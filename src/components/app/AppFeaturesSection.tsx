'use client';

import React from 'react';
import { 
  CreditCard, 
  Coins, 
  FileCheck2, 
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
    title: 'حجز فوري بدون بطاقة فيزا دولية',
    desc: 'لا تحتاج لبطاقات بنكية أجنبية؛ ادفع بسهولة عبر حسابك في بنك الكريمي (إم فلوس)، محفظة جيب، ون باي، أو بالدفع كاش عند الوصول.',
    color: 'from-[#23096E] to-[#3A1C8F]',
    badge: 'طرق دفع يمنية مرنة',
  },
  {
    icon: Coins,
    title: 'شفافية الأسعار وتعدد العملات',
    desc: 'احصل على أسعار مباشرة ومحدثة بالريال اليمني (قعيطي وقديم)، الدولار الأمريكي، والريال السعودي بدون أي عمولات خفية.',
    color: 'from-[#FF3B30] to-[#d92217]',
    badge: 'ريال يمني / دولار / سعودي',
  },
  {
    icon: FileCheck2,
    title: 'قسيمة حجز رقمية معتمدة وفورية',
    desc: 'بمجرد إتمام الحجز تستلم قسيمة الحجز الرسمية المزودة برمز QR على جوالك ومحفوظة للعمل بدون إنترنت عند الوصول للفندق.',
    color: 'from-emerald-600 to-teal-700',
    badge: 'تأكيد فوري مضمون',
  },
  {
    icon: Headphones,
    title: 'دعم فني يمني مباشر 24/7',
    desc: 'فريق دعم محلي متخصص معك في كل خطوة عبر واتساب والاتصال الهاتفي لضمان وصولك واستلام غرفتك بكل راحة.',
    color: 'from-[#3A1C8F] to-[#23096E]',
    badge: 'خدمة عملاء حية',
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

export default function AppFeaturesSection({ isEn = false, features }: Props) {
  const items = LOCAL_FEATURES;

  return (
    <section className="py-20 lg:py-28 bg-[#F4F2F8]/70 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-[#23096E]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#FF3B30]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container-msari relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#23096E]/10 border border-[#23096E]/20 text-[#23096E] text-xs font-black">
            <Sparkles className="w-3.5 h-3.5 text-[#FF3B30]" />
            <span>{isEn ? 'Tailored for You' : 'صُمم خصيصاً للمسافر اليمني'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#23096E] tracking-tight">
            {isEn ? 'Why Download Msari App Today?' : 'لماذا يعتبر تطبيق مساري خيارك الأول للسفر؟'}
          </h2>
          <p className="text-[#423861] text-base sm:text-lg max-w-2xl mx-auto font-semibold">
            {isEn
              ? 'Enjoy unmatched convenience, zero foreign card requirements, direct hotel rates, and 24/7 local support across Yemen.'
              : 'حلول ذكية تراعي واقع المعاملات في اليمن، مع حجز فوري وتأكيد رسمي بأفضل الأسعار المتاحة.'}
          </p>
        </div>

        {/* 3x2 Grid of Enhanced Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {items.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="group relative bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden flex flex-col justify-between"
              >
                {/* Accent Top Line with Gradient */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${feat.color}`} />

                <div className="space-y-5">
                  {/* Badge & Icon Row */}
                  <div className="flex items-center justify-between">
                    <div className={`w-13 h-13 rounded-2xl bg-gradient-to-br ${feat.color} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                      <Icon size={26} />
                    </div>
                    <span className="text-[11px] font-black text-slate-700 bg-slate-100 border border-slate-200/80 px-3 py-1 rounded-full">
                      {feat.badge}
                    </span>
                  </div>

                  {/* Text Content */}
                  <div className="space-y-2">
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-[#23096E] transition-colors leading-snug">
                      {feat.title}
                    </h3>
                    <p className="text-[#423861] text-xs sm:text-sm leading-relaxed font-semibold">
                      {feat.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-1.5 text-emerald-700 text-xs font-black">
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
