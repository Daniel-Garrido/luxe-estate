// Server-only: data for the admin dashboard
import { createClient } from '@/lib/supabase/server';
import { USER_ROLES } from '@/lib/auth/roles';
import type { ProfileRow, PropertyRow, UserRole } from '@/types/database.types';

export interface PropertyStats {
  total: number;
  forSale: number;
  forRent: number;
  featured: number;
}

// Uses the admin's session so drafts are counted too
export async function getPropertyStats(): Promise<PropertyStats> {
  const supabase = await createClient();
  const base = () => supabase.from('properties').select('id', { count: 'exact', head: true });

  const results = await Promise.all([
    base(),
    base().eq('listing_type', 'buy'),
    base().eq('listing_type', 'rent'),
    base().eq('is_featured', true),
  ]);
  const [total, forSale, forRent, featured] = results.map(({ count, error }) => {
    if (error) console.error('Error counting properties:', error.message);
    return count ?? 0;
  });

  return { total, forSale, forRent, featured };
}

// Raw row for the edit form; null when it does not exist (RLS also hides drafts from non-admins)
export async function getPropertyForEdit(id: string): Promise<PropertyRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('properties').select('*').eq('id', id).maybeSingle();
  if (error) console.error('Error fetching property for edit:', error.message);
  return data ?? null;
}

export interface FetchProfilesParams {
  page?: number;
  pageSize?: number;
  role?: UserRole;
  search?: string;
}

export interface PaginatedProfilesResult {
  profiles: ProfileRow[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Uses the signed-in admin's session: RLS only returns every profile to admins
export async function getPaginatedProfiles({
  page = 1,
  pageSize = 10,
  role,
  search = '',
}: FetchProfilesParams = {}): Promise<PaginatedProfilesResult> {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase.from('profiles').select('*', { count: 'exact' });
  if (role) {
    query = query.eq('role', role);
  }
  // Strip characters that have meaning in PostgREST filter syntax
  const term = search.replace(/[,()%*\\]/g, ' ').trim();
  if (term) {
    query = query.or(`full_name.ilike.%${term}%,email.ilike.%${term}%`);
  }

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Error fetching profiles:', error.message);
  }

  const totalCount = count ?? 0;
  return {
    profiles: data ?? [],
    totalCount,
    page,
    pageSize,
    totalPages: Math.ceil(totalCount / pageSize),
  };
}

export type RoleCounts = Record<UserRole | 'all', number>;

export async function getRoleCounts(): Promise<RoleCounts> {
  const supabase = await createClient();
  const countRole = async (role?: UserRole) => {
    let query = supabase.from('profiles').select('id', { count: 'exact', head: true });
    if (role) query = query.eq('role', role);
    const { count } = await query;
    return count ?? 0;
  };

  const [all, ...perRole] = await Promise.all([undefined, ...USER_ROLES].map(countRole));
  return USER_ROLES.reduce(
    (acc, role, i) => ({ ...acc, [role]: perRole[i] }),
    { all } as RoleCounts
  );
}
