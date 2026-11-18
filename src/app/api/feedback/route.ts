import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase';
import { getCurrentUser } from '../../../lib/auth';
import { Resend } from 'resend';
import { esc, rateLimit } from '../../../lib/security';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!rateLimit(`feedback:${user.id}`, 10, 10 * 60e3)) {
      return NextResponse.json({ error: 'Too many messages. Try again in a few minutes.' }, { status: 429 });
    }

    const body = await request.json().catch(() => ({}));
    const message = typeof body.message === 'string' ? body.message.slice(0, 4000) : '';
    const type = ['issue', 'idea', 'general', 'post_session'].includes(body.type) ? body.type : 'general';
    const sessionId = typeof body.sessionId === 'string' && /^[0-9a-f-]{36}$/i.test(body.sessionId) ? body.sessionId : null;
    const page = typeof body.page === 'string' ? body.page.slice(0, 200) : null;

    if (message.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Save to Supabase
    const { data, error } = await supabaseAdmin
      .from('feedback')
      .insert({
        user_id: user.id,
        user_email: user.email,
        message: message.trim(),
        type: type || 'general',
        session_id: sessionId || null,
        page: page || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to save feedback:', error);
      throw error;
    }

    // Email notification to you
    try {
     await resend.emails.send({
  from: 'Stride <hello@trystrideai.com>',
  to: 'hello@trystrideai.com',
  replyTo: user.email,
  subject: `Stride Feedback: ${type} from ${user.email}`,

        html: `
          <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #111113;">New Feedback</h2>
            <p><strong>From:</strong> ${esc(user.email)}</p>
            <p><strong>Type:</strong> ${esc(type)}</p>
            ${sessionId ? `<p><strong>Session:</strong> ${esc(sessionId)}</p>` : ''}
            ${page ? `<p><strong>Page:</strong> ${esc(page)}</p>` : ''}
            <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <p style="margin: 0; white-space: pre-wrap;">${esc(message.trim())}</p>
            </div>
            <p style="color: #6b7280; font-size: 12px;">Feedback ID: ${data.id}</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error('Failed to send feedback email:', emailError);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Feedback error:', error);
    return NextResponse.json({ error: 'Failed to send feedback' }, { status: 500 });
  }
}