import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkInterventionNeeded } from '../../../../lib/prediction-service';
import { generateIntervention } from '../../../../lib/ai-service';
import { supabaseAdmin } from '../../../../lib/supabase';
import { getCurrentUser } from '../../../../lib/auth';
import { sendPushNotification } from '../../../../lib/push-service';

const checkInterventionSchema = z.object({
  sessionId: z.string().uuid(),
  elapsedMinutes: z.number().min(0),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { sessionId, elapsedMinutes } = checkInterventionSchema.parse(body);

    console.log(`🔍 Checking intervention for session ${sessionId} at ${elapsedMinutes} mins`);

    // Fetch current session
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      console.error('❌ Session not found:', sessionError);
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    console.log(`📋 Session: ${session.task_type}, elapsed: ${elapsedMinutes}/${session.planned_duration} mins`);

    // Check if intervention is needed
    const { needed, prediction } = await checkInterventionNeeded(
      user.id,
      sessionId,
      session.task_type,
      elapsedMinutes,
      session.planned_duration
    );

    console.log(`🎲 Prediction:`, { 
      needed, 
      checkpoint: prediction?.checkpoint,
      variant: prediction?.variant,
      timing: prediction?.interventionMinute
    });

    if (!needed || !prediction || !prediction.checkpoint) {
      console.log('⏭️ No intervention needed yet');
      return NextResponse.json({ 
        needed: false,
        message: 'No intervention needed yet',
      });
    }

    // Check if already intervened at this checkpoint
    const { data: existingInterventions } = await supabaseAdmin
      .from('interventions')
      .select('*')
      .eq('session_id', sessionId)
      .eq('checkpoint', prediction.checkpoint);

    if (existingInterventions && existingInterventions.length > 0) {
      console.log(`⏭️ Already intervened at ${prediction.checkpoint} checkpoint`);
      return NextResponse.json({ 
        needed: false,
        message: `Already intervened at ${prediction.checkpoint} checkpoint`,
      });
    }

    console.log(`🚨 Intervention needed! Checkpoint: ${prediction.checkpoint}, Variant: ${prediction.variant?.variantType}`);

    // FETCH FEEDBACK DATA FOR PERSONALIZATION

    // 1. Get interventions from THIS session (earlier checkpoints)
    const { data: currentSessionInterventions } = await supabaseAdmin
      .from('interventions')
      .select('checkpoint, focus_state, drift_reason, user_action')
      .eq('session_id', sessionId)
      .order('triggered_at', { ascending: true });

    // 2. Get recent interventions from PAST sessions (same task type)
    const { data: pastInterventions } = await supabaseAdmin
      .from('interventions')
      .select(`
        checkpoint,
        focus_state,
        drift_reason,
        break_effectiveness,
        user_action,
        sessions!inner(task_type, focus_quality)
      `)
      .eq('sessions.user_id', user.id)
      .eq('sessions.task_type', session.task_type)
      .neq('session_id', sessionId)
      .not('focus_state', 'is', null)
      .order('triggered_at', { ascending: false })
      .limit(10);

    // 3. Get user's known patterns
    const { data: patterns } = await supabaseAdmin
      .from('patterns')
      .select('insight')
      .eq('user_id', user.id)
      .order('detected_at', { ascending: false })
      .limit(3);

    // BUILD FOCUS HISTORY FOR PROMPT
    const focusHistory = {
      currentSession: currentSessionInterventions?.map(i => ({
        checkpoint: i.checkpoint,
        focusState: i.focus_state,
        driftReason: i.drift_reason,
        action: i.user_action,
      })) || [],
      pastSessions: summarizePastInterventions(pastInterventions || []),
      patterns: patterns?.map(p => p.insight) || [],
    };

    console.log(`📊 Focus history:`, {
      currentSession: focusHistory.currentSession.length,
      pastSessions: focusHistory.pastSessions,
      patterns: focusHistory.patterns.length,
    });

    // GENERATE INTERVENTION
    const intervention = await generateIntervention(
      {
        taskDescription: session.task_description,
        taskType: session.task_type,
        elapsedMinutes,
        plannedDuration: session.planned_duration,
        checkpoint: prediction.checkpoint,
        focusHistory,
        variant: prediction.variant?.variantType,
      },
      user.id,
      sessionId
    );

    console.log('💬 Generated intervention:', intervention);

    // Save intervention to DB
    const { data: savedIntervention, error: saveError } = await supabaseAdmin
      .from('interventions')
      .insert({
        session_id: sessionId,
        message: intervention.message,
        strategy: intervention.strategy,
        variant_type: prediction.variant?.variantType,
        timing_offset: prediction.variant?.timingOffset,
        checkpoint: prediction.checkpoint,
        triggered_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (saveError) {
      console.error('❌ Failed to save intervention:', saveError);
    } else {
      console.log(`✅ Intervention saved to DB (${prediction.checkpoint} checkpoint)`);
    }

    console.log('📦 savedIntervention:', savedIntervention?.id || 'NULL', 'saveError:', saveError?.message || 'none');

    // SEND PUSH NOTIFICATION
    if (savedIntervention) {
      console.log('🔔 Sending push notification...');
      sendPushNotification(user.id, {
        title: 'Stride — Focus Check',
        body: intervention.message,
        tag: `stride-${prediction.checkpoint}`,
        interventionId: savedIntervention.id,
        sessionId,
      }).then((result) => {
        console.log('📤 Push result:', result);
      }).catch((err) => {
        console.error('❌ Push notification failed:', err);
      });
    } else {
      console.error('⚠️ No savedIntervention, skipping push notification');
    }

    return NextResponse.json({
      needed: true,
      intervention: {
        id: savedIntervention?.id,
        message: intervention.message,
        strategy: intervention.strategy,
        variant: prediction.variant?.variantType,
        timingOffset: prediction.variant?.timingOffset,
        checkpoint: prediction.checkpoint,
        prediction: {
          predictedMinutes: prediction.predictedMinutes,
          confidence: prediction.confidence,
          reasoning: prediction.reasoning,
        },
      },
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Validation error:', error.issues);
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    console.error('❌ Error checking intervention:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// HELPER: Summarize past interventions into useful stats
function summarizePastInterventions(interventions: any[]): {
  totalInterventions: number;
  commonDriftReasons: { reason: string; count: number }[];
  focusStateAtCheckpoints: { checkpoint: string; avgState: string }[];
  breakEffectiveness: { helped: number; somewhat: number; notReally: number };
} {
  if (interventions.length === 0) {
    return {
      totalInterventions: 0,
      commonDriftReasons: [],
      focusStateAtCheckpoints: [],
      breakEffectiveness: { helped: 0, somewhat: 0, notReally: 0 },
    };
  }

  const driftReasonCounts: Record<string, number> = {};
  interventions.forEach(i => {
    if (i.drift_reason) {
      driftReasonCounts[i.drift_reason] = (driftReasonCounts[i.drift_reason] || 0) + 1;
    }
  });

  const commonDriftReasons = Object.entries(driftReasonCounts)
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  const checkpointStates: Record<string, string[]> = {};
  interventions.forEach(i => {
    if (i.checkpoint && i.focus_state) {
      if (!checkpointStates[i.checkpoint]) {
        checkpointStates[i.checkpoint] = [];
      }
      checkpointStates[i.checkpoint].push(i.focus_state);
    }
  });

  const focusStateAtCheckpoints = Object.entries(checkpointStates).map(([checkpoint, states]) => {
    const counts: Record<string, number> = {};
    states.forEach(s => { counts[s] = (counts[s] || 0) + 1; });
    const avgState = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'unknown';
    return { checkpoint, avgState };
  });

  const breakEffectiveness = { helped: 0, somewhat: 0, notReally: 0 };
  interventions.forEach(i => {
    if (i.break_effectiveness === 'helped') breakEffectiveness.helped++;
    if (i.break_effectiveness === 'somewhat') breakEffectiveness.somewhat++;
    if (i.break_effectiveness === 'not_really') breakEffectiveness.notReally++;
  });

  return {
    totalInterventions: interventions.length,
    commonDriftReasons,
    focusStateAtCheckpoints,
    breakEffectiveness,
  };
}