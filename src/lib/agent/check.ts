/**
 * Accuracy guard. Before an answer reaches the user, a second pass compares
 * every claim about their data with the data the Agent actually read, and
 * fixes or removes anything the data doesn't support. Also writes chat titles.
 */
import type Anthropic from "@anthropic-ai/sdk";

const CHECK_SYSTEM = `You fact-check answers from Stride, a focus coach app, against the user's real data.

You get: the user's data as JSON (everything the coach read), the user's question, and the coach's draft answer.

Check every statement about the user's data: counts, minutes and hours, ratings and scores, dates, days, times, streaks, comparisons (more, less, best, worst, improving), trends, goal progress and anything described as "usually" or "typically".
- A statement is wrong if the data contradicts it, or if the data doesn't contain it.
- Watch the time window: "this week" means since Monday; "last 7 days", "last 30 days" and "all time" are different numbers. A number from one window used for another is wrong.
- Focus ratings are 1 to 10. Insights scores are 0 to 100 (rating x10). Mixing them up is wrong.
- Rounding is fine (78 minutes as "about 1h 20m"). Simple sums and differences of numbers in the data are fine if they're right.
- Plans, suggestions, encouragement and general advice are not claims about the data. Only flag them if they misstate the data they rely on.

Return ok=true if everything checks out. Otherwise return ok=false, list each problem briefly in issues, and put the full corrected answer in corrected: fix each wrong statement using the data, or remove it if the data can't support it. Keep everything else exactly as written, same wording, tone and formatting. Never add new claims.`;

const CHECK_SCHEMA = {
  type: "object",
  properties: {
    ok: { type: "boolean" },
    issues: { type: "array", items: { type: "string" } },
    corrected: { type: "string" },
  },
  required: ["ok", "issues", "corrected"],
  additionalProperties: false,
};

export type CheckResult = { ok: boolean; issues: string[]; corrected: string | null; ran: boolean };

export async function factCheck(opts: {
  client: Anthropic;
  model: string;
  question: string;
  answer: string;
  evidence: string[];
}): Promise<CheckResult> {
  const data = opts.evidence.join("\n\n").slice(0, 60_000);
  try {
    const res = await opts.client.messages.create({
      model: opts.model,
      max_tokens: 4096,
      thinking: { type: "adaptive" },
      output_config: { effort: "medium", format: { type: "json_schema", schema: CHECK_SCHEMA } },
      system: CHECK_SYSTEM,
      messages: [
        {
          role: "user",
          content: `<data>\n${data}\n</data>\n\n<question>\n${opts.question}\n</question>\n\n<draft>\n${opts.answer}\n</draft>`,
        },
      ],
    });
    const text = res.content.find((b) => b.type === "text");
    const out = JSON.parse(text && text.type === "text" ? text.text : "{}");
    const corrected = typeof out.corrected === "string" && out.corrected.trim() ? out.corrected.trim() : null;
    return { ok: out.ok !== false, issues: Array.isArray(out.issues) ? out.issues : [], corrected: out.ok === false ? corrected : null, ran: true };
  } catch (e) {
    console.error("Agent fact check failed:", e);
    return { ok: true, issues: [], corrected: null, ran: false };
  }
}

/** A short title for the chat history, not the raw first message. */
export async function chatTitle(opts: { client: Anthropic; model: string; question: string; answer: string }) {
  try {
    const res = await opts.client.messages.create({
      model: opts.model,
      max_tokens: 1024,
      thinking: { type: "adaptive" },
      output_config: { effort: "low" },
      system:
        "Name this chat for a history list. 2 to 5 words, sentence case, no quotes, no punctuation at the end, no emoji. Describe the topic, not the question (for example: Peak focus hours, Planning launch week, Evening session drift). Reply with the title only.",
      messages: [{ role: "user", content: `User: ${opts.question.slice(0, 600)}\n\nCoach: ${opts.answer.slice(0, 600)}` }],
    });
    const text = res.content.find((b) => b.type === "text");
    const t = (text && text.type === "text" ? text.text : "").split("\n")[0].replace(/^["'\s]+|["'.\s]+$/g, "").slice(0, 60);
    return t || null;
  } catch (e) {
    console.error("Agent title failed:", e);
    return null;
  }
}

/** House style: no em dashes. */
export const tidy = (s: string) =>
  s
    .replace(/\s*—\s*/g, ", ")
    .replace(/ – /g, ", ")
    .replace(/,\s*,/g, ",")
    .trim();
