'use client';

import { useState } from 'react';
import { 
  Phone, Mail, MessageCircle, 
  ChevronDown, ArrowUpRight, Sparkles
} from 'lucide-react';
import type { WebsiteSettingsData } from '@/services/cms';

interface ContactClientProps {
  settings: WebsiteSettingsData;
}

export default function ContactClient({ settings }: ContactClientProps) {
  const faqs = (settings.contactFaqs && settings.contactFaqs.length > 0)
    ? settings.contactFaqs
    : [
        { q: 'كيف يمكنني تأكيد حجزي الفندقي عبر الموقع؟', a: 'بمجرد إتمام خطوات الحجز وإرفاق إشعار التحويل البنكي أو اختيار الدفع عند الوصول، يتم إصدار رقم الحجز فوراً وتصلك رسالة تأكيد عبر واتساب.' },
        { q: 'هل يمكنني إلغاء أو تعديل الحجز؟', a: 'نعم، يمكنك التواصل معنا مباشرة عبر واتساب مع تزويدنا برقم الحجز وسيقوم فريق الدعم بمساعدتك في إجراء التعديل أو الإلغاء.' },
        { q: 'ما هي طرق الدفع المقبولة في مساري؟', a: 'نقبل التحويلات البنكية المباشرة لكافة البنوك وشركات الصرافة، الدفع عند الوصول لبعض الفنادق، وبالعملات: الريال اليمني، الريال السعودي، والدولار الأمريكي.' },
        { q: 'هل توفرون حجوزات فنادق خارج اليمن؟', a: 'نعم، نوفر قسماً مخصصاً للفنادق العالمية في أشهر الوجهات (دبي، إسطنبول، القاهرة، مكة المكرمة، الرياض) بأسعار تنافسية.' },
      ];

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const whatsappNum = settings?.whatsappNumber || '967777000000';
  const whatsappUrl = `https://wa.me/${whatsappNum}`;
  const supportPhone = settings?.supportPhone || '+967 777 000 000';
  const infoEmail = settings?.infoEmail || 'info@msari.net';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let msg = `*رسالة واستفسار جديد عبر موقع مساري*\n\n`;
    msg += `👤 *الاسم:* ${name.trim()}\n`;
    msg += `📱 *الهاتف:* ${phone.trim()}\n\n`;
    msg += `💬 *الرسالة:*\n${message.trim()}\n`;

    window.open(`https://wa.me/${whatsappNum}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      
      {/* ─── 1. Elegant Brand Hero Header ─── */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 bg-gradient-to-br from-[#120336] via-[#23096e] to-[#3A1C8F] text-white overflow-hidden">
        {/* Subtle Ambient Lighting */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_50%)] pointer-events-none" />
        <div className="absolute -bottom-20 -start-20 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white/90 text-xs sm:text-sm font-bold mb-5 border border-white/15 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>خدمة العملاء متواجدة لخدمتكم 24/7</span>
          </div>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white mb-2.5 tracking-tight leading-tight">
            تواصل معنا
          </h1>

          <p className="text-white/80 text-xs sm:text-sm lg:text-base max-w-xl mx-auto leading-relaxed font-normal">
            نسعد بالإجابة على استفساراتك وتقديم الدعم الكامل لرحلتك وحجوزاتك في أي وقت.
          </p>
        </div>
      </section>

      {/* ─── 2. Direct Contact Channels (3 Clean Cards) ─── */}
      <section className="py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-8 rounded-2xl border border-neutral-200/70 hover:border-emerald-500 hover:shadow-lg transition-all duration-200 group bg-white"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MessageCircle size={24} />
              </div>
              <h3 className="text-lg font-black text-neutral-900 mb-1">واتساب الدعم المباشر</h3>
              <p className="text-xs text-neutral-500 mb-4">الرد السريع والمباشر على مدار الساعة</p>
              <div className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <span dir="ltr">{whatsappNum}</span>
                <ArrowUpRight size={14} className="rtl:rotate-90" />
              </div>
            </a>

            {/* Phone */}
            <a
              href={`tel:${supportPhone.replace(/\s+/g, '')}`}
              className="p-8 rounded-2xl border border-neutral-200/70 hover:border-[var(--brand-primary)] hover:shadow-lg transition-all duration-200 group bg-white"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-[var(--brand-primary)] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Phone size={24} />
              </div>
              <h3 className="text-lg font-black text-neutral-900 mb-1">خدمة العملاء</h3>
              <p className="text-xs text-neutral-500 mb-4">للاستفسارات والمساعدة الهاتفية المباشرة</p>
              <div className="text-xs font-bold text-[var(--brand-primary)] flex items-center gap-1">
                <span dir="ltr">{supportPhone}</span>
                <ArrowUpRight size={14} className="rtl:rotate-90" />
              </div>
            </a>

            {/* Email */}
            <a
              href={`mailto:${infoEmail}`}
              className="p-8 rounded-2xl border border-neutral-200/70 hover:border-[var(--brand-primary)] hover:shadow-lg transition-all duration-200 group bg-white"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Mail size={24} />
              </div>
              <h3 className="text-lg font-black text-neutral-900 mb-1">البريد الإلكتروني</h3>
              <p className="text-xs text-neutral-500 mb-4">للشركات والشراكات والاستفسارات العامة</p>
              <div className="text-xs font-bold text-blue-600 flex items-center gap-1">
                <span dir="ltr">{infoEmail}</span>
                <ArrowUpRight size={14} className="rtl:rotate-90" />
              </div>
            </a>

          </div>
        </div>
      </section>

      {/* ─── 3. Clean & Simple Message Form ─── */}
      <section className="py-16 sm:py-24 bg-[#fafafc] border-y border-neutral-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 mb-3 tracking-tight">
              أرسل لنا رسالة
            </h2>
            <p className="text-neutral-500 text-sm">
              أدخل رسالتك وسيتم تحويلها مباشرة إلى محادثة واتساب مع فريقنا.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white p-8 sm:p-10 rounded-3xl border border-neutral-200/70 shadow-sm space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-2">الاسم الكامل *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="محمد أحمد علي"
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary)]/10 transition-all outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-2">رقم الهاتف أو الواتساب *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+967 7XX XXX XXX"
                  dir="ltr"
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary)]/10 transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-2">الرسالة *</label>
              <textarea
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="اكتب رسالتك أو استفسارك هنا..."
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 p-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary)]/10 transition-all outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-xl bg-[var(--brand-primary)] hover:bg-[#1b0654] text-white font-bold text-sm transition-all duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageCircle size={18} />
              <span>إرسال الرسالة عبر واتساب</span>
            </button>
          </form>
        </div>
      </section>

      {/* ─── 4. Spacious Clean FAQs ─── */}
      <section className="py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 mb-3 tracking-tight">
              الأسئلة الشائعة
            </h2>
            <p className="text-neutral-500 text-sm">
              إجابات على أكثر الأسئلة تكراراً لمساعدتك فوراً
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-neutral-200/80 overflow-hidden transition-all bg-white"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-6 text-start font-black text-neutral-900 text-sm sm:text-base cursor-pointer gap-4"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={18}
                      className={`text-neutral-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[var(--brand-primary)]' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 pt-1 text-sm text-neutral-600 leading-relaxed border-t border-neutral-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
}
