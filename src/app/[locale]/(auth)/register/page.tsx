'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, User, Phone, AlertCircle, UserPlus, CheckCircle2 } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { registerUser } from '@/actions/auth';
import { getSafeRedirect } from '@/lib/safeRedirect';

type RegisterActionResult = Awaited<ReturnType<typeof registerUser>>;

function RegisterForm() {
  const params = useSearchParams();
  const redirect = params.get('redirect') || '/';
  const safeRedirect = getSafeRedirect(redirect);
  const encodedRedirect = encodeURIComponent(safeRedirect);

  const register = async (name: string, email: string, phone: string, password: string) => {
    const result = await registerUser({ name, email, phone, password });
    if (!result.success) return result;

    // Auto-login after successful registration
    await signIn('credentials', { email, password, redirect: true, callbackUrl: safeRedirect });

    return { success: true as const };
  };

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('كلمتا المرور غير متطابقتين');
    if (form.password.length < 10) return setError('كلمة المرور يجب أن تكون 10 أحرف على الأقل');
    setLoading(true);
    try {
      const result = await register(form.name, form.email, form.phone, form.password);
      if (!result.success) {
        const errMsg = (result as RegisterActionResult).error?.message || 'حدث خطأ';
        setError(errMsg);
      }
    } catch {
      setError('حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative p-4 sm:p-8">
      {/* Background Image (Socotra Vibe) & Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1644406213799-a8648fc9b08f?q=80&w=2000&auto=format&fit=crop")' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#23096e]/70 via-[#23096e]/40 to-black/80 backdrop-blur-[2px]" />
      </div>

      {/* Form Card (Glassmorphism) */}
      <div className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-xl p-8 sm:p-10 rounded-[2rem] shadow-2xl border border-white/20">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4 hover:scale-105 transition-transform">
            <div className="relative w-16 h-16 mx-auto bg-white rounded-2xl p-3 shadow-sm border border-neutral-100 flex items-center justify-center">
              <Image src="/images/logo-dark.png" alt="مساري" width={50} height={50} className="object-contain" />
            </div>
          </Link>
          <h1 className="text-2xl font-black text-neutral-900 mb-2">احزم حقائبك..</h1>
          <p className="text-neutral-500 text-sm font-medium">أنشئ حسابك الآن وابدأ استكشاف العالم</p>
        </div>

          {error && (
            <div role="alert" aria-live="assertive" className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-neutral-700 mb-2">الاسم الكامل</label>
              <div className="relative">
                <User size={18} className="absolute top-1/2 -translate-y-1/2 end-4 text-neutral-400" />
                <input id="name" type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder="محمد أحمد" required autoFocus autoComplete="name" className="input-msari pe-12" />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-neutral-700 mb-2">البريد الإلكتروني</label>
              <div className="relative">
                <Mail size={18} className="absolute top-1/2 -translate-y-1/2 end-4 text-neutral-400" />
                <input id="email" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="example@email.com" required autoComplete="email" inputMode="email" dir="ltr" className="input-msari pe-12" />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-neutral-700 mb-2">رقم الهاتف</label>
              <div className="relative">
                <Phone size={18} className="absolute top-1/2 -translate-y-1/2 end-4 text-neutral-400" />
                <input id="phone" type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+967 7XX XXX XXX" required autoComplete="tel" inputMode="tel" dir="ltr" className="input-msari pe-12" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-neutral-700 mb-2">كلمة المرور</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  className="absolute top-1/2 -translate-y-1/2 end-4 text-neutral-400"
                  aria-label={showPw ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                <input id="password" type={showPw ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)} placeholder="10 أحرف على الأقل" required minLength={10} autoComplete="new-password" dir="ltr" className="input-msari pe-12" />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-neutral-700 mb-2">تأكيد كلمة المرور</label>
              <div className="relative">
                {form.confirm.length > 0 && form.password === form.confirm ? (
                  <CheckCircle2 size={18} className="absolute top-1/2 -translate-y-1/2 end-4 text-emerald-500" />
                ) : (
                  <Lock size={18} className="absolute top-1/2 -translate-y-1/2 end-4 text-neutral-400" />
                )}
                <input id="confirmPassword" type="password" value={form.confirm} onChange={e => set('confirm', e.target.value)} placeholder="أعد كتابة كلمة المرور" required autoComplete="new-password" dir="ltr" className="input-msari pe-12" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-br from-[#23096e] to-[#3A1C8F] text-white font-black py-4 rounded-xl hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
            >
              {loading
                ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <><UserPlus size={18} /> إنشاء الحساب</>
              }
            </button>
          </form>

          <p className="text-center text-neutral-500 text-sm mt-8">
            لديك حساب بالفعل؟{' '}
            <Link href={`/login?redirect=${encodedRedirect}`} className="text-[#23096e] font-bold hover:underline">
              تسجيل الدخول
            </Link>
          </p>
        </div>
    </div>
  );
}

export default function RegisterPage() {
  return <Suspense><RegisterForm /></Suspense>;
}
