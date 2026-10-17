import React from 'react';
import { AdminComingSoon } from '@/components/admin/AdminComingSoon';
import { requireAdmin } from '@/lib/auth/dal';
import { getDictionary } from '@/i18n/dictionaries';

export default async function AdminNewUserPage() {
  await requireAdmin('/admin/users/new');
  const t = (await getDictionary()).admin;

  return <AdminComingSoon title={t.addUser} icon="person_add" backHref="/admin/users" />;
}
