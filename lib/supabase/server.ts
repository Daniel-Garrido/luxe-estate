// Server-only: uses next/headers, so importing it from a Client Component fails at build time
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { User } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase/config';
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
export function toAuthUser(user: User): AuthUser {
  const meta = user.user_metadata ?? {};
  return {
    id: user.id,
    email: user.email ?? null,
    name: meta.full_name || meta.name || meta.user_name || user.email || null,
    avatarUrl: meta.avatar_url || meta.picture || null,
    provider: user.app_metadata?.provider ?? null,
  };
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? toAuthUser(user) : null;
}
