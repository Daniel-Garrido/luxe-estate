// Server-only: uses next/headers, so importing it from a Client Component fails at build time
import { cache } from 'react';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { User } from '@supabase/supabase-js';
import { Database, type UserRole } from '@/types/database.types';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase/config';
import { fetchUserRole } from '@/lib/supabase/roles';
import type { AuthUser } from '@/types/auth';

// Auth-aware client for Server Components, Server Functions and Route Handlers
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component, where cookies are read-only.
          // Safe to ignore: proxy.ts refreshes the session on every request.
        }
      },
    },
  });
}

// Google stores the photo in `picture`, GitHub in `avatar_url`
export function toAuthUser(user: User, role: UserRole): AuthUser {
  const meta = user.user_metadata ?? {};
  return {
    id: user.id,
    email: user.email ?? null,
    name: meta.full_name || meta.name || meta.user_name || user.email || null,
    avatarUrl: meta.avatar_url || meta.picture || null,
    provider: user.app_metadata?.provider ?? null,
    role,
  };
}

// Cached per request, so the root layout, admin layout and pages share one lookup.
// The role is read from the database (not the JWT), so it is safe for authorization.
export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  return toAuthUser(user, await fetchUserRole(supabase, user.id));
});
