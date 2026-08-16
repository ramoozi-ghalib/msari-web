'use client';

import { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, AlertCircle, LogIn, ArrowRight, Check } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { getSafeRedirect } from '@/lib/safeRedirect';
import { Button } from '@/components/ui/Button';
import AuthVisualSide from '@/components/auth/AuthVisualSide';

function LoginForm() {
  const params = useSearchParams();
  const redirect = params.get('redirect') || '/';
  const safeRedirect = getSafeRedirect(redirect);
  const encodedRedirect = encodeURIComponent(safeRedirect);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const authError = params.get('error');
    if (authError === 'CredentialsSignin') {
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    } else if (authError) {
      setError('حدث خطأ أثناء تسجيل الدخول، يرجى المحاولة مرة أخرى');
    }
  }, [params]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await signIn('credentials', {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (res?.error) {
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
        setLoading(false);
      } else {
        const targetUrl = (redirect && redirect !== '/') ? safeRedirect : '/';
        window.location.href = targetUrl;
      }
    } catch {
      setError('حدث خطأ أثناء تسجيل الدخول، يرجى المحاولة مرة أخرى');
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
              مرحباً بك مجدداً 👋
            </h1>
            <p className="text-neutral-500 text-sm leading-relaxed">
              سجّل دخولك لمتابعة استكشاف أفضل الفنادق وإدارة حجوزاتك بكل سهولة.
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
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  autoFocus
                  autoComplete="email"
                  inputMode="email"
                  dir="ltr"
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 ps-10 pe-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary)]/10 transition-all outline-none"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs sm:text-sm font-bold text-neutral-800">
                  كلمة المرور
                </label>
                <Link
                  href={`/forgot-password?redirect=${encodedRedirect}`}
                  className="text-xs font-bold text-[var(--brand-primary)] hover:underline"
                >
                  نسيت كلمة المرور؟
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-neutral-400">
                  <Lock size={18} />
                </div>
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
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
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-neutral-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-neutral-300 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)] cursor-pointer"
                />
                تذكرني على هذا الجهاز
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                icon={<LogIn size={18} />}
                className="py-3.5 shadow-lg shadow-[var(--brand-primary)]/20 hover:shadow-[var(--brand-primary)]/30 font-bold"
              >
                تسجيل الدخول
              </Button>
            </div>
          </form>

          {/* Registration Link */}
          <div className="mt-8 pt-6 border-t border-neutral-100 text-center">
            <p className="text-neutral-600 text-sm">
              ليس لديك حساب بعد؟{' '}
              <Link
                href={`/register?redirect=${encodedRedirect}`}
                className="font-bold text-[var(--brand-primary)] hover:underline inline-flex items-center gap-0.5"
              >
                إنشاء حساب جديد
              </Link>
            </p>
          </div>
        </div>

        {/* Bottom Legal Footer */}
        <div className="pt-6 border-t border-neutral-100/80 flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-400">
          <span>© {new Date().getFullYear()} مساري لخدمات السفر والسياحة.</span>
          <div className="flex items-center gap-4 font-medium">
            <Link href="/terms" className="hover:text-neutral-600 transition-colors">شروط الخدمة</Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-neutral-600 transition-colors">سياسة الخصوصية</Link>
          </div>
        </div>
      </div>

      {/* ── Visual Showcase Side Column (6/12 on lg, 7/12 on xl) ── */}
      <AuthVisualSide
        badgeText="بوابتك لحجوزات الفنادق المعتمدة"
        headline="سافر واكتشف أجمل الوجهات براحة تامة"
        subheadline="نوفر لك تجربة حجز سلسة، أسعاراً منافسة، وتأكيداً فورياً عبر شبكة واسعة من الفنادق المعتمدة في كافة المدن."
      />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}