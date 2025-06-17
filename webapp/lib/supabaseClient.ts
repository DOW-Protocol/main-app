import { createClient } from '@supabase/supabase-js';

// Variabel ini akan diambil dari Environment Variables di Vercel/Netlify nanti
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);