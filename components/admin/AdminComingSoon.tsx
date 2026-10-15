import React from 'react';
import Link from 'next/link';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { getDictionary } from '@/i18n/dictionaries';

interface AdminComingSoonProps {
  title: string;
  icon: string;
  // Section to return to
  backHref: string;
}

// Placeholder for admin sections that are linked from the UI but not built yet
export const AdminComingSoon = async ({ title, icon, backHref }: AdminComingSoonProps) => {
  const t = (await getDictionary()).admin.comingSoon;

  return (
    <>
      <AdminPageHeader title={title} subtitle={t.body} />
      <section className="flex flex-col items-center text-center gap-4 py-16 px-6 bg-white rounded-2xl border border-nordic-dark/5 shadow-card">
        <span className="flex items-center justify-center w-14 h-14 rounded-full bg-hint-green text-mosque">
          <span className="material-icons text-2xl">{icon}</span>
        </span>
        <p className="text-lg font-semibold text-nordic">{t.title}</p>
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 text-sm font-medium text-mosque hover:underline"
        >
          <span className="material-icons text-base">arrow_back</span>
          {t.back}
        </Link>
      </section>
    </>
  );
};
