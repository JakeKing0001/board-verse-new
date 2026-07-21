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

const authStorage =
  typeof window === 'undefined'
    ? undefined
    : {
        getItem(key) {
          return sessionStorage.getItem(key) ?? localStorage.getItem(key);
        },
        setItem(key, value) {
          const remember = localStorage.getItem('rememberMe') === 'true';
          const selectedStorage = remember ? localStorage : sessionStorage;
          const otherStorage = remember ? sessionStorage : localStorage;
          otherStorage.removeItem(key);
          selectedStorage.setItem(key, value);
        },
        removeItem(key) {
          sessionStorage.removeItem(key);
          localStorage.removeItem(key);
        },
      };

/**
 * Browser-side BoardVerse client. Only a publishable key is used here; access
 * to data is enforced by the database RLS policies and the Supabase session.
 */
export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: authStorage,
  },
});
