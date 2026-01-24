import Anthropic from '@anthropic-ai/sdk';
import { logAICall } from './opik';

const apiKey = process.env.ANTHROPIC_API_KEY;

if (!apiKey) {
  throw new Error('Missing ANTHROPIC_API_KEY environment variable');
}

export const anthropic = new Anthropic({
  apiKey,
});


export async function callClaude(
  prompt: string,
  systemPrompt?: string,
  model: 'claude-3-5-sonnet-20241022' | 'claude-3-haiku-20240307' = 'claude-3-haiku-20240307',
  metadata?: Record<string, any> 
) {
  const startTime = Date.now();

  try {
    const response = await anthropic.messages.create({
      model,
      max_tokens: 1024,
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