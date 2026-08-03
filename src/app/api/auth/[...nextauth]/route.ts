import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { supabaseAdmin } from "../../../../lib/supabase";
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false;

      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', user.email)
        .single();

      if (!existingUser) {
        await supabaseAdmin.from('users').insert({
          id: user.id,
          email: user.email,
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
            subject: `New Stride user (#${count}): ${user.name || user.email}`,
            html: `
              <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
                <h2 style="color: #1a3a2f;">New User Signed Up!</h2>
                <p><strong>Name:</strong> ${user.name || 'N/A'}</p>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Total users:</strong> ${count}</p>
                <p style="color: #888; font-size: 13px;">${new Date().toLocaleString()}</p>
              </div>
            `,
          });
        } catch (e) {
          console.error('Failed to send new user notification:', e);
        }
      }

      return true;
    },
    async jwt({ token, user, account }) {
      if (account && user?.email) {
        const { data: dbUser } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('email', user.email)
          .single();

        if (dbUser) {
          token.sub = dbUser.id;
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
    signIn: '/auth/signin',
  },
});

export const GET = handlers.GET;
export const POST = handlers.POST;