import { useState } from 'react';
import { Building, MessageCircle, Shield, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

interface PaymentStepProps {
  onBack: () => void;
  onConfirm: (paymentMethod: string) => void;
  isLoading?: boolean;
  error?: string | null;
  bankAccounts?: any[];
}

export default function PaymentStep({ onBack, onConfirm, isLoading = false, error, bankAccounts = [] }: PaymentStepProps) {
  const [payment, setPayment] = useState<'transfer' | 'whatsapp'>('transfer');

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
              <p className="font-black text-neutral-900">طلب حجز (تحويل بنكي)</p>
              <p className="text-sm text-neutral-400 mt-0.5">سنستلم طلبك الآن، ويُؤكّد نهائيًا بعد التحقق من إشعار التحويل.</p>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${payment === 'transfer' ? 'border-[#23096e]' : 'border-neutral-300'}`}>
              {payment === 'transfer' && <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#23096e' }} />}
            </div>
          </button>
          
          {payment === 'transfer' && (
            <div className="mt-3 p-4 rounded-xl bg-neutral-50 border border-neutral-100 animate-in fade-in slide-in-from-top-2">
              <p className="text-xs font-bold text-neutral-500 mb-3">حسابات مساري المعتمدة:</p>
              <div className="space-y-3">
                {bankAccounts.map((b) => (
                  <div key={b.id} className="bg-white p-4 rounded-xl border border-neutral-200 space-y-2.5">
                    <div className="flex items-center gap-3">
                      {b.iconUrl && (
                        <img src={b.iconUrl} alt={b.nameAr} className="w-6 h-6 rounded-md object-contain shrink-0" />
                      )}
                      <p className="text-sm font-bold text-[#23096e]">{b.nameAr}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-1">
                      {b.accounts?.map((acc: any, index: number) => {
                        const currencyNames: Record<string, string> = {
                          usd: 'دولار أمريكي',
                          sar: 'ريال سعودي',
                          yerSouth: 'ريال يمني جديد',
                          yerNorth: 'ريال يمني قديم',
                        };
                        return (
                          <div key={index} className="flex justify-between items-center bg-neutral-50 px-3 py-2 rounded-lg border border-neutral-100 text-xs">
                            <span className="text-neutral-500 font-semibold">{currencyNames[acc.currencyCode] || acc.currencyCode}</span>
                            <span className="font-mono font-bold text-neutral-800 tracking-wider">{acc.accountNumber}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] sm:text-xs text-neutral-500 mt-4 text-center leading-relaxed">
                اختر الحساب الأنسب لك لإتمام التحويل لاحقاً.<br/>
                <span className="text-emerald-600 font-bold">مهم:</span> الطلب لا يصبح مؤكداً إلا بعد إرسال إشعار التحويل عبر واتساب واعتماده.
              </p>
            </div>
          )}
        </div>

        {/* WhatsApp */}
        <button
          onClick={() => setPayment('whatsapp')}
          className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 text-start transition-all ${payment === 'whatsapp' ? 'border-[#23096e] bg-[#23096e]/4' : 'border-neutral-200 hover:border-neutral-300'}`}
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${payment === 'whatsapp' ? 'text-white' : 'text-green-500 bg-green-50'}`}
            style={payment === 'whatsapp' ? { background: 'linear-gradient(135deg,#23096e,#3A1C8F)' } : {}}>
            <MessageCircle size={22} />
          </div>
          <div className="flex-1">
              <p className="font-black text-neutral-900">طلب حجز عبر واتساب</p>
              <p className="text-sm text-neutral-400 mt-0.5">نستلم الطلب ثم يتواصل معك فريق خدمة العملاء لتأكيد التفاصيل والدفع.</p>
          </div>
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${payment === 'whatsapp' ? 'border-[#23096e]' : 'border-neutral-300'}`}>
            {payment === 'whatsapp' && <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#23096e' }} />}
          </div>
        </button>
      </div>

      <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-100 mb-6">
        <Shield size={18} className="text-green-600 shrink-0" />
        <p className="text-sm text-amber-700">تنبيه: إرسال الطلب في هذه الخطوة لا يعني تأكيد الحجز نهائيًا. التأكيد يتم بعد التحقق من الدفع.</p>
      </div>

      {/* Error message from server action */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100 mb-4 animate-in fade-in">
          <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 font-medium">{error}</p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          disabled={isLoading}
          className="flex-1 py-4 rounded-xl border-2 border-neutral-200 font-bold text-neutral-600 hover:border-neutral-300 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          رجوع
        </button>
        <button
          onClick={() => onConfirm(payment)}
          disabled={isLoading}
          className="flex-[2] flex items-center justify-center gap-2 text-white font-black py-4 rounded-xl hover:opacity-90 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 shadow-md disabled:opacity-70 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-md"
          style={{ background: 'linear-gradient(135deg,#23096e,#3A1C8F)' }}
        >
          {isLoading ? (
            <>
              <Loader2 size={17} className="animate-spin" />
              جاري الحجز...
            </>
          ) : (
            <>
              تأكيد الحجز
              <CheckCircle2 size={17} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
