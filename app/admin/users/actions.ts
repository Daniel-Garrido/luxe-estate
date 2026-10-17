'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getAdminOrNull } from '@/lib/auth/dal';
import { isUserRole } from '@/lib/auth/roles';

export type UpdateRoleResult = { ok: true } | { ok: false; error: 'forbidden' | 'self' | 'invalid' | 'failed' };

export async function updateUserRole(userId: string, role: string): Promise<UpdateRoleResult> {
  // Server Functions are public endpoints: re-check the caller's role on every call
  const admin = await getAdminOrNull();
  if (!admin) return { ok: false, error: 'forbidden' };
  if (!isUserRole(role) || typeof userId !== 'string' || !userId) {
    return { ok: false, error: 'invalid' };
  }
  // Also enforced by RLS: an admin cannot demote themselves and lock everyone out
  if (userId === admin.id) return { ok: false, error: 'self' };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)
    .select('id');

  // RLS filters out rows instead of throwing, so an empty result also means it failed
  if (error || !data?.length) {
    if (error) console.error('Error updating user role:', error.message);
    return { ok: false, error: 'failed' };
  }

  revalidatePath('/admin/users');
  return { ok: true };
}
