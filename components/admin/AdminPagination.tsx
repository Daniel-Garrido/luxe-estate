import React from 'react';
import Link from 'next/link';
import { getDictionary } from '@/i18n/dictionaries';
import { format, formatRich } from '@/i18n/format';

interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  // Builds the URL for a page while keeping the current filters
  hrefForPage: (page: number) => string;
}

// First, last and the pages around the current one; gaps become an ellipsis
function getPageItems(current: number, total: number): (number | 'gap')[] {
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);

  return sorted.flatMap((page, i) => {
    const prev = sorted[i - 1];
    if (prev === undefined || page - prev === 1) return [page];
    // A gap of a single page shows that page instead of "…"
    return page - prev === 2 ? [prev + 1, page] : ['gap' as const, page];
  });
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
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  const arrow = (label: string, icon: string, page: number, enabled: boolean) =>
    enabled ? (
      <Link
        href={hrefForPage(page)}
        aria-label={label}
        className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-nordic-muted hover:bg-hint-green/40 hover:text-mosque transition-colors"
      >
        <span className="material-icons text-xl">{icon}</span>
      </Link>
    ) : (
      <span
        aria-disabled="true"
        className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-nordic-muted/30 cursor-not-allowed select-none"
      >
        <span className="material-icons text-xl">{icon}</span>
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
      {totalPages > 1 && (
        <nav aria-label={t.paginationLabel} className="flex items-center gap-1">
          {arrow(t.prev, 'chevron_left', currentPage - 1, hasPrev)}
          {getPageItems(currentPage, totalPages).map((item, i) =>
            item === 'gap' ? (
              <span key={`gap-${i}`} className="w-9 text-center text-sm text-nordic-muted/60 select-none">
                …
              </span>
            ) : (
              <Link
                key={item}
                href={hrefForPage(item)}
                aria-label={format(t.page, { page: item })}
                aria-current={item === currentPage ? 'page' : undefined}
                className={`inline-flex items-center justify-center min-w-9 h-9 px-3 rounded-lg text-sm font-medium transition-colors ${
                  item === currentPage
                    ? 'bg-mosque text-white shadow-sm'
                    : 'text-nordic-dark/70 hover:bg-hint-green/40 hover:text-mosque'
                }`}
              >
                {item}
              </Link>
            )
          )}
          {arrow(t.next, 'chevron_right', currentPage + 1, hasNext)}
        </nav>
      )}
    </div>
  );
};
