import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase';
import { Resend } from 'resend';
import crypto from 'crypto';
import { esc } from '../../../../lib/security';

const WEBHOOK_SECRET = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!;
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    if (!WEBHOOK_SECRET) {
      console.error('LEMONSQUEEZY_WEBHOOK_SECRET is not set');
      return NextResponse.json({ error: 'Not configured' }, { status: 500 });
    }
    const rawBody = await request.text();

    // Verify webhook signature
    const signature = request.headers.get('x-signature');
    if (!signature) {
      console.error('Missing webhook signature');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const hmac = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');

    const a = Buffer.from(hmac, 'utf8');
    const b = Buffer.from(signature, 'utf8');
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    const eventName = event.meta.event_name;
    const customData = event.meta.custom_data;
    const userId = customData?.user_id;

    console.log('Lemon Squeezy webhook:', eventName);

    switch (eventName) {
      case 'subscription_created': {
        await handleSubscriptionCreated(event.data, userId);
        break;
      }
      case 'subscription_updated': {
        await handleSubscriptionUpdated(event.data, userId);
        break;
      }
      case 'subscription_cancelled': {
        // Still premium until ends_at; saving the date lets the app end it on time
        // even if the expiry webhook never arrives.
        await handleSubscriptionUpdated(event.data, userId);
        break;
      }
      case 'subscription_paused':
      case 'subscription_unpaused':
      case 'subscription_resumed': {
        await handleSubscriptionUpdated(event.data, userId);
        break;
      }
      case 'subscription_expired': {
        await handleSubscriptionExpired(event.data, userId);
        break;
      }
      case 'subscription_payment_success': {
        console.log('Subscription payment successful');
        break;
      }
      case 'subscription_payment_failed': {
        await handlePaymentFailed(event.data, userId);
        break;
      }
      default:
        console.log('Unhandled event:', eventName);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    // A 500 makes Lemon Squeezy retry, so a failed downgrade isn't lost.
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}

/**
 * Write billing fields to the right user: by the signed user_id from checkout,
 * falling back to the (lowercased) email. Throws so the webhook gets retried.
 * onlySub: only touch the row if it's still on this subscription, so an old
 * subscription expiring can't downgrade someone who has since resubscribed.
 */
async function updateUser(
  update: Record<string, any>,
  userId: string | undefined,
  email: string | undefined,
  onlySub?: string
) {
  const run = async (col: 'id' | 'email', val: string, withEndsAt = true) => {
    const data = withEndsAt ? update : Object.fromEntries(Object.entries(update).filter(([k]) => k !== 'ls_ends_at'));
    let q = supabaseAdmin.from('users').update(data).eq(col, val);
    if (onlySub) q = q.or(`ls_subscription_id.is.null,ls_subscription_id.eq.${onlySub}`);
    let res = await q.select('id');
    // before add-billing-expiry.sql runs, ls_ends_at doesn't exist yet
    if (res.error && withEndsAt && /ls_ends_at/.test(res.error.message || '')) return run(col, val, false);
    if (res.error) throw res.error;
    return res.data?.length || 0;
  };
  let n = 0;
  if (userId) n = await run('id', userId);
  if (!n && email) n = await run('email', String(email).trim().toLowerCase());
  return n;
}

async function handleSubscriptionCreated(data: any, userId: string | undefined) {
  const attrs = data.attributes;
  const email = attrs.user_email;
  const status = attrs.status; // 'active', 'on_trial', etc.
  const variantId = String(attrs.variant_id);
  const subscriptionId = String(data.id);

  // Determine plan type
  const isMonthly = variantId === process.env.LEMONSQUEEZY_MONTHLY_VARIANT_ID;
  const planType = isMonthly ? 'monthly' : 'yearly';

  const updateData: Record<string, any> = {
    plan: 'premium',
    plan_updated_at: new Date().toISOString(),
    ls_subscription_id: subscriptionId,
    ls_customer_id: String(attrs.customer_id),
    ls_variant_id: variantId,
    ls_plan_type: planType,
    ls_status: status,
    ls_renews_at: attrs.renews_at,
    ls_ends_at: attrs.ends_at ?? null,
  };

  const updated = await updateUser(updateData, userId, email);
  if (!updated) {
    console.error(`No Stride user found for subscription ${subscriptionId} (${email})`);
    return;
  }

  console.log(`✅ User ${email} upgraded to premium (${planType})`);

  // Notify you
  try {
    await resend.emails.send({
      from: 'Stride <notifications@trystrideai.com>',
      to: 'emosinachi@gmail.com',
      subject: `💰 New Premium subscriber: ${email}`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #1a3a2f;">New Premium Subscriber!</h2>
          <p><strong>Email:</strong> ${esc(email)}</p>
          <p><strong>Plan:</strong> ${esc(planType)}</p>
          <p><strong>Status:</strong> ${esc(status)}</p>
          <p><strong>Subscription ID:</strong> ${esc(subscriptionId)}</p>
          <p style="color: #888; font-size: 13px;">${new Date().toLocaleString()}</p>
        </div>
      `,
    });
  } catch (e) {
    console.error('Failed to send notification:', e);
  }
}

async function handleSubscriptionUpdated(data: any, userId: string | undefined) {
  const attrs = data.attributes;
  const email = attrs.user_email;
  const status = attrs.status;
  const subscriptionId = String(data.id);

  // Ended, unpaid or paused: back to free now
  if (status === 'expired' || status === 'unpaid' || status === 'paused') {
    await downgradeUser(email, userId, subscriptionId, status);
    return;
  }

  // Otherwise keep the dates and status current (cancelled keeps premium until ends_at)
  const updateData: Record<string, any> = {
    ls_status: status,
    ls_renews_at: attrs.renews_at,
    ls_ends_at: attrs.ends_at ?? null,
  };

  // If (re)activated, ensure premium and point the row at this subscription
  if (status === 'active' || status === 'on_trial') {
    updateData.plan = 'premium';
    updateData.plan_updated_at = new Date().toISOString();
    updateData.ls_subscription_id = subscriptionId;
    await updateUser(updateData, userId, email);
  } else {
    await updateUser(updateData, userId, email, subscriptionId);
  }

  console.log(`🔄 Subscription ${subscriptionId} updated: ${status}`);
}

async function handleSubscriptionExpired(data: any, userId: string | undefined) {
  const attrs = data.attributes;
  const email = attrs.user_email;
  const subscriptionId = String(data.id);

  await downgradeUser(email, userId, subscriptionId, 'expired');
}

async function downgradeUser(email: string, userId: string | undefined, subscriptionId: string, reason: string) {
  const updateData = {
    plan: 'free',
    plan_updated_at: new Date().toISOString(),
    ls_status: reason,
  };

  const updated = await updateUser(updateData, userId, email, subscriptionId);
  if (!updated) {
    console.log(`Subscription ${subscriptionId} ${reason}, but the user is on a newer subscription; left as is`);
    return;
  }

  console.log(`⬇️ User ${email} downgraded to free (${reason})`);

  try {
    await resend.emails.send({
      from: 'Stride <notifications@trystrideai.com>',
      to: 'emosinachi@gmail.com',
      subject: `📉 Subscription ${reason}: ${email}`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #1a3a2f;">Subscription ${reason}</h2>
          <p><strong>Email:</strong> ${esc(email)}</p>
          <p><strong>Subscription:</strong> ${esc(subscriptionId)}</p>
          <p style="color: #888; font-size: 13px;">${new Date().toLocaleString()}</p>
        </div>
      `,
    });
  } catch (e) {
    console.error('Failed to send notification:', e);
  }
}

async function handlePaymentFailed(data: any, userId: string | undefined) {
  const attrs = data.attributes;
  const email = attrs.user_email;

  console.log(`⚠️ Payment failed for ${email}`);

  try {
    await resend.emails.send({
      from: 'Stride <notifications@trystrideai.com>',
      to: 'emosinachi@gmail.com',
      subject: `⚠️ Payment failed: ${email}`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #1a3a2f;">Payment Failed</h2>
          <p><strong>Email:</strong> ${esc(email)}</p>
          <p>User may need to update their payment method.</p>
          <p style="color: #888; font-size: 13px;">${new Date().toLocaleString()}</p>
        </div>
      `,
    });
  } catch (e) {
    console.error('Failed to send notification:', e);
  }
}