import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase';
import { getCurrentUser } from '../../../../lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessionId = request.nextUrl.searchParams.get('id');
    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session ID' }, { status: 400 });
    }

    const { data: session, error } = await supabaseAdmin
      .from('sessions')
      .select('paused_at, total_paused_ms, pause_count')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (error || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({
      paused_at: session.paused_at,
      total_paused_ms: session.total_paused_ms || 0,
      pause_count: session.pause_count || 0,
    });
  } catch (error: any) {
    console.error('Session status error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}