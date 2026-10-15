import React from 'react';
import Link from 'next/link';
import { getDictionary } from '@/i18n/dictionaries';
import { formatRich } from '@/i18n/format';

interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  // Builds the URL for a page while keeping the current filters
  hrefForPage: (page: number) => string;
}

export const AdminPagination = async ({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  hrefForPage,
}: AdminPaginationProps) => {
  if (totalCount === 0) return null;

  const t = (await getDictionary()).admin;
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalCount);

  const button = (label: string, page: number, enabled: boolean) =>
    enabled ? (
      <Link
        href={hrefForPage(page)}
        className="px-4 py-2 text-sm font-medium rounded-lg border border-nordic-dark/10 bg-white text-nordic hover:bg-hint-green/40 hover:text-mosque transition-colors"
      >
        {label}
      </Link>
    ) : (
      <span
        aria-disabled="true"
        className="px-4 py-2 text-sm font-medium rounded-lg border border-nordic-dark/5 text-nordic-muted/40 cursor-not-allowed select-none"
      >
        {label}
      </span>
    );

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-nordic-dark/5">
      <p className="text-sm text-nordic-muted">
        {formatRich(t.showing, {
          start: <span className="font-semibold text-nordic">{start}</span>,
          end: <span className="font-semibold text-nordic">{end}</span>,
          total: <span className="font-semibold text-nordic">{totalCount}</span>,
        })}
      </p>
      <nav aria-label={t.paginationLabel} className="flex gap-2">
        {button(t.prev, currentPage - 1, currentPage > 1)}
        {button(t.next, currentPage + 1, currentPage < totalPages)}
      </nav>
    </div>
  );
};
