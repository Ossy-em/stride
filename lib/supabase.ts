import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Client-side Supabase client (for auth, public operations)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side admin client (for API routes with elevated privileges)
// Only use this in API routes, NEVER expose to client
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Helper function to get current user (we'll implement auth later)
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}