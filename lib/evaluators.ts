import { callClaude } from './anthropic';

// LLM-as-judge: Rate the quality of AI-generated insights
export async function evaluateInsightQuality(
  insights: string[],
  sessionData: any[]
): Promise<number> {
  try {
    const prompt = `You are evaluating the quality of AI-generated focus insights for a user.

Session Data Summary:
- Total sessions: ${sessionData.length}
- Task types: ${[...new Set(sessionData.map(s => s.task_type))].join(', ')}
- Avg focus quality: ${(sessionData.reduce((sum, s) => sum + (s.focus_quality || 0), 0) / sessionData.length).toFixed(1)}/10

Generated Insights:
${insights.map((insight, i) => `${i + 1}. ${insight}`).join('\n')}

Rate these insights on a scale of 1-10 based on:
1. Specificity (references actual data, not generic advice)
2. Actionability (user can immediately apply them)
3. Relevance (matches the session data provided)
4. Personalization (feels tailored to this user)

Return ONLY a single number from 1-10. No explanation.`;

    const response = await callClaude(
      prompt,
      'You are an expert evaluator of AI-generated content. Be critical but fair.',
      'claude-3-haiku-20240307',
      {
        callType: 'insight_quality_evaluation',
        tags: ['evaluation', 'llm-as-judge'],
      }
    );

    const score = parseInt(response.trim());
    return isNaN(score) ? 5 : Math.max(1, Math.min(10, score)); // Clamp 1-10
  } catch (error) {
    console.error('Error evaluating insight quality:', error);
    return 5; // Default middle score
  }
}

// Evaluate if a predicted intervention time was accurate
export async function evaluateInterventionAccuracy(params: {
  predictedMinutes: number; // When we predicted distraction
  actualFocusQuality: number; // What user rated their focus
  sessionDuration: number; // How long they actually worked
}): Promise<number> {
  const { predictedMinutes, actualFocusQuality, sessionDuration } = params;

  // If user ended session close to predicted time with low focus, prediction was accurate
  const timeDiff = Math.abs(sessionDuration - predictedMinutes);
  const timeAccuracy = timeDiff <= 5 ? 1.0 : Math.max(0, 1 - (timeDiff / 30)); // Within 5 mins = perfect

  // If focus quality dropped (< 6), prediction was correct
  const focusAccuracy = actualFocusQuality < 6 ? 1.0 : 0.5;

  // Combined score
  return (timeAccuracy + focusAccuracy) / 2;
}