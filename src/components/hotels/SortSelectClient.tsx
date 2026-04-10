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
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex items-center gap-3 w-full sm:w-auto">
      <ArrowUpDown size={18} className="text-neutral-400" />
      <select 
        className="input-msari py-2 outline-none border-none bg-neutral-50"
        value={currentSort}
        onChange={handleSortChange}
      >
        <option value="recommended">الأعلى توصية</option>
        <option value="price_asc">السعر (الأقل أولاً)</option>
        <option value="price_desc">السعر (الأعلى أولاً)</option>
        <option value="rating">تقييم النزلاء</option>
      </select>
    </div>
  );
}
