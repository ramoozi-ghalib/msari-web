import { Suspense } from 'react';
import BookingPage from './BookingPage';
import BookingGuard from '@/components/auth/BookingGuard';

export default function Page() {
  return (
    <BookingGuard>
      <Suspense fallback={
        <div className="min-h-screen bg-[#f8f8fa] flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-4 border-[#23096e]/20 border-t-[#23096e] animate-spin mx-auto mb-4" />
            <p className="text-neutral-400 text-sm">جاري التحميل...</p>
          </div>
        </div>
      }>
        <BookingPage />
      </Suspense>
    </BookingGuard>
  );
}
