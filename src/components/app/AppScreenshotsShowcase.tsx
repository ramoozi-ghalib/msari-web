'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Hotel, 
  CreditCard, 
  FileCheck2, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { 
  SearchAppScreen, 
  HotelDetailsAppScreen, 
  PaymentAppScreen, 
  VoucherAppScreen 
} from './AppMockupScreens';

interface Props {
  isEn?: boolean;
  screensShowcase?: Array<{
    id: number;
    title: string;
    headline: string;
    subtitle: string;
    image: string;
    icon?: string;
  }>;
}

export default function AppScreenshotsShowcase({ isEn = false }: Props) {
  const [activeTab, setActiveTab] = useState<number>(0);

  const tabs = [
    {
      id: 0,
      title: isEn ? 'Search & Filters' : 'الرئيسية والبحث الذكي',
      icon: Search,
      headline: isEn ? 'Smart Search & Instant Hotel Filtering' : 'بحث فائق السرعة وفلترة دقيقة حسب المدينة والميزانية',
      subtitle: isEn
        ? 'Find available hotels in Aden, Sana’a, Mukalla, and Seiyun with live room rates in YER, USD, and SAR.'
        : 'استعرض الفنادق المتاحة فورياً، وقارن الأسعار الحية بالريال اليمني والدولار والريال السعودي، مع إمكانية الفلترة حسب الموقع وتوفر الكهرباء 24/7 والخدمات.',
      bullets: [
        'بحث مباشر عن فنادق عدن، صنعاء، سيئون، والمكلا',
        'عرض الأسعار بعدة عملات بدون أي رسوم إضافية',
        'تقييمات وصور حقيقية لكل غرفة ومرفق',
      ],
      renderScreen: () => <SearchAppScreen isEn={isEn} />,
    },
    {
      id: 1,
      title: isEn ? 'Hotel Details' : 'تفاصيل الفندق والمرافق',
      icon: Hotel,
      headline: isEn ? 'Comprehensive Photos, Amenities & Real Reviews' : 'معاينة شاملة للغرف والمرافق والموقع الجغرافي',
      subtitle: isEn
        ? 'Check high-resolution photos, verified amenities like 24/7 power, free WiFi, parking, and distance to airports.'
        : 'تعرف على أدق تفاصيل الفندق قبل الحجز؛ جودة التكييف والكهرباء الدائمة، القرب من الأسواق والمطارات، ونوع الأسرّة والإطلالات.',
      bullets: [
        'معاينة صور عالية الدقة لجميع فئات الغرف والأجنحة',
        'قائمة واضحة بالخدمات (واي فاي، إفطار، مسبح، كهرباء دائم)',
        'تحديد الموقع الدقيق على الخريطة وسهولة التوجيه',
      ],
      renderScreen: () => <HotelDetailsAppScreen isEn={isEn} />,
    },
    {
      id: 2,
      title: isEn ? 'Local Payments' : 'الدفع وتأكيد الحجز',
      icon: CreditCard,
      headline: isEn ? 'Seamless Local Payment via Kuraimi & Wallets' : 'طرق دفع محلية ميسرة تناسب جميع المواطنين والزوار',
      subtitle: isEn
        ? 'Pay directly with Kuraimi (M-Floos), Jeeb wallet, CAC Bank, or choose to pay cash upon arrival.'
        : 'أتمم حجزك خلال ثوانٍ عبر حسابك في بنك الكريمي، أو محفظة جيب، أو بالحوالات البنكية المباشرة، أو بالدفع كاش في الاستقبال.',
      bullets: [
        'دفع فوري عبر تطبيق الكريمي جوال (إم فلوس)',
        'دعم المحافظ الإلكترونية اليمنية (جيب، ون باي، فلوسك)',
        'خيار الدفع كاش عند الوصول لبعض الفنادق الشريكة',
      ],
      renderScreen: () => <PaymentAppScreen isEn={isEn} />,
    },
    {
      id: 3,
      title: isEn ? 'Digital Voucher' : 'القسيمة الإلكترونية الفورية',
      icon: FileCheck2,
      headline: isEn ? 'Instant Official Voucher with Offline QR Code' : 'قسيمة حجز رسمية معتمدة تعمل بدون اتصال بالإنترنت',
      subtitle: isEn
        ? 'Get your official booking voucher instantly on your mobile with QR verification and direct WhatsApp hotel chat.'
        : 'استلم قسيمة الحجز المعتمدة فوراً على هاتفك متضمنة كود QR ورقم مرجعي رسمي، مع إمكانية حفظها كملف PDF للتأكيد السريع عند الاستقبال.',
      bullets: [
        'إصدار فوري لقسيمة الحجز المعتمدة لدى الفندق',
        'تعمل بدون إنترنت (Offline) مع إمكانية التنزيل كـ PDF',
        'زر اتصال ومحادثة واتساب مباشرة مع إدارة الفندق',
      ],
      renderScreen: () => <VoucherAppScreen isEn={isEn} />,
    },
  ];

  const currentTab = tabs[activeTab] || tabs[0];
  const CurrentIcon = currentTab.icon;

  return (
    <section className="py-20 lg:py-28 bg-white relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute top-0 right-1/3 w-96 h-96 bg-[#23096E]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container-msari relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#23096E]/10 border border-[#23096E]/20 text-[#23096E] text-xs font-black">
            <Sparkles className="w-3.5 h-3.5 text-[#FF3B30]" />
            <span>{isEn ? 'Inside the App' : 'شاهد التطبيق من الداخل'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#23096E] tracking-tight">
            {isEn ? 'Explore the Clean, Fast Mobile Interface' : 'استكشف واجهات وتجربة تطبيق مساري'}
          </h2>
          <p className="text-[#423861] text-base sm:text-lg max-w-2xl mx-auto font-semibold">
            {isEn
              ? 'Every screen is crafted for simplicity, high speed, and complete clarity for the traveler.'
              : 'شاشات عصرية صُممت لتمنحك تجربة حجز سلسة دون أي تعقيد تقني أو خطوات زائدة.'}
          </p>
        </div>

        {/* Tab Selector Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 mb-12">
          {tabs.map((tab, idx) => {
            const Icon = tab.icon;
            const isActive = activeTab === idx;
            return (
              <button
                key={idx}
                onClick={() => setActiveTab(idx)}
                className={`flex items-center gap-2.5 px-4 sm:px-6 py-3 rounded-2xl text-xs sm:text-sm font-black transition-all duration-300 transform cursor-pointer ${
                  isActive
                    ? 'bg-[#23096E] text-white shadow-xl shadow-[#23096E]/25 scale-105 border border-[#23096E]'
                    : 'bg-[#F4F2F8] text-slate-700 hover:bg-slate-200/90 hover:text-slate-900 border border-slate-200/60'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-[#FF3B30]' : 'text-slate-500'} />
                <span>{tab.title}</span>
              </button>
            );
          })}
        </div>

        {/* Interactive Showcase Box */}
        <div className="bg-[#F4F2F8]/70 border border-slate-200/80 rounded-3xl p-6 sm:p-10 lg:p-14 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Content Column (Left on RTL) */}
            <div className="lg:col-span-7 space-y-6 order-2 lg:order-1 text-start">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#23096E]/10 text-[#23096E] text-xs font-black">
                <CurrentIcon size={16} className="text-[#FF3B30]" />
                <span>{currentTab.title}</span>
              </div>

              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-tight">
                {currentTab.headline}
              </h3>

              <p className="text-[#423861] text-base lg:text-lg leading-relaxed font-semibold">
                {currentTab.subtitle}
              </p>

              {/* Bullet Points */}
              <div className="space-y-3 pt-2">
                {currentTab.bullets.map((bullet, bIdx) => (
                  <div key={bIdx} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <span className="text-sm sm:text-base font-bold text-slate-800">
                      {bullet}
                    </span>
                  </div>
                ))}
              </div>

              {/* Action Prompt */}
              <div className="pt-4 flex items-center gap-4">
                <a
                  href="https://play.google.com/store/apps/details?id=net.msari.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#23096E] hover:bg-[#3A1C8F] text-white rounded-2xl text-xs sm:text-sm font-black shadow-lg shadow-[#23096E]/20 transition-all transform hover:-translate-y-0.5"
                >
                  <span>{isEn ? 'Try This Screen in the App' : 'جرب هذه الميزة في التطبيق الآن'}</span>
                  <Zap className="w-4 h-4 text-[#FF3B30]" />
                </a>
              </div>

            </div>

            {/* Mockup Display Column (Right on RTL) */}
            <div className="lg:col-span-5 flex justify-center order-1 lg:order-2">
              <div className="relative w-[280px] sm:w-[310px] h-[580px] sm:h-[610px] rounded-[44px] border-[8px] border-slate-900 bg-slate-950 shadow-2xl shadow-[#23096E]/20 overflow-hidden">
                
                {/* Notch */}
                <div className="absolute top-2 inset-x-0 h-5 bg-black rounded-full z-30 w-24 mx-auto border border-white/10 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-slate-900 border border-white/15" />
                </div>

                {/* Render Selected Dynamic Screen */}
                <div className="w-full h-full pt-5">
                  {currentTab.renderScreen()}
                </div>

                {/* Home Indicator */}
                <div className="absolute bottom-1 inset-x-0 w-28 h-1 bg-white/40 rounded-full mx-auto z-30 pointer-events-none" />
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
