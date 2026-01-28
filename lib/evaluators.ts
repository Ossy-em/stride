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


// LLM-as-judge: Rate intervention quality after user responds
export async function evaluateInterventionQuality(params: {
  intervention: string;
  context: {
    taskType: string;
    elapsedMinutes: number;
    plannedDuration: number;
    checkpoint: 'early' | 'mid' | 'late';
    variant: 'direct' | 'question' | 'challenge';
  };
  userResponse: 'accepted' | 'dismissed' | 'ignored';
  userId: string;
  sessionId: string;
}): Promise<{
  helpfulness: number;
  timing: number;
  tone: number;
  overall: number;
}> {
  try {
    const { intervention, context, userResponse } = params;

    const prompt = `You are evaluating the quality of a focus intervention message.

Context:
- Task: ${context.taskType}
- Progress: ${context.elapsedMinutes}/${context.plannedDuration} mins (${Math.round((context.elapsedMinutes / context.plannedDuration) * 100)}%)
- Checkpoint: ${context.checkpoint}
- Message style: ${context.variant}

Intervention Message: "${intervention}"

User Response: ${userResponse}

Rate this intervention on three dimensions (1-5 scale):

1. Helpfulness: Would this message actually help someone stay focused?
   - 5 = Highly motivating and actionable
   - 1 = Generic or unhelpful

2. Timing: Was this appropriate for their progress level?
   - 5 = Perfect timing for their checkpoint
   - 1 = Too early, too late, or awkward timing

3. Tone: Does the message match the intended ${context.variant} style?
   - 5 = Perfectly matches the style
   - 1 = Doesn't match or feels off

Return ONLY valid JSON (no markdown):
{
  "helpfulness": X,
  "timing": X,
  "tone": X,
  "reasoning": "brief 1-sentence explanation"
}`;

    const response = await callClaude(
      prompt,
      'You are an expert evaluator. Be critical but fair. Consider that user response affects quality.',
      'claude-3-haiku-20240307',
      {
        callType: 'intervention_quality_evaluation',
        userId: params.userId,
        sessionId: params.sessionId,
        checkpoint: context.checkpoint,
        variant: context.variant,
        userResponse,
        tags: ['evaluation', 'llm-as-judge', 'intervention'],
      }
    );

    // Parse JSON response
    const cleaned = response.replace(/```json|```/g, '').trim(); 
    const scores = JSON.parse(cleaned);

    // Calculate overall score
    const overall = (scores.helpfulness + scores.timing + scores.tone) / 3;

    console.log(`📊 Intervention Quality: ${overall.toFixed(1)}/5 (H:${scores.helpfulness} T:${scores.timing} To:${scores.tone}) - ${userResponse}`);

    return {
      helpfulness: scores.helpfulness,
      timing: scores.timing,
      tone: scores.tone,
      overall: parseFloat(overall.toFixed(2)),
    };
  } catch (error) {
    console.error('Error evaluating intervention quality:', error);
    // Return middle scores on error
    return {
      helpfulness: 3,
      timing: 3,
      tone: 3,
      overall: 3,
    };
  }
}