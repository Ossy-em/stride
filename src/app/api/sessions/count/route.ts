import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import { getCurrentUser } from '../../../../lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { count, error } = await supabase
      .from('sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to count sessions' }, { status: 500 });
    }

    return NextResponse.json({ count: count ?? 0 });

  } catch (error) {
    console.error('Error counting sessions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}