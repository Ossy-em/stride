import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';
import { evaluateInterventionQuality } from '@/lib/evaluators';
import { logInterventionOutcome } from '@/lib/opik';
import { getCurrentUser } from '@/lib/auth';

const respondSchema = z.object({
  interventionId: z.string().uuid(),
  action: z.enum(['accepted', 'dismissed', 'ignored']),
  // Optional: client can send how long the notification was visible
  responseTimeMs: z.number().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { interventionId, action, responseTimeMs } = respondSchema.parse(body);

    // Fetch intervention with session data
    const { data: intervention, error: fetchError } = await supabase
      .from('interventions')
      .select(`
        *,
        sessions!inner(
          task_type,
          planned_duration,
          started_at,
          user_id
        )
      `)
      .eq('id', interventionId)
      .single();

    if (fetchError || !intervention) {
      console.error('Failed to fetch intervention:', fetchError);
      return NextResponse.json({ error: 'Intervention not found' }, { status: 404 });
    }

    // Verify ownership
    if (intervention.sessions.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Calculate response time if not provided by client
    // (time from intervention triggered to user response)
    const calculatedResponseTimeMs = responseTimeMs ?? 
      (Date.now() - new Date(intervention.triggered_at).getTime());

    const elapsedMinutes = Math.floor(
      (Date.now() - new Date(intervention.sessions.started_at).getTime()) / (1000 * 60)
    );

    // Determine effectiveness
    // For now: accepted = effective, dismissed/ignored = not effective
    // This gets recalculated at session end with more context
    const effective = action === 'accepted';

    // Update intervention in database
    const { error } = await supabase
      .from('interventions')
      .update({
        user_action: action,
        effective: effective,
      })
      .eq('id', interventionId);

    if (error) {
      console.error('Failed to update intervention:', error);
      return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }

    console.log(`📝 Intervention ${interventionId}: ${action} (${calculatedResponseTimeMs}ms response time)`);

    // LOG TO OPIK FOR A/B ANALYSIS
   
    await logInterventionOutcome({
      interventionTraceId: `intervention_${interventionId}`,
      sessionId: intervention.session_id,
      userId: user.id,
      variant: intervention.variant_type || 'direct',
      checkpoint: intervention.checkpoint,
      userAction: action,
      effective: effective,
      responseTimeMs: calculatedResponseTimeMs,
      metadata: {
        message: intervention.message,
        strategy: intervention.strategy,
        timing_offset: intervention.timing_offset,
        elapsed_minutes: elapsedMinutes,
        task_type: intervention.sessions.task_type,
      },
    });

    // Run quality evaluation (non-blocking)
    evaluateInterventionQuality({
      intervention: intervention.message,
      context: {
        taskType: intervention.sessions.task_type,
        elapsedMinutes,
        plannedDuration: intervention.sessions.planned_duration,
        checkpoint: intervention.checkpoint,
        variant: intervention.variant_type,
      },
      userResponse: action,
      userId: user.id,
      sessionId: intervention.session_id,
    }).catch(err => console.error('Evaluation failed:', err));

    return NextResponse.json({ 
      success: true,
      logged: {
        action,
        variant: intervention.variant_type,
        checkpoint: intervention.checkpoint,
        responseTimeMs: calculatedResponseTimeMs,
      },
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error recording response:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}