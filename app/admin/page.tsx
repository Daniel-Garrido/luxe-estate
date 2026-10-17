import React from 'react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminAddButton } from '@/components/admin/AdminAddButton';
import { AdminSearchForm } from '@/components/admin/AdminSearchForm';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { AdminPropertyRow } from '@/components/admin/AdminPropertyRow';
import { StatCard } from '@/components/admin/StatCard';
import { getPaginatedProperties } from '@/lib/supabase/properties';
import { getPropertyStats } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/dal';
import { getDictionary } from '@/i18n/dictionaries';

const PAGE_SIZE = 10;

interface AdminPropertiesPageProps {
  searchParams: Promise<{ page?: string; q?: string; saved?: string }>;
}

export default async function AdminPropertiesPage({ searchParams }: AdminPropertiesPageProps) {
  await requireAdmin('/admin');
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || '1', 10) || 1);
  const q = (params.q || '').trim();

  const [dict, stats, result] = await Promise.all([
    getDictionary(),
    getPropertyStats(),
    // Session client: RLS lets admins see drafts and deactivated properties too
    getPaginatedProperties({
      page,
      pageSize: PAGE_SIZE,
      searchQuery: q,
      client: await createClient(),
      includeHidden: true,
    }),
  ]);
  const t = dict.admin;
  // Set by the property form after saving
  const savedKey = params.saved;
  const savedMessage =
    savedKey === 'created' || savedKey === 'updated' || savedKey === 'draft'
      ? t.properties.saved[savedKey]
      : null;

  const hrefForPage = (p: number) => {
    const query = new URLSearchParams();
    if (p > 1) query.set('page', String(p));
    if (q) query.set('q', q);
    const qs = query.toString();
    return qs ? `/admin?${qs}` : '/admin';
  };

  return (
    <>
      <AdminPageHeader title={t.properties.title} subtitle={t.properties.subtitle}>
        <AdminSearchForm
          action="/admin"
          defaultValue={q}
          placeholder={t.properties.searchPlaceholder}
          submitLabel={t.search}
          clearLabel={t.clearSearch}
        />
        <AdminAddButton href="/admin/properties/new" label={t.addProperty} />
      </AdminPageHeader>

      {savedMessage && (
        <p
          role="status"
          className="mb-8 flex items-center gap-2 rounded-xl border border-hint-green bg-hint-green/40 px-4 py-3 text-sm font-medium text-mosque"
        >
          <span className="material-icons text-base">check_circle</span>
          {savedMessage}
        </p>
      )}

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
        <StatCard label={t.properties.statTotal} value={stats.total} icon="apartment" />
        <StatCard
          label={t.properties.statForSale}
          value={stats.forSale}
          icon="sell"
          tone="bg-hint-green text-mosque"
        />
        <StatCard
          label={t.properties.statForRent}
          value={stats.forRent}
          icon="key"
          tone="bg-orange-50 text-orange-600"
        />
        <StatCard
          label={t.properties.statFeatured}
          value={stats.featured}
          icon="star"
          tone="bg-amber-50 text-amber-500"
        />
      </section>

      <section className="bg-white rounded-2xl border border-nordic-dark/5 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead className="bg-clear-day/40">
              <tr className="text-xs uppercase tracking-wider text-nordic-muted">
                <th scope="col" className="px-6 py-4 font-semibold">{t.properties.colDetails}</th>
                <th scope="col" className="px-6 py-4 font-semibold">{t.properties.colPrice}</th>
                <th scope="col" className="px-6 py-4 font-semibold">{t.properties.colType}</th>
                <th scope="col" className="px-6 py-4 font-semibold text-right">{t.properties.colActions}</th>
              </tr>
            </thead>
            <tbody>
              {result.properties.map((property) => (
                <AdminPropertyRow key={property.id} property={property} dict={dict} />
              ))}
            </tbody>
          </table>
        </div>

        {result.properties.length === 0 && (
          <p className="px-6 py-16 text-center text-nordic-muted">{t.properties.empty}</p>
        )}

        <AdminPagination
          currentPage={result.page}
          totalPages={result.totalPages}
          totalCount={result.totalCount}
          pageSize={result.pageSize}
          hrefForPage={hrefForPage}
        />
      </section>
    </>
  );
}
