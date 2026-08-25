'use client';

import { useState } from 'react';
import {
  Zap,
  Server,
  ShieldCheck,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Coins,
  Cpu,
  Globe2,
  Check,
  ChevronDown,
  Layers,
  Code2,
  Code,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import Link from 'next/link';
import type { DevelopersPageData } from '@/services/cms';

interface DevelopersClientProps {
  data: DevelopersPageData;
  whatsappNumber: string;
}

const ICON_MAP: Record<string, any> = {
  Zap,
  Server,
  ShieldCheck,
  MessageSquare,
  Coins,
  Cpu,
  Globe2,
  Layers,
  Code2,
  Code,
  CheckCircle2,
  Lock,
};

export default function DevelopersClient({ data, whatsappNumber }: DevelopersClientProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const openWhatsApp = (planName?: string) => {
    const text = `مرحباً فريق مساري، نود طلب مفتاح الربط البرمجي (API Key) والاشتراك في ${planName || 'خطة الشراكة والربط البرمجي'}.`;
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  // Safe fallback data if CMS fields are partially empty
  const heroBadge = data?.hero?.badge || 'بوابة المطورين والربط البرمجي B2B';
  const heroTitle = data?.hero?.title || 'اربط نظامك مع مخزون أكبر شبكة سفر وفنادق في اليمن';
  const heroSubtitle =
    data?.hero?.subtitle ||
    'واجهة برمجية سريعة وموثوقة تتيح لوكالات السفر والتطبيقات ومنصات السفر البحث اللحظي، جلب الأسعار، وتأكيد الحجوزات برمجياً في ثوانٍ.';

  const features = data?.features && data.features.length > 0 
    ? data.features.filter(f => !f.title.includes('Sandbox') && !f.desc.includes('Sandbox'))
    : [
    {
      icon: 'Zap',
      title: 'استجابة فائقة السرعة',
      desc: 'واجهة RESTful مبنية بأحدث معايير الأداء لمعالجة الطلبات اللحظية بكفاءة عالية.',
    },
    {
      icon: 'ShieldCheck',
      title: 'توثيق وأمان عالي',
      desc: 'مفاتيح API مشفرة وصلاحيات دقيقة وتشفير كامل للبيانات عبر بروتوكول TLS 1.3.',
    },
    {
      icon: 'Coins',
      title: 'تسعير متعدد العملات',
      desc: 'تحديث لحظي لأسعار الغرف والتوفر بالريال اليمني والدولار والريال السعودي بدون عمولات خفية.',
    },
    {
      icon: 'Cpu',
      title: 'تأكيد حجز فوري معتمد',
      desc: 'خصم مباشر من التوفر وإصدار رقم مرجعي رسمي وقسيمة إلكترونية معتمدة من الفندق.',
    },
  ];

  // Clean plan features to ensure excluded items are not displayed
  const rawPlan = data?.plans && data.plans.length > 0 ? data.plans[0] : null;
  const filteredPlanFeatures = (rawPlan?.features || [
    'ربط فوري وتأكيد مباشر لجميع حجوزات الفنادق',
    'معدل طلبات غير محدود وسرعة استجابة فائقة',
    'تحديث لحظي لأسعار الغرف والتوفر بعدة عملات',
    'نظام Webhooks للإشعارات والتحديثات اللحظية',
    'دعم فني وهندسي مخصص 24/7 عبر واتساب',
  ]).filter(
    (feat: string) =>
      !feat.includes('Sandbox') &&
      !feat.includes('SLA') &&
      !feat.includes('99.9%') &&
      !feat.includes('بيئة اختبار')
  );

  const plan = {
    id: rawPlan?.id || 'b2b_integration',
    name: rawPlan?.name || 'خطة الشراكة والربط البرمجي (Msari B2B API)',
    description:
      rawPlan?.description ||
      'خطة شاملة ومتكاملة تمنح وكالات السفر والتطبيقات ومنصات السفر وصولاً مباشراً لآلاف الغرف الفندقية وتأكيد الحجوزات لحظياً.',
    features: filteredPlanFeatures,
    popular: true,
  };

  const faqs = [
    {
      q: 'كيف أحصل على مفتاح API الخاص بي؟',
      a: 'تواصل معنا عبر واتساب الشركاء وسيتم تزويدك بمفتاح الربط البرمجي فوراً بعد مراجعة طلب الشراكة وتوثيق الحساب.',
    },
    {
      q: 'هل يدعم الـ API تأكيد الحجز الفوري وإصدار القسيمة؟',
      a: 'نعم، يتيح الـ API إتمام وتأكيد الحجز الفوري مع خصم التوفر لحظياً وإصدار رقم مرجعي معتمد ومباشر لدى إدارة الفندق وقسيمة حجز إلكترونية.',
    },
    {
      q: 'ما هي صيغة البيانات المعتمدة في الـ API؟',
      a: 'البيانات تُرسل وتُستقبل بصيغة JSON القياسية عبر بروتوكول HTTPS المشفر، مع توفير Webhooks للإشعارات والتحديثات المباشرة لحالة الحجز.',
    },
    {
      q: 'هل يتوفر دعم فني وهندسي أثناء عملية التكامل؟',
      a: 'نعم، نوفر دعماً فنياً وهندسياً مباشراً لمساعدتك في إتمام عملية الربط والتكامل خطوة بخطوة عبر واتساب.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FD] text-[#0A0912] selection:bg-[#23096E] selection:text-white pb-20">
      
      {/* ── Top Navigation Bar ────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#23096E]/10 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo & Brand */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#23096E] via-[#3A1C8F] to-[#23096E] flex items-center justify-center shadow-md shadow-[#23096E]/20 group-hover:scale-105 transition-transform">
                  <span className="text-white font-black text-2xl">م</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-[#23096E] tracking-tight">مساري</span>
                    <span className="text-xs font-black px-2.5 py-0.5 rounded-md bg-[#F4F2F8] text-[#3A1C8F] border border-purple-200/60">
                      B2B API
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold block">بوابة المطورين والربط البرمجي</span>
                </div>
              </Link>
            </div>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-600">
              <a href="#features" className="hover:text-[#23096E] transition-colors">المميزات والقدرات</a>
              <a href="#quickstart" className="hover:text-[#23096E] transition-colors">خطوات البدء السريع</a>
              <a href="#pricing" className="hover:text-[#23096E] transition-colors">خطة الشراكة B2B</a>
              <a href="#faq" className="hover:text-[#23096E] transition-colors">الأسئلة الشائعة</a>
            </nav>

            {/* Top Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => openWhatsApp(plan.name)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#23096E] to-[#3A1C8F] hover:from-[#3A1C8F] hover:to-[#23096E] text-white text-xs sm:text-sm font-black shadow-md shadow-[#23096E]/20 transition-all cursor-pointer flex items-center gap-2"
              >
                <MessageSquare size={15} />
                <span>طلب مفتاح الـ API</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* ── Hero Section ──────────────────────────────────────────────── */}
      <section className="relative pt-14 sm:pt-20 pb-16 sm:pb-20 overflow-hidden">
        {/* Soft Background Glows */}
        <div className="absolute -top-10 right-1/4 w-[500px] h-[500px] bg-[#23096E]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[450px] h-[450px] bg-[#FF3B30]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#23096E]/15 text-[#23096E] text-xs sm:text-sm font-black shadow-sm mb-6">
            <Sparkles size={14} className="text-[#FF3B30]" />
            <span>{heroBadge}</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0A0912] leading-[1.3] tracking-tight mb-5">
            {heroTitle}
            <span className="block text-[#FF3B30] mt-2">
              بواجهة برمجية سريعة وتأكيد حجز فوري
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 font-semibold max-w-3xl mx-auto leading-relaxed mb-8">
            {heroSubtitle}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => openWhatsApp(plan.name)}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#23096E] via-[#3A1C8F] to-[#23096E] text-white font-black text-sm sm:text-base shadow-xl shadow-[#23096E]/20 hover:opacity-95 transition-all flex items-center gap-2.5 cursor-pointer"
            >
              <MessageSquare size={18} />
              <span>تواصل لطلب مفتاح الـ API والبدء فوراً</span>
            </button>
            <a
              href="#features"
              className="px-6 py-4 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-[#23096E] font-black text-sm sm:text-base transition-all shadow-sm flex items-center gap-2"
            >
              <span>استكشاف المزايا والقدرات</span>
              <ArrowRight size={16} />
            </a>
          </div>

        </div>
      </section>

      {/* ── Capabilities & Features Grid ───────────────────────────────── */}
      <section id="features" className="py-16 scroll-mt-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-black uppercase tracking-wider text-[#23096E] bg-purple-50 px-3.5 py-1.5 rounded-full border border-purple-200/60 inline-block mb-3">
              Core Capabilities
            </span>
            <h2 className="text-3xl font-black text-[#0A0912] mb-3">
              لماذا يختار الشركاء والوكالات الربط مع مساري؟
            </h2>
            <p className="text-slate-600 text-sm sm:text-base font-semibold">
              بنية تحتية موثوقة مصممة لتلبية احتياجات وكالات السفر، التطبيقات، والشركات السياحية.
            </p>
          </div>

          <div
            className={`grid gap-6 ${
              features.length === 1
                ? 'grid-cols-1 max-w-xl mx-auto'
                : features.length === 2
                ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto'
                : features.length === 3
                ? 'grid-cols-1 md:grid-cols-3 max-w-6xl mx-auto'
                : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
            }`}
          >
            {features.map((feat, idx) => {
              const Icon = ICON_MAP[feat.icon] || Zap;
              return (
                <div
                  key={idx}
                  className="bg-white p-6 sm:p-7 rounded-3xl border border-purple-900/10 shadow-sm hover:shadow-xl hover:shadow-[#23096E]/5 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 text-[#23096E] flex items-center justify-center mb-5">
                      <Icon size={22} className="text-[#23096E]" />
                    </div>
                    <h3 className="text-lg font-black text-[#0A0912] mb-2">{feat.title}</h3>
                    <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── Quickstart Integration Guide ───────────────────────────────── */}
      <section id="quickstart" className="py-16 scroll-mt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <div className="mb-12">
            <span className="text-xs font-black uppercase tracking-wider text-purple-700 bg-purple-50 px-3.5 py-1.5 rounded-full border border-purple-200/60 inline-block mb-3">
              Integration Flow
            </span>
            <h2 className="text-3xl font-black text-[#0A0912] mb-3">
              كيف تبدأ التكامل مع مساري في خطوات بسيطة؟
            </h2>
            <p className="text-slate-600 text-sm font-semibold max-w-2xl mx-auto">
              مسار واضح ومباشر لنقل نظامك إلى بيئة العمل الحية وتأكيد الحجوزات دون تعقيد.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-start">
            
            {/* Step 1 */}
            <div className="bg-white p-8 rounded-3xl border border-purple-900/10 shadow-sm relative overflow-hidden group hover:border-[#23096E]/30 transition-all">
              <div className="text-4xl font-black text-[#23096E] font-mono mb-4">01</div>
              <h3 className="text-xl font-black text-slate-900 mb-2">طلب مفتاح الـ API والتوثيق</h3>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                تواصل معنا عبر واتساب الشركاء لاستلام مفتاح الربط وتوثيق بيانات الشراكة خلال دقائق.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-8 rounded-3xl border border-purple-900/10 shadow-sm relative overflow-hidden group hover:border-[#23096E]/30 transition-all">
              <div className="text-4xl font-black text-[#FF3B30] font-mono mb-4">02</div>
              <h3 className="text-xl font-black text-slate-900 mb-2">إطلاق وتأكيد الحجوزات</h3>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                ابدأ بتقديم خدمات حجز الفنادق لعملائك وتأكيد الحجوزات اللحظية مباشرة عبر نظامك.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── Single Unified B2B Plan Card ──────────────────────────────── */}
      <section id="pricing" className="py-16 scroll-mt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-10">
            <span className="text-xs font-black uppercase tracking-wider text-[#23096E] bg-purple-50 px-3.5 py-1.5 rounded-full border border-purple-200 inline-block mb-3">
              B2B Partnership Plan
            </span>
            <h2 className="text-3xl font-black text-[#0A0912] mb-2">
              خطة الشراكة والربط البرمجي الموحدة
            </h2>
            <p className="text-slate-600 text-sm font-semibold">
              حلول مرنة ومخصصة للتطبيقات ومواقع السفر والوكالات السياحية.
            </p>
          </div>

          {/* Unified Plan Card */}
          <div className="bg-white rounded-3xl border-2 border-[#23096E]/20 shadow-2xl shadow-[#23096E]/10 relative overflow-hidden p-8 sm:p-10">
            {/* Top Gradient Border */}
            <div className="absolute top-0 right-0 left-0 h-3 bg-gradient-to-r from-[#23096E] via-[#3A1C8F] to-[#FF3B30]" />

            <div className="mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-[#23096E] text-xs font-black mb-3 border border-purple-200">
                <Zap size={14} className="text-[#FF3B30]" />
                خطة الشراكة الشاملة (Full B2B Access)
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900">{plan.name}</h3>
            </div>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium mb-8">
              {plan.description}
            </p>

            {/* Features Checklist Grid */}
            <div className="border-t border-b border-slate-100 py-6 mb-8">
              <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4">
                المزايا والقدرات التقنية المضمنة في الخطة:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {plan.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-3 text-slate-800 text-sm font-bold">
                    <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
                      <Check size={14} className="text-emerald-600" />
                    </div>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => openWhatsApp(plan.name)}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#23096E] via-[#3A1C8F] to-[#23096E] hover:opacity-95 text-white text-base font-black transition-all shadow-xl shadow-[#23096E]/20 flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <MessageSquare size={18} />
              <span>تواصل معنا عبر واتساب لطلب مفتاح الـ API وتفعيل الربط</span>
            </button>

          </div>

        </div>
      </section>

      {/* ── FAQ Section (Clean Expandable Accordions) ───────────────────── */}
      <section id="faq" className="py-16 scroll-mt-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-10">
            <span className="text-xs font-black uppercase tracking-wider text-purple-700 bg-purple-50 px-3.5 py-1.5 rounded-full border border-purple-200/60 inline-block mb-3">
              FAQ
            </span>
            <h2 className="text-3xl font-black text-[#0A0912] mb-2">الأسئلة الشائعة</h2>
            <p className="text-slate-600 text-sm font-semibold">إجابات سريعة وواضحة حول الربط البرمجي وطرق العمل.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((item, i) => {
              const isOpen = openFaqIndex === i;
              return (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-purple-900/10 shadow-sm overflow-hidden transition-all"
                >
                  <button
                    onClick={() => toggleFaq(i)}
                    className="w-full p-5 sm:p-6 text-start flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                  >
                    <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-purple-50 text-[#23096E] text-xs font-mono font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <span>{item.q}</span>
                    </h3>
                    <ChevronDown
                      size={18}
                      className={`text-slate-400 transition-transform duration-200 shrink-0 ${
                        isOpen ? 'rotate-180 text-[#23096E]' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-6 pt-1 text-slate-600 text-xs sm:text-sm leading-relaxed font-medium border-t border-slate-50">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── Bottom Support CTA Banner ─────────────────────────────────── */}
      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-[#23096E] via-[#3A1C8F] to-[#23096E] p-8 sm:p-12 text-center text-white relative overflow-hidden shadow-xl shadow-[#23096E]/20">
            <div className="max-w-2xl mx-auto space-y-5 relative z-10">
              <h3 className="text-2xl sm:text-3xl font-black">
                جاهز لبناء شراكة سفر متكاملة مع مساري؟
              </h3>
              <p className="text-purple-100 text-sm sm:text-base leading-relaxed font-medium">
                فريقنا التقني وإدارة الشراكات مستعدون لتقديم الدعم الفني وتسهيل عملية الربط خطوة بخطوة.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => openWhatsApp(plan.name)}
                  className="px-8 py-4 rounded-2xl bg-white hover:bg-slate-100 text-[#23096E] font-black text-sm sm:text-base shadow-lg transition-all cursor-pointer"
                >
                  تواصل معنا عبر واتساب الآن
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}


