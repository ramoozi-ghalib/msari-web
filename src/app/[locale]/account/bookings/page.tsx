'use client';

import Link from 'next/link';
import { BookOpen, Hotel, Clock, CheckCircle, ArrowRight } from 'lucide-react';

export default function AccountBookingsPage() {
  // Placeholder — will be connected to Supabase auth + bookings in next phase
  const mockBookings = [
    { id: 'BK-001', hotel: 'فندق موفنبيك صنعاء', checkIn: '٢٠٢٥-٠٤-١٠', checkOut: '٢٠٢٥-٠٤-١٣', nights: 3, total: 255, status: 'confirmed' },
    { id: 'BK-002', hotel: 'فندق عزيزي عدن', checkIn: '٢٠٢٥-٠٣-٠١', checkOut: '٢٠٢٥-٠٣-٠٣', nights: 2, total: 120, status: 'completed' },
  ];

  const statusColors: Record<string, string> = {
    confirmed: 'bg-green-100 text-green-700',
    pending: 'bg-amber-100 text-amber-700',
    completed: 'bg-blue-100 text-blue-700',
    cancelled: 'bg-red-100 text-red-600',
  };

  const statusLabels: Record<string, string> = {
    confirmed: 'مؤكد',
    pending: 'قيد المراجعة',
    completed: 'مكتمل',
    cancelled: 'ملغي',
  };

  return (
    <div className="min-h-screen bg-[#f8f8fa]">

      {/* Hero */}
      <section className="relative pt-28 pb-16 bg-gradient-to-br from-[#23096e] to-[#3A1C8F]">
        <div className="container-msari">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
              <BookOpen size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">حجوزاتي</h1>
              <p className="text-white/70 text-sm">جميع حجوزاتك في مكان واحد</p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="container-msari py-10">
        <div className="max-w-3xl mx-auto">

          {/* Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-8 flex items-start gap-3">
            <Clock size={18} className="text-amber-600 mt-0.5 shrink-0" />
            <div>
              <div className="font-bold text-amber-800 text-sm mb-1">ملاحظة</div>
              <p className="text-amber-700 text-sm">
                هذا عرض تجريبي. ستتمكن من رؤية حجوزاتك الحقيقية بعد تفعيل نظام تسجيل الدخول.
                للاستفسار عن حجزك الآن، تواصل معنا عبر{' '}
                <a href="https://wa.me/967770000000" target="_blank" rel="noopener noreferrer" className="underline font-bold">واتساب</a>.
              </p>
            </div>
          </div>

          {/* Bookings List */}
          <div className="space-y-4">
            {mockBookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 hover:shadow-md transition-shadow duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#23096e]/10 rounded-xl flex items-center justify-center">
                      <Hotel size={18} className="text-[#23096e]" />
                    </div>
                    <div>
                      <div className="font-black text-neutral-900">{booking.hotel}</div>
                      <div className="text-neutral-400 text-xs mt-0.5">رقم الحجز: {booking.id}</div>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusColors[booking.status]}`}>
                    {statusLabels[booking.status]}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-neutral-100 mb-4">
                  <div>
                    <div className="text-xs text-neutral-400 mb-1">تاريخ الوصول</div>
                    <div className="font-bold text-neutral-700 text-sm">{booking.checkIn}</div>
                  </div>
                  <div>
                    <div className="text-xs text-neutral-400 mb-1">تاريخ المغادرة</div>
                    <div className="font-bold text-neutral-700 text-sm">{booking.checkOut}</div>
                  </div>
                  <div>
                    <div className="text-xs text-neutral-400 mb-1">عدد الليالي</div>
                    <div className="font-bold text-neutral-700 text-sm">{booking.nights} ليالٍ</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-neutral-400">إجمالي الحجز </span>
                    <span className="font-black text-[#23096e] text-lg">${booking.total}</span>
                  </div>
                  {booking.status === 'confirmed' && (
                    <a
                      href={`https://wa.me/967770000000?text=أريد الاستفسار عن حجزي رقم ${booking.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-bold text-[#23096e] hover:underline flex items-center gap-1"
                    >
                      تواصل معنا <ArrowRight size={14} className="rtl:rotate-180" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-10 bg-white rounded-2xl p-8 shadow-sm border border-neutral-100 text-center">
            <div className="w-14 h-14 bg-[#23096e]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Hotel size={28} className="text-[#23096e]" />
            </div>
            <h3 className="text-xl font-black text-neutral-900 mb-3">هل تريد حجزاً جديداً؟</h3>
            <p className="text-neutral-500 text-sm mb-6">تصفح الفنادق واحجز إقامتك القادمة</p>
            <Link href="/hotels" className="btn btn-primary">
              تصفح الفنادق
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
