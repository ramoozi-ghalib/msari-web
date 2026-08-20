'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface HotelsPaginationProps {
  currentPage: number;
  totalPages:  number;
}

/**
 * مكوّن Pagination يُعدِّل URL params عند التنقل بين الصفحات.
 * يحافظ على جميع الفلاتر الحالية عند تغيير الصفحة.
 */
export default function HotelsPagination({ currentPage, totalPages }: HotelsPaginationProps) {
  const router      = useRouter();
  const pathname    = usePathname();
  const searchParams = useSearchParams();

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete('page');
    } else {
      params.set('page', String(page));
    }
    router.push(`${pathname}?${params.toString()}`);
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

  return (
    <div className="flex items-center justify-center gap-2 mt-8" dir="rtl">
      {/* السابق */}
      <button
        type="button"
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-9 h-9 flex items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-600 hover:bg-[#23096E] hover:text-white hover:border-[#23096E] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
        aria-label="الصفحة السابقة"
      >
        <ChevronRight size={16} />
      </button>

      {/* أرقام الصفحات */}
      {getPageNumbers().map((pg, i) =>
        pg === '...' ? (
          <span key={`ellipsis-${i}`} className="px-2 text-neutral-400 select-none">
            …
          </span>
        ) : (
          <button
            key={pg}
            type="button"
            onClick={() => goToPage(pg as number)}
            className={`w-9 h-9 rounded-xl text-xs font-bold transition-all duration-200 ${
              pg === currentPage
                ? 'bg-[#23096E] text-white shadow-md shadow-[#23096E]/20 scale-105'
                : 'border border-neutral-200 bg-white text-neutral-700 hover:bg-[#23096E]/10 hover:border-[#23096E]/30'
            }`}
          >
            {pg}
          </button>
        )
      )}

      {/* التالي */}
      <button
        type="button"
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-9 h-9 flex items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-600 hover:bg-[#23096E] hover:text-white hover:border-[#23096E] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
        aria-label="الصفحة التالية"
      >
        <ChevronLeft size={16} />
      </button>
    </div>
  );
}
