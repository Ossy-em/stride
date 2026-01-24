import { callClaude } from './anthropic';
import { 
  buildPatternAnalysisPrompt, 
  buildInterventionPrompt,
  buildDashboardInsightsPrompt 
} from './prompts';
import { applyVariantStyle, type MessageVariant } from './ab-testing';
import type { Session } from '@/types';

// Pattern Analysis 
export async function analyzeUserPatterns(
  sessions: Session[],
  userId: string
) {
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
    
    const parsed = JSON.parse(response);
    return parsed;
  } catch (error) {
    console.error('Error analyzing patterns:', error);
    return {
      patterns: [],
      recommendations: ['Complete more sessions to unlock personalized insights.'],
    };
  }
}

// Intervention Generation 
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
) {
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
        tags: ['intervention', context.taskType],
      }
    );
    
    const parsed = JSON.parse(response);
    return parsed;
  } catch (error) {
    console.error('Error generating intervention:', error);
    
    // UPDATED: Human fallback messages with emoji for mid checkpoint
    const percentComplete = Math.round((context.elapsedMinutes / context.plannedDuration) * 100);
    
    const fallbacks = {
      early: {
        direct: `${context.elapsedMinutes} minutes in. Keep going.`,
        question: `How's your focus so far?`,
        challenge: `${context.elapsedMinutes} down. Can you hit ${context.plannedDuration}?`
      },
      mid: {
        direct: `Halfway there, keep pushing! 👊🏼`,
        question: `Still locked in?`,
        challenge: `${context.elapsedMinutes} minutes down. Push to the end?`
      },
      late: {
        direct: `You're ${percentComplete}% through. Stretch your neck quick?`,
        question: `Almost done. Need to crack your knuckles?`,
        challenge: `${percentComplete}% in. Final push—stretch those hands first?`
      }
    };
    
    const fallbackMessage = context.variant 
      ? fallbacks[context.checkpoint][context.variant]
      : fallbacks[context.checkpoint]['direct'];
    
    // Strategy based on checkpoint
    const strategy = context.checkpoint === 'late' ? 'take_break' : 
                     context.checkpoint === 'mid' ? 'check_in' : 
                     'push_through';
    
    return {
      message: fallbackMessage,
      strategy,
      reasoning: 'Fallback intervention (API error)',
    };
  }
}

// Dashboard Insights 
export async function generateDashboardInsights(
  sessions: Session[],
  userId: string
) {
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
    
    const parsed = JSON.parse(response);
    return parsed as string[];
  } catch (error) {
    console.error('Error generating insights:', error);
    return [
      'Complete a few more sessions to unlock personalized insights.',
    ];
  }
}