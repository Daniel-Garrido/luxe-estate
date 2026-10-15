import React from 'react';
import Link from 'next/link';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminSearchForm } from '@/components/admin/AdminSearchForm';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { AdminUserCard } from '@/components/admin/AdminUserCard';
import { getPaginatedProfiles, getRoleCounts } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/dal';
import { USER_ROLES, isUserRole } from '@/lib/auth/roles';
import { getDictionary, getLocale } from '@/i18n/dictionaries';
import type { UserRole } from '@/types/database.types';

const PAGE_SIZE = 10;

interface AdminUsersPageProps {
  searchParams: Promise<{ page?: string; q?: string; role?: string }>;
}

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const admin = await requireAdmin('/admin/users');
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || '1', 10) || 1);
  const q = (params.q || '').trim();
  const role = isUserRole(params.role) ? params.role : undefined;

  const [dict, locale, counts, result] = await Promise.all([
    getDictionary(),
    getLocale(),
    getRoleCounts(),
    getPaginatedProfiles({ page, pageSize: PAGE_SIZE, role, search: q }),
  ]);
  const t = dict.admin;

  const buildHref = (next: { page?: number; role?: UserRole }) => {
    const query = new URLSearchParams();
    if (next.role) query.set('role', next.role);
    if (q) query.set('q', q);
    if (next.page && next.page > 1) query.set('page', String(next.page));
    const qs = query.toString();
    return qs ? `/admin/users?${qs}` : '/admin/users';
  };

  const tabs: { key: UserRole | 'all'; label: string; role?: UserRole }[] = [
    { key: 'all', label: t.users.tabAll },
    ...USER_ROLES.map((r) => ({ key: r, label: t.users.tabs[r], role: r })),
  ];

  return (
    <>
      <AdminPageHeader title={t.users.title} subtitle={t.users.subtitle}>
        <AdminSearchForm
          action="/admin/users"
          defaultValue={q}
          placeholder={t.users.searchPlaceholder}
          submitLabel={t.search}
          clearLabel={t.clearSearch}
          hiddenParams={{ role }}
        />
      </AdminPageHeader>

      {/* Role tabs */}
      <nav className="flex gap-6 border-b border-nordic-dark/10 mb-6 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const active = (role ?? 'all') === tab.key;
          return (
            <Link
              key={tab.key}
              href={buildHref({ role: tab.role })}
              aria-current={active ? 'page' : undefined}
              className={`pb-3 -mb-px whitespace-nowrap text-sm border-b-2 transition-colors ${
                active
                  ? 'border-mosque text-mosque font-semibold'
                  : 'border-transparent text-nordic-muted hover:text-nordic'
              }`}
            >
              {tab.label}
              <span className="ml-1.5 text-xs text-nordic-muted">({counts[tab.key]})</span>
            </Link>
          );
        })}
      </nav>

      {/* Column labels, aligned with the card grid */}
      <div className="hidden md:grid grid-cols-[2fr_1fr_1.2fr_auto] gap-4 px-5 mb-3 text-xs uppercase tracking-wider font-semibold text-nordic-muted">
        <span>{t.users.colUser}</span>
        <span>{t.users.colRole}</span>
        <span>{t.users.colDetails}</span>
        <span className="text-right">{t.users.colActions}</span>
      </div>

      {result.profiles.length > 0 ? (
        <ul className="space-y-4">
          {result.profiles.map((profile) => (
            <AdminUserCard
              key={profile.id}
              profile={profile}
              isCurrentUser={profile.id === admin.id}
              dict={dict}
              locale={locale}
            />
          ))}
        </ul>
      ) : (
        <p className="py-16 text-center text-nordic-muted bg-white rounded-2xl border border-nordic-dark/5">
          {t.users.empty}
        </p>
      )}

      {result.totalCount > 0 && (
        <div className="mt-6 bg-white rounded-2xl border border-nordic-dark/5 shadow-card">
          <AdminPagination
            currentPage={result.page}
            totalPages={result.totalPages}
            totalCount={result.totalCount}
            pageSize={result.pageSize}
            hrefForPage={(p) => buildHref({ page: p, role })}
          />
        </div>
      )}
    </>
  );
}
