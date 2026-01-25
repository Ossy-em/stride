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

    // ENSURE USER EXISTS IN YOUR USERS TABLE (PRODUCTION-SAFE VERSION)
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', user.email)
      .maybeSingle();

    if (existingUser && existingUser.id !== user.id) {
      // ID mismatch - delete old user and create new one with correct ID
      console.log(`⚠️ User ID mismatch for ${user.email}. Migrating to new ID...`);
      
      // Delete old user (cascade deletes sessions, interventions, etc.)
      await supabase
        .from('users')
        .delete()
        .eq('email', user.email);
      
      // Insert new user with NextAuth's ID
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        });
        
      if (insertError) {
        console.error('Failed to create user:', insertError);
        return NextResponse.json(
          { error: 'Failed to create user' },
          { status: 500 }
        );
      }
      
      console.log(`✅ User ${user.email} migrated to new ID`);
    } else if (!existingUser) {
      // User doesn't exist - create them
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        });
        
      if (insertError) {
        console.error('Failed to create user:', insertError);
        return NextResponse.json(
          { error: 'Failed to create user' },
          { status: 500 }
        );
      }
      
      console.log(`✅ New user ${user.email} created`);
    } else {
      // User exists with correct ID - update metadata
      await supabase
        .from('users')
        .update({
          name: user.name,
          image: user.image,
        })
        .eq('id', user.id);
        
      console.log(`✅ User ${user.email} synced`);
    }

    // NOW CREATE THE SESSION
    const body = await request.json();
    const { taskDescription, taskType, plannedDuration } = startSessionSchema.parse(body);

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