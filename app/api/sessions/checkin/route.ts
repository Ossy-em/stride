import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';
import { CheckInResponse } from '@/types';

const checkInSchema = z.object({
  sessionId: z.string().uuid(),
  response: z.enum(['focused', 'neutral', 'distracted']),
  note: z.string().max(100).optional(),
});

function calculateEffectiveness(
  focusBefore: CheckInResponse,
  focusAfter: CheckInResponse,
  userAction: 'accepted' | 'dismissed' | 'ignored'
): boolean {
  // Map responses to numeric scores for comparison
  const scoreMap: Record<CheckInResponse, number> = {
    focused: 2,
    neutral: 1,
    distracted: 0
  };
  
  const beforeScore = scoreMap[focusBefore];
  const afterScore = scoreMap[focusAfter];
  
 
  if (userAction !== 'accepted') {
    return afterScore > beforeScore;
  }
 return afterScore >= beforeScore;
}

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
    const validatedData = checkInSchema.parse(body);

    // Verify session belongs to this user
    const { data: session } = await supabase
      .from('sessions')
      .select('user_id')
      .eq('id', validatedData.sessionId)
      .single();

    if (session?.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Save the check-in
    const { data: newCheckin, error: checkinError } = await supabase
      .from('checkins')
      .insert({
        session_id: validatedData.sessionId,
        response: validatedData.response,
        note: validatedData.note,
        timestamp: new Date().toISOString(),
      })
      .select()
      .single();

    if (checkinError) {
      console.error('Supabase error:', checkinError);
      return NextResponse.json(
        { error: 'Failed to save check-in' },
        { status: 500 }
      );
    }

    // Find interventions that happened in the last 25 minutes and don't have effectiveness calculated yet
    const twentyFiveMinsAgo = new Date(Date.now() - 25 * 60 * 1000).toISOString();
    
    const { data: recentInterventions, error: interventionsError } = await supabase
      .from('interventions')
      .select('*')
      .eq('session_id', validatedData.sessionId)
      .is('effective', null)
      .gte('triggered_at', twentyFiveMinsAgo)
      .not('user_action', 'is', null); // Only process if user has responded

    if (interventionsError) {
      console.error('Error fetching interventions:', interventionsError);

    }

  
    if (recentInterventions && recentInterventions.length > 0) {
      for (const intervention of recentInterventions) {
        const focusBefore = (intervention.metadata as any)?.focus_before || 'neutral';
        const focusAfter = validatedData.response;
        const userAction = intervention.user_action as 'accepted' | 'dismissed' | 'ignored';
        
        const effective = calculateEffectiveness(
          focusBefore as CheckInResponse,
          focusAfter as CheckInResponse,
          userAction
        );
        
        const { error: updateError } = await supabase
          .from('interventions')
          .update({ effective })
          .eq('id', intervention.id);
        
        if (updateError) {
          console.error(`Failed to update effectiveness for intervention ${intervention.id}:`, updateError);
        } else {
          console.log(` Calculated effectiveness for intervention ${intervention.id}: ${effective} (${focusBefore} → ${focusAfter}, action: ${userAction})`);
        }
      }
    }

    return NextResponse.json({ 
      message: 'Check-in saved successfully',
      effectivenessCalculated: recentInterventions?.length || 0
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error saving check-in:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}