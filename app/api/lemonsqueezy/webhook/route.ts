import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { Resend } from 'resend';
import crypto from 'crypto';

const WEBHOOK_SECRET = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!;
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
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

    if (hmac !== signature) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
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
        // Subscription cancelled but still active until end of period
        console.log('Subscription cancelled, will expire at end of period');
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
    console.error('Webhook error:', error);
    return NextResponse.json({ received: true });
  }
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
  };

  // Update by user ID first, then by email
  let result;
  if (userId) {
    result = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', userId);
  }

  if (!result || result.error) {
    result = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('email', email);
  }

  if (result.error) {
    console.error('Failed to update user:', result.error);
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
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Plan:</strong> ${planType}</p>
          <p><strong>Status:</strong> ${status}</p>
          <p><strong>Subscription ID:</strong> ${subscriptionId}</p>
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

  // If status changed to 'expired' or 'cancelled', downgrade
  if (status === 'expired' || status === 'unpaid') {
    await downgradeUser(email, userId, subscriptionId, status);
    return;
  }

  // Otherwise update the status
  const updateData: Record<string, any> = {
    ls_status: status,
    ls_renews_at: attrs.renews_at,
  };

  // If reactivated, ensure premium
  if (status === 'active') {
    updateData.plan = 'premium';
    updateData.plan_updated_at = new Date().toISOString();
  }

  if (userId) {
    await supabaseAdmin.from('users').update(updateData).eq('id', userId);
  } else {
    await supabaseAdmin.from('users').update(updateData).eq('email', email);
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

  let result;
  if (userId) {
    result = await supabaseAdmin.from('users').update(updateData).eq('id', userId);
  }
  if (!result || result.error) {
    result = await supabaseAdmin.from('users').update(updateData).eq('email', email);
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
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subscription:</strong> ${subscriptionId}</p>
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
          <p><strong>Email:</strong> ${email}</p>
          <p>User may need to update their payment method.</p>
          <p style="color: #888; font-size: 13px;">${new Date().toLocaleString()}</p>
        </div>
      `,
    });
  } catch (e) {
    console.error('Failed to send notification:', e);
  }
}