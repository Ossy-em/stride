import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getUserPlan, getPlanLimits, canStartSession } from '@/lib/plans';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const timezone = request.nextUrl.searchParams.get('tz') || undefined;

    const plan = await getUserPlan(user.id);
    const limits = await getPlanLimits(user.id);
    const sessionCheck = await canStartSession(user.id, timezone);

    // For premium users, get the Lemon Squeezy customer portal URL
    let portalUrl: string | null = null;
    if (plan === 'premium') {
      const { data: userData } = await supabaseAdmin
        .from('users')
        .select('ls_customer_id')
        .eq('id', user.id)
        .single();

      if (userData?.ls_customer_id) {
        // Lemon Squeezy customer portal URL format
        // Users can manage billing, update payment, and cancel here
        portalUrl = `https://trystrideai.lemonsqueezy.com/billing`;
      }
    }

    return NextResponse.json({
      plan,
      limits,
      portalUrl,
      sessions: {
        canStart: sessionCheck.allowed,
        todayCount: sessionCheck.sessionsToday || 0,
        dailyLimit: sessionCheck.limit || -1,
        reason: sessionCheck.reason,
      },
    });
  } catch (error: any) {
    console.error('Plan check error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}