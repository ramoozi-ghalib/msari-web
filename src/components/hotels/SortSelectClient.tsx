'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowUpDown } from 'lucide-react';

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
    <div className="flex items-center gap-2 w-full sm:w-auto">
      <div className="relative flex items-center w-full sm:w-auto">
        <ArrowUpDown size={14} className="absolute start-3 text-[#23096E] pointer-events-none" />
        <select 
          className="w-full sm:w-auto h-9 ps-8 pe-4 rounded-xl bg-neutral-50 hover:bg-neutral-100/80 border border-neutral-200/80 text-xs font-bold text-neutral-800 outline-none focus:ring-2 focus:ring-[#23096E]/20 focus:border-[#23096E] cursor-pointer transition-all appearance-none"
          value={currentSort}
          onChange={handleSortChange}
        >
          <option value="recommended">افتراضي</option>
          <option value="price_asc">السعر (الأقل أولاً)</option>
          <option value="price_desc">السعر (الأعلى أولاً)</option>
        </select>
      </div>
    </div>
  );
}
