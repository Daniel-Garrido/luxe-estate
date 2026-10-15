import React from 'react';
import { AdminComingSoon } from '@/components/admin/AdminComingSoon';
import { requireAdmin } from '@/lib/auth/dal';
import { getDictionary } from '@/i18n/dictionaries';

export default async function AdminNewPropertyPage() {
  await requireAdmin('/admin/properties/new');
  const t = (await getDictionary()).admin;

  return <AdminComingSoon title={t.addProperty} icon="add_home" backHref="/admin" />;
}
