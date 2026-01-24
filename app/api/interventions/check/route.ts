import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkInterventionNeeded } from '@/lib/prediction-service';
import { generateIntervention } from '@/lib/ai-service';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

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


    const { data: session, error: sessionError } = await supabase
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

    const { data: existingInterventions } = await supabase
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

    console.log(`🚨 Intervention needed! Checkpoint: ${prediction.checkpoint}, Variant: ${prediction.variant?.variantType}, Timing: ${prediction.variant?.timingOffset}`);

    // Get recent check-ins for context
    const { data: checkIns } = await supabase
      .from('checkins')
      .select('response')
      .eq('session_id', sessionId)
      .order('timestamp', { ascending: false })
      .limit(3);

    const recentCheckIns = checkIns?.map(c => c.response) || [];

    // Get user's known patterns
    const { data: patterns } = await supabase
      .from('patterns')
      .select('insight')
      .eq('user_id', user.id) 
      .order('detected_at', { ascending: false })
      .limit(3);

    const userPatterns = patterns?.map(p => p.insight) || [];

    console.log(`📊 Context: ${userPatterns.length} patterns, ${recentCheckIns.length} check-ins`);


    const intervention = await generateIntervention(
      {
        taskDescription: session.task_description,
        taskType: session.task_type,
        elapsedMinutes,
        plannedDuration: session.planned_duration,
        checkpoint: prediction.checkpoint,
        userPatterns,
        recentCheckIns,
        variant: prediction.variant?.variantType,
      },
      user.id, 
      sessionId
    );

    console.log('💬 Generated intervention:', intervention);


    const { data: savedIntervention, error: saveError } = await supabase
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

    console.log(`🎯 Intervention triggered: ${intervention.strategy} (${prediction.variant?.variantType}) at ${prediction.checkpoint}`);

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