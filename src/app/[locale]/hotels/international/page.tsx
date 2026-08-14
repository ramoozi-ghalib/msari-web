import type { Metadata } from 'next';
import Image from 'next/image';
import { Globe, Shield, CreditCard, HeartHandshake } from 'lucide-react';
import Heading from '@/components/ui/Heading';
import { PagesCmsService, SettingsCmsService } from '@/services/cms';

export const metadata: Metadata = {
  title: 'فنادق عالمية — مساري',
  description: 'احجز أفضل الفنادق العالمية حول العالم بأسعار تنافسية مع مساري.',
  alternates: { canonical: 'https://msari.net/ar/hotels/international' },
  openGraph: {
    title: 'فنادق عالمية — مساري',
    description: 'احجز أفضل الفنادق العالمية حول العالم بأسعار تنافسية مع مساري.',
    url: 'https://msari.net/ar/hotels/international',
  },
};

const DEFAULT_DESTINATIONS = [
  { city: 'دبي', country: 'الإمارات', emoji: '🏙️', hotels: 240, img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800&auto=format&fit=crop' },
  { city: 'إسطنبول', country: 'تركيا', emoji: '🕌', hotels: 380, img: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=800&auto=format&fit=crop' },
  { city: 'القاهرة', country: 'مصر', emoji: '🏛️', hotels: 195, img: 'https://images.unsplash.com/photo-1539768942893-daf53e448371?q=80&w=800&auto=format&fit=crop' },
  { city: 'الرياض', country: 'السعودية', emoji: '🌴', hotels: 210, img: 'https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?q=80&w=800&auto=format&fit=crop' },
  { city: 'عمّان', country: 'الأردن', emoji: '🏰', hotels: 120, img: 'https://images.unsplash.com/photo-1570651788016-29231e21a1ad?q=80&w=800&auto=format&fit=crop' },
  { city: 'بيروت', country: 'لبنان', emoji: '⛵', hotels: 90, img: 'https://images.unsplash.com/photo-1550699026-4302f8e58dd9?q=80&w=800&auto=format&fit=crop' },
];

const DEFAULT_FEATURES = [
  { icon: Globe, title: '+١٠٠٠ وجهة عالمية', desc: 'فنادق في أكثر من ١٠٠٠ مدينة حول العالم' },
  { icon: Shield, title: 'حجز آمن ومضمون', desc: 'دفع آمن وتأكيد فوري لجميع الحجوزات' },
  { icon: CreditCard, title: 'أفضل الأسعار', desc: 'نضمن لك أقل سعر أو نسترد الفرق' },
  { icon: HeartHandshake, title: 'دعم ٢٤/٧', desc: 'فريقنا متاح على مدار الساعة لمساعدتك' },
];

export default async function InternationalHotelsPage() {
  const [intlContent, settings] = await Promise.all([
    PagesCmsService.getInternationalHotelsPage(),
    SettingsCmsService.getSettings(),
  ]);

  const badge = intlContent?.hero?.badge || '+١٠٠٠ وجهة عالمية';
  const title = intlContent?.hero?.title || 'فنادق عالمية بأسعار لا تُنافَس';
  const subtitle = intlContent?.hero?.subtitle || 'احجز إقامتك في أفضل الفنادق حول العالم بأسعار تنافسية وخدمة عربية متميزة';
  const destinations = (intlContent?.topDestinations && intlContent.topDestinations.length > 0)
    ? intlContent.topDestinations
    : DEFAULT_DESTINATIONS;

  const makeWaLink = (text: string) => `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(text)}`;

  return (
    <div className="min-h-screen bg-[#F4F2F8] surface-page">
      {/* Hero */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[#23096E]">
          <Image
            src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2000&auto=format&fit=crop"
            alt="فنادق عالمية"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#160549]/90 via-[#23096E]/85 to-[#3A1C8F]/80 z-10" />
        </div>

        <div className="relative z-20 container-msari text-center pt-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-sm font-extrabold mb-6 border border-white/20 backdrop-blur-md">
            <Globe size={16} className="text-[#FF3B30]" />
            <span>{badge}</span>
          </div>
          <Heading level={1} variant="on-dark" className="mb-6">
            {title}
          </Heading>
          <p className="text-[#F4F2F8] text-lg sm:text-xl max-w-2xl mx-auto mb-8 font-semibold leading-relaxed">
            {subtitle}
          </p>
          {/* Quick WhatsApp CTA */}
          <a
            href={makeWaLink('مرحباً، أرغب في حجز فندق عالمي')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-[#FF3B30] hover:bg-[#e02d23] text-white font-black px-8 py-4 rounded-2xl transition-all duration-300 hover:-translate-y-1 shadow-xl text-lg"
          >
            💬 تواصل معنا للحجز الآن
          </a>
        </div>
      </section>

      {/* Destinations Grid */}
      <section className="py-16 bg-[#F4F2F8]">
        <div className="container-msari">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6 sm:p-10">
            <h2 className="text-2xl sm:text-3xl font-black text-[#23096E] mb-2">الوجهات الأكثر حجزاً</h2>
            <p className="text-[#423861] text-sm sm:text-base font-semibold mb-8">اختر وجهتك وتواصل معنا للحصول على أفضل سعر</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {destinations.map((dest: { city: string; country: string; emoji: string; hotels: number; img: string }) => (
                <a
                  key={dest.city}
                  href={makeWaLink(`مرحباً، أريد حجز فندق في ${dest.city}، ${dest.country}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative rounded-2xl overflow-hidden h-48 group cursor-pointer shadow-md hover:shadow-xl transition-all duration-300"
                >
                  <Image src={dest.img} alt={dest.city} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className="text-2xl mb-1">{dest.emoji}</div>
                    <div className="text-white font-black text-xl leading-none">{dest.city}</div>
                    <div className="text-white/80 text-xs font-bold mt-1.5">{dest.hotels}+ فندق • {dest.country}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-white">
        <div className="container-msari">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {DEFAULT_FEATURES.map((f) => (
              <div key={f.title} className="bg-[#F4F2F8] rounded-2xl p-6 border border-slate-200/80 text-center hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-[#23096E]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <f.icon size={24} className="text-[#23096E]" />
                </div>
                <h3 className="font-black text-[#23096E] mb-2 text-base">{f.title}</h3>
                <p className="text-[#423861] text-xs font-semibold leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#F4F2F8]">
        <div className="container-msari">
          <div className="bg-gradient-to-br from-[#23096E] via-[#2d1580] to-[#3A1C8F] rounded-3xl p-10 sm:p-14 text-center text-white shadow-2xl">
            <h2 className="text-2xl sm:text-4xl font-black mb-4 text-white">هل لم تجد وجهتك؟</h2>
            <p className="text-[#F4F2F8] text-base sm:text-lg mb-8 max-w-xl mx-auto font-semibold">
              تواصل معنا مباشرة وسنساعدك في إيجاد أفضل فندق لوجهتك المفضلة
            </p>
            <a
              href={makeWaLink('مرحباً، أريد مساعدة في حجز فندق عالمي')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#FF3B30] hover:bg-[#e02d23] text-white font-black px-8 py-4 rounded-2xl shadow-xl transition-all hover:-translate-y-1"
            >
              💬 تواصل مع فريقنا
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
