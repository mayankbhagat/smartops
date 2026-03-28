import { createClient } from '@supabase/supabase-js';

// Force absolute fallback string if the key is missing or literal string "undefined"
const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const safeUrl = rawUrl && rawUrl.startsWith('http') ? rawUrl : 'https://dummy.supabase.co';
const safeKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'undefined' 
  ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
  : 'dummy-key';

export const supabase = createClient(safeUrl, safeKey);
