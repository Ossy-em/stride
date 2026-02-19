import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { canStartSession, getUserPlan, isDurationAllowed } from '@/lib/plans';

const startSessionSchema = z.object({
  taskDescription: z.string().min(1),
  taskType: z.enum(['coding', 'writing', 'reading']),
  plannedDuration: z.number().min(1),
  timezone: z.string().optional(), // *** NEW: timezone from client ***
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

    // Parse body first so we can get timezone
    const body = await request.json();
    const { taskDescription, taskType, plannedDuration, timezone } = startSessionSchema.parse(body);

    // *** Check session limit with timezone ***
    const sessionCheck = await canStartSession(user.id, timezone);
    if (!sessionCheck.allowed) {
      return NextResponse.json({
        error: sessionCheck.reason,
        upgrade: true,
        sessionsToday: sessionCheck.sessionsToday,
        limit: sessionCheck.limit,
      }, { status: 403 });
    }

    // *** Check duration limit ***
    const plan = await getUserPlan(user.id);
    const durationCheck = isDurationAllowed(plan, plannedDuration);
    if (!durationCheck.allowed) {
      return NextResponse.json({
        error: durationCheck.reason,
        upgrade: true,
        maxAllowed: durationCheck.maxAllowed,
      }, { status: 403 });
    }

    // ENSURE USER EXISTS IN YOUR USERS TABLE
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', user.email)
      .maybeSingle();

    if (existingUser && existingUser.id !== user.id) {
      console.log(`⚠️ User ID mismatch for ${user.email}. Migrating to new ID...`);
      
      await supabaseAdmin
        .from('users')
        .delete()
        .eq('email', user.email);
      
      const { error: insertError } = await supabaseAdmin
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
      const { error: insertError } = await supabaseAdmin
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
      await supabaseAdmin
        .from('users')
        .update({
          name: user.name,
          image: user.image,
        })
        .eq('id', user.id);
        
      console.log(`✅ User ${user.email} synced`);
    }

    // CREATE THE SESSION
    const { data: session, error } = await supabaseAdmin
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