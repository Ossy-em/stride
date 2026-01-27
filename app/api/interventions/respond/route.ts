import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';
import { evaluateInterventionQuality } from '@/lib/evaluators';

const respondSchema = z.object({
  interventionId: z.string().uuid(),
  action: z.enum(['accepted', 'dismissed', 'ignored']),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { interventionId, action } = respondSchema.parse(body);

    // Get the intervention details first
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

    // Calculate elapsed minutes
    const elapsedMinutes = Math.floor(
      (Date.now() - new Date(intervention.triggered_at).getTime()) / (1000 * 60)
    );

    // Simple effectiveness: accepted = effective
    const effective = action === 'accepted';

    // Update intervention with user action and effectiveness
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

    console.log(`📝 Intervention ${interventionId}: User ${action} → ${effective ? 'Effective' : 'Not effective'}`);

    // LLM-as-Judge Evaluation (async, don't wait)
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
      userId: intervention.sessions.user_id,
      sessionId: intervention.session_id,
    }).catch(err => console.error('Evaluation failed:', err));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error recording response:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}