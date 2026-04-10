import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Globe, Search, Star, MapPin, Wifi, Coffee, Shield, CreditCard, HeartHandshake } from 'lucide-react';

export const metadata: Metadata = {
  title: 'فنادق عالمية — مساري',
  description: 'احجز أفضل الفنادق العالمية حول العالم بأسعار تنافسية مع مساري.',
};

const destinations = [
  { city: 'دبي', country: 'الإمارات', emoji: '🏙️', hotels: 240, img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800&auto=format&fit=crop' },
  { city: 'إسطنبول', country: 'تركيا', emoji: '🕌', hotels: 380, img: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=800&auto=format&fit=crop' },
  { city: 'القاهرة', country: 'مصر', emoji: '🏛️', hotels: 195, img: 'https://images.unsplash.com/photo-1539768942893-daf53e448371?q=80&w=800&auto=format&fit=crop' },
  { city: 'الرياض', country: 'السعودية', emoji: '🌴', hotels: 210, img: 'https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?q=80&w=800&auto=format&fit=crop' },
  { city: 'عمّان', country: 'الأردن', emoji: '🏰', hotels: 120, img: 'https://images.unsplash.com/photo-1570651788016-29231e21a1ad?q=80&w=800&auto=format&fit=crop' },
  { city: 'بيروت', country: 'لبنان', emoji: '⛵', hotels: 90, img: 'https://images.unsplash.com/photo-1550699026-4302f8e58dd9?q=80&w=800&auto=format&fit=crop' },
];

const features = [
  { icon: Globe, title: '+١٠٠٠ وجهة عالمية', desc: 'فنادق في أكثر من ١٠٠٠ مدينة حول العالم' },
  { icon: Shield, title: 'حجز آمن ومضمون', desc: 'دفع آمن وتأكيد فوري لجميع الحجوزات' },
  { icon: CreditCard, title: 'أفضل الأسعار', desc: 'نضمن لك أقل سعر أو نسترد الفرق' },
  { icon: HeartHandshake, title: 'دعم ٢٤/٧', desc: 'فريقنا متاح على مدار الساعة لمساعدتك' },
];

export default function InternationalHotelsPage() {
  return (
    <div className="min-h-screen bg-[#f8f8fa]">

      {/* Hero */}
      <section className="relative pt-28 pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[#23096e]">
          <Image
            src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2000&auto=format&fit=crop"
            alt="فنادق عالمية"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a0658]/90 via-[#23096e]/80 to-[#3A1C8F]/75 z-10" />
        </div>

        <div className="relative z-20 container-msari text-center pt-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/90 text-sm font-medium mb-6 border border-white/20">
            <Globe size={14} />
            +١٠٠٠ وجهة عالمية
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
            فنادق عالمية بأسعار<br />لا تُنافَس
          </h1>
          <p className="text-white/80 text-xl max-w-2xl mx-auto mb-10">
            احجز إقامتك في أفضل الفنادق حول العالم بأسعار تنافسية وخدمة عربية متميزة
          </p>
          {/* Quick WhatsApp CTA */}
          <a
            href="https://wa.me/967770000000?text=مرحباً، أرغب في حجز فندق عالمي"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white font-black px-8 py-4 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl text-lg"
          >
            💬 تواصل معنا للحجز الآن
          </a>
        </div>
      </section>

      {/* Destinations Grid */}
      <section className="container-msari -mt-16 relative z-10 mb-20">
        <div className="bg-white rounded-3xl shadow-xl border border-neutral-100 p-8">
          <h2 className="text-2xl font-black text-neutral-900 mb-2">الوجهات الأكثر حجزاً</h2>
          <p className="text-neutral-500 text-sm mb-8">اختر وجهتك وتواصل معنا للحصول على أفضل سعر</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {destinations.map((dest) => (
              <a
                key={dest.city}
                href={`https://wa.me/967770000000?text=مرحباً، أريد حجز فندق في ${dest.city}، ${dest.country}`}
                target="_blank"
                rel="noopener noreferrer"
                className="relative rounded-2xl overflow-hidden h-44 group cursor-pointer"
              >
                <Image src={dest.img} alt={dest.city} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="text-2xl mb-1">{dest.emoji}</div>
                  <div className="text-white font-black text-lg leading-none">{dest.city}</div>
                  <div className="text-white/70 text-xs mt-1">{dest.hotels}+ فندق • {dest.country}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container-msari mb-20">
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

      {/* CTA */}
      <section className="container-msari mb-20">
        <div className="bg-gradient-to-br from-[#23096e] to-[#3A1C8F] rounded-3xl p-12 text-center">
          <h2 className="text-3xl font-black text-white mb-4">هل لم تجد وجهتك؟</h2>
          <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
            تواصل معنا مباشرة وسنساعدك في إيجاد أفضل فندق لوجهتك المفضلة
          </p>
          <a
            href="https://wa.me/967770000000?text=مرحباً، أريد مساعدة في حجز فندق عالمي"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-[#23096e] font-black px-8 py-4 rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            💬 تواصل مع فريقنا
          </a>
        </div>
      </section>
    </div>
  );
}
