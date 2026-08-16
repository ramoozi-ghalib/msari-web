import { useState } from 'react';
import { ArrowRight, User, Mail, Phone, UserCheck, Users } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const guestSchema = z
  .object({
    name: z.string().min(2, { message: 'الاسم يجب أن يكون حرفين على الأقل' }),
    email: z.string().email({ message: 'البريد الإلكتروني غير صحيح' }),
    phone: z.string().min(7, { message: 'رقم الهاتف يجب أن يكون 7 أرقام على الأقل' }),
    isForAnotherGuest: z.boolean().default(false),
    anotherGuestName: z.string().optional(),
    anotherGuestPhone: z.string().optional(),
    requests: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.isForAnotherGuest) {
      if (!data.anotherGuestName || data.anotherGuestName.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'يرجى إدخال اسم النزيل الآخر الكامل (حرفين على الأقل)',
          path: ['anotherGuestName'],
        });
      }
      if (!data.anotherGuestPhone || data.anotherGuestPhone.trim().length < 7) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'يرجى إدخال رقم هاتف النزيل الآخر (7 أرقام على الأقل)',
          path: ['anotherGuestPhone'],
        });
      }
    }
  });

export type GuestFormData = z.infer<typeof guestSchema>;

interface GuestDetailsStepProps {
  defaultValues?: Partial<GuestFormData>;
  onNext: (data: GuestFormData) => void;
}

