import Link from 'next/link';
import { redirect } from 'next/navigation';
import { BookOpen, Hotel, Clock, ArrowRight } from 'lucide-react';
import { auth } from '@/auth';
import { getMyBookings } from '@/actions/bookings';
import { Button } from '@/components/ui/Button';

export default async function AccountBookingsPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/${locale}/auth/login?redirect=/account/bookings`);
  }

  const res = await getMyBookings();
  const bookings = res.success ? (res.data || []) : [];

  const statusColors: Record<string, string> = {
    CONFIRMED: 'bg-green-100 text-green-700',
    PENDING: 'bg-amber-100 text-amber-700',
    COMPLETED: 'bg-blue-100 text-blue-700',
    CANCELLED: 'bg-red-100 text-red-600',
    REJECTED: 'bg-red-100 text-red-600',
    NO_SHOW: 'bg-gray-100 text-gray-700',
  };

  const statusLabels: Record<string, string> = {
    CONFIRMED: 'مؤكد',
    PENDING: 'قيد المراجعة',
    COMPLETED: 'مكتمل',
    CANCELLED: 'ملغي',
    REJECTED: 'مرفوض',
    NO_SHOW: 'لم يحضر',
  };

  return (
    <div className="min-h-screen bg-[var(--surface-page)]">
      {/* Hero */}
      <section className="relative pt-28 pb-16 bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)]">
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
                ستتمكن من رؤية حجوزاتك الحقيقية والتحقق منها مباشرة.
                للاستفسار عن أي حجز بشكل فوري، تواصل معنا عبر{' '}
                <a href="https://wa.me/967784644466" target="_blank" rel="noopener noreferrer" className="underline font-bold">واتساب</a>.
              </p>
            </div>
          </div>

          {/* Bookings List */}
          <div className="space-y-4">
            {bookings.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-neutral-100 text-center py-12">
                <div className="w-14 h-14 bg-neutral-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BookOpen size={28} className="text-neutral-400" />
                </div>
                <h3 className="text-lg font-black text-neutral-800 mb-2">لا توجد حجوزات</h3>
                <p className="text-neutral-500 text-sm">ليس لديك أي طلبات حجز حالياً.</p>
              </div>
            ) : (
              bookings.map((booking) => (
                <div key={booking.id} className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 hover:shadow-md transition-shadow duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[var(--brand-primary)]/10 rounded-xl flex items-center justify-center">
                        <Hotel size={18} className="text-[var(--brand-primary)]" />
                      </div>
                      <div>
                        <div className="font-black text-neutral-900">
                          {booking.hotel?.nameAr || booking.hotel?.nameEn || 'فندق'}
                        </div>
                        <div className="text-neutral-400 text-xs mt-0.5">رقم الحجز: {booking.code}</div>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusColors[booking.status] || 'bg-gray-100 text-gray-700'}`}>
                      {statusLabels[booking.status] || booking.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-neutral-100 mb-4">
                    <div>
                      <div className="text-xs text-neutral-400 mb-1">تاريخ الوصول</div>
                      <div className="font-bold text-neutral-700 text-sm">
                        {new Date(booking.checkIn).toLocaleDateString('ar-YE', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-neutral-400 mb-1">تاريخ المغادرة</div>
                      <div className="font-bold text-neutral-700 text-sm">
                        {new Date(booking.checkOut).toLocaleDateString('ar-YE', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-neutral-400 mb-1">عدد الليالي</div>
                      <div className="font-bold text-neutral-700 text-sm">{booking.nights} ليالٍ</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-neutral-400">إجمالي الحجز </span>
                      <span className="font-black text-[var(--brand-primary)] text-lg">${booking.totalPrice}</span>
                    </div>
                    {booking.status === 'CONFIRMED' && (
                      <a
                        href={`https://wa.me/967784644466?text=${encodeURIComponent('أريد الاستفسار عن حجزي رقم ' + booking.code)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-bold text-[var(--brand-primary)] hover:underline flex items-center gap-1"
                      >
                        تواصل معنا <ArrowRight size={14} className="rtl:rotate-180" />
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* CTA */}
          <div className="mt-10 bg-white rounded-2xl p-8 shadow-sm border border-neutral-100 text-center">
            <div className="w-14 h-14 bg-[var(--brand-primary)]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Hotel size={28} className="text-[var(--brand-primary)]" />
            </div>
            <h3 className="text-xl font-black text-neutral-900 mb-3">هل تريد حجزاً جديداً؟</h3>
            <p className="text-neutral-500 text-sm mb-6">تصفح الفنادق واحجز إقامتك القادمة</p>
            <Link href="/hotels">
              <Button variant="primary">
                تصفح الفنادق
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
