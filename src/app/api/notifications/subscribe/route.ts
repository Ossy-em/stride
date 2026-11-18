import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase';
import { getCurrentUser } from '../../../../lib/auth';
import { z } from 'zod';

// The server later POSTs to this URL, so only accept real browser push services.
const PUSH_HOSTS = ['fcm.googleapis.com', 'updates.push.services.mozilla.com', 'push.apple.com', 'notify.windows.com', 'push.services.mozilla.com'];
const subscriptionSchema = z.object({
  endpoint: z.string().url().max(1000).refine((u) => {
    try {
      const { protocol, hostname } = new URL(u);
      return protocol === 'https:' && PUSH_HOSTS.some((h) => hostname === h || hostname.endsWith('.' + h));
    } catch {
      return false;
    }
  }),
  expirationTime: z.number().nullable().optional(),
  keys: z.object({ p256dh: z.string().max(200), auth: z.string().max(100) }),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const parsed = subscriptionSchema.safeParse(body?.subscription);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid subscription data' }, { status: 400 });
    }
    const subscription = parsed.data;

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
      return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }

    return NextResponse.json({ success: true, upsertedRows: data?.length || 0 });
  } catch (error: any) {
    console.error('Subscribe route error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}