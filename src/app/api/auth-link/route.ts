/**
 * POST /api/auth-link { email, callbackUrl? }
 * Emails a one-time sign-in link. Always answers the same way, so it
 * can't be used to find out who has an account.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { LINK_MINUTES, createLoginToken, normalizeEmail } from "@/lib/account";
import { clientIp, rateLimit } from "@/lib/security";

const input = z.object({
  email: z.string().trim().email().max(254),
  callbackUrl: z.string().max(300).optional(),
});

const safePath = (p?: string) => (p && p.startsWith("/") && !p.startsWith("//") ? p : "/home");
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export async function POST(request: NextRequest) {
  // per-address limits live in the database; this stops one visitor emailing lots of addresses
  if (!rateLimit(`auth-link:${clientIp(request)}`, 10, 60 * 60e3)) {
    return NextResponse.json({ error: "Too many sign-in links. Try again in an hour." }, { status: 429 });
  }
  const parsed = input.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  if (!process.env.RESEND_API_KEY) return NextResponse.json({ error: "Email sign-in isn't available right now." }, { status: 503 });

  const email = normalizeEmail(parsed.data.email);
  let token: string | null;
  try {
    token = await createLoginToken(email);
  } catch (e) {
    console.error("auth-link: token failed", e);
    return NextResponse.json({ error: "Email sign-in isn't available right now." }, { status: 503 });
  }
  if (!token) return NextResponse.json({ error: "Too many sign-in links. Try again in an hour." }, { status: 429 });

  const origin = process.env.AUTH_URL || process.env.NEXTAUTH_URL || request.nextUrl.origin;
  const url = new URL("/sign-in/verify", origin);
  url.searchParams.set("email", email);
  url.searchParams.set("token", token);
  url.searchParams.set("callbackUrl", safePath(parsed.data.callbackUrl));
  const link = url.toString();

  try {
    await new Resend(process.env.RESEND_API_KEY).emails.send({
      from: "Stride <notifications@trystrideai.com>",
      to: email,
      subject: "Your Stride sign-in link",
      text: `Sign in to Stride:\n${link}\n\nThis link works once and expires in ${LINK_MINUTES} minutes. If you didn't ask for it, you can ignore this email.`,
      html: `
        <div style="font-family: -apple-system, Segoe UI, sans-serif; max-width: 460px; margin: 0 auto; padding: 32px 24px; color: #111113;">
          <p style="font-size: 20px; font-weight: 600; margin: 0 0 20px;">stride</p>
          <p style="font-size: 15px; line-height: 22px; margin: 0 0 24px;">Use this button to sign in to Stride.</p>
          <a href="${esc(link)}" style="display: inline-block; background: #111113; color: #f7f8f8; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 20px; border-radius: 999px;">Sign in to Stride</a>
          <p style="font-size: 13px; line-height: 20px; color: #6b6b72; margin: 24px 0 0;">This link works once and expires in ${LINK_MINUTES} minutes. If you didn't ask for it, you can ignore this email.</p>
        </div>`,
    });
  } catch (e) {
    console.error("auth-link: email failed", e);
    return NextResponse.json({ error: "We couldn't send the email. Try again." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
