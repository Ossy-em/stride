import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { supabase } from "@/lib/supabase";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // When user signs in with Google, save them to Supabase
      if (user.email) {
        const { data: existingUser } = await supabase
          .from('users')
          .select('*')
          .eq('email', user.email)
          .single();

        if (!existingUser) {
          // Create new user in Supabase
          await supabase.from('users').insert({
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          });
        }
      }
      return true;
    },
    async session({ session, token }) {
      // Add user ID to session
      if (session.user) {
        session.user.id = token.sub!;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
});

export const GET = handlers.GET;
export const POST = handlers.POST;