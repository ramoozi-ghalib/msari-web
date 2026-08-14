'use client';

import { useState } from 'react';
import { Hotel, MapPin, Phone, Mail, User, Send, CheckCircle, Building2, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const cities = ['صنعاء', 'عدن', 'مأرب', 'المكلا', 'تعز', 'الحديدة', 'إب', 'ذمار', 'حضرموت', 'سيئون', 'أخرى'];

const DEFAULT_BENEFITS = [
  { emoji: '📈', title: 'أكثر حجوزات', desc: 'وصول لآلاف المسافرين شهرياً' },
  { emoji: '💰', title: 'عمولة منخفضة', desc: 'أفضل شروط إذا قارنت بالمنافسين' },
];

export default function AddHotelClient({ pageContent }: { pageContent?: any }) {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    hotelName: '',
    city: '',
    address: '',
    stars: '3',
    ownerName: '',
    position: '',
    phone: '',
    email: '',
    rooms: '',
    suites: '',
    amenities: '',
    message: '',
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  const badge = pageContent?.hero?.badge || 'انضم كشريك في مساري';
  const title = pageContent?.hero?.title || 'أضف فندقك إلى مساري';
  const subtitle = pageContent?.hero?.subtitle || 'اعرض فندقك أمام آلاف المسافرين يومياً واحصل على حجوزات أكثر';
  const benefits = (pageContent?.benefits && pageContent.benefits.length > 0) ? pageContent.benefits : DEFAULT_BENEFITS;

  if (sent) {
    return (
      <div className="min-h-screen bg-[var(--surface-page)] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-black text-neutral-900 mb-3">تم إرسال الطلب بنجاح!</h2>
          <p className="text-neutral-500 text-base mb-8 leading-relaxed">
            تم استلام طلبك بنجاح. سيتواصل معك فريقنا خلال ٢٤ ساعة لمراجعة الطلب وإتمام الإجراءات.
          </p>
          <Button variant="primary" onClick={() => setSent(false)}>
            إرسال طلب آخر
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--surface-page)]">
      {/* Hero */}
      <section className="relative pt-28 pb-20 bg-gradient-to-br from-[var(--brand-primary)] via-[var(--brand-secondary)] to-[var(--brand-dark)] overflow-hidden">
        <div className="container-msari relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/90 text-sm font-medium mb-6 border border-white/20">
            <Building2 size={14} />
            {badge}
          </div>
          <h1 className="text-4xl md:text-5xl font-black !text-white mb-4">{title}</h1>
          <p className="text-white/80 text-lg max-w-xl mx-auto">
            {subtitle}
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="container-msari -mt-8 relative z-10 mb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {benefits.map((b: any) => (
            <div key={b.title} className="bg-white rounded-2xl p-6 shadow-lg border border-neutral-100 text-center">
              <div className="text-4xl mb-3">{b.emoji}</div>
              <div className="font-black text-neutral-900 mb-1">{b.title}</div>
              <div className="text-neutral-500 text-sm">{b.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Form */}
      <section className="container-msari mb-20">
        <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-md border border-neutral-100 p-8">
          <h2 className="text-2xl font-black text-neutral-900 mb-2">نموذج تقديم الطلب</h2>
          <p className="text-neutral-500 text-sm mb-8">
            أملأ البيانات وسيتواصل معك فريقنا خلال ٢٤ ساعة لمراجعة الطلب
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Hotel Info */}
            <div className="pb-4 border-b border-neutral-100">
              <h3 className="font-black text-neutral-800 mb-4 flex items-center gap-2">
                <Hotel size={18} className="text-[var(--brand-primary)]" /> معلومات الفندق
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1.5">اسم الفندق *</label>
                  <input
                    type="text"
                    required
                    value={form.hotelName}
                    onChange={e => set('hotelName', e.target.value)}
                    placeholder="مثال: فندق التاج الذهبي"
                    className="input-msari"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-1.5">المدينة *</label>
                    <select
                      required
                      value={form.city}
                      onChange={e => set('city', e.target.value)}
                      className="input-msari"
                    >
                      <option value="">اختر المدينة</option>
                      {cities.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-1.5">تصنيف النجوم</label>
                    <select
                      value={form.stars}
                      onChange={e => set('stars', e.target.value)}
                      className="input-msari"
                    >
                      {['1', '2', '3', '4', '5'].map(s => (
                        <option key={s} value={s}>{s} {s === '1' ? 'نجمة' : 'نجوم'}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1.5">العنوان بالتفصيل *</label>
                  <input
                    type="text"
                    required
                    value={form.address}
                    onChange={e => set('address', e.target.value)}
                    placeholder="الشارع، الحي، المعلم القريب"
                    className="input-msari"
                  />
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="pb-4 border-b border-neutral-100">
              <h3 className="font-black text-neutral-800 mb-4 flex items-center gap-2">
                <User size={18} className="text-[var(--brand-primary)]" /> بيانات المسؤول
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-1.5">اسم المسؤول *</label>
                    <input
                      type="text"
                      required
                      value={form.ownerName}
                      onChange={e => set('ownerName', e.target.value)}
                      placeholder="الاسم الكامل"
                      className="input-msari"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-1.5">المسمى الوظيفي</label>
                    <input
                      type="text"
                      value={form.position}
                      onChange={e => set('position', e.target.value)}
                      placeholder="المدير العام، مسؤول الحجوزات..."
                      className="input-msari"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-1.5">رقم الهاتف / واتساب *</label>
                    <input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={e => set('phone', e.target.value)}
                      placeholder="777000000"
                      dir="ltr"
                      className="input-msari text-right"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-1.5">البريد الإلكتروني</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => set('email', e.target.value)}
                      placeholder="hotel@example.com"
                      dir="ltr"
                      className="input-msari"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Capacity */}
            <div className="pb-4 border-b border-neutral-100">
              <h3 className="font-black text-neutral-800 mb-4 flex items-center gap-2">
                <Star size={18} className="text-[var(--brand-primary)]" /> سعة الفندق
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1.5">عدد الغرف الإجمالي</label>
                  <input
                    type="number"
                    value={form.rooms}
                    onChange={e => set('rooms', e.target.value)}
                    placeholder="مثال: 40"
                    className="input-msari"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1.5">عدد الأجنحة</label>
                  <input
                    type="number"
                    value={form.suites}
                    onChange={e => set('suites', e.target.value)}
                    placeholder="مثال: 5"
                    className="input-msari"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">ملاحظات إضافية أو خدمات خاصة</label>
              <textarea
                rows={3}
                value={form.message}
                onChange={e => set('message', e.target.value)}
                placeholder="أي تفاصيل تود إضافتها (مسبح، مطعم، قاعات مؤتمرات...)"
                className="input-msari resize-none"
              />
            </div>

            <Button type="submit" variant="primary" size="lg" fullWidth icon={<Send size={18} />}>
              إرسال طلب الانضمام
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
