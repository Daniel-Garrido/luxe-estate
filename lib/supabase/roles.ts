import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, UserRole } from '@/types/database.types';
import { DEFAULT_ROLE } from '@/lib/auth/roles';

// Reads the role from `profiles` with the user's own session (RLS: users can read their own row).
// Falls back to the least privileged role if the profile is missing or the query fails.
export async function fetchUserRole(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<UserRole> {
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user role:', error.message);
  }
  return data?.role ?? DEFAULT_ROLE;
}
