'use client';

import React from 'react';
import { 
  CreditCard, 
  Coins, 
  ShieldCheck, 
  Headphones, 
  MapPin, 
  Layers,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface Props {
  isEn?: boolean;
  features?: Array<{
    title: string;
    desc: string;
    icon?: string;
    badge?: string;
    color?: string;
  }>;
}

const LOCAL_FEATURES = [
  {
    icon: CreditCard,
    title: 'خيارات دفع متعددة',
    desc: 'ادفع بسهولة عبر المحافظ الإلكترونية المتوفرة، أو تحويل بنكي، أو الدفع كاش عند الوصول.',
    color: 'from-[#23096E] to-[#3A1C8F]',
    badge: 'طرق دفع مرنة',
  },
  {
    icon: Coins,
    title: 'شفافية الأسعار وتعدد العملات',
    desc: 'احصل على أسعار مباشرة ومحدثة بالريال اليمني، الدولار الأمريكي، والريال السعودي بدون أي عمولات خفية.',
    color: 'from-[#FF3B30] to-[#d92217]',
    badge: 'ريال يمني / دولار / سعودي',
  },
  {
    icon: ShieldCheck,
    title: 'تأكيد حجز فوري برقم مرجعي رسمي',
    desc: 'بمجرد إتمام الحجز تستلم تفاصيل الحجز المؤكد فورياً على هاتفك، مع إمكانية مراجعة الحجز بدون إنترنت.',
    color: 'from-emerald-600 to-teal-700',
    badge: 'تأكيد فوري مضمون',
  },
  {
    icon: Headphones,
    title: '24/7 خدمة عملاء',
    desc: 'فريق دعم محلي متخصص معك في كل خطوة عبر واتساب والاتصال الهاتفي لضمان إقامة مريحة وممتعة.',
    color: 'from-[#3A1C8F] to-[#23096E]',
    badge: 'دعم متواصل 24/7',
  },
  {
    icon: MapPin,
    title: 'تغطية شاملة لأهم المدن والمحافظات',
    desc: 'فنادق وأجنحة وشقق مفروشة في عدن، صنعاء، المكلا، سيئون، المهرة، تعز، إب، مأرب، وشبوة تناسب جميع الميزانيات.',
    color: 'from-blue-600 to-indigo-800',
    badge: 'جميع محافظات اليمن',
  },
  {
    icon: Layers,
    title: 'منصة سفر شاملة ومتكاملة',
    desc: 'بالإضافة لفنادق اليمن، يتيح لك التطبيق مقارنة أسعار الفنادق العالمية، وحجز تذاكر الطيران، وطلب تأجير السيارات والتنقل.',
    color: 'from-purple-700 to-pink-700',
    badge: 'فنادق · طيران · سيارات',
  },
];

export default function AppFeaturesSection({ isEn = false }: Props) {
  const items = LOCAL_FEATURES;

  return (
    <section className="py-14 sm:py-20 lg:py-28 bg-[#F4F2F8]/70 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-[#23096E]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#FF3B30]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container-msari relative z-10 px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4 mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#23096E]/10 border border-[#23096E]/20 text-[#23096E] text-xs font-black">
            <Sparkles className="w-3.5 h-3.5 text-[#FF3B30]" />
            <span>{isEn ? 'Tailored for You' : 'صُمم خصيصاً للمسافر اليمني'}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#23096E] tracking-tight leading-tight">
            {isEn ? 'Why Download Msari App Today?' : 'لماذا يعتبر تطبيق مساري خيارك الأول للسفر؟'}
          </h2>
          <p className="text-[#423861] text-sm sm:text-base lg:text-lg max-w-2xl mx-auto font-semibold">
            {isEn
              ? 'Enjoy unmatched convenience, flexible local payments, direct hotel rates, and 24/7 support across Yemen.'
              : 'حلول ذكية تراعي واقع المعاملات في اليمن، مع حجز فوري وتأكيد رسمي بأفضل الأسعار المتاحة.'}
          </p>
        </div>

        {/* 3x2 Grid of Enhanced Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {items.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="group relative bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden flex flex-col justify-between"
              >
                {/* Accent Top Line with Gradient */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${feat.color}`} />

                <div className="space-y-4">
                  {/* Badge & Icon Row */}
                  <div className="flex items-center justify-between">
                    <div className={`w-11 h-11 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl bg-gradient-to-br ${feat.color} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-black text-slate-700 bg-slate-100 border border-slate-200/80 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full">
                      {feat.badge}
                    </span>
                  </div>

                  {/* Text Content */}
                  <div className="space-y-1.5">
                    <h3 className="text-base sm:text-lg lg:text-xl font-black text-slate-900 group-hover:text-[#23096E] transition-colors leading-snug">
                      {feat.title}
                    </h3>
                    <p className="text-[#423861] text-xs sm:text-sm leading-relaxed font-semibold">
                      {feat.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center gap-1.5 text-emerald-700 text-xs font-black">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Included in App' : 'متاح ومفعل في التطبيق'}</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
