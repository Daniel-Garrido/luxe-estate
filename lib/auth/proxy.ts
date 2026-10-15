import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { SessionResult } from '@/lib/supabase/proxy';
import { fetchUserRole } from '@/lib/supabase/roles';
import { canAccessAdmin, isAdminPath } from '@/lib/auth/roles';

// Redirects while keeping the cookies already set on the response (refreshed session, locale)
function redirectWithCookies(request: NextRequest, path: string, from: NextResponse) {
  const redirect = NextResponse.redirect(new URL(path, request.url));
  from.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}

// Role check for /admin routes. Only these routes hit the database, so the rest of
// the site stays fast. This is the optimistic check: the admin layout and the
// Server Functions verify the role again before reading or changing data.
export async function protectAdminRoutes(
  request: NextRequest,
  { response, supabase, userId }: SessionResult
): Promise<NextResponse> {
  const { pathname, search } = request.nextUrl;
  if (!isAdminPath(pathname)) return response;

  if (!userId) {
    const next = encodeURIComponent(`${pathname}${search}`);
    return redirectWithCookies(request, `/login?next=${next}`, response);
  }

  const role = await fetchUserRole(supabase, userId);
  if (!canAccessAdmin(role)) {
    return redirectWithCookies(request, '/', response);
  }

  return response;
}
