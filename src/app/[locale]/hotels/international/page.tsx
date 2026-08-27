import type { Metadata } from 'next';
import Image from 'next/image';
import { Globe, Shield, CreditCard, HeartHandshake, Star } from 'lucide-react';
import Heading from '@/components/ui/Heading';
import { PagesCmsService, SettingsCmsService } from '@/services/cms';

import { getLocalizedAlternates } from '@/lib/seo';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const isEn = locale === 'en';

  const title = isEn
    ? 'International Hotels Worldwide Booking | Msari'
    : 'فنادق عالمية — حجز ومقارنة أسعار الفنادق حول العالم | مساري';

  const description = isEn
    ? 'Book the best international hotels around the world (Dubai, Cairo, Istanbul, Riyadh) with exclusive offers and easy payment on Msari.'
    : 'احجز أفضل الفنادق العالمية حول العالم (دبي، القاهرة، إسطنبول، الرياض، عمّان) بأسعار تنافسية وخيارات دفع متعددة ومضمونة مع مساري.';

  return {
    title,
    description,
    alternates: getLocalizedAlternates('/hotels/international', locale),
    openGraph: {
      title,
      description,
      url: `https://msari.net/${isEn ? 'en' : 'ar'}/hotels/international`,
      siteName: 'مساري',
      locale: isEn ? 'en_US' : 'ar_YE',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

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

const ICON_MAP: Record<string, any> = {
  Globe,
  Shield,
  CreditCard,
  HeartHandshake,
  Star,
};

export default async function InternationalHotelsPage() {
  const [intlContent, settings] = await Promise.all([
    PagesCmsService.getInternationalHotelsPage(),
    SettingsCmsService.getSettings(),
  ]);

  const badge = intlContent?.hero?.badge || '+١٠٠٠ وجهة عالمية';
  const title = intlContent?.hero?.title || 'فنادق عالمية بأسعار لا تُنافَس';
  const subtitle = intlContent?.hero?.subtitle || 'احجز إقامتك في أفضل الفنادق حول العالم بأسعار تنافسية وخدمة عربية متميزة';
  const bgImage = intlContent?.hero?.bgImage || 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2000&auto=format&fit=crop';
  const destinations = (intlContent?.topDestinations && intlContent.topDestinations.length > 0)
    ? intlContent.topDestinations
    : DEFAULT_DESTINATIONS;

  const features = (intlContent?.features && intlContent.features.length > 0)
    ? intlContent.features
    : DEFAULT_FEATURES;

  const ctaTitle = intlContent?.cta?.title || 'هل لم تجد وجهتك؟';
  const ctaSubtitle = intlContent?.cta?.subtitle || 'تواصل معنا مباشرة وسنساعدك في إيجاد أفضل فندق لوجهتك المفضلة';

  const makeWaLink = (text: string) => `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(text)}`;

  return (
    <div className="min-h-screen bg-[#F4F2F8] surface-page">
      {/* Hero */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[#23096E]">
          <Image
            src={bgImage}
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
          <p className="text-[#F4F2F8] text-sm sm:text-base lg:text-lg max-w-2xl mx-auto mb-8 font-medium leading-relaxed">
            {subtitle}
          </p>
          {/* Quick WhatsApp CTA */}
          <a
            href={makeWaLink('مرحباً، أرغب في حجز فندق عالمي')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 bg-[#FF3B30] hover:bg-[#e02d23] text-white font-black px-7 py-3.5 rounded-2xl transition-all duration-300 hover:-translate-y-1 shadow-xl text-base"
          >
            💬 تواصل معنا للحجز الآن
          </a>
        </div>
      </section>

      {/* Destinations Grid */}
      <section className="py-16 bg-[#F4F2F8]">
        <div className="container-msari">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6 sm:p-10">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#23096E] mb-1.5">الوجهات الأكثر حجزاً</h2>
            <p className="text-[#423861] text-xs sm:text-sm font-medium mb-8">اختر وجهتك وتواصل معنا للحصول على أفضل سعر</p>
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
            {features.map((f: any, idx: number) => {
              const Icon = (typeof f.icon === 'string' ? ICON_MAP[f.icon] : f.icon) || DEFAULT_FEATURES[idx % DEFAULT_FEATURES.length].icon;
              return (
                <div key={idx} className="bg-[#F4F2F8] rounded-2xl p-6 border border-slate-200/80 text-center hover:shadow-md transition-all">
                  <div className="w-12 h-12 bg-[#23096E]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon size={24} className="text-[#23096E]" />
                  </div>
                  <h3 className="font-bold text-[#23096E] mb-1.5 text-xs sm:text-sm">{f.title}</h3>
                  <p className="text-[#423861] text-xs font-normal leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#F4F2F8]">
        <div className="container-msari">
          <div className="bg-gradient-to-br from-[#23096E] via-[#2d1580] to-[#3A1C8F] rounded-3xl p-8 sm:p-12 text-center text-white shadow-2xl">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2.5 text-white">{ctaTitle}</h2>
            <p className="text-[#F4F2F8] text-xs sm:text-sm mb-6 max-w-xl mx-auto font-normal">
              {ctaSubtitle}
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
