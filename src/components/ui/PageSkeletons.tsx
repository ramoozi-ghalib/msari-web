// Shared route-transition skeletons (used by loading.tsx files).
// Shapes mirror the real pages so navigation feels instant, not empty.

function Block({ className = '' }: { className?: string }) {
  return <div className={`skeleton-shimmer rounded-xl ${className}`} />;
}

export function HotelsListSkeleton() {
  return (
    <div dir="rtl" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Block className="h-8 w-56 mb-2" />
      <Block className="h-4 w-80 mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl overflow-hidden border border-neutral-200/80"
          >
            <Block className="aspect-[16/10] !rounded-none" />
            <div className="p-4 space-y-2.5">
              <Block className="h-5 w-3/4" />
              <Block className="h-4 w-1/2" />
              <div className="flex justify-between items-center pt-1">
                <Block className="h-6 w-20" />
                <Block className="h-9 w-24 !rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HotelDetailSkeleton() {
  return (
    <div dir="rtl" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Block className="aspect-[16/8] sm:aspect-[16/6] !rounded-2xl mb-6" />
      <Block className="h-8 w-2/3 mb-3" />
      <Block className="h-4 w-1/3 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-neutral-200/80 p-4 flex gap-4"
          >
            <Block className="w-32 h-24 shrink-0" />
            <div className="flex-1 space-y-2.5 py-1">
              <Block className="h-5 w-3/4" />
              <Block className="h-4 w-1/2" />
              <Block className="h-6 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function GenericSkeleton() {
  return (
    <div dir="rtl" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Block className="h-9 w-64 mb-3" />
      <Block className="h-4 w-96 max-w-full mb-8" />
      <Block className="h-64 w-full !rounded-2xl mb-4" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Block key={i} className="h-28" />
        ))}
      </div>
    </div>
  );
}
