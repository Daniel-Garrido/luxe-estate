import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  isLocale,
  matchLocale,
} from '@/i18n/config';
import { updateSession } from '@/lib/supabase/proxy';

// On the first visit, detect the browser language and store it in a cookie
function applyLocale(request: NextRequest): NextResponse {
  if (isLocale(request.cookies.get(LOCALE_COOKIE)?.value)) {
    return NextResponse.next();
  }

  const locale = matchLocale(request.headers.get('accept-language'));

  // Make the cookie visible to Server Components in this same request
  request.cookies.set(LOCALE_COOKIE, locale);
  const response = NextResponse.next({ request: { headers: request.headers } });

  response.cookies.set(LOCALE_COOKIE, locale, {
    path: '/',
    maxAge: LOCALE_COOKIE_MAX_AGE,
    sameSite: 'lax',
  });
  return response;
}

// Then keep the Supabase auth session fresh
export async function proxy(request: NextRequest) {
  return updateSession(request, applyLocale(request));
}

export const config = {
  matcher: [
    // Skip API routes, Next.js internals and static files
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico)$).*)',
  ],
};
