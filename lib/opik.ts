import { Opik } from 'opik';

// Initialize Opik with API key
const opik = new Opik({
  projectName: process.env.OPIK_PROJECT_NAME || 'stride-hackathon',
  apiKey: process.env.OPIK_API_KEY,
});

// CORE LOGGING FUNCTION

export async function logAICall(params: {
  name: string;
  input: any;
  output: any;
  model: string;
  startTime: number;
  endTime: number;
  metadata?: Record<string, any>;
  tags?: string[];
}): Promise<string | null> {
  try {
    const { name, input, output, model, startTime, endTime, metadata, tags } = params;
    const latency = endTime - startTime;
    const traceId = `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await opik.trace({
      name,
      input,
      output,
      metadata: {
        trace_id: traceId,
        model,
        latency_ms: latency,
        timestamp: new Date().toISOString(),
        ...metadata,
      },
      tags: tags || [],
    });

    console.log(`✅ Logged: ${name} (${latency}ms) | Model: ${model} | Tokens: in=${metadata?.input_tokens || 'N/A'} out=${metadata?.output_tokens || 'N/A'}`);
    
    return traceId;
  } catch (error) {
    console.error('❌ Opik logging failed:', error);
    return null;
  }
}

// EVALUATION LOGGING (links to parent trace)

export async function logEvaluation(params: {
  name: string;
  traceId: string;
  score: number;
  metadata?: Record<string, any>;
}): Promise<string | null> {
  try {
    const { name, traceId, score, metadata } = params;
    const evalId = `eval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await opik.trace({
      name: `eval:${name}`,
      input: { 
        parent_trace_id: traceId,
        evaluation_type: name,
      },
      output: { 
        score,
        passed: score >= 0.6, // Threshold for "good" evaluation
      },
      metadata: {
        eval_id: evalId,
        parent_trace_id: traceId,
        evaluation_name: name,
        score,
        score_percent: Math.round(score * 100),
        timestamp: new Date().toISOString(),
        ...metadata,
      },
      tags: ['evaluation', name, score >= 0.6 ? 'passed' : 'needs_improvement'],
    });

    console.log(`📊 Evaluation: ${name} = ${(score * 100).toFixed(0)}% ${score >= 0.6 ? '✓' : '✗'}`);
    
    return evalId;
  } catch (error) {
    console.error('❌ Opik evaluation logging failed:', error);
    return null;
  }
}

// INTERVENTION OUTCOME LOGGING (for A/B analysis)
export async function logInterventionOutcome(params: {
  interventionTraceId: string;
  sessionId: string;
  userId: string;
  variant: 'direct' | 'question' | 'challenge';
  checkpoint: 'early' | 'mid' | 'late';
  userAction: 'accepted' | 'dismissed' | 'ignored';
  effective: boolean | null;
  responseTimeMs?: number;
  metadata?: Record<string, any>;
}): Promise<string | null> {
  try {
    const { 
      interventionTraceId, 
      sessionId, 
      userId, 
      variant, 
      checkpoint, 
      userAction, 
      effective,
      responseTimeMs,
      metadata 
    } = params;

    const outcomeId = `outcome_${Date.now()}`;

    await opik.trace({
      name: 'intervention_outcome',
      input: {
        intervention_trace_id: interventionTraceId,
        session_id: sessionId,
        variant,
        checkpoint,
      },
      output: {
        user_action: userAction,
        effective,
        response_time_ms: responseTimeMs,
      },
      metadata: {
        outcome_id: outcomeId,
        intervention_trace_id: interventionTraceId,
        session_id: sessionId,
        user_id: userId,
        variant,
        checkpoint,
        user_action: userAction,
        effective,
        response_time_ms: responseTimeMs,
        // A/B test categorization for filtering
        ab_test_group: `${variant}_${checkpoint}`,
        timestamp: new Date().toISOString(),
        ...metadata,
      },
      tags: [
        'outcome',
        `variant:${variant}`,
        `checkpoint:${checkpoint}`,
        `action:${userAction}`,
        effective === true ? 'effective' : effective === false ? 'ineffective' : 'pending',
      ],
    });

    console.log(`🎯 Outcome: ${variant}/${checkpoint} → ${userAction} (effective: ${effective})`);
    
    return outcomeId;
  } catch (error) {
    console.error('❌ Opik outcome logging failed:', error);
    return null;
  }
}

