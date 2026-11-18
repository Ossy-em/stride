import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

if (!supabaseUrl || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase environment variables');
}

// No public (anon-key) client here on purpose. Every read and write goes
// through the server with the service role, after checking who's asking.
// Row-level security is on for every table, so the public key can't read data.

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

