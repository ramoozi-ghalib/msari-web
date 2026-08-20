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
    <div className="flex items-center justify-center gap-2" dir="ltr">
      {/* السابق */}
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-9 h-9 flex items-center justify-center rounded-xl border border-neutral-200 text-neutral-600 hover:bg-[#23096e] hover:text-white hover:border-[#23096e] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="الصفحة السابقة"
      >
        <ChevronLeft size={16} />
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
            onClick={() => goToPage(pg as number)}
            className={`w-9 h-9 rounded-xl text-sm font-bold transition-all duration-200 ${
              pg === currentPage
                ? 'bg-[#23096e] text-white shadow-md shadow-[#23096e]/20'
                : 'border border-neutral-200 text-neutral-600 hover:bg-[#23096e]/10 hover:border-[#23096e]/30'
            }`}
          >
            {pg}
          </button>
        )
      )}

      {/* التالي */}
      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-9 h-9 flex items-center justify-center rounded-xl border border-neutral-200 text-neutral-600 hover:bg-[#23096e] hover:text-white hover:border-[#23096e] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="الصفحة التالية"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
