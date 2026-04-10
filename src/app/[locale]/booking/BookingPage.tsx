'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import type { Hotel } from '@/types';

import GuestDetailsStep, { GuestFormData } from '@/components/booking/GuestDetailsStep';
import PaymentStep from '@/components/booking/PaymentStep';
import ConfirmationStep from '@/components/booking/ConfirmationStep';
import BookingSummaryBox from '@/components/booking/BookingSummaryBox';

type Step = 'details' | 'payment' | 'confirm';

function generateCode() {
  // Usually this runs on the server side in an API route. Kept here for mockup.
  return 'MS-' + Math.random().toString(36).toUpperCase().slice(2, 8);
}

function StepBar({ step }: { step: Step }) {
  const steps: { id: Step; label: string }[] = [
    { id: 'details', label: 'بيانات الضيف' },
    { id: 'payment', label: 'طريقة الدفع' },
    { id: 'confirm', label: 'تأكيد الحجز' },
  ];
  const idx = steps.findIndex(s => s.id === step);
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {steps.map((s, i) => (
        <div key={s.id} className="flex items-center">
          <div className="flex flex-col items-center gap-1.5">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm transition-all duration-300 ${
              i < idx  ? 'text-white'             :
              i === idx? 'text-white ring-4 ring-[#23096e]/20' :
                         'bg-neutral-100 text-neutral-400'
            }`}
              style={i <= idx ? { background: 'linear-gradient(135deg,#23096e,#3A1C8F)' } : {}}>
              {i < idx ? <CheckCircle2 size={18}/> : i + 1}
            </div>
            <span className={`text-xs font-semibold whitespace-nowrap ${i === idx ? 'text-[#23096e]' : 'text-neutral-400'}`}>
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-20 h-0.5 mx-2 mb-5 rounded-full transition-all duration-300 ${i < idx ? 'bg-[#23096e]' : 'bg-neutral-200'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function BookingPageContent() {
  const params    = useSearchParams();
  const hotelSlug = params.get('hotel') || '';
  const checkIn   = params.get('checkIn')  || '';
  const checkOut  = params.get('checkOut') || '';
  const guestsP   = Number(params.get('guests') || 2);
  const nightsP   = Number(params.get('nights') || 1);

  const [hotel, setHotel]   = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hotelSlug) { setLoading(false); return; }
    fetch(`/api/hotels/${encodeURIComponent(hotelSlug)}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { setHotel(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [hotelSlug]);

  const [step, setStep]     = useState<Step>('details');
  const [code]              = useState(generateCode);
  const [guestData, setGuestData] = useState<GuestFormData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('');

  const discounted = hotel?.discount
    ? Math.round((hotel.priceFrom) * (1 - hotel.discount.percentage / 100))
    : (hotel?.priceFrom ?? 0);
  const total = discounted * nightsP;

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#23096e]/20 border-t-[#23096e] rounded-full animate-spin" /></div>;
  }

  if (step === 'confirm') {
    return (
      <div className="min-h-screen bg-[#f8f8fa] flex items-center justify-center px-4 py-20">
        <ConfirmationStep 
          code={code}
          paymentMethod={paymentMethod}
          hotelName={hotel?.name}
          guestName={guestData?.name || ''}
          checkIn={checkIn}
          checkOut={checkOut}
          total={total}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f8fa] pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-neutral-900 mb-1">إتمام الحجز</h1>
          <p className="text-neutral-400 text-sm">أنت على بُعد خطوتين من إتمام حجزك</p>
        </div>

        <StepBar step={step} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
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
                onConfirm={(method) => {
                  setPaymentMethod(method);
                  setStep('confirm');
                }}
              />
            )}
          </div>
          <div>
            <BookingSummaryBox 
              hotel={hotel}
              checkIn={checkIn}
              checkOut={checkOut}
              guests={guestsP}
              nights={nightsP}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[#23096e] font-bold">جاري التحميل...</div>}>
      <BookingPageContent />
    </Suspense>
  );
}
