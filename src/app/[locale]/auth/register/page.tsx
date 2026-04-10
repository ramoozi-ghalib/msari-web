'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, User, Phone, AlertCircle, UserPlus } from 'lucide-react';
// import { useAuth } from '@/contexts/AuthContext'; // Removed for backend migration

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get('redirect') || '/';
  // Mock register function
  const register = async (...args: any[]) => { return { success: false, error: 'إنشاء الحساب معطل مؤقتاً أثناء التحديثات' }; };

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('كلمتا المرور غير متطابقتين');
    if (form.password.length < 6) return setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
    setLoading(true);
    const result = await register(form.name, form.email, form.phone, form.password);
    setLoading(false);
    if (result.success) router.push(redirect);
    else setError(result.error || 'حدث خطأ');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left - Brand */}
      <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-[#23096e] via-[#2d1580] to-[#3A1C8F] items-center justify-center p-12">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4z'/%3E%3C/g%3E%3C/svg%3E")` }}
        />
        <div className="relative z-10 text-center text-white max-w-sm">
          <div className="text-7xl mb-8">🏨</div>
          <h2 className="text-3xl font-black mb-4">انضم لعائلة مساري</h2>
          <p className="text-white/75 text-lg leading-relaxed">
            أنشئ حسابك مجاناً واستمتع بأفضل عروض الفنادق والطيران في اليمن
          </p>
          <div className="mt-10 space-y-4">
            {['احجز بخطوات سهلة وسريعة','تتبع جميع حجوزاتك في مكان واحد','احصل على عروض حصرية للأعضاء'].map(t => (
              <div key={t} className="flex items-center gap-3 text-white/90 text-sm">
                <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs">✓</span>
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-flex items-center gap-3 mb-10 group">
            <div className="relative w-10 h-10 rounded-sm overflow-hidden">
              <Image src="/images/logo-dark.png" alt="مساري" fill className="object-contain" />
            </div>
            <span className="text-2xl font-black text-[#23096e]">مساري</span>
          </Link>

          <h1 className="text-3xl font-black text-neutral-900 mb-2">إنشاء حساب جديد</h1>
          <p className="text-neutral-500 mb-8">أنشئ حسابك مجاناً في دقيقة واحدة</p>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">الاسم الكامل</label>
              <div className="relative">
                <User size={18} className="absolute top-1/2 -translate-y-1/2 end-4 text-neutral-400" />
                <input type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder="محمد أحمد" required className="input-msari pe-12" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">البريد الإلكتروني</label>
              <div className="relative">
                <Mail size={18} className="absolute top-1/2 -translate-y-1/2 end-4 text-neutral-400" />
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="example@email.com" required dir="ltr" className="input-msari pe-12" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">رقم الهاتف</label>
              <div className="relative">
                <Phone size={18} className="absolute top-1/2 -translate-y-1/2 end-4 text-neutral-400" />
                <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+967 7XX XXX XXX" required dir="ltr" className="input-msari pe-12" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">كلمة المرور</label>
              <div className="relative">
                <button type="button" onClick={() => setShowPw(p => !p)} className="absolute top-1/2 -translate-y-1/2 end-4 text-neutral-400">
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                <input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)} placeholder="6 أحرف على الأقل" required dir="ltr" className="input-msari pe-12" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">تأكيد كلمة المرور</label>
              <div className="relative">
                <Lock size={18} className="absolute top-1/2 -translate-y-1/2 end-4 text-neutral-400" />
                <input type="password" value={form.confirm} onChange={e => set('confirm', e.target.value)} placeholder="أعد كتابة كلمة المرور" required dir="ltr" className="input-msari pe-12" />
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
            <Link href={`/auth/login?redirect=${redirect}`} className="text-[#23096e] font-bold hover:underline">
              تسجيل الدخول
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return <Suspense><RegisterForm /></Suspense>;
}
