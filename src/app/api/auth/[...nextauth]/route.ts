import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import GitHubProvider from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { randomUUID } from "crypto";
import { supabaseAdmin } from "../../../../lib/supabase";
import { consumeLoginToken, enabledProviders, findUserByEmail, normalizeEmail, recordIdentity } from "../../../../lib/account";
import { Resend } from 'resend';
import { esc } from '../../../../lib/security';

const resend = new Resend(process.env.RESEND_API_KEY);
const enabled = enabledProviders();

/**
 * Sign-in methods. Every method resolves to one Stride account per email:
 * signing in with Google, Apple, GitHub or an email link using the same
 * address lands in the same account. Apple and GitHub switch on when their
 * env vars are set (AUTH_APPLE_ID/SECRET, AUTH_GITHUB_ID/SECRET).
 */
const providers: Provider[] = [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  }),
];
if (enabled.apple) providers.push(AppleProvider({ clientId: process.env.AUTH_APPLE_ID!, clientSecret: process.env.AUTH_APPLE_SECRET! }));
if (enabled.github) providers.push(GitHubProvider({ clientId: process.env.AUTH_GITHUB_ID!, clientSecret: process.env.AUTH_GITHUB_SECRET! }));
// email link: /api/auth-link sends a one-time link; this checks it
providers.push(
  Credentials({
    id: "email-link",
    name: "Email link",
    credentials: { email: {}, token: {} },
    async authorize(creds) {
      const email = typeof creds?.email === "string" ? creds.email : "";
      const token = typeof creds?.token === "string" ? creds.token : "";
      if (!email || !token) return null;
      const verified = await consumeLoginToken(email, token);
      if (!verified) return null;
      const existing = await findUserByEmail(verified);
      return { id: existing?.id ?? randomUUID(), email: verified, name: existing?.name ?? null, image: existing?.image ?? null };
    },
  })
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;
      const email = normalizeEmail(user.email);

      const existingUser = await findUserByEmail(email);
      let userId = existingUser?.id;

      if (!existingUser) {
        userId = user.id ?? randomUUID();
        await supabaseAdmin.from('users').insert({
          id: userId,
          email,
          name: user.name,
          image: user.image,
        });

        // Get total user count
        const { count } = await supabaseAdmin
          .from('users')
          .select('*', { count: 'exact', head: true });

        // Notify you of new signup
        try {
          await resend.emails.send({
            from: 'Stride <notifications@trystrideai.com>',
            to: 'emosinachi@gmail.com',
            subject: `New Stride user (#${count}): ${user.name || email}`,
            html: `
              <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
                <h2 style="color: #111113;">New User Signed Up!</h2>
                <p><strong>Name:</strong> ${esc(user.name || 'N/A')}</p>
                <p><strong>Email:</strong> ${esc(email)}</p>
                <p><strong>Signed up with:</strong> ${esc(account?.provider ?? 'unknown')}</p>
                <p><strong>Total users:</strong> ${count}</p>
                <p style="color: #888; font-size: 13px;">${new Date().toLocaleString()}</p>
              </div>
            `,
          });
        } catch (e) {
          console.error('Failed to send new user notification:', e);
        }
      } else if (!existingUser.image && user.image) {
        // fill in a photo the first time a provider gives us one; never overwrite a name they set
        await supabaseAdmin.from('users').update({ image: user.image }).eq('id', existingUser.id);
      }

      if (userId && account?.provider) {
        await recordIdentity(userId, account.provider === "email-link" ? "email" : account.provider, email);
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (account && user?.email) {
        const dbUser = await findUserByEmail(user.email);
        if (dbUser) {
          token.sub = dbUser.id;
          token.name = dbUser.name ?? token.name;
          token.picture = dbUser.image ?? token.picture;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: '/sign-in',
    error: '/sign-in',
  },
});

export const GET = handlers.GET;
export const POST = handlers.POST;
