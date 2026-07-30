'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Search, Hotel, CheckCircle2, Ticket } from 'lucide-react';

interface Props {
  isEn?: boolean;
  data?: {
    tab1Image?: string;
    tab2Image?: string;
    tab3Image?: string;
    tab4Image?: string;
  };
}

export default function AppScreenshotsShowcase({ isEn = false, data }: Props) {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    {
      id: 0,
      title: isEn ? 'Home & Search' : 'الرئيسية والبحث',
      icon: Search,
      image: data?.tab1Image || 'https://firebasestorage.googleapis.com/v0/b/msariapp-v2.firebasestorage.app/o/hotels%2FBmS2C5c4z23UfUv3T0oG%2Fimg_0.jpg?alt=media&token=7fa51dd1-b3b3-4f05-8968-3f596a77d542',
      headline: isEn ? 'Smart Search & Instant Filters' : 'بحث ذكي وفلترة فائقة السرعة',
      subtitle: isEn
        ? 'Browse over 500 hotels in Aden, Sanaa, Taiz, and Mukalla with instant rates in YER, USD, and SAR.'
        : 'تصفح أكثر من 500 فندق في عدن، صنعاء، تعز، والمكلا بسهولة فائقة مع أسعار فورية بالريال اليمني والدولار والريال السعودي.',
    },
    {
      id: 1,
      title: isEn ? 'Hotel Details' : 'تفاصيل الفندق',
      icon: Hotel,
      image: data?.tab2Image || 'https://firebasestorage.googleapis.com/v0/b/msariapp-v2.firebasestorage.app/o/hotels%2FIOfiz4EpAILtuN0nc7zg%2Fimg_0.jpg?alt=media&token=2b00ded4-8b95-4efe-bc46-62e0ebdb178e',
      headline: isEn ? 'Comprehensive Specs & HD Gallery' : 'تفاصيل كاملة وصور عالية الدقة',
      subtitle: isEn
        ? 'View room photos, amenities, sea views, and exact Google Maps location before booking.'
        : 'عرض شاملاً لصور الغرف، المرافق، الإطلالات، والموقع الخريطي للفندق قبل اتخاذ قرار الحجز.',
    },
    {
      id: 2,
      title: isEn ? 'Booking Voucher' : 'تأكيد الحجز',
      icon: CheckCircle2,
      image: data?.tab3Image || 'https://firebasestorage.googleapis.com/v0/b/msariapp-v2.firebasestorage.app/o/hotels%2FIOfiz4EpAILtuN0nc7zg%2Fimg_1.jpg?alt=media&token=d33cdf0e-18fb-4dbe-ac1c-0ad1bbb78ef7',
      headline: isEn ? 'Instant Voucher & Direct Assistance' : 'تأكيد حجز فوري وقسيمة الكترونية',
      subtitle: isEn
        ? 'Receive your official booking voucher directly on your phone with live agent assistance.'
        : 'احصل على قسيمة الحجز الرسمية مباشرة على هاتفك مع إمكانية التنسيق المباشر مع موظفي الخدمة.',
    },
    {
      id: 3,
      title: isEn ? 'Manage Bookings' : 'إدارة الحجوزات',
      icon: Ticket,
      image: data?.tab4Image || 'https://firebasestorage.googleapis.com/v0/b/msariapp-v2.firebasestorage.app/o/hotels%2FBmS2C5c4z23UfUv3T0oG%2Fimg_1.jpg?alt=media&token=e110c710-53ab-453d-8e43-ef4675e4eeb0',
      headline: isEn ? 'All Trips in One Place' : 'إدارة جميع رحلاتك في مكان واحد',
      subtitle: isEn
        ? 'Easily track past and upcoming hotel stays, flight tickets, and car transfers anytime.'
        : 'تابع حجوزات الفنادق والتذاكر السابقة والقادمة بكل يسر وسهولة في أي وقت.',
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-white border-y border-slate-200/80 relative overflow-hidden">
      <div className="container-msari relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#23096E]">
            {isEn ? 'Explore App Screens' : 'استعرض شاشات التطبيق'}
          </h2>
          <p className="text-slate-700 text-base sm:text-lg font-bold">
            {isEn
              ? 'Sleek and modern UI designed for high speed and ultimate user convenience'
              : 'تصميم أنيق وعصري يمنحك التصفح الأسرع والسهولة الكاملة'}
          </p>
        </div>

        {/* Tab Navigation Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl font-black text-sm transition-all duration-300 ${
                  isActive
                    ? 'bg-[#23096E] text-white shadow-xl shadow-[#23096E]/20 scale-105'
                    : 'bg-[#F4F2F8] text-slate-700 hover:text-[#23096E] border border-slate-200'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-[#FF3B30]' : 'text-slate-500'}`} />
                <span>{tab.title}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Active Content Display */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center bg-gradient-to-br from-[#F4F2F8] via-white to-[#F4F2F8] rounded-3xl p-8 lg:p-12 border border-slate-200 shadow-xl shadow-[#23096E]/5">
          
          {/* Text Description Side */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-start">
            <span className="inline-block px-3.5 py-1 rounded-full bg-[#FF3B30]/10 text-[#FF3B30] text-xs font-black">
              {isEn ? `Feature #${activeTab + 1}` : `الميزة رقم ${activeTab + 1}`}
            </span>
            <h3 className="text-2xl sm:text-4xl font-black text-[#23096E] leading-tight">
              {tabs[activeTab].headline}
            </h3>
            <p className="text-slate-700 text-base leading-relaxed font-bold">
              {tabs[activeTab].subtitle}
            </p>
          </div>

          {/* Phone Frame Interactive Image Display */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative w-64 sm:w-72 h-[460px] sm:h-[500px] rounded-[40px] border-4 border-slate-300 bg-slate-950 shadow-2xl overflow-hidden transform hover:scale-105 transition-transform duration-500">
              <Image
                src={tabs[activeTab].image}
                alt={tabs[activeTab].headline}
                fill
                className="object-cover transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40 pointer-events-none" />
              <div className="absolute bottom-6 inset-x-4 text-center">
                <span className="inline-block px-4 py-1.5 bg-[#FF3B30] text-white font-black text-xs rounded-full shadow-lg">
                  {tabs[activeTab].title}
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
