import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { checkInterventionNeeded } from '@/lib/prediction-service';
import { generateIntervention } from '@/lib/ai-service';
import { sendPushNotification } from '@/lib/push-service';

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized access
 const secret = request.nextUrl.searchParams.get('secret');
if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Find all active sessions (started but not ended)
    const { data: activeSessions, error: sessionsError } = await supabaseAdmin
      .from('sessions')
      .select('*, users!inner(email)')
      .is('ended_at', null)
      .not('started_at', 'is', null);

    if (sessionsError) {
      console.error('❌ Error fetching active sessions:', sessionsError);
      return NextResponse.json({ error: sessionsError.message }, { status: 500 });
    }

    if (!activeSessions || activeSessions.length === 0) {
      return NextResponse.json({ checked: 0, interventions: 0 });
    }

    console.log(`⏰ Cron: checking ${activeSessions.length} active session(s)`);

    let interventionsSent = 0;

    for (const session of activeSessions) {
      try {
        // Calculate elapsed minutes
        const startedAt = new Date(session.started_at).getTime();
        const elapsedMs = Date.now() - startedAt;
        const elapsedMinutes = Math.floor(elapsedMs / 60000);

        // Skip if session just started or is way past planned duration
        if (elapsedMinutes < 1) continue;
        // Re-check session hasn't ended since our initial query
const { data: freshSession } = await supabaseAdmin
  .from('sessions')
  .select('ended_at')
  .eq('id', session.id)
  .single();

if (freshSession?.ended_at) {
  console.log(`⏭️ Session ${session.id} already ended, skipping`);
  continue;
}
        if (elapsedMinutes > session.planned_duration * 2) {
          console.log(`⏭️ Session ${session.id} is way past duration, skipping`);
          continue;
        }

        // Check how many interventions already sent for this session
        const { data: existingInterventions } = await supabaseAdmin
          .from('interventions')
          .select('id')
          .eq('session_id', session.id);

        if (existingInterventions && existingInterventions.length >= 3) {
          continue; // Max 3 interventions per session
        }

        // Check if intervention is needed
        const { needed, prediction } = await checkInterventionNeeded(
          session.user_id,
          session.id,
          session.task_type,
          elapsedMinutes,
          session.planned_duration
        );

        if (!needed || !prediction || !prediction.checkpoint) continue;

        // Check if already intervened at this checkpoint
        const { data: checkpointInterventions } = await supabaseAdmin
          .from('interventions')
          .select('id')
          .eq('session_id', session.id)
          .eq('checkpoint', prediction.checkpoint);

        if (checkpointInterventions && checkpointInterventions.length > 0) continue;

        console.log(`🚨 Cron: intervention needed for session ${session.id} at ${elapsedMinutes}min (${prediction.checkpoint})`);

        // Fetch focus history for personalization
        const { data: currentSessionInterventions } = await supabaseAdmin
          .from('interventions')
          .select('checkpoint, focus_state, drift_reason, user_action')
          .eq('session_id', session.id)
          .order('triggered_at', { ascending: true });

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
          .eq('sessions.user_id', session.user_id)
          .eq('sessions.task_type', session.task_type)
          .neq('session_id', session.id)
          .not('focus_state', 'is', null)
          .order('triggered_at', { ascending: false })
          .limit(10);

        const { data: patterns } = await supabaseAdmin
          .from('patterns')
          .select('insight')
          .eq('user_id', session.user_id)
          .order('detected_at', { ascending: false })
          .limit(3);

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

        // Generate intervention
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
          session.user_id,
          session.id
        );

        // Save to DB
        const { data: savedIntervention, error: saveError } = await supabaseAdmin
          .from('interventions')
          .insert({
            session_id: session.id,
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
          console.error(`❌ Cron: failed to save intervention for session ${session.id}:`, saveError);
          continue;
        }

        console.log(`✅ Cron: intervention saved for session ${session.id} (${prediction.checkpoint})`);

        // Send push notification
        const pushResult = await sendPushNotification(session.user_id, {
          title: 'Stride — Focus Check',
          body: intervention.message,
          tag: `stride-${prediction.checkpoint}`,
          interventionId: savedIntervention.id,
          sessionId: session.id,
        });

        console.log(`📤 Cron: push result for session ${session.id}:`, pushResult);
        interventionsSent++;

      } catch (sessionError) {
        console.error(`❌ Cron: error processing session ${session.id}:`, sessionError);
        continue;
      }
    }

    console.log(`✅ Cron complete: checked ${activeSessions.length} sessions, sent ${interventionsSent} interventions`);

    return NextResponse.json({
      checked: activeSessions.length,
      interventions: interventionsSent,
    });

  } catch (error: any) {
    console.error('❌ Cron error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function summarizePastInterventions(interventions: any[]) {
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
      if (!checkpointStates[i.checkpoint]) checkpointStates[i.checkpoint] = [];
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