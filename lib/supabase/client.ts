import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/database.types';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase/config';

// Auth-aware client for Client Components (session lives in cookies shared with the server)
export function createClient() {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}
