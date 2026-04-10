'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { User, Mail, Phone, Edit3, LogOut, Save, CheckCircle, Shield, BookOpen, Heart } from 'lucide-react';
// import { useAuth } from '@/contexts/AuthContext';

export default function ProfilePage() {
  const router = useRouter();
  
  // Mock data for UI preview during backend migration
  const isLoading = false;
  const isAuthenticated = true;
  const user = {
    name: 'ضيف مساري',
    email: 'demo@msari.net',
    phone: '',
    role: 'user',
    createdAt: new Date().toISOString()
  };
  const logout = () => router.push('/');
  const updateProfile = (data: any) => {};
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '' });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/account/profile');
    }
    if (user) setForm({ name: user.name, phone: user.phone || '' });
  }, [user, isAuthenticated, isLoading, router]);

  const handleSave = () => {
    updateProfile({ name: form.name, phone: form.phone });
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#23096e]/20 border-t-[#23096e] rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const initials = user.name.split(' ').map(w => w[0]).join('').slice(0, 2);
  const joinDate = new Date(user.createdAt).toLocaleDateString('ar-YE', { year: 'numeric', month: 'long' });

  return (
    <div className="min-h-screen bg-[#f8f8fa]">

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#23096e] to-[#3A1C8F] pt-28 pb-20">
        <div className="container-msari">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white/20 border-4 border-white/30 rounded-2xl flex items-center justify-center text-white text-3xl font-black">
              {initials}
            </div>
            <div>
              <h1 className="text-3xl font-black text-white mb-1">{user.name}</h1>
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <Shield size={14} />
                <span>{user.role === 'admin' ? 'مدير' : 'عضو'}</span>
                <span>—</span>
                <span>انضم منذ {joinDate}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-msari py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
              <h3 className="font-black text-neutral-900 mb-4">القائمة</h3>
              <nav className="space-y-2">
                {[
                  { icon: User, label: 'الملف الشخصي', href: '/account/profile', active: true },
                  { icon: BookOpen, label: 'حجوزاتي', href: '/account/bookings' },
                  { icon: Heart, label: 'المفضلة', href: '/favorites' },
                ].map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${item.active ? 'bg-[#23096e] text-white' : 'text-neutral-600 hover:bg-neutral-50'}`}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="border-t border-neutral-100 mt-4 pt-4">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 w-full transition-colors"
                >
                  <LogOut size={18} />
                  تسجيل الخروج
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">

            {saved && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm font-bold">
                <CheckCircle size={16} />
                تم حفظ التغييرات بنجاح
              </div>
            )}

            {/* Profile Info */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-neutral-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-neutral-900">المعلومات الشخصية</h2>
                <button
                  onClick={() => setEditing(e => !e)}
                  className="flex items-center gap-2 text-sm text-[#23096e] font-bold hover:underline"
                >
                  <Edit3 size={16} />
                  {editing ? 'إلغاء' : 'تعديل'}
                </button>
              </div>

              {editing ? (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">الاسم الكامل</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="input-msari"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">رقم الهاتف</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      className="input-msari"
                      dir="ltr"
                    />
                  </div>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 bg-[#23096e] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#1a0654] transition-colors"
                  >
                    <Save size={16} />
                    حفظ التغييرات
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  {[
                    { icon: User, label: 'الاسم الكامل', value: user.name },
                    { icon: Mail, label: 'البريد الإلكتروني', value: user.email },
                    { icon: Phone, label: 'رقم الهاتف', value: user.phone || 'لم يُضَف بعد' },
                  ].map(row => (
                    <div key={row.label} className="flex items-center gap-4 py-3 border-b border-neutral-50 last:border-0">
                      <div className="w-10 h-10 bg-[#23096e]/10 rounded-xl flex items-center justify-center shrink-0">
                        <row.icon size={18} className="text-[#23096e]" />
                      </div>
                      <div>
                        <div className="text-xs text-neutral-400 font-medium">{row.label}</div>
                        <div className="text-neutral-900 font-semibold">{row.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-neutral-100">
              <h2 className="text-xl font-black text-neutral-900 mb-6">إجراءات سريعة</h2>
              <div className="grid grid-cols-2 gap-4">
                <Link href="/account/bookings" className="flex items-center gap-3 p-4 rounded-xl border border-neutral-200 hover:border-[#23096e]/40 hover:bg-[#23096e]/5 transition-all group">
                  <BookOpen size={20} className="text-[#23096e]" />
                  <span className="font-semibold text-sm text-neutral-700 group-hover:text-[#23096e]">حجوزاتي</span>
                </Link>
                <Link href="/hotels" className="flex items-center gap-3 p-4 rounded-xl border border-neutral-200 hover:border-[#23096e]/40 hover:bg-[#23096e]/5 transition-all group">
                  <Heart size={20} className="text-[#23096e]" />
                  <span className="font-semibold text-sm text-neutral-700 group-hover:text-[#23096e]">تصفح الفنادق</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
