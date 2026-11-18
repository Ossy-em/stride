import Anthropic from '@anthropic-ai/sdk';
import { logAICall } from './opik';

const apiKey = process.env.ANTHROPIC_API_KEY;

if (!apiKey) {
  throw new Error('Missing ANTHROPIC_API_KEY environment variable');
}

export const anthropic = new Anthropic({
  apiKey,
});

// *** CHANGED: model type is now `string` to support plan-based model selection ***
export async function callClaude(
  prompt: string,
  systemPrompt?: string,
  model: string = 'claude-sonnet-5',
  metadata?: Record<string, any>
) {
  const startTime = Date.now();

  try {
    // Sonnet 5 runs adaptive thinking when `thinking` is omitted; low effort keeps
    // these short JSON calls fast. max_tokens covers thinking + answer (and the
    // Sonnet 5 tokenizer counts ~30% more tokens than earlier models).
    const response = await anthropic.messages.create({
      model,
      max_tokens: 4096,
      thinking: { type: 'adaptive' },
      output_config: { effort: 'low' },
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const endTime = Date.now();

    const textContent = response.content.find(block => block.type === 'text');
    const output = textContent?.type === 'text' ? textContent.text : '';

    await logAICall({
      name: metadata?.callType || 'claude_api_call',
      input: {
        prompt,
        systemPrompt,
        model,
      },
      output: {
        text: output,
        usage: response.usage, 
      },
      model,
      startTime,
      endTime,
      metadata: {
        ...metadata,
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
        stop_reason: response.stop_reason, // 'max_tokens' / 'refusal' mean truncated or empty output
      },
      tags: metadata?.tags || [],
    });

    return output;
  } catch (error) {
    const endTime = Date.now();

    await logAICall({
      name: metadata?.callType || 'claude_api_call_failed',
      input: {
        prompt,
        systemPrompt,
        model,
      },
      output: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      model,
      startTime,
      endTime,
      metadata: {
        ...metadata,
        failed: true,
      },
      tags: [...(metadata?.tags || []), 'error'],
    });

    throw error;
  }
}