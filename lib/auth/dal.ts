// Server-only: authorization checks for pages and Server Functions
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/supabase/server';
import { canAccessAdmin, ADMIN_PATH } from '@/lib/auth/roles';
import type { AuthUser } from '@/types/auth';

// Secure check for admin pages: proxy.ts already redirected, but never rely on it alone
export async function requireAdmin(next: string = ADMIN_PATH): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }
  if (!canAccessAdmin(user.role)) {
    redirect('/');
  }
  return user;
}

// For Server Functions, which should return an error instead of redirecting
export async function getAdminOrNull(): Promise<AuthUser | null> {
  const user = await getCurrentUser();
  return user && canAccessAdmin(user.role) ? user : null;
}