// ERROR/FALLBACK LOGGING
export async function logAIError(params: {
  name: string;
  input: any;
  error: string;
  fallbackUsed: boolean;
  fallbackOutput?: any;
  metadata?: Record<string, any>;
}): Promise<string | null> {
  try {
    const { name, input, error, fallbackUsed, fallbackOutput, metadata } = params;
    const errorId = `error_${Date.now()}`;

    await opik.trace({
      name: `error:${name}`,
      input,
      output: {
        error,
        fallback_used: fallbackUsed,
        fallback_output: fallbackOutput,
      },
      metadata: {
        error_id: errorId,
        error_message: error,
        fallback_used: fallbackUsed,
        timestamp: new Date().toISOString(),
        ...metadata,
      },
      tags: ['error', name, fallbackUsed ? 'fallback_used' : 'no_fallback'],
    });

    console.log(`⚠️ Error logged: ${name} | Fallback: ${fallbackUsed}`);
    
    return errorId;
  } catch (logError) {
    console.error('❌ Failed to log error to Opik:', logError);
    return null;
  }
}

// SESSION SUMMARY LOGGING (end of session metrics)

export async function logSessionSummary(params: {
  sessionId: string;
  userId: string;
  duration: number;
  focusQuality: number;
  interventionCount: number;
  acceptedCount: number;
  dismissedCount: number;
  effectiveCount: number;
  variants: string[];
}): Promise<string | null> {
  try {
    const {
      sessionId,
      userId,
      duration,
      focusQuality,
      interventionCount,
      acceptedCount,
      dismissedCount,
      effectiveCount,
      variants,
    } = params;

    const acceptanceRate = interventionCount > 0 ? acceptedCount / interventionCount : 0;
    const effectivenessRate = interventionCount > 0 ? effectiveCount / interventionCount : 0;

    await opik.trace({
      name: 'session_summary',
      input: {
        session_id: sessionId,
        planned_interventions: interventionCount,
      },
      output: {
        focus_quality: focusQuality,
        acceptance_rate: acceptanceRate,
        effectiveness_rate: effectivenessRate,
      },
      metadata: {
        session_id: sessionId,
        user_id: userId,
        duration_minutes: duration,
        focus_quality: focusQuality,
        focus_quality_category: focusQuality >= 7 ? 'high' : focusQuality >= 4 ? 'medium' : 'low',
        intervention_count: interventionCount,
        accepted_count: acceptedCount,
        dismissed_count: dismissedCount,
        effective_count: effectiveCount,
        acceptance_rate: Math.round(acceptanceRate * 100),
        effectiveness_rate: Math.round(effectivenessRate * 100),
        variants_used: variants,
        timestamp: new Date().toISOString(),
      },
      tags: [
        'session_summary',
        `quality:${focusQuality >= 7 ? 'high' : focusQuality >= 4 ? 'medium' : 'low'}`,
        acceptanceRate >= 0.5 ? 'high_acceptance' : 'low_acceptance',
        effectivenessRate >= 0.5 ? 'high_effectiveness' : 'low_effectiveness',
      ],
    });

    console.log(`📈 Session summary: quality=${focusQuality}/10, acceptance=${Math.round(acceptanceRate * 100)}%, effectiveness=${Math.round(effectivenessRate * 100)}%`);
    
    return `summary_${sessionId}`;
  } catch (error) {
    console.error('❌ Failed to log session summary:', error);
    return null;
  }
}

export { opik };