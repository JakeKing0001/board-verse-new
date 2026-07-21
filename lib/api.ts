import { supabase } from './supabase';

/** Headers used by BoardVerse route handlers that are protected by Supabase RLS. */
export const getApiHeaders = async (): Promise<Record<string, string>> => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return {
    'Content-Type': 'application/json',
    ...(session?.access_token
      ? { Authorization: `Bearer ${session.access_token}` }
      : {}),
  };
};
