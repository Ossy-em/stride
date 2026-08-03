import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase';
import { getCurrentUser } from '../../../../lib/auth';
import { getUserPlan } from '../../../../lib/plans';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId, action } = await request.json();

    if (!sessionId || !['pause', 'resume'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Check premium access
    const plan = await getUserPlan(user.id);
    if (plan !== 'premium') {
      return NextResponse.json({
        error: 'Pause/resume is a Premium feature',
        upgrade: true,
      }, { status: 403 });
    }

    // Fetch the session
    const { data: session, error: fetchError } = await supabaseAdmin
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.ended_at) {
      return NextResponse.json({ error: 'Session already ended' }, { status: 400 });
    }

    if (action === 'pause') {
      if (session.paused_at) {
        return NextResponse.json({ error: 'Session already paused' }, { status: 400 });
      }

      const { error: updateError } = await supabaseAdmin
        .from('sessions')
        .update({
          paused_at: new Date().toISOString(),
          pause_count: (session.pause_count || 0) + 1,
        })
        .eq('id', sessionId);

      if (updateError) throw updateError;

      return NextResponse.json({ status: 'paused', paused_at: new Date().toISOString() });
    }

    if (action === 'resume') {
      if (!session.paused_at) {
        return NextResponse.json({ error: 'Session is not paused' }, { status: 400 });
      }

      // Calculate how long the session was paused
      const pausedAt = new Date(session.paused_at).getTime();
      const now = Date.now();
      const pauseDuration = now - pausedAt;
      const newTotalPaused = (session.total_paused_ms || 0) + pauseDuration;

      const { error: updateError } = await supabaseAdmin
        .from('sessions')
        .update({
          paused_at: null,
          total_paused_ms: newTotalPaused,
        })
        .eq('id', sessionId);

      if (updateError) throw updateError;

      return NextResponse.json({
        status: 'resumed',
        total_paused_ms: newTotalPaused,
      });
    }
  } catch (error: any) {
    console.error('Pause/resume error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}