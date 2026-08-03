import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase';
import { getCurrentUser } from '../../../../lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessionId = request.nextUrl.searchParams.get('sessionId');
    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    // First check if session is currently paused — don't show interventions while paused
    const { data: session } = await supabaseAdmin
      .from('sessions')
      .select('paused_at')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (session?.paused_at) {
      return NextResponse.json({ pending: false });
    }

    // Find interventions that were sent but not responded to
    const { data: pending, error } = await supabaseAdmin
      .from('interventions')
      .select('id, message, strategy, checkpoint, triggered_at')
      .eq('session_id', sessionId)
      .is('user_action', null)
      .order('triggered_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching pending interventions:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!pending || pending.length === 0) {
      return NextResponse.json({ pending: false });
    }

    return NextResponse.json({
      pending: true,
      intervention: {
        id: pending[0].id,
        message: pending[0].message,
        strategy: pending[0].strategy,
      },
    });
  } catch (error: any) {
    console.error('Error in pending interventions route:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}