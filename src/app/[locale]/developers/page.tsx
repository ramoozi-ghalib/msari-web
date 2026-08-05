'use client';

import { CheckCircle2, Zap, Server, ShieldCheck, MessageSquare, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { whatsappLink } from '@/lib/site-config';

export default function DeveloperPortal() {
  const openWhatsApp = (planName: string) => {
    window.open(whatsappLink(`مرحباً مساري، نود الاشتراك في ${planName} للربط المباشر عبر API.`), '_blank');
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
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight text-white" style={{ color: '#ffffff' }}>
              <span className="text-white" style={{ color: '#ffffff' }}>اربط نظامك مع مخزون</span> <br/> <span className="text-transparent bg-clip-text bg-gradient-to-l from-purple-200 to-purple-400">أكبر شبكة سفر في اليمن</span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/80 font-medium leading-relaxed max-w-2xl mx-auto">
              نوفر واجهة مساري البرمجية (API) للتطبيقات، مواقع السفر، الوكالات، والشركات لاستعراض وحجز الفنادق والخدمات السياحية بسلاسة تامة.
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
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl shadow-black/5 border border-neutral-100 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl">
            <div className="w-12 h-12 bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] rounded-xl flex items-center justify-center mb-6">
              <Zap size={24} />
            </div>
            <h3 className="text-lg font-black text-neutral-900 mb-3">قاعدة بيانات الفنادق</h3>
            <p className="text-neutral-500 font-medium leading-relaxed">وصول كامل لقاعدة بيانات الفنادق المحلية مع تفاصيل الغرف والخدمات والمرافق والأسعار والصور.</p>
          </div>
          
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl shadow-black/5 border border-neutral-100 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-6">
              <Server size={24} />
            </div>
            <h3 className="text-lg font-black text-neutral-900 mb-3">نظام الحجز الآلي</h3>
            <p className="text-neutral-500 font-medium leading-relaxed">نظام حجز متكامل مع وسائل الدفع المتوفرة في التطبيق، يُمكّن شركاءنا من إتمام الحجوزات برمجياً.</p>
          </div>
          
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl shadow-black/5 border border-neutral-100 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl">
            <div className="w-12 h-12 bg-purple-50 text-[var(--brand-secondary)] rounded-xl flex items-center justify-center mb-6">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-lg font-black text-neutral-900 mb-3">الوجهات والمدن المحلية</h3>
            <p className="text-neutral-500 font-medium leading-relaxed">بيانات شاملة عن الوجهات والمدن المحلية مع المعلومات السياحية لتقديم تجربة متكاملة لعملائك.</p>
          </div>
        </div>
      </div>

      {/* Pricing/Plans */}
      <div id="pricing" className="container mx-auto px-4 sm:px-6 lg:px-8 mb-24 scroll-mt-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-neutral-900 mb-4">خطط الشراكة والاستخدام (API B2B)</h2>
          <p className="text-neutral-500 font-medium max-w-2xl mx-auto">حلول مرنة ومخصصة للتطبيقات، مواقع السفر، الوكالات السياحية، والشركات للربط المباشر مع منصة مساري.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* Plan 1: Standard Commission Tier */}
          <div 
            onClick={() => openWhatsApp('الفئة العادية (نظام العمولة 5%)')}
            className="group bg-white rounded-3xl p-8 shadow-md border-2 border-neutral-200 hover:border-[var(--brand-primary)] transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl cursor-pointer flex flex-col justify-between relative overflow-hidden"
          >
            <div>
              <div className="inline-block px-3 py-1 bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] text-xs font-black rounded-full mb-4">
                الفئة العادية
              </div>
              <h3 className="text-2xl font-black text-neutral-900 mb-2 group-hover:text-[var(--brand-primary)] transition-colors">نظام العمولة</h3>
              <div className="text-neutral-500 font-medium text-sm mb-6">مناسب للتطبيقات والشركات الناشئة بدون رسوم اشتراك مسبقة.</div>
              <div className="mb-8">
                <span className="text-4xl font-black text-neutral-900">5%</span>
                <span className="text-neutral-500 font-medium"> عمولة على كل حجز</span>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3 text-sm font-bold text-neutral-700">
                  <CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" /> بدون رسوم اشتراك سنوية أو شهرية
                </li>
                <li className="flex items-start gap-3 text-sm font-bold text-neutral-700">
                  <CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" /> قاعدة بيانات الفنادق والغرف والأسعار والصور
                </li>
                <li className="flex items-start gap-3 text-sm font-bold text-neutral-700">
                  <CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" /> نظام حجز آلي مع وسائل الدفع المعتمدة
                </li>
                <li className="flex items-start gap-3 text-sm font-bold text-neutral-700">
                  <CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" /> بيانات الوجهات والمدن المحلية
                </li>
                <li className="flex items-start gap-3 text-sm font-bold text-neutral-700">
                  <CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" /> دعم فني وربط برمجي قياسي
                </li>
              </ul>
            </div>
            
            <button className="w-full py-4 rounded-xl font-black bg-neutral-100 text-neutral-900 group-hover:bg-[var(--brand-primary)] group-hover:text-white transition-all duration-300 flex items-center justify-center gap-2 shadow-sm group-hover:shadow-md">
              <MessageSquare size={18} />
              <span>تواصل لطلب الشراكة</span>
              <ArrowLeft size={16} className="transform group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Plan 2: Business & Agencies Tier */}
          <div 
            onClick={() => openWhatsApp('فئة وكالات السفر (الاشتراك السنوي 500$)')}
            className="group bg-[var(--brand-primary)] text-white rounded-3xl p-8 shadow-2xl relative border-2 border-[var(--brand-secondary)] hover:border-purple-300 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-[var(--brand-secondary)] to-[var(--brand-accent)] text-white px-4 py-1 rounded-full text-xs font-black shadow-lg whitespace-nowrap">
              الأكثر طلباً لوكالات ومواقع السفر
            </div>
            <div>
              <div className="inline-block px-3 py-1 bg-white/10 text-purple-200 text-xs font-black rounded-full mb-4 mt-2">
                فئة وكالات السفر (الأعمال)
              </div>
              <h3 className="text-2xl font-black text-white mb-2" style={{ color: '#ffffff' }}>الاشتراك السنوي الشامل</h3>
              <div className="text-white/80 font-medium text-sm mb-6">مناسب لوكالات السفر والمواقع ذات الكثافة العالية للاستفادة من كامل الأرباح.</div>
              <div className="mb-8">
                <span className="text-4xl font-black text-white" style={{ color: '#ffffff' }}>$500</span>
                <span className="text-white/80 font-medium"> / سنوياً</span>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3 text-sm font-bold text-white">
                  <CheckCircle2 size={18} className="text-purple-300 shrink-0 mt-0.5" /> <strong>بدون عمولة حجز (0% عمولة)</strong>
                </li>
                <li className="flex items-start gap-3 text-sm font-bold text-white">
                  <CheckCircle2 size={18} className="text-purple-300 shrink-0 mt-0.5" /> وصول غير محدود لقواعد البيانات والغرف والأسعار والصور
                </li>
                <li className="flex items-start gap-3 text-sm font-bold text-white">
                  <CheckCircle2 size={18} className="text-purple-300 shrink-0 mt-0.5" /> نظام حجز آلي فوري ومباشر مع وسائل الدفع
                </li>
                <li className="flex items-start gap-3 text-sm font-bold text-white">
                  <CheckCircle2 size={18} className="text-purple-300 shrink-0 mt-0.5" /> كامل بيانات المدن والوجهات السياحية
                </li>
                <li className="flex items-start gap-3 text-sm font-bold text-white">
                  <CheckCircle2 size={18} className="text-purple-300 shrink-0 mt-0.5" /> أولوية القصوى في الدعم الفني وتوليد مفاتيح API
                </li>
                <li className="flex items-start gap-3 text-sm font-bold text-white">
                  <CheckCircle2 size={18} className="text-purple-300 shrink-0 mt-0.5" /> مدير حساب مخصص للشراكة
                </li>
              </ul>
            </div>
            
            <button className="w-full py-4 rounded-xl font-black bg-white text-[var(--brand-primary)] group-hover:bg-[var(--brand-secondary)] group-hover:text-white transition-all duration-300 flex items-center justify-center gap-2 shadow-lg">
              <MessageSquare size={18} />
              <span>تواصل لطلب التفعيل السنوي</span>
              <ArrowLeft size={16} className="transform group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
