'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, AlertCircle, LogIn } from 'lucide-react';
import { signIn } from 'next-auth/react';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get('redirect') || '/';

  const login = async (e: string, p: string) => {
    try {
      const res = await signIn('credentials', {
        email: e,
        password: p,
        redirect: false,
      });

      if (res?.error) {
        return { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'حدث خطأ أثناء الاتصال بالخادم' };
    }
  };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      router.push(redirect);
    } else {
      setError(result.error || 'حدث خطأ');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-3 mb-10 group">
            <div className="relative w-10 h-10 rounded-sm overflow-hidden">
              <Image src="/images/logo-dark.png" alt="مساري" fill className="object-contain" />
            </div>
            <span className="text-2xl font-black text-[#23096e]">مساري</span>
          </Link>

          <h1 className="text-3xl font-black text-neutral-900 mb-2">مرحباً بعودتك 👋</h1>
          <p className="text-neutral-500 mb-8">سجّل دخولك للوصول إلى حجوزاتك وعروضك</p>

          {/* Demo hint */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm text-blue-700">
            <strong>للتجربة:</strong> admin@msari.net / admin123
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">البريد الإلكتروني</label>
              <div className="relative">
                <Mail size={18} className="absolute top-1/2 -translate-y-1/2 end-4 text-neutral-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  required
                  dir="ltr"
                  className="input-msari pe-12"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">كلمة المرور</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  className="absolute top-1/2 -translate-y-1/2 end-4 text-neutral-400 hover:text-neutral-600"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  dir="ltr"
                  className="input-msari pe-12"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-br from-[#23096e] to-[#3A1C8F] text-white font-black py-4 rounded-xl hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <><LogIn size={18} /> تسجيل الدخول</>
              )}
            </button>
          </form>

          <p className="text-center text-neutral-500 text-sm mt-8">
            ليس لديك حساب؟{' '}
            <Link href={`/auth/register?redirect=${redirect}`} className="text-[#23096e] font-bold hover:underline">
              إنشاء حساب جديد
            </Link>
          </p>
        </div>
      </div>

      {/* Right - Brand Visual */}
      <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-[#23096e] via-[#2d1580] to-[#3A1C8F] items-center justify-center p-12">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4z'/%3E%3C/g%3E%3C/svg%3E")` }}
        />
        <div className="relative z-10 text-center text-white max-w-sm">
          <div className="text-7xl mb-8">✈️</div>
          <h2 className="text-3xl font-black mb-4">سفرتك القادمة تبدأ هنا</h2>
          <p className="text-white/75 text-lg leading-relaxed">
            احجز فنادقك، طيرانك، وتنقلاتك في اليمن والعالم — كل شيء في مكان واحد
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[{v:'+50',l:'فندق'},{v:'+10',l:'مدينة'},{v:'4.8★',l:'تقييم'}].map(s => (
              <div key={s.l} className="bg-white/10 rounded-2xl p-4 border border-white/20">
                <div className="text-2xl font-black">{s.v}</div>
                <div className="text-white/70 text-xs mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
