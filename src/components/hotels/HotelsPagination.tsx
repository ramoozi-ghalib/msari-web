'use client';

import Link from 'next/link';
import { useSearchParams, usePathname } from 'next/navigation';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface HotelsPaginationProps {
  currentPage: number;
  totalPages:  number;
}

/**
 * مكوّن Pagination بروابط HTML حقيقية قابلة للزحف (SEO Phase 2 BATCH 4).
 * نفس سلوك التنقل السابق (client-side nav) لكن بـ href فعلية بدل أزرار JS فقط.
 */
export default function HotelsPagination({ currentPage, totalPages }: HotelsPaginationProps) {
  const pathname    = usePathname();
  const searchParams = useSearchParams();

  const pageHref = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete('page');
    } else {
      params.set('page', String(page));
    }
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  // بناء نطاق الأرقام المرئية
  const getPageNumbers = () => {
    const range: (number | '...')[] = [];
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    range.push(1);
    if (currentPage > 4) range.push('...');
    for (let i = Math.max(2, currentPage - 2); i <= Math.min(totalPages - 1, currentPage + 2); i++) {
      range.push(i);
    }
    if (currentPage < totalPages - 3) range.push('...');
    range.push(totalPages);
    return range;
  };

  const prevDisabled = currentPage === 1;
  const nextDisabled = currentPage === totalPages;
  const pagerBtn =
    'w-9 h-9 flex items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-600 hover:bg-[#23096E] hover:text-white hover:border-[#23096E] transition-all duration-200 shadow-xs aria-disabled:opacity-40 aria-disabled:pointer-events-none';

  return (
    <div className="flex items-center justify-center gap-2 mt-8" dir="rtl">
      {/* السابق */}
      {prevDisabled ? (
        <span className={pagerBtn + ' opacity-40 cursor-not-allowed'} aria-label="الصفحة السابقة" aria-disabled="true">
          <ChevronRight size={16} />
        </span>
      ) : (
        <Link
          href={pageHref(currentPage - 1)}
          className={pagerBtn}
          aria-label="الصفحة السابقة"
        >
          <ChevronRight size={16} />
        </Link>
      )}

      {/* أرقام الصفحات */}
      {getPageNumbers().map((pg, i) =>
        pg === '...' ? (
          <span key={`ellipsis-${i}`} className="px-2 text-neutral-400 select-none">
            …
          </span>
        ) : (
          <Link
            key={pg}
            href={pageHref(pg as number)}
            aria-current={pg === currentPage ? 'page' : undefined}
            className={`w-9 h-9 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center ${
              pg === currentPage
                ? 'bg-[#23096E] text-white shadow-md shadow-[#23096E]/20 scale-105'
                : 'border border-neutral-200 bg-white text-neutral-700 hover:bg-[#23096E]/10 hover:border-[#23096E]/30'
            }`}
          >
            {pg}
          </Link>
        )
      )}

      {/* التالي */}
      {nextDisabled ? (
        <span className={pagerBtn + ' opacity-40 cursor-not-allowed'} aria-label="الصفحة التالية" aria-disabled="true">
          <ChevronLeft size={16} />
        </span>
      ) : (
        <Link
          href={pageHref(currentPage + 1)}
          className={pagerBtn}
          aria-label="الصفحة التالية"
        >
          <ChevronLeft size={16} />
        </Link>
      )}
    </div>
  );
}
