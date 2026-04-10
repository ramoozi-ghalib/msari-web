import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Car, MapPin, Clock, Shield, Star, Phone, CheckCircle, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'تاكسي المطار — مساري',
  description: 'احجز تاكسي المطار في اليمن بسهولة. خدمة استقبال احترافية من وإلى المطار في صنعاء وعدن.',
};

const airports = [
  { name: 'مطار صنعاء الدولي', city: 'صنعاء', code: 'SAH', emoji: '✈️' },
  { name: 'مطار عدن الدولي', city: 'عدن', code: 'ADE', emoji: '✈️' },
  { name: 'مطار سيئون', city: 'حضرموت', code: 'GXF', emoji: '✈️' },
];

const features = [
  { icon: Clock, title: 'تتبع رحلتك', desc: 'السائق يتابع رحلتك ويكون في انتظارك عند الوصول' },
  { icon: Shield, title: 'سائقون معتمدون', desc: 'جميع سائقينا مدربون ومرخصون رسمياً' },
  { icon: Star, title: 'سيارات نظيفة ومريحة', desc: 'أسطول متنوع من خصوصي وميني باص' },
  { icon: Phone, title: 'دعم فوري', desc: 'تواصل معنا في أي وقت قبل وأثناء رحلتك' },
];

const packages = [
  { name: 'اقتصادي', desc: 'سيارة خصوصية مريحة', passengers: 4, price: 15, emoji: '🚗' },
  { name: 'VIP', desc: 'سيارة فاخرة بمرافق', passengers: 4, price: 30, emoji: '🚙' },
  { name: 'ميني باص', desc: 'مجموعات وعائلات', passengers: 12, price: 45, emoji: '🚌' },
];

export default function AirportTaxiPage() {
  return (
    <div className="min-h-screen bg-[#f8f8fa]">

      {/* Hero */}
      <section className="relative pt-28 pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[#23096e]">
          <Image
            src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2000&auto=format&fit=crop"
            alt="تاكسي المطار"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a0658]/90 via-[#23096e]/80 to-[#3A1C8F]/75 z-10" />
        </div>

        <div className="relative z-20 container-msari text-center pt-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/90 text-sm font-medium mb-6 border border-white/20">
            <Car size={14} />
            خدمة تاكسي المطار
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
            استقبال من المطار<br />بكل راحة وأمان
          </h1>
          <p className="text-white/80 text-xl max-w-2xl mx-auto mb-10">
            احجز سيارتك من وإلى المطار مسبقاً وتجنب عناء البحث عن وسيلة نقل
          </p>
          <a
            href="https://wa.me/967770000000?text=مرحباً، أريد حجز تاكسي من المطار"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white font-black px-8 py-4 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl text-lg"
          >
            💬 احجز الآن عبر واتساب
          </a>
        </div>
      </section>

      {/* Packages */}
      <section className="container-msari -mt-16 relative z-10 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <a
              key={pkg.name}
              href={`https://wa.me/967770000000?text=أريد حجز ${pkg.name} من المطار، السعر المبدئي $${pkg.price}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-3xl p-8 shadow-xl border border-neutral-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 text-center group"
            >
              <div className="text-5xl mb-4">{pkg.emoji}</div>
              <h3 className="text-xl font-black text-neutral-900 mb-2">{pkg.name}</h3>
              <p className="text-neutral-500 text-sm mb-4">{pkg.desc}</p>
              <div className="flex items-center justify-center gap-2 text-neutral-400 text-sm mb-6">
                <span>حتى {pkg.passengers} راكب</span>
              </div>
              <div className="text-[#23096e] font-black text-3xl mb-1">${pkg.price}</div>
              <div className="text-neutral-400 text-xs mb-6">رحلة واحدة</div>
              <div className="w-full bg-[#23096e] text-white font-bold py-3 rounded-xl group-hover:bg-[#3A1C8F] transition-colors duration-300">
                احجز الآن
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Airports */}
      <section className="container-msari mb-20">
        <h2 className="text-2xl font-black text-neutral-900 mb-8 text-center">المطارات التي نخدمها</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {airports.map((airport) => (
            <div key={airport.code} className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 flex items-center gap-4 hover:shadow-md transition-shadow duration-300">
              <div className="text-4xl">{airport.emoji}</div>
              <div>
                <div className="font-black text-neutral-900">{airport.name}</div>
                <div className="text-neutral-500 text-sm">{airport.city} • {airport.code}</div>
              </div>
              <div className="mr-auto">
                <CheckCircle size={20} className="text-green-500" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-[#23096e] py-16 mb-0">
        <div className="container-msari">
          <h2 className="text-2xl font-black text-white text-center mb-10">لماذا تختار مساري للنقل؟</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="text-center">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
                  <f.icon size={26} className="text-white" />
                </div>
                <h3 className="font-black text-white text-base mb-2">{f.title}</h3>
                <p className="text-white/70 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
