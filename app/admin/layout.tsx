import React from 'react';
import type { Metadata } from 'next';
import { AdminNavbar } from '@/components/admin/AdminNavbar';
import { requireAdmin } from '@/lib/auth/dal';
import { getDictionary } from '@/i18n/dictionaries';
import { format } from '@/i18n/format';

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return {
    title: dict.admin.metaTitle,
    robots: { index: false, follow: false },
  };
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Secure role check; proxy.ts only does the optimistic redirect
  await requireAdmin();
  const dict = await getDictionary();

  return (
    <div className="min-h-screen flex flex-col bg-clear-day text-nordic font-display">
      <AdminNavbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">{children}</main>
      <footer className="border-t border-nordic-dark/10 bg-white py-6 text-center text-sm text-nordic-muted">
        {format(dict.admin.footer, { year: new Date().getFullYear() })}
      </footer>
    </div>
  );
}
