import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { supabaseAdmin } from "@/lib/supabase";

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

      // Check if user already exists in Supabase
      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', user.email)
        .single();

      if (!existingUser) {
        // Create new user with the NextAuth-generated ID
        await supabaseAdmin.from('users').insert({
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        });
      }

      return true;
    },
    async jwt({ token, user, account }) {
      // On first sign-in, look up the Supabase user ID by email
      // This ensures the same email ALWAYS gets the same ID
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
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/signin',
  },
});

export const GET = handlers.GET;
export const POST = handlers.POST;