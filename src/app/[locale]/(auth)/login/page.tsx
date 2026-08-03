'use client';

import { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Mail, Eye, EyeOff, AlertCircle, LogIn } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { getSafeRedirect } from '@/lib/safeRedirect';
import { Button } from '@/components/ui/Button';

function LoginForm() {
  const params = useSearchParams();
  const redirect = params.get('redirect') || '/';
  const safeRedirect = getSafeRedirect(redirect);
  const encodedRedirect = encodeURIComponent(safeRedirect);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const authError = params.get('error');
    if (authError === 'CredentialsSignin') {
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    } else if (authError) {
      setError('حدث خطأ أثناء تسجيل الدخول');
    }
  }, [params]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // We use NextAuth's built-in redirect mechanism.
    // If the user is an admin, the redirect to /admin will be handled by the middleware 
    // when they hit the root or an admin-only path.
    try {
      await signIn('credentials', {
        email,
        password,
        redirect: true,
        callbackUrl: safeRedirect,
      });
    } catch {
      setError('حدث خطأ أثناء تسجيل الدخول، يرجى المحاولة مرة أخرى');
    } finally {
      // Fallback if redirect: true fails or is slow
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
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand-primary)]/70 via-[var(--brand-primary)]/40 to-black/80 backdrop-blur-[2px]" />
      </div>

      {/* Form Card (Glassmorphism) */}
      <div className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-xl p-8 sm:p-10 rounded-[2rem] shadow-2xl border border-white/20">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4 hover:scale-105 transition-transform">
            <div className="relative w-16 h-16 mx-auto bg-white rounded-2xl p-3 shadow-sm border border-neutral-100 flex items-center justify-center">
              <Image src="/images/logo-dark.png" alt="مساري" width={50} height={50} className="object-contain" />
            </div>
          </Link>
          <h1 className="text-2xl font-black text-neutral-900 mb-2">وجهتك القادمة بانتظارك..</h1>
          <p className="text-neutral-500 text-sm font-medium">سجل دخولك لمواصلة الرحلة</p>
        </div>

          {error && (
            <div role="alert" aria-live="assertive" className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-neutral-700 mb-2">البريد الإلكتروني</label>
              <div className="relative">
                <Mail size={18} className="absolute top-1/2 -translate-y-1/2 end-4 text-neutral-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  required
                  autoFocus
                  autoComplete="email"
                  inputMode="email"
                  dir="ltr"
                  className="input-msari pe-12"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-semibold text-neutral-700">كلمة المرور</label>
                <Link href={`/forgot-password?redirect=${encodedRedirect}`} className="text-sm font-medium text-[var(--brand-primary)] hover:underline">
                  نسيت كلمة المرور؟
                </Link>
              </div>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  className="absolute top-1/2 -translate-y-1/2 end-4 text-neutral-400 hover:text-neutral-600"
                  aria-label={showPw ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  dir="ltr"
                  className="input-msari pe-12"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              icon={<LogIn size={18} />}
            >
              تسجيل الدخول
            </Button>
          </form>

          <p className="text-center text-neutral-500 text-sm mt-8">
            ليس لديك حساب؟{' '}
            <Link href={`/register?redirect=${encodedRedirect}`} className="text-[var(--brand-primary)] font-bold hover:underline">
              إنشاء حساب جديد
            </Link>
          </p>
        </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}