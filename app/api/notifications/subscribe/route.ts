import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subscription } = await request.json();

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ error: 'Invalid subscription data' }, { status: 400 });
    }

    // Upsert the subscription
    const { data, error } = await supabaseAdmin
      .from('push_subscriptions')
      .upsert(
        {
          user_id: user.id,
          endpoint: subscription.endpoint,
          subscription: subscription,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'endpoint' }
      )
      .select();

    if (error) {
      console.error('Supabase upsert error:', error);
      return NextResponse.json({ 
        error: error.message,
        code: error.code,
        details: error.details,
      }, { status: 500 });
    }

    // Verify it actually saved
    const { data: verify } = await supabaseAdmin
      .from('push_subscriptions')
      .select('id')
      .eq('user_id', user.id);

    return NextResponse.json({ 
      success: true,
      upsertedRows: data?.length || 0,
      totalSubscriptions: verify?.length || 0,
      userId: user.id,
    });
  } catch (error: any) {
    console.error('Subscribe route error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}