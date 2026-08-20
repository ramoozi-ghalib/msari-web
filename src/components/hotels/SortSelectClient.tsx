'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';

export default function SortSelectClient({ currentSort }: { currentSort: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    if (e.target.value !== 'recommended') {
      params.set('sort', e.target.value);
    } else {
      params.delete('sort');
    }
    // Reset page on sort change
    params.delete('page');
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="relative inline-flex items-center">
      <div className="flex items-center gap-2.5 bg-white rounded-2xl px-4 py-2.5 shadow-xs border border-neutral-200/80 hover:border-[#23096E]/30 transition-all">
        <SlidersHorizontal size={15} className="text-[#23096E] shrink-0" />
        <select 
          className="bg-transparent text-xs font-bold text-neutral-800 outline-none cursor-pointer pe-4 appearance-none"
          value={currentSort}
          onChange={handleSortChange}
        >
          <option value="recommended">افتراضي</option>
          <option value="price_asc">السعر (الأقل أولاً)</option>
          <option value="price_desc">السعر (الأعلى أولاً)</option>
        </select>
        <ChevronDown size={13} className="text-neutral-400 -ms-3 pointer-events-none shrink-0" />
      </div>
    </div>
  );
}
