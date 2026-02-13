import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    // Simple auth check - only you should trigger this
    const { secret } = await request.json();
    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all waitlist emails
    const { data: waitlist, error } = await supabaseAdmin
      .from('waitlist')
      .select('email')
      .order('created_at', { ascending: true });

    if (error) throw error;
    if (!waitlist || waitlist.length === 0) {
      return NextResponse.json({ message: 'No waitlist entries' });
    }

    let sent = 0;
    let failed = 0;

    for (const entry of waitlist) {
      try {
        await resend.emails.send({
          from: 'Ossy from Stride <notifications@trystrideai.com>',
          to: entry.email,
          subject: "You're in! Stride beta is live 🎯",
          html: buildBetaInviteEmail(entry.email),
        });
        sent++;
        // Small delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 200));
      } catch (emailError) {
        console.error(`Failed to send to ${entry.email}:`, emailError);
        failed++;
      }
    }

    // Notify you
    await resend.emails.send({
      from: 'Stride <notifications@trystrideai.com>',
      to: 'emosinachi@gmail.com',
      subject: `Beta invites sent: ${sent} delivered, ${failed} failed`,
      html: `<p>Sent ${sent} beta invite emails. ${failed} failed.</p><p>Waitlist total: ${waitlist.length}</p>`,
    });

    return NextResponse.json({ sent, failed, total: waitlist.length });
  } catch (error: any) {
    console.error('Beta invite error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function buildBetaInviteEmail(email: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 560px; margin: 0 auto; padding: 40px 20px;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #0f2a1f 0%, #1a4a35 100%); border-radius: 16px 16px 0 0; padding: 40px 32px; text-align: center;">
      <div style="display: inline-block; background-color: #84cc16; width: 48px; height: 48px; border-radius: 12px; line-height: 48px; font-size: 24px; margin-bottom: 16px;">
        ⚡
      </div>
      <h1 style="color: #ffffff; font-size: 26px; font-weight: 700; margin: 0 0 8px 0;">
        You're in the Stride beta!
      </h1>
      <p style="color: #a3e635; font-size: 15px; margin: 0; font-weight: 500;">
        Early access — you're one of the first.
      </p>
    </div>

    <!-- Body -->
    <div style="background-color: #ffffff; padding: 32px; border-radius: 0 0 16px 16px;">
      <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">
        Hey! 👋
      </p>
      <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">
        Thanks for signing up for Stride. I've been building this to solve a problem I kept running into myself — losing focus mid-session and not realizing it until it's too late.
      </p>
      <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">
        <strong>Stride predicts when you're about to lose focus and nudges you back before it happens.</strong> Not after. Before.
      </p>
      <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
        The more you use it, the smarter it gets about your patterns.
      </p>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="https://www.trystrideai.com" 
           style="display: inline-block; background-color: #84cc16; color: #0f2a1f; font-size: 16px; font-weight: 600; padding: 14px 36px; border-radius: 50px; text-decoration: none;">
          Start Your First Session →
        </a>
      </div>

      <!-- Quick Tips -->
      <div style="background-color: #f0fdf4; border-radius: 12px; padding: 20px; margin: 24px 0;">
        <p style="color: #166534; font-size: 14px; font-weight: 600; margin: 0 0 12px 0;">
          Quick start tips:
        </p>
        <p style="color: #374151; font-size: 14px; line-height: 1.6; margin: 0 0 8px 0;">
          1. Sign in with Google
        </p>
        <p style="color: #374151; font-size: 14px; line-height: 1.6; margin: 0 0 8px 0;">
          2. Allow notifications when prompted (this is how Stride reaches you)
        </p>
        <p style="color: #374151; font-size: 14px; line-height: 1.6; margin: 0 0 8px 0;">
          3. Start a focus session and do your work
        </p>
        <p style="color: #374151; font-size: 14px; line-height: 1.6; margin: 0;">
          4. Stride will check in on you — respond honestly so it learns
        </p>
      </div>

      <!-- Mobile note -->
      <div style="background-color: #fffbeb; border-radius: 12px; padding: 16px; margin: 24px 0;">
        <p style="color: #92400e; font-size: 13px; line-height: 1.5; margin: 0;">
          📱 <strong>On iPhone?</strong> Open Stride in Safari, tap Share → "Add to Home Screen" to get push notifications when you're away from the app.
        </p>
      </div>

      <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 24px 0 8px 0;">
        This is an early beta — things might break. I'd genuinely love your feedback. Hit reply or use the feedback button inside the app.
      </p>

      <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0;">
        — Ossy
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 24px 0;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">
        Stride — Focus, predicted.
      </p>
    </div>
  </div>
</body>
</html>`;
}