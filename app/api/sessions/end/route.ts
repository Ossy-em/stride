import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { z } from 'zod';
import { analyzeUserPatterns } from '@/lib/ai-service';
import { logEvaluation, logSessionSummary } from '@/lib/opik';
import { getCurrentUser } from '@/lib/auth';

const endSessionSchema = z.object({
  sessionId: z.string().uuid(),
  actualDuration: z.number().min(1),
  focusQuality: z.number().min(1).max(10),
  distractionCount: z.number().min(0),
  outcome: z.string().max(500).optional(),
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
    const validatedData = endSessionSchema.parse(body);

    // Verify session ownership
    const { data: session } = await supabaseAdmin
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

    // Update session with final data
    const { error } = await supabaseAdmin
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

   
    // FETCH INTERVENTIONS FOR STATS & LOGGING
    
    const { data: interventions, error: interventionsError } = await supabaseAdmin
      .from('interventions')
      .select('*')
      .eq('session_id', validatedData.sessionId);

    if (interventionsError) {
      console.error('Failed to fetch interventions:', interventionsError);
    }

    const allInterventions = interventions || [];
    
    // Calculate stats for logging
    const acceptedCount = allInterventions.filter(i => i.user_action === 'accepted').length;
    const dismissedCount = allInterventions.filter(i => i.user_action === 'dismissed').length;
    const effectiveCount = allInterventions.filter(i => i.effective === true).length;
    const variantsUsed = [...new Set(allInterventions.map(i => i.variant_type).filter(Boolean))];


    // LOG SESSION SUMMARY TO OPIK
   
    await logSessionSummary({
      sessionId: validatedData.sessionId,
      userId: user.id,
      duration: validatedData.actualDuration,
      focusQuality: validatedData.focusQuality,
      interventionCount: allInterventions.length,
      acceptedCount,
      dismissedCount,
      effectiveCount,
      variants: variantsUsed as string[],
    });

    console.log(`✅ Session ${validatedData.sessionId} ended: ${validatedData.focusQuality}/10, ${allInterventions.length} interventions`);

    // PATTERN ANALYSIS (if enough sessions)
    const { data: userSessions } = await supabaseAdmin
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
        // Save patterns to database
        for (const pattern of analysis.patterns) {
          await supabaseAdmin.from('patterns').insert({
            user_id: user.id,
            pattern_type: pattern.type,
            insight: pattern.insight,
            confidence: pattern.confidence,
          });
        }
        console.log('💾 Patterns saved to database');

        // Log pattern confidence to Opik
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
      console.log('⏳ Not enough sessions for pattern analysis (need 5+, have', userSessions?.length || 0, ')');
    }

    return NextResponse.json({ 
      message: 'Session ended successfully',
      sessionId: validatedData.sessionId,
      stats: {
        focusQuality: validatedData.focusQuality,
        duration: validatedData.actualDuration,
        interventions: allInterventions.length,
        accepted: acceptedCount,
        dismissed: dismissedCount,
        effective: effectiveCount,
      },
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