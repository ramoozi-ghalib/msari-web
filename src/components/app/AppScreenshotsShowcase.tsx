'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Search, Hotel, CheckCircle2, Ticket } from 'lucide-react';

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

const DEFAULT_TABS = [
  {
    id: 0,
    title: 'الرئيسية والبحث',
    icon: Search,
    image: 'https://firebasestorage.googleapis.com/v0/b/msariapp-v2.firebasestorage.app/o/hotels%2FBmS2C5c4z23UfUv3T0oG%2Fimg_0.jpg?alt=media&token=7fa51dd1-b3b3-4f05-8968-3f596a77d542',
    headline: 'بحث ذكي وفلترة فائقة السرعة',
    subtitle: 'تصفح أكثر من 500 فندق في عدن، صنعاء، تعز، والمكلا بسهولة فائقة مع أسعار فورية بالريال اليمني والدولار والريال السعودي.',
  },
  {
    id: 1,
    title: 'تفاصيل الفندق',
    icon: Hotel,
    image: 'https://firebasestorage.googleapis.com/v0/b/msariapp-v2.firebasestorage.app/o/hotels%2FIOfiz4EpAILtuN0nc7zg%2Fimg_0.jpg?alt=media&token=2b00ded4-8b95-4efe-bc46-62e0ebdb178e',
    headline: 'تفاصيل كاملة وصور عالية الدقة',
    subtitle: 'عرض شاملاً لصور الغرف، المرافق، الإطلالات، والموقع الخريطي للفندق قبل اتخاذ قرار الحجز.',
  },
  {
    id: 2,
    title: 'تأكيد الحجز',
    icon: CheckCircle2,
    image: 'https://firebasestorage.googleapis.com/v0/b/msariapp-v2.firebasestorage.app/o/hotels%2FIOfiz4EpAILtuN0nc7zg%2Fimg_1.jpg?alt=media&token=d33cdf0e-18fb-4dbe-ac1c-0ad1bbb78ef7',
    headline: 'تأكيد حجز فوري وقسيمة الكترونية',
    subtitle: 'احصل على قسيمة الحجز الرسمية مباشرة على هاتفك مع إمكانية التنسيق المباشر مع موظفي الخدمة.',
  },
  {
    id: 3,
    title: 'إدارة الحجوزات',
    icon: Ticket,
    image: 'https://firebasestorage.googleapis.com/v0/b/msariapp-v2.firebasestorage.app/o/hotels%2FBmS2C5c4z23UfUv3T0oG%2Fimg_1.jpg?alt=media&token=e110c710-53ab-453d-8e43-ef4675e4eeb0',
    headline: 'إدارة جميع رحلاتك في مكان واحد',
    subtitle: 'تابع حجوزات الفنادق والتذاكر السابقة والقادمة بكل يسر وسهولة في أي وقت.',
  },
];

export default function AppScreenshotsShowcase({ isEn = false, screensShowcase }: Props) {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = (screensShowcase && screensShowcase.length > 0)
    ? screensShowcase.map((t, idx) => ({
        id: idx,
        title: t.title,
        icon: DEFAULT_TABS[idx % DEFAULT_TABS.length].icon,
        image: t.image || DEFAULT_TABS[idx % DEFAULT_TABS.length].image,
        headline: t.headline,
        subtitle: t.subtitle,
      }))
    : DEFAULT_TABS;

  const currentTab = tabs[activeTab] || tabs[0];
  const CurrentIcon = currentTab.icon;

  return (
    <section className="py-20 lg:py-28 bg-white relative">
      <div className="container-msari">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#23096E]/10 text-[#23096E] text-xs font-black">
            {isEn ? 'App Experience' : 'تجربة استخدام فريدة'}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#23096E]">
            {isEn ? 'Explore Msari App Interface' : 'استعرض شاشات تطبيق مساري'}
          </h2>
          <p className="text-[#423861] text-base sm:text-lg max-w-2xl mx-auto font-semibold">
            {isEn
              ? 'Intuitive navigation, crystal clear details, and rapid checkout crafted specifically for the Yemeni traveler.'
              : 'تنقل سلس، تفاصيل دقيقة، وسرعة في الحجز مصممة خصيصاً لتناسب احتياجاتك.'}
          </p>
        </div>

        {/* Tab Selector Pill Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-14">
          {tabs.map((tab, idx) => {
            const Icon = tab.icon;
            const isActive = activeTab === idx;
            return (
              <button
                key={idx}
                onClick={() => setActiveTab(idx)}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-black transition-all duration-300 ${
                  isActive
                    ? 'bg-[#23096E] text-white shadow-lg shadow-[#23096E]/20 scale-105'
                    : 'bg-[#F4F2F8] text-slate-700 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-[#FF3B30]' : 'text-slate-500'} />
                <span>{tab.title}</span>
              </button>
            );
          })}
        </div>

        {/* Interactive Showcase Box */}
        <div className="bg-[#F4F2F8]/70 border border-slate-200/80 rounded-3xl p-8 lg:p-12 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left/Content Column */}
            <div className="lg:col-span-7 space-y-6 order-2 lg:order-1">
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
            </div>

            {/* Right/Mockup Column */}
            <div className="lg:col-span-5 flex justify-center order-1 lg:order-2">
              <div className="relative w-64 sm:w-72 h-[480px] sm:h-[520px] rounded-[36px] overflow-hidden border-[6px] border-slate-900 shadow-2xl shadow-[#23096E]/15 bg-slate-950">
                <Image
                  src={currentTab.image}
                  alt={currentTab.headline}
                  fill
                  className="object-cover"
                />
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
