import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '../../../../lib/supabase';
import { getCurrentUser } from '../../../../lib/auth';
import { canStartSession, getUserPlan, isDurationAllowed } from '../../../../lib/plans';

const startSessionSchema = z.object({
  taskDescription: z.string().trim().min(1).max(300),
  taskType: z.enum(['coding', 'writing', 'reading']),
  plannedDuration: z.number().int().min(1).max(600),
  timezone: z.string().max(64).optional(),
  goalId: z.string().uuid().nullable().optional(), // goal this session counts towards
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
    const { taskDescription, taskType, plannedDuration, timezone, goalId } = startSessionSchema.parse(body);

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

    // Users are created at sign-in. This only fills the gap for an account
    // that somehow has no row yet. It never deletes or re-keys a user: an
    // older version did, and that would have cascaded away all their data.
    const { error: ensureError } = await supabaseAdmin
      .from('users')
      .upsert({ id: user.id, email: user.email, name: user.name, image: user.image }, { onConflict: 'id', ignoreDuplicates: true });
    if (ensureError) {
      console.error('Failed to ensure user row:', ensureError.message);
      return NextResponse.json({ error: 'Failed to start session' }, { status: 500 });
    }

    // Only link goals that belong to this user and are still active
    let linkedGoalId: string | null = null;
    if (goalId) {
      const { data: goal } = await supabaseAdmin
        .from('goals')
        .select('id')
        .eq('id', goalId)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();
      linkedGoalId = goal?.id ?? null;
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
        ...(linkedGoalId ? { goal_id: linkedGoalId } : {}),
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

    console.log(`Session ${session.id} started`);

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