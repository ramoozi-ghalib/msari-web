'use client';

import { useState, useTransition } from 'react';
import {
  Building, Search, CheckCircle2, XCircle, Eye, Info, MessageCircle, AlertCircle, ShieldCheck
} from 'lucide-react';
import { updateBookingStatus, getAdminBookings, verifyBookingPayment } from '@/actions/bookings';
import type { AdminBookingView } from '@/services/query/BookingQueryService';
import { BookingStatus } from '@prisma/client';

interface Props {
  initialBookings: AdminBookingView[];
  initialNextCursor?: string;
}

export default function BookingsManagementClient({ initialBookings, initialNextCursor }: Props) {
  const [bookings, setBookings] = useState<AdminBookingView[]>(initialBookings);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');
  const [selectedBooking, setSelectedBooking] = useState<AdminBookingView | null>(null);

  const [isPending, startTransition] = useTransition();
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>(initialNextCursor);
  const [errorMsg, setErrorMsg] = useState('');

  // ─── FILTERS ─────────────────────────────────────────────────────────────
  const filteredBookings = bookings.filter(b => {
    const matchSearch = b.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.guestName.includes(searchTerm) ||
      b.hotel.nameAr.includes(searchTerm);

    let matchType = true;
    if (activeFilter === 'pending') matchType = b.status === BookingStatus.PENDING;
    if (activeFilter === 'confirmed') matchType = b.status === BookingStatus.CONFIRMED;
    if (activeFilter === 'cancelled') matchType = b.status === BookingStatus.CANCELLED;

    return matchSearch && matchType;
  });

  // ─── ACTIONS ─────────────────────────────────────────────────────────────
  const handleUpdateStatus = (id: string, newStatus: BookingStatus) => {
    setErrorMsg('');
    startTransition(async () => {
      // Pass object expected by the Server Action schema
      const res = await updateBookingStatus({ bookingId: id, newStatus });
      if (res.success) {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
        setSelectedBooking(null);
      } else {
        setErrorMsg('حدث خطأ أثناء تحديث حالة الحجز: ' + (res.error?.message || res.error?.code || ''));
      }
    });
  };

  const handleVerifyPayment = (id: string) => {
    setErrorMsg('');
    startTransition(async () => {
      const res = await verifyBookingPayment(id);
      if (res.success) {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, paymentVerified: true } : b));
        setSelectedBooking(prev => prev && prev.id === id ? { ...prev, paymentVerified: true } : prev);
      } else {
        setErrorMsg('حدث خطأ أثناء التحقق من الدفع: ' + (res.error?.message || res.error?.code || ''));
      }
    });
  };

  const handleLoadMore = async () => {
    if (!nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    const res = await getAdminBookings({ cursor: nextCursor, pageSize: 50 });
    if (res.success) {
      setBookings(prev => [...prev, ...res.data]);
      setNextCursor(res.nextCursor);
    }
    setIsLoadingMore(false);
  };

  // ─── HELPERS ─────────────────────────────────────────────────────────────
  const getStatusStyle = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.PENDING: return 'bg-amber-100 text-amber-800';
      case BookingStatus.CONFIRMED: return 'bg-green-100 text-green-800';
      case BookingStatus.CANCELLED: return 'bg-red-100 text-red-800';
      case BookingStatus.NO_SHOW: return 'bg-neutral-100 text-neutral-800';
      case BookingStatus.COMPLETED: return 'bg-blue-100 text-blue-800';
      default: return 'bg-neutral-100 text-neutral-800';
    }
  };

  const getStatusLabel = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.PENDING: return 'قيد المراجعة';
      case BookingStatus.CONFIRMED: return 'مؤكد';
      case BookingStatus.CANCELLED: return 'ملغي';
      case BookingStatus.NO_SHOW: return 'لم يحضر';
      case BookingStatus.COMPLETED: return 'مكتمل';
      default: return status;
    }
  };

  return (
    <div className="pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 mb-1">إدارة الحجوزات</h1>
          <p className="text-neutral-500 font-medium">مراجعة وتأكيد الحجوزات الواردة وإشعارات التحويل البنكي</p>
        </div>

        <div className="flex bg-white rounded-xl shadow-sm border border-neutral-100 p-1">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeFilter === 'all' ? 'bg-[#23096e] text-white' : 'text-neutral-500 hover:bg-neutral-50'}`}>
            الكل
          </button>
          <button
            onClick={() => setActiveFilter('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeFilter === 'pending' ? 'bg-[#23096e] text-white' : 'text-neutral-500 hover:bg-neutral-50'}`}>
            بانتظار المراجعة
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
          <AlertCircle size={20} />
          <span className="font-bold text-sm">{errorMsg}</span>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white rounded-t-2xl shadow-sm border border-neutral-100 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-b-0">
        <div className="relative w-full sm:w-96">
          <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="البحث برقم الحجز، اسم العميل، أو الفندق..."
            className="w-full pl-4 pr-10 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:border-[#23096e] focus:bg-white text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow-sm border border-neutral-100 rounded-b-2xl overflow-x-auto">
        <table className="w-full text-start">
          <thead className="bg-neutral-50 border-b border-neutral-100 text-neutral-500 text-sm font-bold">
            <tr>
              <th className="py-4 px-6 text-start">رمز الحجز</th>
              <th className="py-4 px-6 text-start">العميل</th>
              <th className="py-4 px-6 text-start">الفندق / الغرفة</th>
              <th className="py-4 px-6 text-start">المبلغ</th>
              <th className="py-4 px-6 text-start">الحالة</th>
              <th className="py-4 px-6 text-start">تاريخ الحجز</th>
              <th className="py-4 px-6 text-end">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filteredBookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-neutral-50 transition-colors">
                <td className="py-4 px-6">
                  <span className="font-bold text-[#23096e]">{booking.code}</span>
                  <div className="text-[10px] text-neutral-400 font-bold mt-1">
                    {booking.paymentMethod === 'bank_transfer' ? 'حوالة بنكية' : 'دفع إلكتروني / نقدي'}
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="font-bold text-neutral-900">{booking.guestName}</div>
                  <div className="text-xs text-neutral-500" dir="ltr">{booking.guestPhone}</div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-600 bg-blue-50">
                      <Building size={16} />
                    </div>
                    <div>
                      <div className="font-bold text-neutral-800 text-sm">{booking.hotel.nameAr}</div>
                      <div className="text-xs text-neutral-500 truncate max-w-[150px]">{booking.room?.nameAr || 'غرفة مخصصة'}</div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="font-black text-neutral-900">{booking.totalPrice} {booking.currency}</div>
                </td>
                <td className="py-4 px-6">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusStyle(booking.status)}`}>
                    {getStatusLabel(booking.status)}
                  </span>
                </td>
                <td className="py-4 px-6 text-sm text-neutral-500">
                  <div dir="ltr">{new Date(booking.createdAt).toLocaleString('en-GB')}</div>
                </td>
                <td className="py-4 px-6 text-end">
                  <button
                    onClick={() => setSelectedBooking(booking)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#23096e]/5 text-[#23096e] hover:bg-[#23096e]/10 rounded-lg text-sm font-bold transition-colors">
                    <Eye size={16} /> عرض
                  </button>
                </td>
              </tr>
            ))}

            {filteredBookings.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-neutral-500">
                  لا توجد حجوزات تطابق بحثك
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {nextCursor && filteredBookings.length > 0 && (
          <div className="p-4 flex justify-center border-t border-neutral-100">
            <button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="px-6 py-2 bg-neutral-100 text-neutral-600 hover:bg-neutral-200 rounded-xl font-bold text-sm transition-colors">
              {isLoadingMore ? 'جاري التحميل...' : 'تحميل المزيد'}
            </button>
          </div>
        )}
      </div>

      {/* --- Modal / Drawer --- */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm" onClick={() => !isPending && setSelectedBooking(null)}></div>

          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in duration-200">

            {/* Left side: Guide (If bank transfer) */}
            <div className="w-full md:w-2/5 bg-neutral-50 border-e border-neutral-100 p-8 flex flex-col justify-center text-center">
              <h3 className="font-black text-neutral-900 mb-6 flex items-center justify-center gap-2 text-lg">
                <Info size={20} className="text-[#23096e]" /> تفاصيل الدفع
              </h3>

              {selectedBooking.paymentMethod === 'bank_transfer' ? (
                <div className="bg-white rounded-2xl border border-neutral-200 p-8 shadow-sm">
                  <div className="w-16 h-16 bg-[#23096e]/10 text-[#23096e] rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle size={28} />
                  </div>
                  <h4 className="font-bold text-neutral-900 text-lg mb-2">حوالة بنكية</h4>
                  <p className="text-neutral-500 text-sm leading-relaxed mb-6">
                    العميل اختار الدفع عبر حوالة بنكية. يرجى مراجعة رسائل الواتساب للتحقق من إشعار التحويل المرفق برقم الحجز:
                  </p>
                  <div className="bg-neutral-50 py-3 px-4 rounded-xl border border-neutral-100 inline-block mb-4">
                    <span className="font-black text-[#23096e] text-xl tracking-wider">{selectedBooking.code}</span>
                  </div>
                  
                  {selectedBooking.paymentVerified ? (
                    <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-xl font-bold border border-green-100">
                      <ShieldCheck size={18} />
                      تم التحقق من الدفع
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleVerifyPayment(selectedBooking.id)}
                      disabled={isPending}
                      className="w-full py-2.5 bg-[#23096e] text-white hover:bg-[#1c0758] rounded-xl font-bold text-sm transition-colors disabled:opacity-50">
                      {isPending ? 'جاري التحقق...' : 'تأكيد استلام الدفعة يدوياً'}
                    </button>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-neutral-200 p-8 shadow-sm">
                  <h4 className="font-bold text-neutral-900 text-lg mb-2">الدفع الإلكتروني / نقدي</h4>
                  <p className="text-neutral-500 text-sm leading-relaxed mb-4">
                    طريقة الدفع المختارة: {selectedBooking.paymentMethod}
                    <br />
                    حالة الدفع: {selectedBooking.paymentStatus}
                  </p>
                  
                  {selectedBooking.paymentVerified ? (
                    <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-xl font-bold border border-green-100">
                      <ShieldCheck size={18} />
                      تم التحقق من الدفع
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleVerifyPayment(selectedBooking.id)}
                      disabled={isPending}
                      className="w-full py-2.5 bg-[#23096e] text-white hover:bg-[#1c0758] rounded-xl font-bold text-sm transition-colors disabled:opacity-50">
                      {isPending ? 'جاري التحقق...' : 'تأكيد استلام الدفعة يدوياً'}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Right side: Booking Details */}
            <div className="flex-1 flex flex-col h-full max-h-[60vh] md:max-h-none overflow-y-auto">
              <div className="p-8 pb-4 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2.5 py-1 inline-flex rounded-md text-xs font-black ${getStatusStyle(selectedBooking.status)}`}>
                      {getStatusLabel(selectedBooking.status)}
                    </span>
                    <span className="text-xs text-neutral-400 font-bold" dir="ltr">
                      {new Date(selectedBooking.createdAt).toLocaleString('en-GB')}
                    </span>
                  </div>
                  <h2 className="text-3xl font-black text-neutral-900">{selectedBooking.code}</h2>
                </div>
                <button
                  onClick={() => !isPending && setSelectedBooking(null)}
                  disabled={isPending}
                  className="p-2 hover:bg-neutral-100 rounded-full text-neutral-400 transition-colors">
                  <XCircle size={24} />
                </button>
              </div>

              <div className="px-8 py-4 space-y-6 flex-1">
                <div className="grid grid-cols-2 gap-6 bg-neutral-50 rounded-2xl p-5 border border-neutral-100">
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 uppercase mb-1 block">اسم العميل</label>
                    <p className="font-bold text-neutral-900">{selectedBooking.guestName}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 uppercase mb-1 block">رقم الهاتف</label>
                    <p className="font-bold text-neutral-900" dir="ltr">{selectedBooking.guestPhone}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase mb-1 block">الفندق</label>
                    <p className="font-bold text-neutral-900">{selectedBooking.hotel.nameAr}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 uppercase mb-1 block">تسجيل الدخول (Check-in)</label>
                    <p className="font-bold text-neutral-900" dir="ltr">{new Date(selectedBooking.checkIn).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 uppercase mb-1 block">تسجيل الخروج (Check-out)</label>
                    <p className="font-bold text-neutral-900" dir="ltr">{new Date(selectedBooking.checkOut).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 uppercase mb-1 block">تفاصيل الإقامة</label>
                    <p className="font-bold text-neutral-900">{selectedBooking.nights} ليالي · {selectedBooking.guests} ضيوف</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 uppercase mb-1 block">إجمالي المبلغ</label>
                    <p className="font-black text-[#23096e] text-lg">{selectedBooking.totalPrice} {selectedBooking.currency}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-8 pt-4 border-t border-neutral-100 flex flex-wrap justify-end gap-3 mt-auto">
                {selectedBooking.status === BookingStatus.PENDING && (
                  <>
                    <button
                      disabled={isPending}
                      onClick={() => handleUpdateStatus(selectedBooking.id, BookingStatus.CANCELLED)}
                      className="px-6 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-bold text-sm transition-colors disabled:opacity-50">
                      رفض / إلغاء
                    </button>
                    <button 
                      disabled={isPending || !selectedBooking.paymentVerified}
                      onClick={() => handleUpdateStatus(selectedBooking.id, BookingStatus.CONFIRMED)}
                      title={!selectedBooking.paymentVerified ? 'يجب تأكيد الدفع أولاً' : ''}
                      className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-sm transition-all shadow-md ${selectedBooking.paymentVerified ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'}`}>
                      <CheckCircle2 size={18} /> {isPending ? 'جاري التنفيذ...' : 'تأكيد الحجز واعتماد الدفع'}
                    </button>
                  </>
                )}

                {selectedBooking.status === BookingStatus.CONFIRMED && (
                  <button
                    disabled={isPending}
                    onClick={() => handleUpdateStatus(selectedBooking.id, BookingStatus.NO_SHOW)}
                    className="px-6 py-2.5 bg-neutral-100 text-neutral-700 hover:bg-neutral-200 rounded-xl font-bold text-sm border border-neutral-200 transition-colors disabled:opacity-50">
                    تسجيل عدم حضور (No-Show)
                  </button>
                )}

                {selectedBooking.status !== BookingStatus.PENDING && (
                  <button
                    onClick={() => !isPending && setSelectedBooking(null)}
                    disabled={isPending}
                    className="px-6 py-2.5 bg-neutral-100 text-neutral-700 hover:bg-neutral-200 rounded-xl font-bold text-sm border border-neutral-200 transition-colors disabled:opacity-50">
                    إغلاق النافذة
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
