import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase'; // Use admin client
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    console.log('Received request to /waitlist');

    const { email } = await request.json();
    console.log('Request body email:', email);

    if (!email || typeof email !== 'string') {
      console.warn('Email missing or invalid type');
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.warn('Email format invalid:', email);
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Insert into Supabase waitlist using admin client
    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('waitlist')
      .insert({ email: normalizedEmail })
      .select()
      .single();

    console.log('Supabase insert result:', insertData, insertError);

    if (insertError) {
      if (insertError.code === '23505') {
        console.info('Email already exists in waitlist');
        return NextResponse.json({ error: "You're already on the waitlist!" }, { status: 409 });
      }
      console.error('Supabase insert failed:', insertError);
      throw insertError;
    }

    // Get total count
    const { count, error: countError } = await supabaseAdmin
      .from('waitlist')
      .select('*', { count: 'exact', head: true });

    console.log('Supabase count result:', count, countError);

    if (countError) {
      console.error('Supabase count failed:', countError);
      throw countError;
    }

    // Send notification email via Resend
    try {
      const emailResponse = await resend.emails.send({
  from: 'Stride <notifications@trystrideai.com>',
  to: 'emosinachi@gmail.com', // Your notification email
  subject: `New waitlist signup (#${count})`,
  html: `
    <div style="font-family: 'Inter', sans-serif; background-color: #1a1a1a; color: #ffffff; padding: 30px; border-radius: 12px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #0f1a15; padding: 25px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
        <h1 style="color: #84cc16; font-size: 24px; margin-bottom: 20px;">New Stride Signup!</h1>
        <p style="font-size: 16px; margin: 10px 0;">
          <strong>Email:</strong> <span style="color: #84cc16;">${normalizedEmail}</span>
        </p>
        <p style="font-size: 16px; margin: 10px 0;">
          <strong>Total signups:</strong> <span style="color: #84cc16;">${count}</span>
        </p>
        <p style="font-size: 14px; margin: 10px 0; color: #cccccc;">
          <strong>Time:</strong> ${new Date().toLocaleString()}
        </p>
        <hr style="border: 0; border-top: 1px solid #84cc16; margin: 20px 0;">
        <p style="font-size: 12px; color: #aaaaaa; text-align: center;">
          This is an automated Stride notification. Visit <a href="https://www.trystrideai.com" style="color: #84cc16;">Stride</a> for more info.
        </p>
      </div>
    </div>
  `,
});

      console.log('Resend email sent successfully:', emailResponse);
    } catch (resendError) {
      console.error('Resend email failed:', resendError);
      // Don't throw - user is already added to waitlist
    }

    console.log("Waitlist process completed successfully for email:", normalizedEmail);

    return NextResponse.json({ success: true, message: "You're on the list!" });
  } catch (error) {
    console.error('Waitlist POST handler caught error:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}