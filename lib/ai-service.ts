import { z } from 'zod';
import { callClaude } from './anthropic';
import { 
  buildPatternAnalysisPrompt, 
  buildInterventionPrompt,
  buildDashboardInsightsPrompt 
} from './prompts';
import { applyVariantStyle, type MessageVariant } from './ab-testing';
import { logAIError } from './opik';
import type { Session } from '@/types';


// RESPONSE SCHEMAS (Zod validation)

const interventionResponseSchema = z.object({
  message: z.string().min(1).max(200),
  intent: z.enum(['awareness', 'refocus', 'momentum', 'closure']),
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

// ============================================
// PATTERN ANALYSIS
// ============================================
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
    
    const parsed = patternAnalysisSchema.parse(JSON.parse(response));
    return parsed;
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
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

// ============================================
// INTERVENTION GENERATION
// ============================================
export async function generateIntervention(
  context: {
    taskDescription: string;
    taskType: string;
    elapsedMinutes: number;
    plannedDuration: number;
    checkpoint: 'early' | 'mid' | 'late';
    focusHistory: {
      currentSession: Array<{
        checkpoint: string;
        focusState: string | null;
        driftReason: string | null;
        action: string | null;
      }>;
      pastSessions: {
        totalInterventions: number;
        commonDriftReasons: Array<{ reason: string; count: number }>;
        focusStateAtCheckpoints: Array<{ checkpoint: string; avgState: string }>;
        breakEffectiveness: { helped: number; somewhat: number; notReally: number };
      };
      patterns: string[];
    };
    variant?: MessageVariant;
  },
  userId: string,
  sessionId: string
): Promise<{
  message: string;
  strategy: 'push_through' | 'check_in' | 'take_break';
  reasoning: string;
  intent?: string;
  isFallback: boolean;
}> {
  const startTime = Date.now();
  
  try {
    let prompt = buildInterventionPrompt({
      taskDescription: context.taskDescription,
      taskType: context.taskType,
      elapsedMinutes: context.elapsedMinutes,
      plannedDuration: context.plannedDuration,
      checkpoint: context.checkpoint,
      focusHistory: context.focusHistory,
    });
    
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
        hasFocusHistory: context.focusHistory.pastSessions.totalInterventions > 0,
        tags: ['intervention', context.taskType, context.checkpoint],
      }
    );
    
    const rawParsed = JSON.parse(response);
    const parsed = interventionResponseSchema.parse(rawParsed);
    
    // Strategy is determined by checkpoint, not LLM
    const strategy = getExpectedStrategy(context.checkpoint);
    
    return {
      message: parsed.message,
      strategy,
      reasoning: parsed.reasoning,
      intent: parsed.intent,
      isFallback: false,
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    console.error('Error generating intervention:', error);
    
    const fallback = buildFallbackIntervention(context);
    
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

// ============================================
// DASHBOARD INSIGHTS
// ============================================
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
    
    let parsed: string[];
    
    try {
      parsed = JSON.parse(response);
    } catch {
      const match = response.match(/\[[\s\S]*\]/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        throw new Error('Could not parse insights response as JSON array');
      }
    }
    
    const validated = insightsSchema.parse(parsed);
    return validated;
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    const fallbackInsights = buildFallbackInsights(sessions);
    
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

// ============================================
// HELPER FUNCTIONS
// ============================================

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
  
  const fallbacks = {
    early: {
      direct: `${context.elapsedMinutes} mins in. How's it going?`,
      question: `Finding your rhythm yet?`,
      challenge: `${context.elapsedMinutes} down. Settling in?`,
    },
    mid: {
      direct: `Halfway there. Still with it?`,
      question: `${percentComplete}% in. How's focus?`,
      challenge: `${context.elapsedMinutes} mins down. This is where it counts.`,
    },
    late: {
      direct: `${minutesLeft} mins left. Roll your shoulders?`,
      question: `Almost there. Feeling good?`,
      challenge: `Home stretch. Deep breath?`,
    },
  };
  
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
  
  const totalMinutes = sessions.reduce((sum, s) => sum + (s.actual_duration || 0), 0);
  const avgFocus = sessions.reduce((sum, s) => sum + (s.focus_quality || 0), 0) / sessionCount;
  
  return [
    `${sessionCount} sessions completed. ${totalMinutes} minutes of focused work.`,
    `Average focus: ${avgFocus.toFixed(1)}/10. We're learning your patterns.`,
  ];
}