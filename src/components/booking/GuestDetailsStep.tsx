import { ArrowRight, User, Mail, Phone } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const guestSchema = z.object({
  name: z.string().min(3, { message: 'الاسم يجب أن يكون 3 أحرف على الأقل' }),
  email: z.string().email({ message: 'البريد الإلكتروني غير صحيح' }),
  phone: z.string().min(9, { message: 'رقم الهاتف يجب أن يكون 9 أرقام على الأقل' }),
  requests: z.string().optional()
});

export type GuestFormData = z.infer<typeof guestSchema>;

interface GuestDetailsStepProps {
  defaultValues?: Partial<GuestFormData>;
  onNext: (data: GuestFormData) => void;
}

export default function GuestDetailsStep({ defaultValues, onNext }: GuestDetailsStepProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<GuestFormData>({
    resolver: zodResolver(guestSchema),
    defaultValues: {
      name: defaultValues?.name || '',
      email: defaultValues?.email || '',
      phone: defaultValues?.phone || '',
      requests: defaultValues?.requests || '',
    }
  });

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
      <h2 className="text-lg font-black text-neutral-900 mb-6">بيانات الضيف</h2>
      <form onSubmit={handleSubmit(onNext)} className="space-y-4">
        
        {/* Name */}
        <div>
          <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">الاسم الكامل *</label>
          <div className="relative">
            <div className="absolute start-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#23096e12', color: '#23096e' }}>
              <User size={15} />
            </div>
            <input
              {...register('name')}
              type="text"
              placeholder="أدخل اسمك الكامل"
              className={`w-full rounded-xl border ps-14 pe-4 py-3 text-sm font-medium text-neutral-800 outline-none transition-all duration-300 placeholder-neutral-300 ${errors.name ? 'border-red-400 bg-red-50' : 'border-neutral-200 focus:border-[#23096e]'}`}
            />
          </div>
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">البريد الإلكتروني *</label>
          <div className="relative">
            <div className="absolute start-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#23096e12', color: '#23096e' }}>
              <Mail size={15} />
            </div>
            <input
              {...register('email')}
              type="email"
              placeholder="example@email.com"
              className={`w-full rounded-xl border ps-14 pe-4 py-3 text-sm font-medium text-neutral-800 outline-none transition-all duration-300 placeholder-neutral-300 ${errors.email ? 'border-red-400 bg-red-50' : 'border-neutral-200 focus:border-[#23096e]'}`}
            />
          </div>
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">رقم الهاتف *</label>
          <div className="relative">
            <div className="absolute start-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#23096e12', color: '#23096e' }}>
              <Phone size={15} />
            </div>
            <input
              {...register('phone')}
              type="tel"
              placeholder="+967 7XX XXX XXX"
              className={`w-full rounded-xl border ps-14 pe-4 py-3 text-sm font-medium text-neutral-800 outline-none transition-all duration-300 placeholder-neutral-300 ${errors.phone ? 'border-red-400 bg-red-50' : 'border-neutral-200 focus:border-[#23096e]'}`}
            />
          </div>
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
        </div>

        {/* Special requests */}
        <div>
          <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">طلبات خاصة <span className="text-neutral-300 normal-case font-normal">(اختياري)</span></label>
          <textarea
            {...register('requests')}
            rows={3}
            placeholder="أي طلبات خاصة؟ (طابق معين، غرفة هادئة...)"
            className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm text-neutral-800 outline-none focus:border-[#23096e] transition-all duration-300 placeholder-neutral-300 resize-none"
          />
        </div>

        <button
          type="submit"
          className="flex items-center justify-center gap-2 w-full text-white font-black py-4 rounded-xl mt-2 hover:opacity-90 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 shadow-md"
          style={{ background: 'linear-gradient(135deg,#23096e,#3A1C8F)' }}
        >
          التالي — طريقة الدفع
          <ArrowRight size={17} />
        </button>
      </form>
    </div>
  );
}
