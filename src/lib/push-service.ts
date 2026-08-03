import webpush from 'web-push';
import { supabaseAdmin } from './supabase';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_EMAIL = process.env.VAPID_EMAIL || 'mailto:hello@stride.app';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

interface PushPayload {
  title: string;
  body: string;
  tag?: string;
  url?: string;
  interventionId?: string;
  sessionId?: string;
}

export async function sendPushNotification(
  userId: string,
  payload: PushPayload
): Promise<{ sent: boolean; error?: string }> {
  try {
    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      console.error('VAPID keys not configured');
      return { sent: false, error: 'VAPID keys not configured' };
    }

    // Use admin client to bypass RLS
    const { data: subscriptions, error } = await supabaseAdmin
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching push subscriptions:', error.message);
      return { sent: false, error: error.message };
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('No push subscriptions found for user:', userId);
      return { sent: false, error: 'No subscriptions found' };
    }

    console.log(`📤 Sending push to ${subscriptions.length} subscription(s) for user ${userId}`);

    const results = await Promise.allSettled(
      subscriptions.map(async (row) => {
        try {
          await webpush.sendNotification(
            row.subscription,
            JSON.stringify(payload)
          );
          console.log('✅ Push notification sent successfully');
          return { success: true };
        } catch (err: any) {
          console.error('❌ Push send error:', err.statusCode, err.body);
          // Subscription expired or invalid, clean it up
          if (err.statusCode === 404 || err.statusCode === 410) {
            console.log('Removing expired push subscription');
            await supabaseAdmin
              .from('push_subscriptions')
              .delete()
              .eq('user_id', userId)
              .eq('subscription', row.subscription);
          }
          throw err;
        }
      })
    );

    const anySent = results.some(
      (r) => r.status === 'fulfilled'
    );

    return { sent: anySent };
  } catch (error: any) {
    console.error('Error sending push notification:', error);
    return { sent: false, error: error.message || 'Failed to send push notification' };
  }
}