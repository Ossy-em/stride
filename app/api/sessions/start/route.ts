import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

const startSessionSchema = z.object({
  taskDescription: z.string().min(1),
  taskType: z.enum(['coding', 'writing', 'reading']),
  plannedDuration: z.number().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }


    const { error: userError } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      }, {
        onConflict: 'id',
        ignoreDuplicates: false
      });

    if (userError) {
      console.error('Failed to ensure user exists:', userError);

    } else {
      console.log(`✅ User ${user.email} synced to users table`);
    }

    const body = await request.json();
    const { taskDescription, taskType, plannedDuration } = startSessionSchema.parse(body);

    // Create session with real user ID
    const { data: session, error } = await supabase
      .from('sessions')
      .insert({
        user_id: user.id,
        task_description: taskDescription,
        task_type: taskType,
        planned_duration: plannedDuration,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create session:', error);
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      );
    }

    console.log(`🎯 Session ${session.id} started for user ${user.email}`);

    return NextResponse.json({ sessionId: session.id });
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