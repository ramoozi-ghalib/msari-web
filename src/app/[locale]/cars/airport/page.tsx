import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Car, MapPin, Clock, Shield, Star, Phone, CheckCircle, ArrowLeft } from 'lucide-react';
import { PagesCmsService, SettingsCmsService } from '@/services/cms';

export const metadata: Metadata = {
  title: 'تاكسي المطار — مساري',
  description: 'احجز تاكسي المطار في اليمن بسهولة. خدمة استقبال احترافية من وإلى المطار في صنعاء وعدن.',
  alternates: { canonical: 'https://msari.net/ar/cars/airport' },
  openGraph: {
    title: 'تاكسي المطار — مساري',
    description: 'احجز تاكسي المطار في اليمن بسهولة. خدمة استقبال احترافية من وإلى المطار في صنعاء وعدن.',
    url: 'https://msari.net/ar/cars/airport',
  },
};

const ICON_MAP: Record<string, any> = {
  Clock,
  Shield,
  Star,
  Phone,
  Car,
  MapPin,
  CheckCircle,
};

export default async function AirportTaxiPage() {
  const [pageContent, settings] = await Promise.all([
    PagesCmsService.getCarsAirportPage(),
    SettingsCmsService.getSettings(),
  ]);

  const badge = pageContent?.hero?.badge || 'خدمة تاكسي المطار';
  const title = pageContent?.hero?.title || 'استقبال من المطار\nبكل راحة وأمان';
  const subtitle = pageContent?.hero?.subtitle || 'احجز سيارتك من وإلى المطار مسبقاً وتجنب عناء البحث عن وسيلة نقل عند الوصول.';
  const bgImage = pageContent?.hero?.bgImage || 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2000&auto=format&fit=crop';
  const packages = pageContent?.packages || [];
  const airports = pageContent?.airports || [];
  const features = pageContent?.features || [];

  const waNumber = settings.whatsappNumber || '967733644466';
  const makeWaLink = (msg: string) => `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;

  return (
    <div className="min-h-screen bg-[#f8f8fa]">

      {/* Hero */}
      <section className="relative pt-28 pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[#23096e]">
          <Image
            src={bgImage}
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
            {badge}
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white mb-3 leading-tight whitespace-pre-line">
            {title}
          </h1>
          <p className="text-white/85 text-xs sm:text-sm lg:text-base max-w-xl mx-auto mb-6">
            {subtitle}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href={makeWaLink('مرحباً، أريد حجز تاكسي مطار')}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-2xl bg-white text-[#23096e] font-black text-base shadow-xl hover:bg-neutral-100 transition-all hover:scale-105"
            >
              احجز الآن عبر واتساب
            </a>
            <Link
              href="/cars"
              className="px-6 py-4 rounded-2xl bg-white/15 text-white font-bold text-base hover:bg-white/25 transition-all border border-white/20"
            >
              جميع خدمات النقل ←
            </Link>
          </div>
        </div>
      </section>

      {/* Airports Supported */}
      <section className="container-msari -mt-12 relative z-30 mb-16">
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-neutral-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {airports.map((a) => (
            <div key={a.name} className="flex items-center gap-4 p-4 rounded-2xl bg-neutral-50 hover:bg-[#23096e]/5 transition-colors">
              <div className="text-3xl">{a.emoji || '✈️'}</div>
              <div>
                <div className="font-black text-neutral-900 text-sm">{a.name}</div>
                <div className="text-neutral-500 text-xs">{a.city} • رمز {a.code}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Packages */}
      <section className="container-msari mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-neutral-900 mb-3">باقات التوصيل من وإلى المطار</h2>
          <p className="text-neutral-500 text-sm">اختر الباقة المناسبة لاحتياجاتك واستمتع برحلة مريحة</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {packages.map((pkg) => (
            <div
              key={pkg.name}
              className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-100 hover:shadow-md hover:border-[#23096e]/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="text-4xl mb-4">{pkg.emoji}</div>
                <h3 className="text-xl font-black text-neutral-900 mb-1">{pkg.name}</h3>
                <p className="text-neutral-500 text-xs mb-4">{pkg.desc}</p>
                <div className="text-xs text-neutral-600 bg-neutral-50 rounded-xl p-2 mb-6">
                  يتسع حتى <strong>{pkg.passengers} ركاب</strong>
                </div>
              </div>
              <div>
                <div className="mb-4">
                  <span className="text-3xl font-black text-[#23096e]">${pkg.price}</span>
                  <span className="text-neutral-400 text-xs mr-1">/ المشوار</span>
                </div>
                <a
                  href={makeWaLink(`مرحباً، أريد حجز باقة ${pkg.name} لتاكسي المطار ($${pkg.price})`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-xl bg-[#23096e] text-white text-center font-bold text-sm block hover:bg-[#3A1C8F] transition-colors"
                >
                  احجز الباقة
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="container-msari mb-20">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {features.map((f, idx) => {
            const Icon = ICON_MAP[f.icon] || Star;
            return (
              <div key={idx} className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100 text-center">
                <div className="w-10 h-10 rounded-xl bg-[#23096e]/10 text-[#23096e] flex items-center justify-center mx-auto mb-3">
                  <Icon size={20} />
                </div>
                <h4 className="font-bold text-neutral-900 text-sm mb-1">{f.title}</h4>
                <p className="text-neutral-500 text-xs leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
