import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_EVIDENCE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_EVIDENCE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables for Evidence Safe');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
