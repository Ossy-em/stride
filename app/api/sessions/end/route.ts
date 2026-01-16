import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';

const endSessionSchema = z.object({
  sessionId: z.string().uuid(),
  actualDuration: z.number().min(1),
  focusQuality: z.number().min(1).max(10),
  distractionCount: z.number().min(0),
  outcome: z.string().max(500).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = endSessionSchema.parse(body);

    // Update session with final data
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

    // TODO: Trigger AI analysis after session ends
    // We'll implement this when we add the Anthropic API
    // For now, just return success

    return NextResponse.json({ 
      message: 'Session ended successfully',
      sessionId: validatedData.sessionId,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
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