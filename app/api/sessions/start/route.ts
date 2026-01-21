import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';

// Validation schema
const startSessionSchema = z.object({
  taskDescription: z.string().min(1).max(200),
  taskType: z.enum(['coding', 'writing', 'reading']),
  plannedDuration: z.number().min(5).max(120),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = startSessionSchema.parse(body);

    // TODO: Get actual user ID from auth session
    // For now, using a mock user ID 
    const mockUserId = '00000000-0000-0000-0000-000000000001';

    // Create session in database
    const { data: session, error } = await supabase
      .from('sessions')
      .insert({
        user_id: mockUserId,
        task_description: validatedData.taskDescription,
        task_type: validatedData.taskType,
        planned_duration: validatedData.plannedDuration,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      sessionId: session.id,
      message: 'Session started successfully',
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error starting session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}