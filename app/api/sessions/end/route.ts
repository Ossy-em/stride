import { z } from 'zod';
import { callClaude } from '@/lib/anthropic';
import { 
  buildPatternAnalysisPrompt, 
  buildInterventionPrompt,
  buildDashboardInsightsPrompt 
} from '@/lib/prompts';
import { applyVariantStyle, type MessageVariant } from '@/lib/ab-testing';
import { logAIError } from '@/lib/opik';
import type { Session } from '@/types';

// RESPONSE SCHEMAS (Zod validation)

const interventionResponseSchema = z.object({
  message: z.string().min(1).max(200),
  strategy: z.enum(['push_through', 'check_in', 'take_break']),
  reasoning: z.string(),
});

const patternSchema = z.object({
  type: z.string(),
  insight: z.string(),
  confidence: z.number().min(0).max(1),
});

const patternAnalysisSchema = z.object({
  patterns: z.array(patternSchema),
  recommendations: z.array(z.string()),
});

const insightsSchema = z.array(z.string().min(1).max(300));

// PATTERN ANALYSIS

export async function analyzeUserPatterns(
  sessions: Session[],
  userId: string
) {
  const startTime = Date.now();
  
  try {
    const prompt = buildPatternAnalysisPrompt(sessions);
    
    const response = await callClaude(
      prompt,
      undefined,
      'claude-3-haiku-20240307',
      {
        callType: 'pattern_analysis',
        userId,
        sessionCount: sessions.length,
        tags: ['analysis', 'patterns'],
      }
    );
    
    // Validate response shape
    const parsed = patternAnalysisSchema.parse(JSON.parse(response));
    return parsed;
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Log error to Opik
    await logAIError({
      name: 'pattern_analysis',
      input: { sessionCount: sessions.length, userId },
      error: errorMessage,
      fallbackUsed: true,
      fallbackOutput: { patterns: [], recommendations: ['Complete more sessions to unlock personalized insights.'] },
      metadata: {
        userId,
        sessionCount: sessions.length,
        duration_ms: Date.now() - startTime,
      },
    });
    
    console.error('Error analyzing patterns:', error);
    return {
      patterns: [],
      recommendations: ['Complete more sessions to unlock personalized insights.'],
    };
  }
}

