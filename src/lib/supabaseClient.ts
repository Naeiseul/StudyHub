import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lsypyjxawzjjhpqaswxb.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeXB5anhhd3pqamhwcWFzd3hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2ODg5NDUsImV4cCI6MjA5NjI2NDk0NX0.-5mpFd3fq8Bdl_hwat9clqctAFj8x_vhTpNlodUqh_Q';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
