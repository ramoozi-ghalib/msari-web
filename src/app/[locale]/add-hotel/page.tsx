'use client';

import { useState } from 'react';
import { Hotel, MapPin, Phone, Mail, User, Send, CheckCircle, Building2, Star } from 'lucide-react';

const cities = ['صنعاء', 'عدن', 'مأرب', 'المكلا', 'تعز', 'الحديدة', 'إب', 'ذمار', 'حضرموت', 'سيئون', 'أخرى'];

export default function AddHotelPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    hotelName: '',
    city: '',
    address: '',
    stars: '3',
    ownerName: '',
    phone: '',
    email: '',
    rooms: '',
    priceFrom: '',
    amenities: '',
    message: '',
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = `مرحباً مساري، أود إضافة فندقي إلى المنصة:

🏨 اسم الفندق: ${form.hotelName}
📍 المدينة: ${form.city}
🗺️ العنوان: ${form.address}
⭐ التصنيف: ${form.stars} نجوم
🛏️ عدد الغرف: ${form.rooms}
💵 السعر يبدأ من: $${form.priceFrom} / ليلة
🏊 المرافق: ${form.amenities}

👤 اسم المسؤول: ${form.ownerName}
📞 رقم الهاتف: ${form.phone}
📧 البريد: ${form.email}

رسالة إضافية: ${form.message}`;
    window.open(`https://wa.me/967770000000?text=${encodeURIComponent(msg)}`, '_blank');
    setSent(true);
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-[#f8f8fa] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-black text-neutral-900 mb-3">تم إرسال الطلب!</h2>
          <p className="text-neutral-500 text-base mb-8 leading-relaxed">
            انتقلت إلى واتساب لإتمام إرسال بيانات الفندق. سيتواصل معك فريقنا خلال ٢٤ ساعة لمراجعة الطلب.
          </p>
          <button onClick={() => setSent(false)} className="btn btn-primary">
            إرسال طلب آخر
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f8fa]">

      {/* Hero */}
      <section className="relative pt-28 pb-20 bg-gradient-to-br from-[#23096e] via-[#2d1580] to-[#3A1C8F] overflow-hidden">
        <div className="container-msari relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/90 text-sm font-medium mb-6 border border-white/20">
            <Building2 size={14} />
            انضم كشريك في مساري
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">أضف فندقك إلى مساري</h1>
          <p className="text-white/80 text-lg max-w-xl mx-auto">
            اعرض فندقك أمام آلاف المسافرين يومياً واحصل على حجوزات أكثر
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="container-msari -mt-8 relative z-10 mb-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { emoji: '📈', title: 'أكثر حجوزات', desc: 'وصول لآلاف المسافرين شهرياً' },
            { emoji: '💰', title: 'عمولة منخفضة', desc: 'أفضل شروط إذا قارنت بالمنافسين' },
            { emoji: '📊', title: 'لوحة تحكم', desc: 'تحكم كامل بأسعارك وغرفك' },
          ].map(b => (
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
            أملأ البيانات وسيتواصل معك فريقنا خلال ٢٤ ساعة عبر واتساب
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Hotel Info */}
            <div className="pb-4 border-b border-neutral-100">
              <h3 className="font-black text-neutral-800 mb-4 flex items-center gap-2">
                <Hotel size={18} className="text-[#23096e]" /> معلومات الفندق
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">اسم الفندق *</label>
                  <input type="text" value={form.hotelName} onChange={e => set('hotelName', e.target.value)} placeholder="مثال: فندق الأمل" required className="input-msari" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">المدينة *</label>
                    <select value={form.city} onChange={e => set('city', e.target.value)} required className="input-msari">
                      <option value="">اختر المدينة</option>
                      {cities.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">التصنيف (نجوم)</label>
                    <select value={form.stars} onChange={e => set('stars', e.target.value)} className="input-msari">
                      {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} نجوم {'⭐'.repeat(n)}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">العنوان التفصيلي</label>
                  <input type="text" value={form.address} onChange={e => set('address', e.target.value)} placeholder="الحي / الشارع / المجاور" className="input-msari" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">عدد الغرف</label>
                    <input type="number" value={form.rooms} onChange={e => set('rooms', e.target.value)} placeholder="مثال: 30" className="input-msari" min="1" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">السعر يبدأ من ($)</label>
                    <input type="number" value={form.priceFrom} onChange={e => set('priceFrom', e.target.value)} placeholder="مثال: 25" className="input-msari" min="1" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">المرافق والخدمات</label>
                  <input type="text" value={form.amenities} onChange={e => set('amenities', e.target.value)} placeholder="مثال: واي فاي، مسبح، مطعم، موقف سيارات" className="input-msari" />
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="pb-4">
              <h3 className="font-black text-neutral-800 mb-4 flex items-center gap-2">
                <User size={18} className="text-[#23096e]" /> معلومات التواصل
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">اسم المسؤول *</label>
                  <input type="text" value={form.ownerName} onChange={e => set('ownerName', e.target.value)} placeholder="اسمك الكامل" required className="input-msari" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">رقم الهاتف *</label>
                    <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+967 7XX" required dir="ltr" className="input-msari" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">البريد الإلكتروني</label>
                    <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="hotel@email.com" dir="ltr" className="input-msari" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">رسالة إضافية</label>
                  <textarea value={form.message} onChange={e => set('message', e.target.value)} placeholder="أي تفاصيل إضافية تريد إخبارنا بها..." rows={3} className="input-msari resize-none" />
                </div>
              </div>
            </div>

            <button type="submit" className="w-full bg-gradient-to-br from-[#23096e] to-[#3A1C8F] text-white font-black py-4 rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-2">
              <Send size={18} />
              إرسال طلب الإضافة عبر واتساب
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