// INTERVENTION GENERATION
export async function generateIntervention(
  context: {
    taskDescription: string;
    taskType: string;
    elapsedMinutes: number;
    plannedDuration: number;
    checkpoint: 'early' | 'mid' | 'late';
    userPatterns: string[];
    recentCheckIns: string[];
    variant?: MessageVariant;
  },
  userId: string,
  sessionId: string
): Promise<{
  message: string;
  strategy: 'push_through' | 'check_in' | 'take_break';
  reasoning: string;
  traceId?: string;
  isFallback: boolean;
}> {
  const startTime = Date.now();
  
  try {
    // Build base prompt with checkpoint context
    let prompt = buildInterventionPrompt({
      taskDescription: context.taskDescription,
      taskType: context.taskType,
      elapsedMinutes: context.elapsedMinutes,
      plannedDuration: context.plannedDuration,
      checkpoint: context.checkpoint,
      userPatterns: context.userPatterns,
      recentCheckIns: context.recentCheckIns,
    });
    
    // Apply A/B test variant style if provided
    if (context.variant) {
      prompt = applyVariantStyle(prompt, context.variant);
    }
    
    const response = await callClaude(
      prompt,
      undefined,
      'claude-3-haiku-20240307',
      {
        callType: 'intervention_generation',
        userId,
        sessionId,
        taskType: context.taskType,
        elapsedMinutes: context.elapsedMinutes,
        checkpoint: context.checkpoint,
        variant: context.variant,
        tags: ['intervention', context.taskType, context.checkpoint],
      }
    );
    
    // Parse and validate response
    const rawParsed = JSON.parse(response);
    const parsed = interventionResponseSchema.parse(rawParsed);
    
    // Validate strategy matches checkpoint (log mismatch but don't fail)
    const expectedStrategy = getExpectedStrategy(context.checkpoint);
    if (parsed.strategy !== expectedStrategy) {
      console.warn(`⚠️ Strategy mismatch: AI chose "${parsed.strategy}" but checkpoint "${context.checkpoint}" expects "${expectedStrategy}"`);
      // Override to expected strategy for consistency
      parsed.strategy = expectedStrategy;
    }
    
    return {
      ...parsed,
      isFallback: false,
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    console.error('Error generating intervention:', error);
    
    // Build fallback response
    const fallback = buildFallbackIntervention(context);
    
    // Log error to Opik (valuable for debugging)
    await logAIError({
      name: 'intervention_generation',
      input: {
        taskType: context.taskType,
        checkpoint: context.checkpoint,
        variant: context.variant,
        elapsedMinutes: context.elapsedMinutes,
      },
      error: errorMessage,
      fallbackUsed: true,
      fallbackOutput: fallback,
      metadata: {
        userId,
        sessionId,
        checkpoint: context.checkpoint,
        variant: context.variant,
        duration_ms: Date.now() - startTime,
      },
    });
    
    return {
      ...fallback,
      isFallback: true,
    };
  }
}

// DASHBOARD INSIGHTS
export async function generateDashboardInsights(
  sessions: Session[],
  userId: string
): Promise<string[]> {
  const startTime = Date.now();
  
  try {
    const prompt = buildDashboardInsightsPrompt(sessions);
    
    const response = await callClaude(
      prompt,
      undefined,
      'claude-3-haiku-20240307',
      {
        callType: 'dashboard_insights',
        userId,
        sessionCount: sessions.length,
        tags: ['insights', 'dashboard'],
      }
    );
    
    // Parse response - handle potential formatting issues
    let parsed: string[];
    
    try {
      parsed = JSON.parse(response);
    } catch {
      // If JSON parsing fails, try to extract array from response
      const match = response.match(/\[[\s\S]*\]/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        throw new Error('Could not parse insights response as JSON array');
      }
    }
    
    // Validate with Zod
    const validated = insightsSchema.parse(parsed);
    return validated;
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Build fallback insights
    const fallbackInsights = buildFallbackInsights(sessions);
    
    // Log error to Opik
    await logAIError({
      name: 'dashboard_insights',
      input: { sessionCount: sessions.length, userId },
      error: errorMessage,
      fallbackUsed: true,
      fallbackOutput: fallbackInsights,
      metadata: {
        userId,
        sessionCount: sessions.length,
        duration_ms: Date.now() - startTime,
      },
    });
    
    console.error('Error generating insights:', error);
    return fallbackInsights;
  }
}

// HELPER FUNCTIONS

function getExpectedStrategy(checkpoint: 'early' | 'mid' | 'late'): 'push_through' | 'check_in' | 'take_break' {
  switch (checkpoint) {
    case 'early': return 'push_through';
    case 'mid': return 'check_in';
    case 'late': return 'take_break';
  }
}

function buildFallbackIntervention(context: {
  elapsedMinutes: number;
  plannedDuration: number;
  checkpoint: 'early' | 'mid' | 'late';
  variant?: MessageVariant;
}): {
  message: string;
  strategy: 'push_through' | 'check_in' | 'take_break';
  reasoning: string;
} {
  const percentComplete = Math.round((context.elapsedMinutes / context.plannedDuration) * 100);
  const minutesLeft = context.plannedDuration - context.elapsedMinutes;
  
  // Fallbacks organized by checkpoint and variant
  // These maintain the companion voice even when AI fails
  const fallbacks = {
    early: {
      direct: `${context.elapsedMinutes} mins in. How's it going?`,
      question: `Finding your rhythm yet?`,
      challenge: `${context.elapsedMinutes} down. Settling in?`,
    },
    mid: {
      direct: `Halfway there. Still with it?`,
      question: `${percentComplete}% in — this is usually the hard part. How's focus?`,
      challenge: `${context.elapsedMinutes} mins down. This is where it counts.`,
    },
    late: {
      direct: `${minutesLeft} mins left. Roll your shoulders?`,
      question: `Almost there. Hands feeling tight?`,
      challenge: `Home stretch. Take 3 deep breaths before the final push?`,
    },
  };
  
  // Select appropriate fallback
  const variant = context.variant || 'direct';
  const message = fallbacks[context.checkpoint][variant];
  const strategy = getExpectedStrategy(context.checkpoint);
  
  return {
    message,
    strategy,
    reasoning: 'Fallback intervention (API unavailable)',
  };
}

function buildFallbackInsights(sessions: Session[]): string[] {
  const sessionCount = sessions.length;
  
  if (sessionCount < 3) {
    return [
      `You've completed ${sessionCount} session${sessionCount === 1 ? '' : 's'}. A few more and we'll start seeing patterns.`,
    ];
  }
  
  // Calculate basic stats for simple fallback insights
  const totalMinutes = sessions.reduce((sum, s) => sum + (s.actual_duration || 0), 0);
  const avgFocus = sessions.reduce((sum, s) => sum + (s.focus_quality || 0), 0) / sessionCount;
  
  return [
    `${sessionCount} sessions completed — ${totalMinutes} minutes of focused work.`,
    `Your average focus score is ${avgFocus.toFixed(1)}/10. We're learning your patterns.`,
  ];
}