export default function GuestDetailsStep({ defaultValues, onNext }: GuestDetailsStepProps) {
  const [isAnotherGuestActive, setIsAnotherGuestActive] = useState<boolean>(
    defaultValues?.isForAnotherGuest || false
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<GuestFormData>({
    resolver: zodResolver(guestSchema),
    defaultValues: {
      name: defaultValues?.name || '',
      email: defaultValues?.email || '',
      phone: defaultValues?.phone || '',
      isForAnotherGuest: defaultValues?.isForAnotherGuest || false,
      anotherGuestName: defaultValues?.anotherGuestName || '',
      anotherGuestPhone: defaultValues?.anotherGuestPhone || '',
      requests: defaultValues?.requests || '',
    },
  });

  const toggleAnotherGuest = () => {
    const nextState = !isAnotherGuestActive;
    setIsAnotherGuestActive(nextState);
    setValue('isForAnotherGuest', nextState, { shouldValidate: true });
    if (!nextState) {
      setValue('anotherGuestName', '');
      setValue('anotherGuestPhone', '');
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-neutral-100">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-100">
        <div>
          <h2 className="text-xl font-black text-neutral-900">بيانات الضيف</h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            بيانات صاحب الحجز والاتصال للتأكيد
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center">
          <UserCheck size={20} />
        </div>
      </div>

      <form onSubmit={handleSubmit(onNext)} className="space-y-5">
        {/* Name */}
        <div>
          <label className="block text-xs font-bold text-neutral-600 mb-1.5">
            الاسم الكامل *
          </label>
          <div className="relative">
            <div
              className="absolute start-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: '#23096e12', color: '#23096e' }}
            >
              <User size={15} />
            </div>
            <input
              {...register('name')}
              type="text"
              placeholder="أدخل اسمك الكامل"
              className={`w-full rounded-xl border ps-14 pe-4 py-3 text-sm font-medium text-neutral-800 outline-none transition-all duration-300 placeholder-neutral-300 ${
                errors.name
                  ? 'border-red-400 bg-red-50'
                  : 'border-neutral-200 focus:border-[#23096e] focus:bg-white'
              }`}
            />
          </div>
          {errors.name && (
            <p className="text-red-500 text-xs mt-1 font-semibold">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-bold text-neutral-600 mb-1.5">
            البريد الإلكتروني *
          </label>
          <div className="relative">
            <div
              className="absolute start-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: '#23096e12', color: '#23096e' }}
            >
              <Mail size={15} />
            </div>
            <input
              {...register('email')}
              type="email"
              placeholder="example@email.com"
              dir="ltr"
              className={`w-full rounded-xl border ps-14 pe-4 py-3 text-sm font-medium text-neutral-800 outline-none transition-all duration-300 placeholder-neutral-300 text-start ${
                errors.email
                  ? 'border-red-400 bg-red-50'
                  : 'border-neutral-200 focus:border-[#23096e] focus:bg-white'
              }`}
            />
          </div>
          {errors.email && (
            <p className="text-red-500 text-xs mt-1 font-semibold">{errors.email.message}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-bold text-neutral-600 mb-1.5">
            رقم الهاتف للتواصل *
          </label>
          <div className="relative">
            <div
              className="absolute start-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: '#23096e12', color: '#23096e' }}
            >
              <Phone size={15} />
            </div>
            <input
              {...register('phone')}
              type="tel"
              placeholder="+967 7XX XXX XXX"
              dir="ltr"
              className={`w-full rounded-xl border ps-14 pe-4 py-3 text-sm font-medium text-neutral-800 outline-none transition-all duration-300 placeholder-neutral-300 text-start ${
                errors.phone
                  ? 'border-red-400 bg-red-50'
                  : 'border-neutral-200 focus:border-[#23096e] focus:bg-white'
              }`}
            />
          </div>
          {errors.phone && (
            <p className="text-red-500 text-xs mt-1 font-semibold">{errors.phone.message}</p>
          )}
        </div>

        {/* Book for another person toggle (مطابق لتطبيق مساري) */}
        <div className="pt-2 pb-2">
          <div
            onClick={toggleAnotherGuest}
            className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
              isAnotherGuestActive
                ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/5'
                : 'border-neutral-200 hover:border-neutral-300 bg-neutral-50/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                  isAnotherGuestActive
                    ? 'bg-[var(--brand-primary)] text-white'
                    : 'bg-neutral-200 text-neutral-500'
                }`}
              >
                <Users size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-neutral-900">
                  {isAnotherGuestActive
                    ? 'الحجز لشخص آخر مفعّل'
                    : 'هل ترغب بالحجز لشخص آخر؟'}
                </p>
                <p className="text-xs text-neutral-400">
                  {isAnotherGuestActive
                    ? 'سيتم تسجيل الحجز باسم وبيانات النزيل الفعلي'
                    : 'فعّل هذا الخيار إذا كان الحجز مخصصاً لشخص غير صاحب الحساب'}
                </p>
              </div>
            </div>
            <div
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                isAnotherGuestActive ? 'bg-[var(--brand-primary)]' : 'bg-neutral-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  isAnotherGuestActive ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Other Guest Fields */}
        {isAnotherGuestActive && (
          <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-4 animate-in fade-in slide-in-from-top-2">
            <h3 className="text-sm font-black text-neutral-800 flex items-center gap-2">
              <User size={16} className="text-[var(--brand-primary)]" />
              بيانات النزيل الفعلي (الضيف الآخر)
            </h3>

            <div>
              <label className="block text-xs font-bold text-neutral-600 mb-1.5">
                اسم النزيل الآخر الكامل *
              </label>
              <input
                {...register('anotherGuestName')}
                type="text"
                placeholder="أدخل الاسم الكامل للنزيل"
                className={`w-full rounded-xl border px-4 py-3 text-sm font-medium text-neutral-800 outline-none transition-all duration-300 placeholder-neutral-300 bg-white ${
                  errors.anotherGuestName
                    ? 'border-red-400 bg-red-50'
                    : 'border-neutral-200 focus:border-[#23096e]'
                }`}
              />
              {errors.anotherGuestName && (
                <p className="text-red-500 text-xs mt-1 font-semibold">
                  {errors.anotherGuestName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-600 mb-1.5">
                رقم هاتف النزيل الآخر *
              </label>
              <input
                {...register('anotherGuestPhone')}
                type="tel"
                placeholder="+967 7XX XXX XXX"
                dir="ltr"
                className={`w-full rounded-xl border px-4 py-3 text-sm font-medium text-neutral-800 outline-none transition-all duration-300 placeholder-neutral-300 text-start bg-white ${
                  errors.anotherGuestPhone
                    ? 'border-red-400 bg-red-50'
                    : 'border-neutral-200 focus:border-[#23096e]'
                }`}
              />
              {errors.anotherGuestPhone && (
                <p className="text-red-500 text-xs mt-1 font-semibold">
                  {errors.anotherGuestPhone.message}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Special requests */}
        <div>
          <label className="block text-xs font-bold text-neutral-600 mb-1.5">
            طلبات خاصة <span className="text-neutral-400 font-normal">(اختياري)</span>
          </label>
          <textarea
            {...register('requests')}
            rows={3}
            placeholder="أي طلبات خاصة؟ (طابق معين، غرفة هادئة، سرير إضافي...)"
            className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm text-neutral-800 outline-none focus:border-[#23096e] transition-all duration-300 placeholder-neutral-300 resize-none bg-neutral-50/30 focus:bg-white"
          />
        </div>

        <button
          type="submit"
          className="flex items-center justify-center gap-2 w-full text-white font-black py-4 rounded-xl mt-4 hover:opacity-90 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 shadow-md cursor-pointer"
          style={{ background: 'linear-gradient(135deg,#23096e,#3A1C8F)' }}
        >
          متابعة إلى خطوة الدفع
          <ArrowRight size={17} />
        </button>
      </form>
    </div>
  );
}
