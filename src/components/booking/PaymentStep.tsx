import { useState } from 'react';
import { Building, CreditCard, MessageCircle, Shield, CheckCircle2 } from 'lucide-react';

interface PaymentStepProps {
  onBack: () => void;
  onConfirm: (paymentMethod: string) => void;
}

const bankAccounts = [
  { id: 1, bank: 'بنك الكريمي', name: 'مساري للسفريات', account: '123456789' },
  { id: 2, bank: 'بنك التضامن', name: 'مساري للسفريات', account: '987654321' },
  { id: 3, bank: 'العمقي للصرافة', name: 'مساري للسفريات', account: '55667788' },
];

export default function PaymentStep({ onBack, onConfirm }: PaymentStepProps) {
  const [payment, setPayment] = useState<'transfer' | 'card' | 'whatsapp'>('transfer');

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
      <h2 className="text-lg font-black text-neutral-900 mb-6">اختر طريقة الدفع</h2>

      <div className="space-y-3 mb-6">
        {/* Bank Transfer */}
        <div className="relative">
          <button
            onClick={() => setPayment('transfer')}
            className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 text-start transition-all ${payment === 'transfer' ? 'border-[#23096e] bg-[#23096e]/4' : 'border-neutral-200 hover:border-neutral-300'}`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${payment === 'transfer' ? 'text-white' : 'text-emerald-600 bg-emerald-50'}`}
              style={payment === 'transfer' ? { background: 'linear-gradient(135deg,#23096e,#3A1C8F)' } : {}}>
              <Building size={22} />
            </div>
            <div className="flex-1">
              <p className="font-black text-neutral-900">حوالة بنكية محلية</p>
              <p className="text-sm text-neutral-400 mt-0.5">قم بتحويل المبلغ لأحد حساباتنا (الكريمي، التضامن، إلخ)</p>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${payment === 'transfer' ? 'border-[#23096e]' : 'border-neutral-300'}`}>
              {payment === 'transfer' && <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#23096e' }} />}
            </div>
          </button>
          
          {payment === 'transfer' && (
            <div className="mt-3 p-4 rounded-xl bg-neutral-50 border border-neutral-100 animate-in fade-in slide-in-from-top-2">
              <p className="text-xs font-bold text-neutral-500 mb-3">حسابات مساري المعتمدة:</p>
              <div className="space-y-2">
                {bankAccounts.map(b => (
                  <div key={b.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-neutral-200">
                    <div>
                        <p className="text-sm font-bold text-[#23096e]">{b.bank}</p>
                        <p className="text-[10px] sm:text-xs text-neutral-500 mt-0.5">{b.name}</p>
                    </div>
                    <div className="text-end">
                        <p className="text-[10px] text-neutral-400">رقم الحساب</p>
                        <p className="font-mono font-bold text-neutral-800 text-sm">{b.account}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] sm:text-xs text-neutral-500 mt-4 text-center leading-relaxed">
                اختر الحساب الأنسب لك لإتمام التحويل لاحقاً.<br/>
                <span className="text-emerald-600 font-bold">ملاحظة:</span> في الخطوة التالية، سيُطلب منك إرسال إشعار التحويل عبر واتساب لاعتماده.
              </p>
            </div>
          )}
        </div>

        {/* Card */}
        <button
          onClick={() => setPayment('card')}
          className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 text-start transition-all ${payment === 'card' ? 'border-[#23096e] bg-[#23096e]/4' : 'border-neutral-200 hover:border-neutral-300'}`}
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${payment === 'card' ? 'text-white' : 'text-blue-600 bg-blue-50'}`}
            style={payment === 'card' ? { background: 'linear-gradient(135deg,#23096e,#3A1C8F)' } : {}}>
            <CreditCard size={22} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-black text-neutral-900">بطاقة ائتمان / خصم</p>
              <span className="text-xs bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">قريباً</span>
            </div>
            <p className="text-sm text-neutral-400 mt-0.5">Visa · Mastercard · يتوفر قريباً</p>
          </div>
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${payment === 'card' ? 'border-[#23096e]' : 'border-neutral-300'}`}>
            {payment === 'card' && <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#23096e' }} />}
          </div>
        </button>

        {/* WhatsApp />}
        <button
          onClick={() => setPayment('whatsapp')}
          className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 text-start transition-all ${payment === 'whatsapp' ? 'border-[#23096e] bg-[#23096e]/4' : 'border-neutral-200 hover:border-neutral-300'}`}
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${payment === 'whatsapp' ? 'text-white' : 'text-green-500 bg-green-50'}`}
            style={payment === 'whatsapp' ? { background: 'linear-gradient(135deg,#23096e,#3A1C8F)' } : {}}>
            <MessageCircle size={22} />
          </div>
          <div className="flex-1">
            <p className="font-black text-neutral-900">الحجز عبر واتساب</p>
            <p className="text-sm text-neutral-400 mt-0.5">للأشخاص الذين لا يتوفر لديهم وسائل دفع إلكترونية — تأكيد يدوي من خدمة العملاء</p>
          </div>
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${payment === 'whatsapp' ? 'border-[#23096e]' : 'border-neutral-300'}`}>
            {payment === 'whatsapp' && <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#23096e' }} />}
          </div>
        </button>
      </div>

      <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-100 mb-6">
        <Shield size={18} className="text-green-600 shrink-0" />
        <p className="text-sm text-green-700">حجزك آمن 100% — يمكنك الإلغاء مجاناً حتى 24 ساعة قبل الموعد.</p>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack}
          className="flex-1 py-4 rounded-xl border-2 border-neutral-200 font-bold text-neutral-600 hover:border-neutral-300 transition-all duration-300">
          رجوع
        </button>
        <button
          onClick={() => onConfirm(payment)}
          className="flex-[2] flex items-center justify-center gap-2 text-white font-black py-4 rounded-xl hover:opacity-90 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 shadow-md"
          style={{ background: 'linear-gradient(135deg,#23096e,#3A1C8F)' }}
        >
          تأكيد الحجز
          <CheckCircle2 size={17} />
        </button>
      </div>
    </div>
  );
}
