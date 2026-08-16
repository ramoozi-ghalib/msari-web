import type { Metadata } from 'next';
import Image from 'next/image';
import { Car, MapPin, Clock, Shield, Users, CheckCircle, ArrowRight } from 'lucide-react';
import { PagesCmsService, SettingsCmsService } from '@/services/cms';

export const metadata: Metadata = {
  title: 'النقل بين المدن — مساري',
  description: 'خدمة نقل مريحة وآمنة بين جميع مدن اليمن مع سائقين محترفين.',
  alternates: { canonical: 'https://msari.net/ar/cars/transport' },
  openGraph: {
    title: 'النقل بين المدن — مساري',
    description: 'خدمة نقل مريحة وآمنة بين جميع مدن اليمن مع سائقين محترفين.',
    url: 'https://msari.net/ar/cars/transport',
  },
};

const ICON_MAP: Record<string, any> = {
  Shield,
  Car,
  Clock,
  Users,
  MapPin,
  CheckCircle,
};

export default async function TransportPage() {
  const [pageContent, settings] = await Promise.all([
    PagesCmsService.getCarsTransportPage(),
    SettingsCmsService.getSettings(),
  ]);

  const badge = pageContent?.hero?.badge || 'النقل بين المدن اليمنية';
  const title = pageContent?.hero?.title || 'سافر بين المدن\nبكل راحة وأمان';
  const subtitle = pageContent?.hero?.subtitle || 'خدمة نقل مريحة وموثوقة بين جميع مدن ومحافظات اليمن مع سائقين محترفين وأسعار تنافسية.';
  const bgImage = pageContent?.hero?.bgImage || 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=2000&auto=format&fit=crop';
  const routes = pageContent?.routes || [];
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
            {badge}
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight whitespace-pre-line">
            {title}
          </h1>
          <p className="text-white/80 text-xl max-w-2xl mx-auto mb-10">
            {subtitle}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href={makeWaLink('مرحباً، أريد حجز سيارة نقل بين المدن')}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-2xl bg-white text-[#23096e] font-black text-base shadow-xl hover:bg-neutral-100 transition-all hover:scale-105"
            >
              احجز رحلتك عبر واتساب
            </a>
          </div>
        </div>
      </section>

      {/* Popular Routes */}
      <section className="container-msari -mt-12 relative z-30 mb-20">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-neutral-900 mb-2">أشهر خطوط النقل</h2>
          <p className="text-neutral-500 text-sm">أسعار تقريبية لسيارة خصوصية كاملة</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {routes.map((r, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-100 hover:shadow-md hover:border-[#23096e]/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 font-black text-lg text-neutral-900">
                    <span>{r.from}</span>
                    <span className="text-[#23096e]">←</span>
                    <span>{r.to}</span>
                  </div>
                  {r.popular && (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#FF3B30]/10 text-[#FF3B30] text-xs font-bold">
                      شائع
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-500 mb-6">
                  <Clock size={14} />
                  <span>المدة التقريبية: {r.duration}</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-neutral-50">
                <div>
                  <span className="text-2xl font-black text-[#23096e]">${r.price}</span>
                  <span className="text-neutral-400 text-xs mr-1">/ المشوار</span>
                </div>
                <a
                  href={makeWaLink(`مرحباً، أريد حجز مشوار من ${r.from} إلى ${r.to}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-[#23096e] text-white text-xs font-bold hover:bg-[#3A1C8F] transition-colors"
                >
                  احجز الآن
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
            const Icon = ICON_MAP[f.icon] || Shield;
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
