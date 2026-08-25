'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Hotel, 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  Zap,
  Smartphone
} from 'lucide-react';
import { 
  SearchAppScreen, 
  HotelDetailsAppScreen, 
  PaymentAppScreen, 
  BookingConfirmationAppScreen,
  IPhone17ProMaxFrame,
  SamsungNote24UltraFrame
} from './AppMockupScreens';

interface Props {
  isEn?: boolean;
  screensShowcase?: Array<{
    id?: number;
    title?: string;
    headline?: string;
    subtitle?: string;
    image?: string;
    bullets?: string[];
  }>;
}

interface TabItem {
  id: number;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  headline: string;
  subtitle: string;
  bullets: string[];
  image?: string;
  renderScreen: () => React.ReactNode;
}

export default function AppScreenshotsShowcase({ isEn = false, screensShowcase }: Props) {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [deviceFrame, setDeviceFrame] = useState<'iphone17' | 'note24'>('iphone17');

  const tabs: TabItem[] = [
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
      title: isEn ? 'Multiple Payments' : 'خيارات دفع متعددة',
      icon: CreditCard,
      headline: isEn ? 'Multiple Local Payment Options in Yemen' : 'ادفع بسهولة عبر المحافظ الإلكترونية، تحويل بنكي، أو كاش',
      subtitle: isEn
        ? 'Pay easily via available electronic wallets, direct bank transfer, or cash upon arrival at the hotel.'
        : 'ادفع بسهولة عبر المحافظ الإلكترونية المتوفرة، أو تحويل بنكي، أو الدفع كاش عند الوصول.',
      bullets: [
        'دفع عبر المحافظ الإلكترونية المتوفرة',
        'تحويل بنكي مباشر وسريع',
        'خيار الدفع كاش عند الوصول للفندق',
      ],
      renderScreen: () => <PaymentAppScreen isEn={isEn} />,
    },
    {
      id: 3,
      title: isEn ? 'Booking Confirmation' : 'تأكيد وتفاصيل الحجز',
      icon: ShieldCheck,
      headline: isEn ? 'Instant Official Booking Confirmation & Details' : 'تأكيد رسمي مباشر مع رقم مرجعي وتواصل فوري مع الفندق',
      subtitle: isEn
        ? 'Get your official booking confirmation instantly on your mobile with full check-in details and direct WhatsApp hotel chat.'
        : 'استلم تفاصيل حجزك المؤكد فوراً على هاتفك متضمناً الرقم المرجعي الرسمي وسياسة الوصول، مع إمكانية مراجعة التفاصيل بدون إنترنت والتواصل المباشر مع الفندق.',
      bullets: [
        'تأكيد حجز رسمي ومضمون ومباشر لدى إدارة الفندق',
        'حفظ تفاصيل الحجز للعمل بدون إنترنت وتنزيلها PDF',
        'زر اتصال ومحادثة واتساب مباشرة مع موظف الاستقبال',
      ],
      renderScreen: () => <BookingConfirmationAppScreen isEn={isEn} />,
    },
  ];

  const effectiveTabs = tabs.map((defaultTab, idx) => {
    const cmsItem = screensShowcase?.[idx];
    if (!cmsItem) return defaultTab;
    return {
      ...defaultTab,
      title: cmsItem.title || defaultTab.title,
      headline: cmsItem.headline || defaultTab.headline,
      subtitle: cmsItem.subtitle || defaultTab.subtitle,
      image: cmsItem.image,
      bullets: (Array.isArray(cmsItem.bullets) && cmsItem.bullets.length > 0)
        ? cmsItem.bullets
        : defaultTab.bullets,
    };
  });

  const currentTab = effectiveTabs[activeTab] || effectiveTabs[0];
  const CurrentIcon = currentTab.icon;

  return (
    <section className="py-14 sm:py-20 lg:py-28 bg-white relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-1/3 w-96 h-96 bg-[#23096E]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container-msari relative z-10 px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4 mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#23096E]/10 border border-[#23096E]/20 text-[#23096E] text-xs font-black">
            <Sparkles className="w-3.5 h-3.5 text-[#FF3B30]" />
            <span>{isEn ? 'Inside the App' : 'شاهد التطبيق من الداخل'}</span>
          </div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#23096E] tracking-tight leading-tight">
            {isEn ? 'Explore the Clean, Fast Mobile Interface' : 'استكشف واجهات وتجربة تطبيق مساري'}
          </h2>
          <p className="text-[#423861] text-xs sm:text-sm lg:text-base max-w-2xl mx-auto font-semibold">
            {isEn
              ? 'Every screen is crafted for simplicity, high speed, and complete clarity on iPhone & Android.'
              : 'شاشات عصرية صُممت لتمنحك تجربة حجز سلسة على أجهزة آيفون وسامسونج دون أي تعقيد.'}
          </p>

          {/* Model Switcher for Showcase */}
          <div className="inline-flex items-center gap-2 bg-[#F4F2F8] p-1.5 rounded-2xl border border-slate-200 shadow-inner mt-1 sm:mt-2">
            <button
              onClick={() => setDeviceFrame('iphone17')}
              className={`px-3 py-1 sm:px-4 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-black transition-all cursor-pointer ${
                deviceFrame === 'iphone17'
                  ? 'bg-[#23096E] text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📱 {isEn ? 'iPhone 17 View' : 'معاينة آيفون ١٧'}
            </button>
            <button
              onClick={() => setDeviceFrame('note24')}
              className={`px-3 py-1 sm:px-4 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-black transition-all cursor-pointer ${
                deviceFrame === 'note24'
                  ? 'bg-[#23096E] text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📱 {isEn ? 'Samsung Note 24 View' : 'معاينة سامسونج نوت ٢٤'}
            </button>
          </div>
        </div>

        {/* Tab Selector Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3.5 mb-8 sm:mb-12">
          {effectiveTabs.map((tab, idx) => {
            const Icon = tab.icon;
            const isActive = activeTab === idx;
            return (
              <button
                key={idx}
                onClick={() => setActiveTab(idx)}
                className={`flex items-center gap-2 px-3 py-2 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black transition-all duration-300 transform cursor-pointer ${
                  isActive
                    ? 'bg-[#23096E] text-white shadow-lg shadow-[#23096E]/20 scale-105 border border-[#23096E]'
                    : 'bg-[#F4F2F8] text-slate-700 hover:bg-slate-200/90 hover:text-slate-900 border border-slate-200/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? 'text-[#FF3B30]' : 'text-slate-500'}`} />
                <span>{tab.title}</span>
              </button>
            );
          })}
        </div>

        {/* Interactive Showcase Box */}
        <div className="bg-[#F4F2F8]/70 border border-slate-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-10 lg:p-14 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Content Column (Left on RTL) */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-6 order-2 lg:order-1 text-start">
              
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#23096E]/10 text-[#23096E] text-xs font-black">
                <CurrentIcon className="w-3.5 h-3.5 text-[#FF3B30]" />
                <span>{currentTab.title}</span>
              </div>

              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 leading-tight">
                {currentTab.headline}
              </h3>

              <p className="text-[#423861] text-xs sm:text-sm lg:text-base leading-relaxed font-semibold">
                {currentTab.subtitle}
              </p>

              {/* Bullet Points */}
              <div className="space-y-2.5 pt-1">
                {currentTab.bullets.map((bullet, bIdx) => (
                  <div key={bIdx} className="flex items-center gap-2.5 sm:gap-3">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600" />
                    </div>
                    <span className="text-xs sm:text-base font-bold text-slate-800">
                      {bullet}
                    </span>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <div className="pt-2 sm:pt-4 flex items-center gap-4">
                <a
                  href="https://play.google.com/store/apps/details?id=net.msari.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3 bg-[#23096E] hover:bg-[#3A1C8F] text-white rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black shadow-lg shadow-[#23096E]/20 transition-all transform hover:-translate-y-0.5"
                >
                  <span>{isEn ? 'Try in App Now' : 'جرب هذه الميزة في التطبيق'}</span>
                  <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FF3B30]" />
                </a>
              </div>

            </div>

            {/* Mockup Display Column (Right on RTL) */}
            <div className="lg:col-span-5 flex justify-center order-1 lg:order-2 scale-90 sm:scale-100 origin-top">
              {deviceFrame === 'iphone17' ? (
                <IPhone17ProMaxFrame className="shadow-2xl shadow-[#23096E]/25">
                  {currentTab.image && currentTab.image.trim().length > 0 && !currentTab.image.includes('app-screen.png') ? (
                    <img
                      src={currentTab.image}
                      alt={currentTab.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    currentTab.renderScreen()
                  )}
                </IPhone17ProMaxFrame>
              ) : (
                <SamsungNote24UltraFrame className="shadow-2xl shadow-[#FF3B30]/20">
                  {currentTab.image && currentTab.image.trim().length > 0 && !currentTab.image.includes('app-screen.png') ? (
                    <img
                      src={currentTab.image}
                      alt={currentTab.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    currentTab.renderScreen()
                  )}
                </SamsungNote24UltraFrame>
              )}
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
