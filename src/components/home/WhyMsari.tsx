import Link from 'next/link';
import { ShieldCheck, Headphones, Tag, MapPin, Sparkles, Building, ArrowLeft } from 'lucide-react';
import type { HomepageContentData } from '@/services/cms';

interface WhyMsariProps {
  whyMsari?: HomepageContentData['whyMsari'];
}

const DEFAULT_FEATURES = [
  {
    title: 'تأكيد حجز فوري ومضمون',
    desc: 'احصل على قسيمة حجزك الفندقي المعتمدة مباشرة دون انتظار أو تأخير وبأعلى معايير الموثوقية.',
    icon: ShieldCheck,
    badge: 'موثوقية 100%',
  },
  {
    title: 'دعم محلي على مدار 24 ساعة',
    desc: 'فريق خدمة عملاء يمني متخصص متواجد على مدار الساعة عبر واتساب والاتصال لمساعدتك في أي استفسار.',
    icon: Headphones,
    badge: 'خدمة 24/7',
  },
  {
    title: 'أفضل الأسعار بدون عمولات خفية',
    desc: 'أسعار مباشرة وشفافة مع خيارات دفع مرنة بالريال اليمني والسعودي والدولار.',
    icon: Tag,
    badge: 'سعر مضمون',
  },
  {
    title: 'أوسع شبكة فنادق في اليمن',
    desc: 'تغطية شاملة لأرقى الفنادق والمنتجعات والشاليهات في عدن، صنعاء، المكلا، إب وكافة المحافظات.',
    icon: Building,
    badge: 'تغطية كاملة',
  },
];

export default function WhyMsari({ whyMsari }: WhyMsariProps) {
  const sectionTitle = whyMsari?.sectionTitleAr || 'لماذا يختار المسافرون منصة مساري؟';
  const badge = whyMsari?.badgeAr || 'مميزات مساري';

  return (
    <section className="py-20 sm:py-28 bg-[#fafafc] border-t border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] text-xs sm:text-sm font-black mb-4">
            <Sparkles size={14} />
            <span>{badge}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-neutral-900 leading-[1.25] tracking-tight mb-4">
            {sectionTitle}
          </h2>
          <p className="text-neutral-500 text-sm sm:text-base lg:text-lg font-medium leading-relaxed">
            صممنا مساري لتلبية كافة احتياجات المسافر اليمني وتوفير تجربة حجز عصرية، آمنة ومريحة تلغي عناء البحث التقليدي.
          </p>
        </div>

        {/* Features 4-Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {DEFAULT_FEATURES.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl p-7 border border-neutral-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center shadow-inner">
                      <Icon size={28} />
                    </div>
                    <span className="text-[11px] font-black text-[var(--brand-primary)] bg-[var(--brand-primary)]/5 px-3 py-1 rounded-full">
                      {feature.badge}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-black text-neutral-900 mb-3 leading-snug">
                    {feature.title}
                  </h3>

                  <p className="text-neutral-500 text-xs sm:text-sm leading-relaxed font-medium">
                    {feature.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Partner & Developer Banner Strip */}
        <div className="mt-12 rounded-3xl bg-white p-6 sm:p-8 border border-neutral-200/60 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="text-start">
            <h4 className="text-base sm:text-lg font-black text-neutral-900 mb-1">
              هل أنت مالك فندق أو مزود خدمة سياحية؟
            </h4>
            <p className="text-neutral-500 text-xs sm:text-sm font-medium">
              انضم إلى شبكة مساري وزد من نسبة إشغال فندقك عبر منصتنا وتكامل مع خدماتنا الرقمية.
            </p>
          </div>

          <Link
            href="/add-hotel"
            className="px-6 py-3 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-secondary)] text-white text-xs sm:text-sm font-black transition-colors shrink-0 shadow-md inline-flex items-center gap-2"
          >
            <span>سجل فندقك الآن</span>
            <ArrowLeft size={16} />
          </Link>
        </div>

      </div>
    </section>
  );
}
