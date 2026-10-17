import type { UserRole } from '@/types/database.types';

// Ordered from most to least privileged; must match the `user_role` enum in Supabase
export const USER_ROLES: readonly UserRole[] = ['admin', 'broker', 'agent', 'viewer'];

export const DEFAULT_ROLE: UserRole = 'viewer';

// Roles allowed into /admin. Add 'broker' here to open the dashboard to brokers.
export const ADMIN_ROLES: readonly UserRole[] = ['admin'];

export const ADMIN_PATH = '/admin';

export const isUserRole = (value: unknown): value is UserRole =>
  typeof value === 'string' && (USER_ROLES as readonly string[]).includes(value);

export const canAccessAdmin = (role: UserRole | null | undefined): boolean =>
  !!role && ADMIN_ROLES.includes(role);

export const isAdminPath = (pathname: string): boolean =>
  pathname === ADMIN_PATH || pathname.startsWith(`${ADMIN_PATH}/`);
