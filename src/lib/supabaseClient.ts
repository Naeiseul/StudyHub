import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vqakyvqxqhgcwtpaexjk.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_05Uj2vkw83-oL0a2BAeCmQ_fMpmynlF';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
