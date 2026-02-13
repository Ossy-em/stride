import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, type, sessionId, page } = await request.json();

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
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
        from: 'Stride <notifications@trystrideai.com>',
        to: 'emosinachi@gmail.com',
        subject: `Stride Feedback: ${type || 'general'} from ${user.email}`,
        html: `
          <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1a3a2f;">New Feedback</h2>
            <p><strong>From:</strong> ${user.email}</p>
            <p><strong>Type:</strong> ${type || 'general'}</p>
            ${sessionId ? `<p><strong>Session:</strong> ${sessionId}</p>` : ''}
            ${page ? `<p><strong>Page:</strong> ${page}</p>` : ''}
            <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <p style="margin: 0; white-space: pre-wrap;">${message.trim()}</p>
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}