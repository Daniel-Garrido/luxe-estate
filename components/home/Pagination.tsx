import React from 'react';
import Link from 'next/link';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  category?: string;
  listingType?: string;
  searchQuery?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  category = 'All',
  listingType = 'all',
  searchQuery = '',
}) => {
  if (totalPages <= 1 && totalCount <= pageSize) {
    return null;
  }

  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams();
    if (pageNumber > 1) {
      params.set('page', String(pageNumber));
    }
    if (category && category !== 'All') {
      params.set('category', category);
    }
    if (listingType && listingType !== 'all') {
      params.set('type', listingType);
    }
    if (searchQuery && searchQuery.trim().length > 0) {
      params.set('q', searchQuery.trim());
    }

    const query = params.toString();
    return query ? `/?${query}#properties-grid` : '/#properties-grid';
  };

  const startItem = Math.min((currentPage - 1) * pageSize + 1, totalCount);
  const endItem = Math.min(currentPage * pageSize, totalCount);

  // Generate page numbers to show (with optional ellipsis)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) {
        pages.push('...');
      }
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      pages.push(totalPages);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <div className="mt-14 pt-8 border-t border-nordic-dark/10 flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Information text */}
      <div className="text-sm text-nordic-muted order-2 sm:order-1">
        Showing <span className="font-semibold text-nordic-dark">{startItem}</span> to{' '}
        <span className="font-semibold text-nordic-dark">{endItem}</span> of{' '}
        <span className="font-semibold text-nordic-dark">{totalCount}</span> properties
      </div>

      {/* Pagination controls */}
      <nav
        aria-label="Server-side Properties Pagination"
        className="inline-flex items-center gap-1.5 order-1 sm:order-2 bg-white/80 backdrop-blur-xs p-1.5 rounded-xl border border-nordic-dark/10 shadow-xs"
      >
        {/* Previous Button */}
        {hasPrev ? (
          <Link
            href={createPageUrl(currentPage - 1)}
            scroll={false}
            className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-nordic-dark hover:text-mosque hover:bg-hint-green/30 rounded-lg transition-colors"
            aria-label="Previous page"
          >
            <span className="material-icons text-base">chevron_left</span>
            <span className="hidden xs:inline">Prev</span>
          </Link>
        ) : (
          <span
            className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-nordic-muted/40 cursor-not-allowed select-none rounded-lg"
            aria-disabled="true"
          >
            <span className="material-icons text-base">chevron_left</span>
            <span className="hidden xs:inline">Prev</span>
          </span>
        )}

        {/* Page Number Pills */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((pageNum, idx) => {
            if (pageNum === '...') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2 py-2 text-xs text-nordic-muted select-none"
                >
                  •••
                </span>
              );
            }

            const page = pageNum as number;
            const isActive = page === currentPage;

            return isActive ? (
              <span
                key={page}
                aria-current="page"
                className="w-9 h-9 flex items-center justify-center text-sm font-semibold rounded-lg bg-nordic-dark text-white shadow-xs select-none"
              >
                {page}
              </span>
            ) : (
              <Link
                key={page}
                href={createPageUrl(page)}
                scroll={false}
                className="w-9 h-9 flex items-center justify-center text-sm font-medium text-nordic-dark hover:text-mosque hover:bg-hint-green/40 rounded-lg transition-all"
              >
                {page}
              </Link>
            );
          })}
        </div>

        {/* Next Button */}
        {hasNext ? (
          <Link
            href={createPageUrl(currentPage + 1)}
            scroll={false}
            className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-nordic-dark hover:text-mosque hover:bg-hint-green/30 rounded-lg transition-colors"
            aria-label="Next page"
          >
            <span className="hidden xs:inline">Next</span>
            <span className="material-icons text-base">chevron_right</span>
          </Link>
        ) : (
          <span
            className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-nordic-muted/40 cursor-not-allowed select-none rounded-lg"
            aria-disabled="true"
          >
            <span className="hidden xs:inline">Next</span>
            <span className="material-icons text-base">chevron_right</span>
          </span>
        )}
      </nav>
    </div>
  );
};
