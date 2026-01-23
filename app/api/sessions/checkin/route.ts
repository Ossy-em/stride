import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';

const checkInSchema = z.object({
  sessionId: z.string().uuid(),
  response: z.enum(['focused', 'neutral', 'distracted']),
  note: z.string().max(100).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
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