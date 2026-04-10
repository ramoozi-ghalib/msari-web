'use client';

import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, MessageCircle, CheckCircle } from 'lucide-react';

const contactInfo = [
  {
    icon: Phone,
    title: 'واتساب',
    value: '+967 770 000 000',
    action: 'https://wa.me/967770000000',
    actionLabel: 'ابدأ المحادثة',
    color: 'bg-green-500',
  },
  {
    icon: Mail,
    title: 'البريد الإلكتروني',
    value: 'info@msari.net',
    action: 'mailto:info@msari.net',
    actionLabel: 'أرسل رسالة',
    color: 'bg-[#23096e]',
  },
  {
    icon: MapPin,
    title: 'موقعنا',
    value: 'صنعاء وعدن — اليمن',
    action: null,
    actionLabel: null,
    color: 'bg-amber-500',
  },
  {
    icon: Clock,
    title: 'ساعات العمل',
    value: 'يومياً ٨ ص — ١٠ م',
    action: null,
    actionLabel: null,
    color: 'bg-blue-500',
  },
];

const faqs = [
  { q: 'كيف يمكنني تأكيد حجزي؟', a: 'بعد إتمام الحجز، ستظهر لك صفحة تأكيد وستصلك رسالة واتساب تحتوي على تفاصيل حجزك كاملة.' },
  { q: 'هل يمكنني إلغاء أو تعديل الحجز؟', a: 'نعم، يمكنك التواصل معنا عبر واتساب وسنقوم بمساعدتك في الإلغاء أو التعديل خلال 24 ساعة.' },
  { q: 'ما هي طرق الدفع المتاحة؟', a: 'نقبل الحوالات البنكية، الدفع عند الوصول، والدفع عبر واتساب. جاري تفعيل الدفع الإلكتروني قريباً.' },
  { q: 'هل تشملون فنادق خارج اليمن؟', a: 'نعم، لدينا قسم مخصص للفنادق العالمية يمكنك تصفحه والتواصل معنا للحجز.' },
];

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = `مرحباً، أود التواصل معكم:\n\nالاسم: ${form.name}\nالهاتف: ${form.phone}\nالموضوع: ${form.subject}\nالرسالة: ${form.message}`;
    window.open(`https://wa.me/967770000000?text=${encodeURIComponent(msg)}`, '_blank');
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div className="min-h-screen bg-[#f8f8fa]">

      {/* Hero */}
      <section className="relative pt-28 pb-20 bg-gradient-to-br from-[#23096e] via-[#2d1580] to-[#3A1C8F] overflow-hidden">
        <div className="container-msari relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">تواصل معنا</h1>
          <p className="text-white/80 text-lg max-w-xl mx-auto">
            فريقنا جاهز لمساعدتك في أي وقت. لا تتردد في التواصل معنا.
          </p>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="container-msari -mt-8 relative z-10 mb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {contactInfo.map((item) => (
            <div key={item.title} className="bg-white rounded-2xl p-6 shadow-lg border border-neutral-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center mb-4`}>
                <item.icon size={22} className="text-white" />
              </div>
              <div className="font-bold text-neutral-900 mb-1">{item.title}</div>
              <div className="text-neutral-500 text-sm mb-3">{item.value}</div>
              {item.action && (
                <a
                  href={item.action}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#23096e] font-bold text-sm hover:underline flex items-center gap-1"
                >
                  {item.actionLabel} →
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Form + FAQ */}
      <section className="container-msari mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Contact Form */}
          <div className="bg-white rounded-3xl p-8 shadow-md border border-neutral-100">
            <h2 className="text-2xl font-black text-neutral-900 mb-2">أرسل لنا رسالة</h2>
            <p className="text-neutral-500 text-sm mb-8">سنردّ عليك عبر واتساب خلال دقائق</p>

            {sent ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle size={40} className="text-green-500" />
                </div>
                <p className="text-lg font-bold text-neutral-900">تم فتح واتساب!</p>
                <p className="text-neutral-500 text-sm text-center">أكمل إرسال الرسالة عبر واتساب وسنرد عليك في أقرب وقت.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">الاسم الكامل *</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="محمد أحمد"
                      className="input-msari"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">رقم الهاتف *</label>
                    <input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+967 7XX XXX XXX"
                      className="input-msari"
                      dir="ltr"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">الموضوع *</label>
                  <select
                    required
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="input-msari"
                  >
                    <option value="">اختر الموضوع...</option>
                    <option>استفسار عن حجز</option>
                    <option>إلغاء أو تعديل حجز</option>
                    <option>مشكلة في الدفع</option>
                    <option>إضافة فندق للمنصة</option>
                    <option>أخرى</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">الرسالة *</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="اكتب رسالتك هنا..."
                    className="input-msari resize-none"
                  />
                </div>
                <button type="submit" className="w-full btn btn-primary gap-2 py-4">
                  <MessageCircle size={18} />
                  إرسال عبر واتساب
                </button>
              </form>
            )}
          </div>

          {/* FAQ */}
          <div>
            <h2 className="text-2xl font-black text-neutral-900 mb-2">الأسئلة الشائعة</h2>
            <p className="text-neutral-500 text-sm mb-8">إجابات على أكثر الأسئلة تكراراً</p>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 hover:shadow-md transition-shadow duration-300">
                  <h3 className="font-bold text-neutral-900 mb-3 flex items-start gap-2">
                    <span className="w-6 h-6 bg-[#23096e] text-white rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5">{i + 1}</span>
                    {faq.q}
                  </h3>
                  <p className="text-neutral-500 text-sm leading-relaxed pr-8">{faq.a}</p>
                </div>
              ))}
            </div>

            {/* WhatsApp Quick Button */}
            <div className="mt-8 bg-green-50 border border-green-200 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                  <Phone size={18} className="text-white" />
                </div>
                <div>
                  <div className="font-bold text-neutral-900">تحدث معنا مباشرة</div>
                  <div className="text-sm text-neutral-500">متاحون ٨ ص — ١٠ م يومياً</div>
                </div>
              </div>
              <a
                href="https://wa.me/967770000000"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-colors duration-300"
              >
                💬 ابدأ محادثة واتساب
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
