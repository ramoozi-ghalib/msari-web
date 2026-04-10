import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Copy, MessageCircle } from 'lucide-react';

interface ConfirmationStepProps {
  code: string;
  paymentMethod: string;
  hotelName?: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  total: number;
}

export default function ConfirmationStep({
  code,
  paymentMethod,
  hotelName,
  guestName,
  checkIn,
  checkOut,
  total,
}: ConfirmationStepProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-neutral-100 overflow-hidden max-w-md mx-auto w-full hover:shadow-2xl transition-shadow duration-500">
      <div className="h-1.5" style={{ background: 'linear-gradient(to right,#23096e,#3A1C8F,#22c55e)' }} />
      <div className="p-8 text-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg hover:scale-110 transition-transform duration-300"
          style={{ background: 'linear-gradient(135deg,#23096e,#3A1C8F)' }}>
          <CheckCircle2 size={36} className="text-white" />
        </div>
        <h2 className="text-2xl font-black text-neutral-900 mb-2 hover:text-[--brand-primary] transition-colors duration-300">تم استلام طلب الحجز! 🎉</h2>
        <p className="text-neutral-500 text-sm">حالة الحجز: {paymentMethod === 'transfer' ? 'بانتظار تأكيد الدفع ⏱️' : 'سيتم التواصل معك للتأكيد خلال ساعة'}</p>

        {/* Booking code */}
        <div className="my-6 p-4 rounded-2xl border-2 border-dashed border-[#23096e]/30 bg-[#23096e]/5 hover:shadow-lg transition-shadow duration-300">
          <p className="text-xs text-neutral-400 font-medium mb-1.5">رقم الحجز المرجعي</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl font-black tracking-widest hover:scale-105 transition-transform duration-300" style={{ color: '#23096e' }}>{code}</span>
            <button onClick={handleCopy}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
              style={{ background: copied ? '#22c55e20' : '#23096e12', color: copied ? '#22c55e' : '#23096e' }}>
              <Copy size={14} />
            </button>
          </div>
          {copied && <p className="text-xs text-green-500 mt-1.5">تم النسخ!</p>}
        </div>

        {/* Whatsapp Prompt */}
        {paymentMethod === 'transfer' && (
          <div className="mb-6 p-5 bg-emerald-50 border border-emerald-100 rounded-2xl text-center">
            <p className="text-sm font-black text-emerald-800 mb-2">خطوة أخيرة لتأكيد حجزك!</p>
            <p className="text-xs text-emerald-600 mb-4 leading-relaxed font-medium">
              لإعتماد حجزك الفندقي، يرجى إرسال صورة سند التحويل البنكي مع رقم الحجز المرجعي أعلاه إلى خدمة العملاء.
            </p>
            <a href={`https://wa.me/967735333552?text=${encodeURIComponent('أهلاً مساري،\nأود تأكيد حجز الفندق الخاص بي.\nرقم الحجز المرجعي: ' + code + '\nمرفق إشعار التحويل البنكي:')}`} target="_blank" rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full text-white font-black py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 hover:shadow-xl hover:scale-105 duration-300">
              <MessageCircle size={20} /> إرسال الإشعار عبر واتساب
            </a>
          </div>
        )}

        {/* Summary */}
        <div className="text-start space-y-2.5 bg-neutral-50 rounded-xl p-4 text-sm mb-6 hover:shadow-lg transition-shadow duration-300">
          <div className="flex justify-between">
            <span className="text-neutral-400">الفندق</span>
            <span className="font-semibold text-neutral-800">{hotelName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-400">الضيف</span>
            <span className="font-semibold text-neutral-800">{guestName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-400">الوصول</span>
            <span className="font-semibold text-neutral-800">{checkIn || '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-400">المغادرة</span>
            <span className="font-semibold text-neutral-800">{checkOut || '—'}</span>
          </div>
          <div className="flex justify-between border-t border-neutral-200 pt-2.5 mt-2">
            <span className="font-black text-neutral-900">الإجمالي</span>
            <span className="font-black hover:scale-105 transition-transform duration-300" style={{ color: '#23096e' }}>${total}</span>
          </div>
        </div>

        <Link href="/" className="flex items-center justify-center gap-2 w-full text-white font-bold py-3.5 rounded-xl block mb-2"
          style={{ background: 'linear-gradient(135deg,#23096e,#3A1C8F)' }}>
          العودة للرئيسية
        </Link>
        <Link href="/hotels" className="block text-sm text-neutral-400 hover:text-[#23096e] mt-3 transition-all duration-300">
          تصفح المزيد من الفنادق
        </Link>
      </div>
    </div>
  );
}
