import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '../../../../lib/auth';
import { getUserPlan } from '../../../../lib/plans';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check user's plan (webhook may have already updated it)
    if ((await getUserPlan(user.id)) === 'premium') {
      return NextResponse.json({ verified: true, plan: 'premium' });
    }

    // Webhook might not have fired yet - poll briefly
    // Wait 2 seconds and check again
    await new Promise(resolve => setTimeout(resolve, 2000));

    if ((await getUserPlan(user.id)) === 'premium') {
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
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}