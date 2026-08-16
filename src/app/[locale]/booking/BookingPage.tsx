'use client';

/**
 * BookingPage.tsx — Client Component لتدفق الحجز متعدد الخطوات.
 *
 * [FIX C-3] بيانات الفندق تُستقبَل كـ prop جاهز من Server Component الأب.
 * [FIX M-8] السعر يُعرَض من previewBookingPrice() server action قبل الإتمام.
 * [HOTEL-SYNC] دعم بيانات الضيف المعبأة مسبقاً، والحجز لشخص آخر، وتفاصيل التحويل البنكي والعملات.
 */

import { useState, useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { Hotel, BankAccount } from '@/types';

import GuestDetailsStep, { GuestFormData } from '@/components/booking/GuestDetailsStep';
import PaymentStep, { PaymentSubmitData } from '@/components/booking/PaymentStep';
import ConfirmationStep from '@/components/booking/ConfirmationStep';
import BookingSummaryBox from '@/components/booking/BookingSummaryBox';
import { createBooking, previewBookingPrice } from '@/actions/bookings';
import { useCurrency } from '@/hooks/use-currency';

type Step = 'review' | 'details' | 'payment' | 'confirm';

type PricePreview = {
  pricePerNight: number;
  nights: number;
  baseTotal: number;
  discountAmount: number;
  finalTotal: number;
  currency: string;
};

function toISODatetime(dateStr: string): string {
  if (!dateStr) return '';
  if (dateStr.includes('T')) return dateStr;
  return `${dateStr}T12:00:00.000Z`;
}

function StepBar({ step }: { step: Step }) {
  const steps: { id: Step; label: string }[] = [
    { id: 'review', label: 'مراجعة الحجز' },
    { id: 'details', label: 'بيانات الضيف' },
    { id: 'payment', label: 'طريقة الدفع' },
    { id: 'confirm', label: 'تأكيد الطلب' },
  ];
  const idx = steps.findIndex((s) => s.id === step);
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {steps.map((s, i) => (
        <div key={s.id} className="flex items-center">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm transition-all duration-300 ${
                i < idx
                  ? 'text-white'
                  : i === idx
                  ? 'text-white ring-4 ring-[#23096e]/20'
                  : 'bg-neutral-100 text-neutral-400'
              }`}
              style={
                i <= idx
                  ? { background: 'linear-gradient(135deg,#23096e,#3A1C8F)' }
                  : {}
              }
            >
              {i < idx ? <CheckCircle2 size={18} /> : i + 1}
            </div>
            <span
              className={`text-xs font-semibold whitespace-nowrap ${
                i === idx ? 'text-[#23096e]' : 'text-neutral-400'
              }`}
            >
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`w-16 sm:w-20 h-0.5 mx-2 mb-5 rounded-full transition-all duration-300 ${
                i < idx ? 'bg-[#23096e]' : 'bg-neutral-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

interface BookingPageProps {
  city: string;
  hotel: Hotel;
  hotelId: string;
  roomId?: string;
  roomName?: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  bankAccounts?: BankAccount[];
  initialUser?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

export default function BookingPage({
  city,
  hotel,
  hotelId,
  roomId,
  roomName,
  checkIn,
  checkOut,
  guests,
  nights,
  bankAccounts = [],
  initialUser,
}: BookingPageProps) {
  const [step, setStep] = useState<Step>('review');
  const [code, setCode] = useState<string>('');
  const { formatPrice } = useCurrency();
  const [guestData, setGuestData] = useState<GuestFormData | null>(
    initialUser
      ? {
          name: initialUser.name || '',
          email: initialUser.email || '',
          phone: initialUser.phone || '',
          isForAnotherGuest: false,
          anotherGuestName: '',
          anotherGuestPhone: '',
          requests: '',
        }
      : null
  );
  const [confirmedPaymentMethod, setConfirmedPaymentMethod] = useState<string>('transfer');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // [FIX M-8] السعر من server-action
  const [pricePreview, setPricePreview] = useState<PricePreview | null>(null);
  const [loadingPrice, setLoadingPrice] = useState(!(checkIn && checkOut));

  useEffect(() => {
    if (!checkIn || !checkOut) return;

    let cancelled = false;
    (async () => {
      const result = await previewBookingPrice({
        hotelId: hotel.id,
        roomId,
        checkIn: toISODatetime(checkIn),
        checkOut: toISODatetime(checkOut),
      });

      if (cancelled) return;

      if (result && 'success' in result && result.success) {
        setPricePreview(result as PricePreview);
      } else {
        setBookingError('تعذر حساب السعر النهائي الآن. يرجى المحاولة لاحقًا.');
      }
      setLoadingPrice(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [hotel.id, roomId, checkIn, checkOut]);

  async function handleConfirm(paymentData: PaymentSubmitData) {
    if (!guestData) return;

    setIsSubmitting(true);
    setBookingError(null);

    const result = await createBooking({
      hotelId: hotel.id,
      roomId: roomId || undefined,
      guestName: guestData.name,
      guestEmail: guestData.email,
      guestPhone: guestData.phone,
      checkIn: toISODatetime(checkIn),
      checkOut: toISODatetime(checkOut),
      guests,
      paymentMethod: paymentData.paymentMethod,
      selectedCurrencyCode: paymentData.selectedCurrencyCode || 'USD',
      isForAnotherGuest: guestData.isForAnotherGuest || false,
      anotherGuestName: guestData.isForAnotherGuest ? guestData.anotherGuestName || '' : undefined,
      anotherGuestPhone: guestData.isForAnotherGuest ? guestData.anotherGuestPhone || '' : undefined,
      senderName: paymentData.senderName,
      senderNumber: paymentData.senderNumber,
      transferAmount: paymentData.transferAmount,
      transferCurrencyCode: paymentData.transferCurrencyCode,
      transferToNumber: paymentData.transferToNumber,
      receiptDataUrl: paymentData.receiptDataUrl,
      receiptFileName: paymentData.receiptFileName,
      notes: guestData.requests || undefined,
    });

    if (result.success) {
      setCode(result.code);
      setConfirmedPaymentMethod(paymentData.paymentMethod);
      setStep('confirm');
    } else {
      setBookingError(result.error.message);
    }

    setIsSubmitting(false);
  }

  if (step === 'confirm') {
    return (
      <div className="min-h-screen bg-[#f8f8fa] flex items-center justify-center px-4 py-20">
        <ConfirmationStep
          code={code}
          paymentMethod={confirmedPaymentMethod}
          hotelName={hotel?.name}
          guestName={
            guestData?.isForAnotherGuest && guestData?.anotherGuestName
              ? `${guestData.anotherGuestName} (بواسطة ${guestData.name})`
              : guestData?.name || ''
          }
          checkIn={checkIn}
          checkOut={checkOut}
          total={pricePreview?.finalTotal ?? 0}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f8fa] py-28">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-neutral-900 mb-1">إتمام الحجز</h1>
          <p className="text-neutral-400 text-sm">
            راجع تفاصيل إقامتك ثم أدخل بيانات الضيف لتأكيد الحجز
          </p>
        </div>

        <StepBar step={step} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {step === 'review' && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-neutral-100 space-y-5">
                <div>
                  <h2 className="text-xl font-black text-neutral-900">مراجعة تفاصيل الحجز</h2>
                  <p className="text-sm text-neutral-500 mt-1">
                    تأكد من صحة الفندق والغرفة وتواريخ الإقامة قبل المتابعة.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4">
                    <p className="text-neutral-400 text-xs mb-1">الفندق</p>
                    <p className="font-bold text-neutral-900">{hotel.name}</p>
                  </div>
                  <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4">
                    <p className="text-neutral-400 text-xs mb-1">الغرفة</p>
                    <p className="font-bold text-neutral-900">
                      {roomName || 'سيتم اختيار الغرفة المتاحة في الفندق'}
                    </p>
                  </div>
                  <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4">
                    <p className="text-neutral-400 text-xs mb-1">تواريخ الإقامة</p>
                    <p className="font-bold text-neutral-900">
                      {checkIn} ← {checkOut}
                    </p>
                  </div>
                  <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4">
                    <p className="text-neutral-400 text-xs mb-1">الضيوف ومدة الإقامة</p>
                    <p className="font-bold text-neutral-900">
                      {guests} ضيف · {pricePreview?.nights ?? nights}{' '}
                      {nights === 1 ? 'ليلة' : 'ليالٍ'}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-[#23096e]/20 bg-[#23096e]/5 p-4">
                  <p className="text-sm text-neutral-600">الإجمالي المتوقع</p>
                  <p className="text-2xl font-black text-[#23096e] mt-1">
                    {loadingPrice ? '...' : formatPrice(pricePreview?.finalTotal ?? 0)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="w-full text-white font-black py-4 rounded-xl hover:opacity-90 transition-all shadow-md cursor-pointer"
                  style={{ background: 'linear-gradient(135deg,#23096e,#3A1C8F)' }}
                >
                  متابعة إلى بيانات الضيف
                </button>
              </div>
            )}

            {step === 'details' && (
              <GuestDetailsStep
                defaultValues={guestData || undefined}
                onNext={(data) => {
                  setGuestData(data);
                  setStep('payment');
                }}
              />
            )}

            {step === 'payment' && (
              <PaymentStep
                onBack={() => setStep('details')}
                onConfirm={handleConfirm}
                isLoading={isSubmitting}
                error={bookingError}
                bankAccounts={bankAccounts}
                expectedTotalUsd={pricePreview?.finalTotal}
              />
            )}
          </div>

          <div>
            <BookingSummaryBox
              hotel={hotel}
              roomName={roomName}
              checkIn={checkIn}
              checkOut={checkOut}
              guests={guests}
              nights={pricePreview?.nights ?? nights}
              serverTotal={loadingPrice ? undefined : pricePreview?.finalTotal}
              serverCurrency={pricePreview?.currency || 'USD'}
              discountAmount={pricePreview?.discountAmount || 0}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
