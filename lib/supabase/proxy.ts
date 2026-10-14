import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase/config';

// Refreshes an expired Supabase session and writes the new auth cookies
// to both the request (for Server Components) and the response (for the browser).
export async function updateSession(
  request: NextRequest,
  response: NextResponse
): Promise<NextResponse> {
  let supabaseResponse = response;

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
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
  await supabase.auth.getClaims();

  return supabaseResponse;
}
