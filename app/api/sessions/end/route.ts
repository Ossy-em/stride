import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';
import { analyzeUserPatterns } from '@/lib/ai-service';
import { logEvaluation } from '@/lib/opik';
import { getCurrentUser } from '@/lib/auth';
import { CheckInResponse } from '@/types';

const endSessionSchema = z.object({
  sessionId: z.string().uuid(),
  actualDuration: z.number().min(1),
  focusQuality: z.number().min(1).max(10),
  distractionCount: z.number().min(0),
  outcome: z.string().max(500).optional(),
});

function calculateFallbackEffectiveness(
  focusBefore: CheckInResponse,
  finalFocusQuality: number, // 1-10 scale
  userAction: 'accepted' | 'dismissed' | 'ignored'
): boolean {

  const finalScore = finalFocusQuality >= 7 ? 2 : finalFocusQuality >= 4 ? 1 : 0;
  
  const scoreMap: Record<CheckInResponse, number> = {
    focused: 2,
    neutral: 1,
    distracted: 0
  };
  
  const beforeScore = scoreMap[focusBefore];
  

  if (userAction !== 'accepted') {
    return finalScore > beforeScore;
  }
  
  return finalScore >= beforeScore;
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
    const validatedData = endSessionSchema.parse(body);


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

    const { error } = await supabase
      .from('sessions')
      .update({
        actual_duration: validatedData.actualDuration,
        focus_quality: validatedData.focusQuality,
        distraction_count: validatedData.distractionCount,
        outcome: validatedData.outcome,
        ended_at: new Date().toISOString(),
      })
      .eq('id', validatedData.sessionId);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to end session' },
        { status: 500 }
      );
    }

    const { data: uncalculatedInterventions, error: interventionsError } = await supabase
      .from('interventions')
      .select('*')
      .eq('session_id', validatedData.sessionId)
      .is('effective', null)
      .not('user_action', 'is', null);

     if (!interventionsError && uncalculatedInterventions && uncalculatedInterventions.length > 0) {
      console.log(`🔄 Calculating fallback effectiveness for ${uncalculatedInterventions.length} interventions using final focus_quality`);
      
      for (const intervention of uncalculatedInterventions) {
        const focusBefore = (intervention.metadata as any)?.focus_before || 'neutral';
        const userAction = intervention.user_action as 'accepted' | 'dismissed' | 'ignored';
        
        const effective = calculateFallbackEffectiveness(
          focusBefore as CheckInResponse,
          validatedData.focusQuality,
          userAction
        );
        
        const { error: updateError } = await supabase
          .from('interventions')
          .update({ effective })
          .eq('id', intervention.id);
        
        if (updateError) {
          console.error(`Failed to update fallback effectiveness for intervention ${intervention.id}:`, updateError);
        } else {
          console.log(`✅ Fallback effectiveness calculated for intervention ${intervention.id}: ${effective} (${focusBefore} → quality:${validatedData.focusQuality}, action: ${userAction})`);
        }
      }
    }

    const { data: userSessions } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', user.id)
      .not('focus_quality', 'is', null)
      .order('started_at', { ascending: false })
      .limit(20);

    if (userSessions && userSessions.length >= 5) {
      console.log('🔍 Analyzing patterns for', userSessions.length, 'sessions...');
      
      const analysis = await analyzeUserPatterns(userSessions, user.id);
      
      console.log('✅ Pattern analysis complete:', analysis.patterns?.length || 0, 'patterns found');
      
      if (analysis.patterns && analysis.patterns.length > 0) {
        for (const pattern of analysis.patterns) {
          await supabase.from('patterns').insert({
            user_id: user.id,
            pattern_type: pattern.type,
            insight: pattern.insight,
            confidence: pattern.confidence,
          });
        }
        console.log('💾 Patterns saved to database');

        const avgConfidence = analysis.patterns.reduce(
          (sum: number, p: { confidence: number }) => sum + p.confidence, 
          0
        ) / analysis.patterns.length;        
        
        await logEvaluation({
          name: 'pattern_confidence',
          traceId: `session_${validatedData.sessionId}`,
          score: avgConfidence,
          metadata: {
            sessionId: validatedData.sessionId,
            userId: user.id,
            patternCount: analysis.patterns.length,
            sessionCount: userSessions.length,
          },
        });

        console.log(`📊 Pattern confidence: ${(avgConfidence * 100).toFixed(1)}%`);
      }
    } else {
      console.log('⏳ Not enough sessions yet for pattern analysis (need 5+, have', userSessions?.length || 0, ')');
    }

    return NextResponse.json({ 
      message: 'Session ended successfully',
      sessionId: validatedData.sessionId,
      effectivenessCalculated: uncalculatedInterventions?.length || 0
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error ending session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}