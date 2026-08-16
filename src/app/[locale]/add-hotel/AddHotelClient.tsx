'use client';

import { useState } from 'react';
import { Hotel, User, Send, CheckCircle, Building2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const cities = ['صنعاء', 'عدن', 'مأرب', 'المكلا', 'تعز', 'الحديدة', 'إب', 'ذمار', 'حضرموت', 'سيئون', 'أخرى'];

const DEFAULT_BENEFITS = [
  { emoji: '📈', title: 'أكثر حجوزات', desc: 'وصول لآلاف المسافرين شهرياً' },
  { emoji: '💰', title: 'عمولة منخفضة', desc: 'أفضل شروط إذا قارنت بالمنافسين' },
];

export default function AddHotelClient({ pageContent }: { pageContent?: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [referenceNumber, setReferenceNumber] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const [form, setForm] = useState({
    hotelName: '',
    city: '',
    stars: '3',
    address: '',
    rooms: '',
    suites: '',
    amenities: '',
    ownerName: '',
    position: '',
    phone: '',
    email: '',
    message: '',
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validate required fields
    if (
      !form.hotelName.trim() ||
      !form.city.trim() ||
      !form.ownerName.trim() ||
      !form.position.trim() ||
      !form.phone.trim()
    ) {
      setErrorMsg('يرجى ملء جميع الحقول المطلوبة الإلزامية (*) قبل إرسال الطلب.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/partners/hotel-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hotelName: form.hotelName,
          city: form.city,
          address: form.address || form.city,
          stars: form.stars || '3',
          ownerName: form.ownerName,
          position: form.position,
          phone: form.phone,
          email: form.email || `${form.phone.replace(/[^0-9]/g, '')}@msari.partner`,
          rooms: form.rooms || '10',
          suites: form.suites || '0',
          amenities: form.amenities || 'مرافق وخدمات فندقية',
          message: form.message || 'طلب انضمام جديد عبر الموقع',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'حدث خطأ أثناء إرسال الطلب');
      }

      setReferenceNumber(data.referenceNumber || null);
      setSent(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'تعذر إرسال الطلب، يرجى المحاولة لاحقاً');
    } finally {
      setIsSubmitting(false);
    }
  };

  const badge = pageContent?.hero?.badge || 'انضم كشريك في مساري';
  const title = pageContent?.hero?.title || 'أضف فندقك إلى مساري';
  const subtitle = pageContent?.hero?.subtitle || 'اعرض فندقك أمام آلاف المسافرين يومياً واحصل على حجوزات أكثر';
  const benefits = (pageContent?.benefits && pageContent.benefits.length > 0) ? pageContent.benefits : DEFAULT_BENEFITS;
  const formTitle = pageContent?.formHeader?.title || 'نموذج تقديم الطلب';
  const formSubtitle = pageContent?.formHeader?.subtitle || 'أملأ البيانات وسيتواصل معك فريقنا خلال ٢٤ ساعة لمراجعة الطلب';
  const successTitle = pageContent?.successState?.title || 'تم إرسال الطلب بنجاح!';
  const successDesc = pageContent?.successState?.desc || 'تم استلام طلبك بنجاح. سيتواصل معك فريقنا خلال ٢٤ ساعة لمراجعة الطلب وإتمام الإجراءات.';
  const successBtnText = pageContent?.successState?.buttonText || 'إرسال طلب آخر';

  if (sent) {
    return (
      <div className="min-h-screen bg-[var(--surface-page)] flex items-center justify-center px-4 py-20">
        <div className="text-center max-w-md bg-white rounded-3xl p-8 shadow-xl border border-neutral-100">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={44} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-black text-neutral-900 mb-3">{successTitle}</h2>
          <p className="text-neutral-500 text-sm mb-6 leading-relaxed">
            {successDesc}
          </p>
          {referenceNumber && (
            <div className="bg-neutral-50 border border-neutral-200/80 rounded-2xl p-4 mb-6">
              <span className="text-xs text-neutral-500 font-bold block mb-1">الرقم المرجعي للطلب:</span>
              <span className="text-base font-black text-[#23096e] select-all font-mono">{referenceNumber}</span>
            </div>
          )}
          <Button
            variant="primary"
            onClick={() => {
              setSent(false);
              setReferenceNumber(null);
              setForm({
                hotelName: '',
                city: '',
                stars: '3',
                address: '',
                rooms: '',
                suites: '',
                amenities: '',
                ownerName: '',
                position: '',
                phone: '',
                email: '',
                message: '',
              });
            }}
          >
            {successBtnText}
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
          <h2 className="text-2xl font-black text-neutral-900 mb-2">{formTitle}</h2>
          <p className="text-neutral-500 text-sm mb-8">
            {formSubtitle}
          </p>

          {errorMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
              <AlertCircle size={20} className="shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* معلومات الفندق */}
            <div className="pb-4 border-b border-neutral-100">
              <h3 className="font-black text-neutral-800 mb-4 flex items-center gap-2">
                <Hotel size={18} className="text-[var(--brand-primary)]" /> معلومات الفندق
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">اسم الفندق *</label>
                  <input
                    type="text"
                    placeholder="مثال: فندق الأمل"
                    required
                    value={form.hotelName}
                    onChange={e => set('hotelName', e.target.value)}
                    className="input-msari"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">المدينة *</label>
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
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">التصنيف (نجوم)</label>
                    <select
                      value={form.stars}
                      onChange={e => set('stars', e.target.value)}
                      className="input-msari"
                    >
                      <option value="1">1 نجوم ⭐</option>
                      <option value="2">2 نجوم ⭐⭐</option>
                      <option value="3">3 نجوم ⭐⭐⭐</option>
                      <option value="4">4 نجوم ⭐⭐⭐⭐</option>
                      <option value="5">5 نجوم ⭐⭐⭐⭐⭐</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">العنوان التفصيلي</label>
                  <input
                    type="text"
                    placeholder="الحي / الشارع / المجاور"
                    value={form.address}
                    onChange={e => set('address', e.target.value)}
                    className="input-msari"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">عدد الغرف</label>
                    <input
                      type="number"
                      placeholder="مثال: 30"
                      min="1"
                      value={form.rooms}
                      onChange={e => set('rooms', e.target.value)}
                      className="input-msari"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">عدد الأجنحة</label>
                    <input
                      type="number"
                      placeholder="مثال: 5"
                      min="0"
                      value={form.suites}
                      onChange={e => set('suites', e.target.value)}
                      className="input-msari"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">المرافق والخدمات</label>
                  <input
                    type="text"
                    placeholder="مثال: واي فاي، مسبح، مطعم، موقف سيارات"
                    value={form.amenities}
                    onChange={e => set('amenities', e.target.value)}
                    className="input-msari"
                  />
                </div>
              </div>
            </div>

            {/* معلومات التواصل */}
            <div className="pb-4">
              <h3 className="font-black text-neutral-800 mb-4 flex items-center gap-2">
                <User size={18} className="text-[var(--brand-primary)]" /> معلومات التواصل
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">اسم المسؤول (مقدم الطلب) *</label>
                    <input
                      type="text"
                      placeholder="اسمك الكامل"
                      required
                      value={form.ownerName}
                      onChange={e => set('ownerName', e.target.value)}
                      className="input-msari"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">الصفة *</label>
                    <input
                      type="text"
                      placeholder="مالك / مدير / مسؤول حجوزات"
                      required
                      value={form.position}
                      onChange={e => set('position', e.target.value)}
                      className="input-msari"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">رقم الهاتف *</label>
                    <input
                      type="tel"
                      placeholder="+967 7XX"
                      required
                      dir="ltr"
                      value={form.phone}
                      onChange={e => set('phone', e.target.value)}
                      className="input-msari"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">البريد الإلكتروني</label>
                    <input
                      type="email"
                      placeholder="hotel@email.com"
                      dir="ltr"
                      value={form.email}
                      onChange={e => set('email', e.target.value)}
                      className="input-msari"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">رسالة إضافية</label>
                  <textarea
                    placeholder="أي تفاصيل إضافية تريد إخبارنا بها..."
                    rows={3}
                    value={form.message}
                    onChange={e => set('message', e.target.value)}
                    className="input-msari resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={isSubmitting}
              icon={isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            >
              {isSubmitting ? 'جاري إرسال الطلب...' : 'إرسال الطلب'}
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
