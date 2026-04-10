import type { Metadata } from 'next';
import Image from 'next/image';
import { Car, MapPin, Clock, Shield, Users, CheckCircle, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'النقل بين المدن — مساري',
  description: 'خدمة نقل مريحة وآمنة بين جميع مدن اليمن مع سائقين محترفين.',
};

const routes = [
  { from: 'صنعاء', to: 'عدن', duration: '٦-٧ ساعات', price: 40, popular: true },
  { from: 'صنعاء', to: 'مأرب', duration: '٣-٤ ساعات', price: 25, popular: false },
  { from: 'صنعاء', to: 'تعز', duration: '٥-٦ ساعات', price: 35, popular: true },
  { from: 'عدن', to: 'المكلا', duration: '٦-٧ ساعات', price: 45, popular: false },
  { from: 'صنعاء', to: 'الحديدة', duration: '٤-٥ ساعات', price: 30, popular: false },
  { from: 'عدن', to: 'تعز', duration: '٣-٤ ساعات', price: 25, popular: true },
];

const features = [
  { icon: Shield, title: 'سائقون محترفون', desc: 'مرخصون ومتمرسون على جميع الطرق' },
  { icon: Car, title: 'سيارات مريحة', desc: 'أسطول متنوع بين خصوصي وميني باص' },
  { icon: Clock, title: 'في الوقت المحدد', desc: 'نلتزم بمواعيد الانطلاق والوصول' },
  { icon: Users, title: 'للأفراد والعائلات', desc: 'سيارات بمقاسات مختلفة تناسب الجميع' },
];

export default function TransportPage() {
  return (
    <div className="min-h-screen bg-[#f8f8fa]">

      {/* Hero */}
      <section className="relative pt-28 pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[#23096e]">
          <Image
            src="https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=2000&auto=format&fit=crop"
            alt="النقل بين المدن"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a0658]/92 via-[#23096e]/82 to-[#3A1C8F]/78 z-10" />
        </div>

        <div className="relative z-20 container-msari text-center pt-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/90 text-sm font-medium mb-6 border border-white/20">
            <MapPin size={14} />
            النقل بين المدن اليمنية
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
            سافر بين المدن<br />بكل راحة وأمان
          </h1>
          <p className="text-white/80 text-xl max-w-2xl mx-auto mb-10">
            خدمة نقل مريحة وموثوقة بين جميع مدن اليمن مع سائقين محترفين وأسعار تنافسية
          </p>
          <a
            href="https://wa.me/967770000000?text=مرحباً، أريد حجز رحلة نقل بين المدن"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white font-black px-8 py-4 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl text-lg"
          >
            💬 احجز الآن عبر واتساب
          </a>
        </div>
      </section>

      {/* Routes */}
      <section className="container-msari -mt-16 relative z-10 mb-20">
        <div className="bg-white rounded-3xl shadow-xl border border-neutral-100 p-8">
          <h2 className="text-2xl font-black text-neutral-900 mb-2">الخطوط المتاحة</h2>
          <p className="text-neutral-500 text-sm mb-8">أسعار مبدئية — يتم تأكيد السعر النهائي عند الحجز</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {routes.map((route) => (
              <a
                key={`${route.from}-${route.to}`}
                href={`https://wa.me/967770000000?text=أريد حجز رحلة من ${route.from} إلى ${route.to}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-5 rounded-2xl border border-neutral-100 hover:border-[#23096e]/30 hover:bg-[#23096e]/5 transition-all duration-300 group"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-black text-neutral-900 text-base">{route.from}</span>
                    <ArrowRight size={16} className="text-neutral-400 rtl:rotate-180" />
                    <span className="font-black text-neutral-900 text-base">{route.to}</span>
                    {route.popular && (
                      <span className="text-xs bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">الأكثر طلباً</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-neutral-500 text-sm">
                    <Clock size={13} /> <span>{route.duration}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[#23096e] font-black text-xl">${route.price}</div>
                  <div className="text-neutral-400 text-xs">للرحلة</div>
                </div>
              </a>
            ))}
          </div>
          <p className="text-neutral-400 text-xs mt-6 text-center">
            * لوجهات أخرى غير مدرجة، تواصل معنا عبر واتساب وسنوفر لك أفضل سعر
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="container-msari mb-20">
        <h2 className="text-2xl font-black text-neutral-900 mb-8 text-center">خدمتنا المتميزة</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {features.map((f) => (
            <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 text-center hover:shadow-md transition-shadow duration-300">
              <div className="w-12 h-12 bg-[#23096e]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <f.icon size={22} className="text-[#23096e]" />
              </div>
              <h3 className="font-black text-neutral-900 mb-2 text-sm">{f.title}</h3>
              <p className="text-neutral-500 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-[#23096e] py-16">
        <div className="container-msari">
          <h2 className="text-2xl font-black text-white text-center mb-12">كيف تحجز؟</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '١', title: 'تواصل معنا', desc: 'أرسل لنا رسالة واتساب مع تفاصيل رحلتك' },
              { step: '٢', title: 'احصل على تأكيد', desc: 'سنؤكد لك السعر والموعد والسائق' },
              { step: '٣', title: 'استمتع بالرحلة', desc: 'السائق سيكون في انتظارك في الوقت المحدد' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-white text-[#23096e] font-black text-2xl rounded-2xl flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-black text-white text-lg mb-2">{item.title}</h3>
                <p className="text-white/70 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <a
              href="https://wa.me/967770000000?text=مرحباً، أريد حجز رحلة نقل بين المدن"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-[#23096e] font-black px-8 py-4 rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              💬 ابدأ الحجز الآن
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
