import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  );
}

/**
 * Creates a request-scoped server client. Forwarding the caller's access token
 * is what lets Postgres evaluate auth.uid() in RLS policies.
 */
export const createServerSupabase = (request) => {
  const authorization = request?.headers?.get('authorization');

  return createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: authorization
      ? { headers: { Authorization: authorization } }
      : undefined,
  });
};
