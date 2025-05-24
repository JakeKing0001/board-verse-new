
import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://yiqbxcxrpjkrrlrvcyar.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpcWJ4Y3hycGprcnJscnZjeWFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1ODQ5MTUsImV4cCI6MjA1OTE2MDkxNX0.wMDxRLTHZc0AqkJwKjUZ6FWi9-3XUc6Sb3F_HDpWWgQ'
export const supabase = createClient(supabaseUrl, supabaseAnonKey)