/**
 * The Agent loop: stream an answer, run any tools it asks for against the
 * user's data, feed the results back, repeat until it answers.
 */
import type Anthropic from "@anthropic-ai/sdk";

const TOOL_RESULT_CAP = 24_000; // characters per tool result

export async function runAgent(opts: {
  client: Anthropic;
  model: string;
  system: Anthropic.TextBlockParam[];
  messages: Anthropic.MessageParam[];
  tools: Anthropic.Tool[];
  runTool: (name: string, input: Record<string, unknown>) => Promise<unknown>;
  onText: (delta: string) => void;
  onTool: (name: string) => void;
  signal?: AbortSignal;
  maxRounds?: number;
}): Promise<{ answer: string; evidence: string[] }> {
  const { client, model, system, tools, onText, onTool, signal } = opts;
  const messages = [...opts.messages];
  const maxRounds = opts.maxRounds ?? 6;
  let answer = "";
  const evidence: string[] = []; // every tool result, for the fact check

  for (let round = 0; round <= maxRounds; round++) {
    if (signal?.aborted) break;
    const lastRound = round === maxRounds;
    const stream = client.messages.stream(
      {
        model,
        max_tokens: 4096,
        thinking: { type: "adaptive" },
        output_config: { effort: "medium" },
        system,
        // last round: no more tools, answer with what it has
        ...(lastRound ? {} : { tools }),
        messages,
      },
      { signal }
    );

    let roundText = "";
    stream.on("text", (delta) => {
      // keep text from separate rounds apart
      if (!roundText && answer && !answer.endsWith("\n")) {
        answer += "\n\n";
        onText("\n\n");
      }
      roundText += delta;
      answer += delta;
      onText(delta);
    });
    const final = await stream.finalMessage();

    const calls = final.content.filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");
    if (final.stop_reason !== "tool_use" || !calls.length) break;

    messages.push({ role: "assistant", content: final.content });
    calls.forEach((c) => onTool(c.name));
    const results = await Promise.all(
      calls.map(async (c): Promise<Anthropic.ToolResultBlockParam> => {
        try {
          let text = JSON.stringify(await opts.runTool(c.name, (c.input || {}) as Record<string, unknown>));
          if (text.length > TOOL_RESULT_CAP) text = text.slice(0, TOOL_RESULT_CAP) + "…(truncated)";
          evidence.push(`${c.name} ${JSON.stringify(c.input || {})}:\n${text}`);
          return { type: "tool_result", tool_use_id: c.id, content: text };
        } catch (e) {
          console.error(`Agent tool ${c.name} failed:`, e);
          return { type: "tool_result", tool_use_id: c.id, content: "This data couldn't be loaded right now.", is_error: true };
        }
      })
    );
    messages.push({ role: "user", content: results });
  }
  return { answer, evidence };
}
