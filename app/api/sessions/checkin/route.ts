import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';

const checkInSchema = z.object({
  sessionId: z.string().uuid(),
  response: z.enum(['focused', 'neutral', 'distracted']),
  note: z.string().max(100).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = checkInSchema.parse(body);

    const { error } = await supabase
      .from('checkins')
      .insert({
        session_id: validatedData.sessionId,
        response: validatedData.response,
        note: validatedData.note,
        timestamp: new Date().toISOString(),
      });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to save check-in' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Check-in saved successfully' });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
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