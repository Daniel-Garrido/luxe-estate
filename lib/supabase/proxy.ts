import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase/config';

export interface SessionResult {
  response: NextResponse;
  supabase: SupabaseClient<Database>;
  userId: string | null;
}

// Refreshes an expired Supabase session and writes the new auth cookies
// to both the request (for Server Components) and the response (for the browser).
export async function updateSession(
  request: NextRequest,
  response: NextResponse
): Promise<SessionResult> {
  let supabaseResponse = response;

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        const refreshed = NextResponse.next({ request: { headers: request.headers } });
        // Keep cookies already set on the original response (e.g. the locale cookie)
        supabaseResponse.cookies.getAll().forEach((cookie) => refreshed.cookies.set(cookie));
        cookiesToSet.forEach(({ name, value, options }) =>
          refreshed.cookies.set(name, value, options)
        );
        supabaseResponse = refreshed;
      },
    },
  });

  // Do not run code between createServerClient and getClaims: it triggers the token refresh
  const { data } = await supabase.auth.getClaims();

  return {
    response: supabaseResponse,
    supabase,
    userId: data?.claims?.sub ?? null,
  };
}
