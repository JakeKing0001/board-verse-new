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
const supabaseUrl = 'https://yiqbxcxrpjkrrlrvcyar.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpcWJ4Y3hycGprcnJscnZjeWFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1ODQ5MTUsImV4cCI6MjA1OTE2MDkxNX0.wMDxRLTHZc0AqkJwKjUZ6FWi9-3XUc6Sb3F_HDpWWgQ'
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
