'use client';

import { useState, Suspense, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, User, Phone, AlertCircle, UserPlus, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { registerUser } from '@/actions/auth';
import { getSafeRedirect } from '@/lib/safeRedirect';
import { Button } from '@/components/ui/Button';
import AuthVisualSide from '@/components/auth/AuthVisualSide';

type RegisterActionResult = Awaited<ReturnType<typeof registerUser>>;

function RegisterForm() {
  const params = useSearchParams();
  const redirect = params.get('redirect') || '/';
  const safeRedirect = getSafeRedirect(redirect);
  const encodedRedirect = encodeURIComponent(safeRedirect);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirm: '',
    acceptTerms: true,
  });

  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  // Password strength calculator
  const passwordScore = useMemo(() => {
    const p = form.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8) score += 1;
    if (p.length >= 10) score += 1;
    if (/[A-Z]/.test(p) || /[a-z]/.test(p)) score += 1;
    if (/[0-9]/.test(p)) score += 1;
    if (/[^A-Za-z0-9]/.test(p)) score += 1;
    return score;
  }, [form.password]);

  const passwordStrengthLabel = useMemo(() => {
    if (!form.password) return null;
    if (passwordScore <= 2) return { text: 'ضعيفة', color: 'bg-rose-500', textColor: 'text-rose-600', percent: '33%' };
    if (passwordScore <= 3) return { text: 'جيدة', color: 'bg-amber-500', textColor: 'text-amber-600', percent: '66%' };
    return { text: 'قوية جداً ومحمية', color: 'bg-emerald-500', textColor: 'text-emerald-600', percent: '100%' };
  }, [form.password, passwordScore]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm) {
      return setError('كلمتا المرور غير متطابقتين، يرجى التأكد من كتابتها بشكل صحيح.');
    }
    if (form.password.length < 10) {
      return setError('يجب ألا تقل كلمة المرور عن 10 أحرف لضمان أمان حسابك.');
    }
    if (!form.acceptTerms) {
      return setError('يرجى الموافقة على شروط الاستخدام وسياسة الخصوصية للمتابعة.');
    }

    setLoading(true);
    try {
      const result = await registerUser({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        password: form.password,
      });

      if (!result.success) {
        const errMsg = (result as RegisterActionResult).error?.message || 'حدث خطأ أثناء إنشاء الحساب، يرجى المحاولة مرة أخرى.';
        setError(errMsg);
        setLoading(false);
        return;
      }

      // Auto-login after successful registration
      await signIn('credentials', {
        email: form.email.trim().toLowerCase(),
        password: form.password,
        redirect: true,
        callbackUrl: safeRedirect,
      });

    } catch {
      setError('حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-white">
      {/* ── Left/Right Interactive Form Column (5/12 on lg, 5/12 on xl) ── */}
      <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16">
        {/* Top Bar: Logo & Back Link */}
        <div className="flex items-center justify-between pb-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-10 h-10 rounded-xl bg-[var(--brand-primary)]/10 p-2 border border-[var(--brand-primary)]/15 flex items-center justify-center transition-transform group-hover:scale-105">
              <Image src="/images/logo-dark.png" alt="مساري" width={28} height={28} className="object-contain" />
            </div>
            <span className="font-black text-xl text-neutral-900 tracking-tight">مساري</span>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-neutral-500 hover:text-[var(--brand-primary)] transition-colors bg-neutral-50 hover:bg-neutral-100 px-3.5 py-1.5 rounded-full"
          >
            الرئيسية <ArrowRight size={14} className="rtl:rotate-180" />
          </Link>
        </div>

        {/* Middle Form Area */}
        <div className="my-auto py-6 max-w-md w-full mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight mb-2.5">
              ابدأ رحلتك مع مساري ✨
            </h1>
            <p className="text-neutral-500 text-sm leading-relaxed">
              أنشئ حسابك المجاني واستمتع بحجوزات فورية وعروض فندقية حصرية.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div role="alert" aria-live="assertive" className="flex items-start gap-2.5 bg-red-50 border border-red-200/80 text-red-700 rounded-2xl p-4 mb-6 text-sm shadow-sm animate-in fade-in duration-200">
              <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-600" />
              <div className="font-medium">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name Field */}
            <div>
              <label htmlFor="name" className="block text-xs sm:text-sm font-bold text-neutral-800 mb-1.5">
                الاسم الكامل
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-neutral-400">
                  <User size={18} />
                </div>
                <input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder="محمد أحمد علي"
                  required
                  autoFocus
                  autoComplete="name"
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 ps-10 pe-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary)]/10 transition-all outline-none"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs sm:text-sm font-bold text-neutral-800 mb-1.5">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-neutral-400">
                  <Mail size={18} />
                </div>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="name@example.com"
                  required
                  autoComplete="email"
                  inputMode="email"
                  dir="ltr"
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 ps-10 pe-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary)]/10 transition-all outline-none"
                />
              </div>
            </div>

            {/* Phone Number Field */}
            <div>
              <label htmlFor="phone" className="block text-xs sm:text-sm font-bold text-neutral-800 mb-1.5">
                رقم الهاتف
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-neutral-400">
                  <Phone size={18} />
                </div>
                <input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                  placeholder="+967 7XX XXX XXX"
                  required
                  autoComplete="tel"
                  inputMode="tel"
                  dir="ltr"
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 ps-10 pe-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary)]/10 transition-all outline-none"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-xs sm:text-sm font-bold text-neutral-800 mb-1.5">
                كلمة المرور
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-neutral-400">
                  <Lock size={18} />
                </div>
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  placeholder="10 أحرف على الأقل"
                  required
                  minLength={10}
                  autoComplete="new-password"
                  dir="ltr"
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 ps-10 pe-11 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary)]/10 transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  className="absolute inset-y-0 end-0 pe-3.5 flex items-center text-neutral-400 hover:text-neutral-700 transition-colors"
                  aria-label={showPw ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Dynamic Password Strength Bar */}
              {passwordStrengthLabel && (
                <div className="mt-2 space-y-1.5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400">قوة كلمة المرور:</span>
                    <span className={`font-bold ${passwordStrengthLabel.textColor}`}>{passwordStrengthLabel.text}</span>
                  </div>
                  <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${passwordStrengthLabel.color} transition-all duration-300 rounded-full`}
                      style={{ width: passwordStrengthLabel.percent }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirm" className="block text-xs sm:text-sm font-bold text-neutral-800 mb-1.5">
                تأكيد كلمة المرور
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-neutral-400">
                  {form.confirm && form.password === form.confirm ? (
                    <CheckCircle2 size={18} className="text-emerald-500" />
                  ) : (
                    <Lock size={18} />
                  )}
                </div>
                <input
                  id="confirm"
                  type={showConfirmPw ? 'text' : 'password'}
                  value={form.confirm}
                  onChange={e => set('confirm', e.target.value)}
                  placeholder="أعد كتابة كلمة المرور"
                  required
                  autoComplete="new-password"
                  dir="ltr"
                  className={`w-full rounded-xl border ${form.confirm && form.password === form.confirm ? 'border-emerald-300 bg-emerald-50/20' : 'border-neutral-200 bg-neutral-50/50'} ps-10 pe-11 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary)]/10 transition-all outline-none`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPw(p => !p)}
                  className="absolute inset-y-0 end-0 pe-3.5 flex items-center text-neutral-400 hover:text-neutral-700 transition-colors"
                  aria-label={showConfirmPw ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showConfirmPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Terms & Privacy Consent */}
            <div className="pt-2">
              <label className="flex items-start gap-2 text-xs text-neutral-500 cursor-pointer select-none leading-relaxed">
                <input
                  type="checkbox"
                  checked={form.acceptTerms}
                  onChange={e => set('acceptTerms', e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-neutral-300 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)] cursor-pointer"
                />
                <span>
                  أوافق على{' '}
                  <Link href="/terms" className="text-[var(--brand-primary)] font-bold hover:underline">
                    شروط الاستخدام
                  </Link>{' '}
                  و{' '}
                  <Link href="/privacy" className="text-[var(--brand-primary)] font-bold hover:underline">
                    سياسة الخصوصية
                  </Link>
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                icon={<UserPlus size={18} />}
                className="py-3.5 shadow-lg shadow-[var(--brand-primary)]/20 hover:shadow-[var(--brand-primary)]/30 font-bold"
              >
                إنشاء الحساب
              </Button>
            </div>
          </form>

          {/* Login Link */}
          <div className="mt-8 pt-6 border-t border-neutral-100 text-center">
            <p className="text-neutral-600 text-sm">
              لديك حساب بالفعل؟{' '}
              <Link
                href={`/login?redirect=${encodedRedirect}`}
                className="font-bold text-[var(--brand-primary)] hover:underline inline-flex items-center gap-0.5"
              >
                تسجيل الدخول
              </Link>
            </p>
          </div>
        </div>

        {/* Bottom Legal Footer */}
        <div className="pt-6 border-t border-neutral-100/80 flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-400">
          <span>© {new Date().getFullYear()} مساري لخدمات السفر والسياحة.</span>
          <div className="flex items-center gap-2 font-medium">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>تسجيل آمن ومشفر 100%</span>
          </div>
        </div>
      </div>

      {/* ── Visual Showcase Side Column (6/12 on lg, 7/12 on xl) ── */}
      <AuthVisualSide
        badgeText="انضم إلى مجتمع مساري"
        headline="عالم من الفنادق والرحلات بانتظارك"
        subheadline="أنشئ حسابك لتستفيد من أفضل أسعار الحجز الفندقي، عروض التخفيض الحصرية، وإدارة كامل حجوزاتك من مكان واحد."
      />
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
