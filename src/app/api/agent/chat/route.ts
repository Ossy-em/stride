/**
 * POST /api/agent/chat  { message, conversationId?, tz?, skill? }
 * Streams newline-delimited JSON events:
 *   {type:"conversation", id, title}   a new chat was created
 *   {type:"tool", name, label}         the Agent is reading the user's data
 *   {type:"text", delta}               answer text
 *   {type:"done", usage:{used,limit}}  finished
 *   {type:"error", message}            something broke mid-stream
 * Free plans are limited per day (lib/plan-limits); over the limit is a 403 { upgrade: true }.
 */
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { rateLimit } from "@/lib/security";
import { getPlanLimits, limitZone } from "@/lib/plans";
import { AGENT_TOOLS, TOOL_LABELS, overview, runTool } from "@/lib/agent/tools";
import { chatTitle, factCheck, tidy } from "@/lib/agent/check";
import { setConversationTitle } from "@/lib/agent/store";
import { AGENT_SYSTEM, agentContext } from "@/lib/agent/prompt";
import { runAgent } from "@/lib/agent/run";
import {
  addMessage,
  createConversation,
  getConversation,
  isMissingAgentTables,
  usedToday,
} from "@/lib/agent/store";

export const maxDuration = 60;

const MODEL = process.env.AGENT_MODEL || "claude-sonnet-5";
const MAX_TOOL_ROUNDS = 6;
const HISTORY = 20; // earlier messages sent back to the model

const input = z.object({
  message: z.string().trim().min(1).max(4000),
  conversationId: z.string().uuid().nullable().optional(),
  tz: z.string().max(64).optional(),
  skill: z.enum(["patterns", "plan", "stuck"]).nullable().optional(),
});

let client: Anthropic | null = null;
const anthropic = () => (client ??= new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }));

function zone(tz?: string) {
  try {
    if (tz) {
      new Intl.DateTimeFormat("en-US", { timeZone: tz });
      return tz;
    }
  } catch {}
  return "UTC";
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // daily cap is checked before the message is saved, so stop bursts of parallel sends
  if (!rateLimit(`agent:${user.id}`, 3, 10e3)) {
    return NextResponse.json({ error: "Slow down a little and try again." }, { status: 429 });
  }
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: "The Agent isn't configured." }, { status: 503 });

  const parsed = input.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid message" }, { status: 400 });
  const { message, conversationId, skill } = parsed.data;
  const tz = zone(parsed.data.tz);

  // ---- plan limit ----
  const limit = (await getPlanLimits(user.id)).agentMessagesPerDay;
  let used = 0;
  try {
    used = await usedToday(user.id, await limitZone(user.id, tz));
  } catch (e: any) {
    if (isMissingAgentTables(e))
      return NextResponse.json({ error: "The Agent isn't set up yet. Run scripts/add-agent.sql in Supabase." }, { status: 503 });
    throw e;
  }
  if (limit >= 0 && used >= limit) {
    return NextResponse.json(
      { error: "Daily Agent limit reached", upgrade: true, reason: "agent_limit", used, limit },
      { status: 403 }
    );
  }

  // ---- conversation ----
  let conversation: { id: string; title: string };
  let history: { role: "user" | "assistant"; content: string }[] = [];
  let isNew = false;
  if (conversationId) {
    const existing = await getConversation(user.id, conversationId);
    if (!existing) return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    conversation = existing;
    history = existing.messages.slice(-HISTORY).map((m) => ({ role: m.role, content: m.content }));
  } else {
    conversation = await createConversation(user.id, message);
    isNew = true;
  }
  await addMessage(user.id, conversation.id, "user", message);

  const firstName = user.name?.split(" ")[0] ?? null;
  // the headline numbers go in up front, so the Agent never has to work them out
  const facts = await overview({ userId: user.id, tz }).catch((e) => {
    console.error("Agent facts failed:", e);
    return null;
  });
  const system: Anthropic.TextBlockParam[] = [
    { type: "text", text: AGENT_SYSTEM, cache_control: { type: "ephemeral" } },
    { type: "text", text: agentContext({ firstName, tz, skill, facts }) },
  ];
  // the API wants turns to alternate; drop anything that would break that
  const messages: Anthropic.MessageParam[] = [];
  for (const m of [...history, { role: "user" as const, content: message }]) {
    if (messages.length && messages[messages.length - 1].role === m.role) {
      const prev = messages[messages.length - 1];
      prev.content = `${prev.content as string}\n\n${m.content}`;
    } else messages.push({ role: m.role, content: m.content });
  }
  if (messages[0]?.role === "assistant") messages.shift();

  const encoder = new TextEncoder();
  const body = new ReadableStream({
    async start(controller) {
      const send = (event: object) => {
        try {
          controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
        } catch {
          // the browser went away; keep going so the answer still gets saved
        }
      };
      let answer = "";
      let aborted = false;
      const onAbort = () => {
        aborted = true;
      };
      request.signal.addEventListener("abort", onAbort);

      try {
        if (isNew) send({ type: "conversation", id: conversation.id, title: conversation.title });

        // draft the answer (tool steps show live), then check it before showing it
        let wrote = false;
        const draft = await runAgent({
          client: anthropic(),
          model: MODEL,
          system,
          messages,
          tools: AGENT_TOOLS,
          runTool: (name, args) => runTool(name, args, { userId: user.id, tz }),
          onText: () => {
            if (!wrote) {
              wrote = true;
              send({ type: "status", label: "Writing your answer" });
            }
          },
          onTool: (name) => send({ type: "tool", name, label: TOOL_LABELS[name] ?? "Looking at your data" }),
          signal: request.signal,
          maxRounds: MAX_TOOL_ROUNDS,
        });

        send({ type: "status", label: "Checking it against your data" });
        const evidence = [`verified facts:\n${JSON.stringify(facts)}`, ...draft.evidence];
        const [check, title] = await Promise.all([
          draft.answer.trim()
            ? factCheck({ client: anthropic(), model: MODEL, question: message, answer: draft.answer, evidence })
            : Promise.resolve({ ok: true, issues: [], corrected: null, ran: false }),
          isNew && draft.answer.trim()
            ? chatTitle({ client: anthropic(), model: MODEL, question: message, answer: draft.answer })
            : Promise.resolve(null),
        ]);
        if (!check.ok) console.warn("Agent answer corrected:", check.issues);
        answer = tidy(check.corrected ?? draft.answer);

        if (title) {
          await setConversationTitle(user.id, conversation.id, title).catch(() => {});
          send({ type: "title", id: conversation.id, title });
        }

        // reveal the checked answer in small pieces so it still reads as typing
        for (const piece of answer.match(/[\s\S]{1,24}/g) || []) {
          if (aborted) break;
          send({ type: "text", delta: piece });
          await new Promise((r) => setTimeout(r, 12));
        }

        if (answer) await addMessage(user.id, conversation.id, "assistant", answer, {
          ok: check.ok,
          ran: check.ran,
          issues: check.issues,
          ...(check.ok ? {} : { draft: draft.answer }),
        });
        send({ type: "done", usage: { used: used + 1, limit } });
      } catch (e: any) {
        if (aborted || e?.name === "APIUserAbortError") {
          // stopped: nothing unchecked is saved
        } else {
          console.error("Agent chat error:", e);
          send({ type: "error", message: "Something went wrong. Please try again." });
        }
      } finally {
        request.signal.removeEventListener("abort", onAbort);
        try {
          controller.close();
        } catch {}
      }
    },
  });

  return new Response(body, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
