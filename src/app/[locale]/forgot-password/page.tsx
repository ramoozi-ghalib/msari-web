'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Mail, ArrowRight, AlertCircle, CheckCircle2, Send, KeyRound, ArrowLeft } from 'lucide-react';
import { requestPasswordReset } from '@/actions/auth';
import { getSafeRedirect } from '@/lib/safeRedirect';
import { Button } from '@/components/ui/Button';
import AuthVisualSide from '@/components/auth/AuthVisualSide';

function ForgotPasswordForm() {
  const params = useSearchParams();
  const redirect = params.get('redirect') || '/';
  const safeRedirect = getSafeRedirect(redirect);
  const encodedRedirect = encodeURIComponent(safeRedirect);

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await requestPasswordReset(email);
      if (res.success) {
        setIsSuccess(true);
      } else {
        setError(res.error?.message || 'حدث خطأ أثناء معالجة الطلب، يرجى المحاولة لاحقاً');
      }
    } catch {
      setError('حدث خطأ في الاتصال، يرجى المحاولة لاحقاً');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-white">
      {/* ── Left/Right Interactive Form Column ── */}
      <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16">
        {/* Top Bar */}
        <div className="flex items-center justify-between pb-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-10 h-10 rounded-xl bg-[var(--brand-primary)]/10 p-2 border border-[var(--brand-primary)]/15 flex items-center justify-center transition-transform group-hover:scale-105">
              <Image src="/images/logo-dark.png" alt="مساري" width={28} height={28} className="object-contain" />
            </div>
            <span className="font-black text-xl text-neutral-900 tracking-tight">مساري</span>
          </Link>

          <Link
            href={`/login?redirect=${encodedRedirect}`}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-neutral-500 hover:text-[var(--brand-primary)] transition-colors bg-neutral-50 hover:bg-neutral-100 px-3.5 py-1.5 rounded-full"
          >
            تسجيل الدخول <ArrowRight size={14} className="rtl:rotate-180" />
          </Link>
        </div>

        {/* Middle Area */}
        <div className="my-auto py-6 max-w-md w-full mx-auto">
          {!isSuccess ? (
            <>
              <div className="mb-8">
                <div className="w-12 h-12 rounded-2xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center mb-4">
                  <KeyRound size={24} />
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight mb-2.5">
                  استعادة كلمة المرور 🔑
                </h1>
                <p className="text-neutral-500 text-sm leading-relaxed">
                  أدخل بريدك الإلكتروني المسجل وسنرسل لك رابطاً آمناً لإعادة تعيين كلمة المرور واستعادة حسابك.
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
                <div>
                  <label htmlFor="email" className="block text-xs sm:text-sm font-bold text-neutral-800 mb-1.5">
                    البريد الإلكتروني المسجل
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

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    loading={loading}
                    icon={<Send size={18} />}
                    className="py-3.5 shadow-lg shadow-[var(--brand-primary)]/20 hover:shadow-[var(--brand-primary)]/30 font-bold"
                  >
                    إرسال رابط الاستعادة
                  </Button>
                </div>
              </form>

              <div className="mt-8 pt-6 border-t border-neutral-100 text-center">
                <p className="text-neutral-600 text-sm">
                  تذكرت كلمة المرور؟{' '}
                  <Link
                    href={`/login?redirect=${encodedRedirect}`}
                    className="font-bold text-[var(--brand-primary)] hover:underline"
                  >
                    تسجيل الدخول
                  </Link>
                </p>
              </div>
            </>
          ) : (
            /* Success Confirmation State */
            <div className="text-center py-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200/80 text-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-sm">
                <CheckCircle2 size={32} />
              </div>

              <h2 className="text-2xl font-black text-neutral-900 mb-3 tracking-tight">
                تم إرسال رابط الاستعادة! ✉️
              </h2>

              <p className="text-neutral-600 text-sm leading-relaxed mb-6">
                أرسلنا رسالة تحتوي على رابط آمن لإعادة تعيين كلمة المرور إلى البريد:
                <br />
                <span className="font-bold text-neutral-900 text-base dir-ltr inline-block mt-1">{email}</span>
              </p>

              <div className="bg-amber-50/80 border border-amber-200/70 rounded-2xl p-4 text-xs text-amber-800 leading-relaxed text-start mb-8">
                💡 <span className="font-bold">ملاحظة:</span> إذا لم تجد الرسالة في صندوق الوارد خلال دقيقة، يرجى التحقق من مجلد الرسائل غير المرغوب فيها (Spam / Junk).
              </div>

              <div className="space-y-3">
                <Link href={`/login?redirect=${encodedRedirect}`}>
                  <Button variant="primary" size="lg" fullWidth className="font-bold">
                    العودة لتسجيل الدخول
                  </Button>
                </Link>

                <button
                  type="button"
                  onClick={() => setIsSuccess(false)}
                  className="w-full text-xs font-bold text-neutral-500 hover:text-[var(--brand-primary)] transition-colors py-2"
                >
                  إعادة المحاولة ببريد إلكتروني آخر
                </button>
              </div>
            </div>
          )}
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

      {/* ── Visual Showcase Side Column ── */}
      <AuthVisualSide
        badgeText="أمان وحماية الحسابات"
        headline="استعد حسابك وتابع خطط سفرك بأمان"
        subheadline="نضمن لك حماية وتشفير بياناتك بالكامل مع استعادة فورية لكلمة المرور عبر بريدك الإلكتروني الموثق."
      />
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <ForgotPasswordForm />
    </Suspense>
  );
}
