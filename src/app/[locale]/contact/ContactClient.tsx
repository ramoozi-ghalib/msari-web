'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Phone, Mail, MapPin, Clock, MessageCircle, 
  CheckCircle2, Send, Sparkles, ChevronDown, 
  ShieldCheck, Headphones, AlertCircle, ArrowUpRight, HelpCircle
} from 'lucide-react';
import type { WebsiteSettingsData } from '@/services/cms';
import { Button } from '@/components/ui/Button';

interface ContactClientProps {
  settings: WebsiteSettingsData;
}

const INQUIRY_CATEGORIES = [
  { id: 'hotel', label: 'حجز فندقي', emoji: '🏨' },
  { id: 'flights', label: 'تذاكر طيران', emoji: '✈️' },
  { id: 'cars', label: 'توصيل وسيارات', emoji: '🚗' },
  { id: 'partner', label: 'إضافة فندق / شريك', emoji: '🏢' },
  { id: 'payment', label: 'الدفع والتحويل', emoji: '💳' },
  { id: 'general', label: 'استفسار عام', emoji: '💬' },
];

export default function ContactClient({ settings }: ContactClientProps) {
  const faqs = (settings.contactFaqs && settings.contactFaqs.length > 0)
    ? settings.contactFaqs
    : [
        { q: 'كيف يمكنني تأكيد حجزي الفندقي عبر الموقع؟', a: 'بمجرد إتمام خطوات الحجز وإرفاق إشعار التحويل البنكي أو اختيار الدفع عند الوصول، يتم إصدار رقم حجز فوري وتصلك رسالة تأكيد عبر واتساب ورسائل المنصة مباشرة.' },
        { q: 'هل يمكنني إلغاء أو تعديل الحجز؟ وما هي السياسة المتبعة؟', a: 'نعم بكل تأكيد، يمكنك التواصل معنا مباشرة عبر واتساب مع ذكر رقم الحجز وسيقوم فريق الدعم بمساعدتك في إجراء التعديل أو الإلغاء وفقاً لسياسة الفندق المحددة.' },
        { q: 'ما هي طرق والعملات المقبولة للدفع في مساري؟', a: 'نقبل التحويلات البنكية المباشرة لكافة البنوك وشركات الصرافة اليمنية، الدفع نقداً عند الوصول لبعض الفنادق، وبالعملات: الريال اليمني (الجديد والقديم)، الريال السعودي، والدولار الأمريكي.' },
        { q: 'هل توفرون حجوزات فنادق خارج اليمن؟', a: 'نعم، نوفر قسماً مخصصاً للفنادق العالمية في أشهر الوجهات (دبي، إسطنبول، القاهرة، مكة المكرمة، الرياض) مع أسعار منافسة ودعم كامل.' },
      ];

  const [selectedCategory, setSelectedCategory] = useState('hotel');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bookingNumber, setBookingNumber] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const whatsappNum = settings?.whatsappNumber || '967777000000';
  const whatsappUrl = `https://wa.me/${whatsappNum}`;
  const supportPhone = settings?.supportPhone || '+967 777 000 000';
  const infoEmail = settings?.infoEmail || 'info@msari.net';
  const headquarters = settings?.headquartersAr || 'عدن، الجمهورية اليمنية';
  const workingHours = settings?.workingHoursAr || 'يومياً على مدار 24 ساعة';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const catLabel = INQUIRY_CATEGORIES.find(c => c.id === selectedCategory)?.label || 'استفسار';
    
    let msg = `*طلب تواصل واستفسار عبر موقع مساري* 🌐\n\n`;
    msg += `👤 *الاسم:* ${name.trim()}\n`;
    msg += `📱 *الهاتف:* ${phone.trim()}\n`;
    msg += `📌 *نوع الاستفسار:* ${catLabel}\n`;
    if (bookingNumber.trim()) {
      msg += `🔢 *رقم الحجز (إن وجد):* ${bookingNumber.trim()}\n`;
    }
    msg += `\n💬 *الرسالة والتفاصيل:*\n${message.trim()}\n`;

    window.open(`https://wa.me/${whatsappNum}?text=${encodeURIComponent(msg)}`, '_blank');
    setSent(true);
    setTimeout(() => setSent(false), 5000);
  };

  return (
    <div className="min-h-screen bg-[#fafafc] text-neutral-900 selection:bg-[var(--brand-primary)] selection:text-white">
      
      {/* ─── 1. Hero Section ─── */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 bg-gradient-to-br from-[#120336] via-[#23096e] to-[#3A1C8F] text-white overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_50%)] pointer-events-none" />
        <div className="absolute -bottom-24 -start-24 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -end-24 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="container-msari relative z-10 text-center px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs sm:text-sm font-bold mb-6 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>فريق خدمة العملاء متاح للرد الفوري والمباشر</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white mb-4 tracking-tight leading-tight max-w-3xl mx-auto">
            تواصل معنا، نحن دائماً بالقرب منك
          </h1>

          <p className="text-white/80 text-base sm:text-xl max-w-xl mx-auto font-medium leading-relaxed">
            فريق مساري المتخصص جاهز لمساعدتك في الاستفسار عن الحجوزات، الدعم الفني، وتقديم كافة التسهيلات لرحلتك.
          </p>
        </div>
      </section>

      {/* ─── 2. Top Contact Channels Cards ─── */}
      <section className="container-msari -mt-10 sm:-mt-14 relative z-20 px-4 sm:px-6 mb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          {/* Card 1: WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white rounded-3xl p-6 shadow-[0_15px_35px_-10px_rgba(0,0,0,0.07)] border border-neutral-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
          >
            <div className="absolute top-0 end-0 w-24 h-24 bg-emerald-50 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-100 transition-colors" />
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200/60 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <MessageCircle size={24} />
            </div>
            <div className="text-xs font-bold text-emerald-600 mb-1">الرد خلال دقائق ⚡</div>
            <div className="text-lg font-black text-neutral-900 mb-1">واتساب الدعم المباشر</div>
            <div className="text-xs text-neutral-500 mb-4 dir-ltr text-end">{whatsappNum}</div>
            <div className="inline-flex items-center gap-1 text-xs font-black text-[var(--brand-primary)] group-hover:underline">
              <span>بدء محادثة فورية</span>
              <ArrowUpRight size={14} className="rtl:rotate-90" />
            </div>
          </a>

          {/* Card 2: Phone */}
          <a
            href={`tel:${supportPhone.replace(/\s+/g, '')}`}
            className="bg-white rounded-3xl p-6 shadow-[0_15px_35px_-10px_rgba(0,0,0,0.07)] border border-neutral-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200/60 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Phone size={24} />
            </div>
            <div className="text-xs font-bold text-blue-600 mb-1">اتصال هاتفي مباشر</div>
            <div className="text-lg font-black text-neutral-900 mb-1">خدمة العملاء</div>
            <div className="text-xs text-neutral-500 mb-4 dir-ltr text-end">{supportPhone}</div>
            <div className="inline-flex items-center gap-1 text-xs font-black text-[var(--brand-primary)] group-hover:underline">
              <span>اتصل بنا الآن</span>
              <ArrowUpRight size={14} className="rtl:rotate-90" />
            </div>
          </a>

          {/* Card 3: Email */}
          <a
            href={`mailto:${infoEmail}`}
            className="bg-white rounded-3xl p-6 shadow-[0_15px_35px_-10px_rgba(0,0,0,0.07)] border border-neutral-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200/60 text-[var(--brand-primary)] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Mail size={24} />
            </div>
            <div className="text-xs font-bold text-purple-600 mb-1">الاستفسارات الرسمية</div>
            <div className="text-lg font-black text-neutral-900 mb-1">البريد الإلكتروني</div>
            <div className="text-xs text-neutral-500 mb-4 dir-ltr text-end">{infoEmail}</div>
            <div className="inline-flex items-center gap-1 text-xs font-black text-[var(--brand-primary)] group-hover:underline">
              <span>إرسال بريد رسمي</span>
              <ArrowUpRight size={14} className="rtl:rotate-90" />
            </div>
          </a>

          {/* Card 4: Headquarters */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_15px_35px_-10px_rgba(0,0,0,0.07)] border border-neutral-100">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/60 text-amber-600 flex items-center justify-center mb-4">
              <MapPin size={24} />
            </div>
            <div className="text-xs font-bold text-amber-600 mb-1">الجمهورية اليمنية</div>
            <div className="text-lg font-black text-neutral-900 mb-1">المقر الرئيسي</div>
            <div className="text-xs text-neutral-500 mb-4">{headquarters}</div>
            <div className="text-xs font-bold text-neutral-400">متاح لزيارة الشركاء</div>
          </div>

        </div>
      </section>

      {/* ─── 3. Interactive Smart Message Builder & Info Hub ─── */}
      <section className="container-msari px-4 sm:px-6 mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Form (7 Cols on lg) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-neutral-100">
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] rounded-full text-xs font-black mb-3">
                <Send size={14} />
                <span>إرسال استفسار مباشر</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight mb-2">
                كيف يمكننا مساعدتك اليوم؟
              </h2>
              <p className="text-neutral-500 text-sm">
                اختر نوع الاستفسار وأدخل بياناتك وسيتم توجيه رسالتك مباشرة لفريق الدعم المختص عبر واتساب.
              </p>
            </div>

            {/* Category Pills */}
            <div className="mb-6">
              <label className="block text-xs font-black text-neutral-700 mb-2.5">نوع الاستفسار والخدمة:</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {INQUIRY_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold transition-all border text-start ${
                      selectedCategory === cat.id
                        ? 'bg-[var(--brand-primary)] text-white border-[var(--brand-primary)] shadow-sm'
                        : 'bg-neutral-50 text-neutral-600 border-neutral-200/80 hover:bg-neutral-100'
                    }`}
                  >
                    <span>{cat.emoji}</span>
                    <span className="truncate">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5">الاسم الكامل *</label>
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
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5">رقم الهاتف أو الواتساب *</label>
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
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">رقم الحجز (اختياري)</label>
                <input
                  type="text"
                  value={bookingNumber}
                  onChange={(e) => setBookingNumber(e.target.value)}
                  placeholder="مثال: MS-2026-XXXX"
                  dir="ltr"
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary)]/10 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">تفاصيل الاستفسار أو الرسالة *</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="اكتب استفسارك أو طلبك بالتفصيل لمساعدتك بشكل أسرع..."
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 p-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary)]/10 transition-all outline-none resize-none"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  icon={<MessageCircle size={18} />}
                  className="py-4 shadow-lg shadow-[var(--brand-primary)]/20 hover:shadow-[var(--brand-primary)]/30 font-black text-sm"
                >
                  إرسال الاستفسار عبر واتساب الدعم
                </Button>
              </div>
            </form>
          </div>

          {/* Right Column: Support Badges & Work Schedule (5 Cols on lg) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Working Hours Card */}
            <div className="bg-gradient-to-br from-[#1b0654] via-[#23096e] to-[#3A1C8F] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 end-0 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-amber-300">
                  <Clock size={20} />
                </div>
                <div>
                  <h3 className="font-black text-base text-white">ساعات العمل والخدمة</h3>
                  <p className="text-xs text-white/70">متواجدون دائماً لخدمتكم</p>
                </div>
              </div>

              <div className="space-y-3 pt-2 text-xs sm:text-sm text-white/85">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span>دعم الحجوزات الطارئة:</span>
                  <span className="font-black text-emerald-400">24 ساعة / 7 أيام</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span>خدمات الطيران والسيارات:</span>
                  <span className="font-bold">8:00 ص – 11:00 م</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>إدارة الشراكات والفنادق:</span>
                  <span className="font-bold">9:00 ص – 5:00 م</span>
                </div>
              </div>
            </div>

            {/* Emergency Hotline Card */}
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-3xl p-6 shadow-sm">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
                  <Headphones size={20} />
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-black text-amber-900 text-sm">هل لديك حجز قائم أو حالة طارئة؟</h4>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    إذا واجهت أي استفسار عاجل أثناء الوصول للفندق أو موعد الرحلة، يرجى الاتصال المباشر على رقم الخط الساخن:
                  </p>
                  <a
                    href={`tel:${supportPhone.replace(/\s+/g, '')}`}
                    className="inline-flex items-center gap-1 text-xs font-black text-amber-900 hover:underline pt-1 dir-ltr"
                  >
                    📞 {supportPhone}
                  </a>
                </div>
              </div>
            </div>

            {/* Trust Assurance Card */}
            <div className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-sm space-y-3">
              <div className="flex items-center gap-2.5 text-emerald-600 font-bold text-sm">
                <ShieldCheck size={20} />
                <span>ضمان سرعة الاستجابة</span>
              </div>
              <p className="text-neutral-500 text-xs leading-relaxed">
                يلتزم فريق مساري بالرد على كافة الاستفسارات خلال متوسط زمن استجابة يقل عن 5 دقائق عبر محادثات واتساب المباشرة.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ─── 4. Dynamic Interactive FAQs Section ─── */}
      <section className="container-msari px-4 sm:px-6 mb-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] rounded-full text-xs font-black mb-3">
            <HelpCircle size={16} />
            <span>إجابات سريعة</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-neutral-900 tracking-tight mb-2">
            الأسئلة الشائعة حول خدمات مساري
          </h2>
          <p className="text-neutral-500 text-sm sm:text-base">
            إليك الإجابات المباشرة عن أكثر الاستفسارات تكراراً لدى المسافرين
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden transition-all duration-200 hover:border-neutral-200"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-start font-black text-neutral-900 text-sm sm:text-base cursor-pointer gap-4 select-none"
                >
                  <span className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                      isOpen ? 'bg-[var(--brand-primary)] text-white' : 'bg-neutral-100 text-neutral-600'
                    }`}>
                      {idx + 1}
                    </span>
                    <span>{faq.q}</span>
                  </span>
                  <ChevronDown
                    size={18}
                    className={`text-neutral-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[var(--brand-primary)]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-neutral-600 leading-relaxed border-t border-neutral-50 ps-14 animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
