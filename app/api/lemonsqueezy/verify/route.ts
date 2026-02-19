import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check user's plan in DB (webhook may have already updated it)
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('plan, ls_status')
      .eq('id', user.id)
      .single();

    if (userData?.plan === 'premium') {
      return NextResponse.json({ verified: true, plan: 'premium' });
    }

    // Webhook might not have fired yet - poll briefly
    // Wait 2 seconds and check again
    await new Promise(resolve => setTimeout(resolve, 2000));

    const { data: retryData } = await supabaseAdmin
      .from('users')
      .select('plan')
      .eq('id', user.id)
      .single();

    if (retryData?.plan === 'premium') {
      return NextResponse.json({ verified: true, plan: 'premium' });
    }

    // Still not updated - webhook may be delayed
    return NextResponse.json({
      verified: false,
      message: 'Payment is being processed. Your account will be upgraded shortly.',
      pending: true,
    });
  } catch (error: any) {
    console.error('Verification error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}