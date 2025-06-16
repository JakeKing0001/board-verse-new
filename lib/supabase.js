import { createClient } from '@supabase/supabase-js'
/**
 * The anonymous public API key for accessing the Supabase backend.
 * 
 * @constant
 * @type {string}
 * @see {@link https://supabase.com/docs/guides/api}
 * @description
 * This key is used to authenticate client-side requests to the Supabase project.
 * It should be safe to expose in frontend code, but ensure you do not use it for sensitive operations.
*/
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
