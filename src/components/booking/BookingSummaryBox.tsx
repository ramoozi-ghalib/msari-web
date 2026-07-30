import { BedDouble, Calendar, Users, Zap, Star, MapPin, Loader2 } from 'lucide-react';
import type { Hotel } from '@/types';
import { useCurrency } from '@/hooks/use-currency';

interface BookingSummaryBoxProps {
  hotel?:          Hotel;
  roomName?:       string;
  checkIn:         string;
  checkOut:        string;
  guests:          number;
  nights:          number;
  // [FIX M-8] السعر يأتي من server action — لا حساب client-side
  serverTotal?:    number; // undefined = جارٍ التحميل
  serverCurrency?: string;
  discountAmount?: number; // نسبة الخصم بالـ % إذا وُجدت
}

export default function BookingSummaryBox({
  hotel,
  roomName,
  checkIn,
  checkOut,
  guests,
  nights,
  serverTotal,
  serverCurrency = 'USD',
  discountAmount = 0,
}: BookingSummaryBoxProps) {
  const isLoadingPrice = serverTotal === undefined;
  const { formatPrice } = useCurrency();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden lg:sticky lg:top-24 hover:shadow-lg transition-shadow duration-300">
      <div className="h-1" style={{ background: 'linear-gradient(to right,#23096e,#3A1C8F)' }} />
      <div className="p-5">
        {/* Hotel Info */}
        <div className="flex items-start gap-3 mb-4 pb-4 border-b border-neutral-100 group">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300"
            style={{ background: 'linear-gradient(135deg,#23096e20,#3A1C8F30)' }}>
            <BedDouble size={22} style={{ color: '#23096e' }} />
          </div>
          <div>
            <p className="font-black text-neutral-900 text-sm leading-tight group-hover:text-[--brand-primary] transition-colors duration-300">
              {hotel?.name ?? 'الفندق'}
            </p>
            <div className="flex items-center gap-1 mt-1">
              {Array(hotel?.stars ?? 4).fill(0).map((_, i) => (
                <Star key={i} size={11} fill="#facc15" className="text-yellow-400" />
              ))}
            </div>
            <div className="flex items-center gap-1 mt-1 text-neutral-400">
              <MapPin size={11} />
              <span className="text-xs">{hotel?.city}</span>
            </div>
            {roomName && (
              <div className="mt-1">
                <span className="text-[11px] font-medium text-neutral-500">الغرفة: {roomName}</span>
              </div>
            )}
          </div>
        </div>

        {/* Dates & Guests */}
        <div className="space-y-3 text-sm mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#23096e12', color: '#23096e' }}>
              <Calendar size={14} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-neutral-400 uppercase">الوصول</p>
              <p className="font-semibold text-neutral-800">{checkIn || 'غير محدد'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#23096e12', color: '#23096e' }}>
              <Calendar size={14} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-neutral-400 uppercase">المغادرة</p>
              <p className="font-semibold text-neutral-800">{checkOut || 'غير محدد'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#23096e12', color: '#23096e' }}>
              <Users size={14} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-neutral-400 uppercase">الضيوف</p>
              <p className="font-semibold text-neutral-800">{guests} ضيف · {nights} {nights === 1 ? 'ليلة' : 'ليالٍ'}</p>
            </div>
          </div>
        </div>

        {/* Price Summary — من server action */}
        <div className="border-t border-neutral-100 pt-4 space-y-2 text-sm">
          {isLoadingPrice ? (
            <div className="flex items-center justify-center gap-2 py-3 text-neutral-400">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-xs">جارٍ حساب السعر...</span>
            </div>
          ) : (
            <>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600 text-xs">
                  <span>خصم {discountAmount}% مُطبَّق</span>
                </div>
              )}
              <div className="flex justify-between font-black text-base pt-2 border-t border-neutral-100">
                <span className="text-neutral-900">الإجمالي</span>
                <span style={{ color: '#23096e' }}>
                  {formatPrice(serverTotal ?? 0)}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Perks */}
        <div className="mt-4 pt-4 border-t border-neutral-100 space-y-1.5">
          {['إلغاء مجاني حتى 24 ساعة قبل الموعد', 'لا توجد رسوم مخفية', 'استلام طلب الحجز فورياً'].map(t => (
            <div key={t} className="flex items-center gap-2 text-xs text-neutral-400">
              <Zap size={11} className="text-[#23096e] shrink-0" />
              {t}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
