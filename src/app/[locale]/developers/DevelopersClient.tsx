'use client';

import { CheckCircle2, Zap, Server, ShieldCheck, MessageSquare } from 'lucide-react';
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
};

export default function DevelopersClient({ data, whatsappNumber }: DevelopersClientProps) {
  const openWhatsApp = (planName: string) => {
    const text = `مرحباً مساري، نود الاشتراك في ${planName} للربط المباشر عبر API.`;
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[var(--surface-page)] pb-20">
      
      {/* Navbar for Dev Portal */}
      <nav className="bg-[var(--brand-primary)] text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-colors">
                <span className="text-white font-bold text-lg">م</span>
              </div>
              <div>
                <span className="text-xl font-black tracking-wide leading-tight block text-white">مساري <span className="text-purple-200">للمطورين</span></span>
                <span className="block text-[10px] text-white/60">B2B API Portal</span>
              </div>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm font-bold text-white/80 hover:text-white transition-colors">المميزات</a>
              <a href="#pricing" className="text-sm font-bold text-white/80 hover:text-white transition-colors">خطط الشراكة</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-[var(--brand-primary)] text-white pt-16 pb-32 relative overflow-hidden">
        {/* Background Patterns */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-96 h-96 rounded-full bg-[var(--brand-secondary)]/30 blur-3xl"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[var(--brand-dark)]/40 blur-3xl"></div>
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-purple-200 text-xs font-bold border border-white/10">
              {data.hero.badge || 'B2B API Portal'}
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight text-white" style={{ color: '#ffffff' }}>
              {data.hero.title}
            </h1>
            
            <p className="text-lg md:text-xl text-white/80 font-medium leading-relaxed max-w-2xl mx-auto">
              {data.hero.subtitle}
            </p>

            <div className="flex items-center justify-center pt-4">
              <a href="#pricing" className="btn btn-white text-base font-black px-10 py-4 shadow-xl">
                اكتشف خطط الشراكة
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div id="features" className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20 mb-20 scroll-mt-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.features.map((feat, idx) => {
            const Icon = ICON_MAP[feat.icon] || Zap;
            return (
              <div key={idx} className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl shadow-black/5 border border-neutral-100 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl">
                <div className="w-12 h-12 bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] rounded-xl flex items-center justify-center mb-6">
                  <Icon size={24} />
                </div>
                <h3 className="text-lg font-black text-neutral-900 mb-3">{feat.title}</h3>
                <p className="text-neutral-500 font-medium leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pricing/Plans */}
      <div id="pricing" className="container mx-auto px-4 sm:px-6 lg:px-8 mb-24 scroll-mt-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-neutral-900 mb-4">خطط الشراكة والاستخدام (API B2B)</h2>
          <p className="text-neutral-500 font-medium max-w-2xl mx-auto">حلول مرنة ومخصصة للتطبيقات، مواقع السفر، الوكالات السياحية، والشركات للربط المباشر مع منصة مساري.</p>
        </div>

        {/* Pricing/Plans */}
        {data.plans && data.plans.length === 1 ? (
          <div className="max-w-3xl mx-auto">
            {data.plans.map((plan) => (
              <div
                key={plan.id}
                className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-[var(--brand-primary)] shadow-2xl shadow-[var(--brand-primary)]/10 relative overflow-hidden transition-all"
              >
                <div className="absolute top-0 right-0 left-0 h-2.5 bg-gradient-to-r from-[#23096E] via-[#3A1C8F] to-[#FF3B30]" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#23096E]/10 text-[#23096E] text-xs font-black mb-2">
                      <Zap size={14} className="text-[#FF3B30]" />
                      خطة الشراكة الموحدة (B2B Full Access)
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-neutral-900">{plan.name}</h3>
                  </div>
                  <div className="text-start sm:text-end">
                    <div className="text-xl sm:text-2xl font-black text-[var(--brand-primary)]">{plan.price}</div>
                    <span className="text-xs text-neutral-500 font-bold block mt-0.5">عمولات وأسعار جملة مخصصة للشركاء</span>
                  </div>
                </div>

                <p className="text-neutral-600 text-sm sm:text-base mb-8 leading-relaxed font-medium">
                  {plan.description}
                </p>

                <div className="border-t border-b border-neutral-100 py-6 mb-8">
                  <h4 className="text-xs font-black uppercase tracking-wider text-neutral-400 mb-4">
                    المزايا والقدرات التقنية المضمنة:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {plan.features.map((feat, i) => (
                      <div key={i} className="flex items-center gap-3 text-neutral-800 text-sm font-bold">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                          <CheckCircle2 size={14} className="text-emerald-600" />
                        </div>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => openWhatsApp(plan.name)}
                  className="w-full py-4 rounded-2xl bg-[var(--brand-primary)] hover:bg-[#3A1C8F] text-white text-base font-black transition-all shadow-xl shadow-[var(--brand-primary)]/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageSquare size={18} />
                  <span>تواصل معنا لطلب مفتاح الـ API وتفعيل الربط المباشر</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {data.plans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-white rounded-3xl p-8 flex flex-col justify-between border transition-all duration-300 relative ${
                  plan.popular
                    ? 'border-[var(--brand-primary)] shadow-2xl scale-105 z-10'
                    : 'border-neutral-200 shadow-md hover:shadow-xl'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 right-8 bg-gradient-to-r from-purple-600 to-[var(--brand-primary)] text-white text-xs font-black px-4 py-1.5 rounded-full shadow-md">
                    الأكثر طلباً
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-black text-neutral-900 mb-2">{plan.name}</h3>
                  <p className="text-neutral-500 text-sm mb-6 min-h-[40px]">{plan.description}</p>
                  <div className="text-3xl font-black text-[var(--brand-primary)] mb-6">{plan.price}</div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-center gap-3 text-neutral-700 text-sm">
                        <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={() => openWhatsApp(plan.name)}
                  className={`w-full py-3.5 rounded-xl font-black transition-all ${
                    plan.popular
                      ? 'bg-[var(--brand-primary)] text-white hover:bg-purple-950 shadow-lg'
                      : 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200'
                  }`}
                >
                  طلب انضمام
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAQ */}
      {data.faq && data.faq.length > 0 && (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-black text-neutral-900 mb-2">الأسئلة الشائعة</h2>
          </div>
          <div className="space-y-4">
            {data.faq.map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
                <h3 className="font-black text-neutral-900 mb-2 text-base">{item.q}</h3>
                <p className="text-neutral-500 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
