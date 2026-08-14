import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Users, Star, Shield, Zap, HeartHandshake } from 'lucide-react';
import { PagesCmsService } from '@/services/cms';

export const metadata: Metadata = {
  title: 'من نحن — مساري لخدمات السفر',
  description: 'مساري هي منصة السفر الأولى في اليمن، نربطك بأفضل الفنادق والرحلات الجوية وخدمات السيارات بأسعار تنافسية.',
  alternates: { canonical: 'https://msari.net/ar/about' },
  openGraph: {
    title: 'من نحن — مساري لخدمات السفر',
    description: 'مساري هي منصة السفر الأولى في اليمن، نربطك بأفضل الفنادق والرحلات الجوية وخدمات السيارات بأسعار تنافسية.',
    url: 'https://msari.net/ar/about',
  },
};

const ICON_MAP: Record<string, any> = {
  Shield,
  Zap,
  HeartHandshake,
  Star,
};

export default async function AboutPage() {
  const data = await PagesCmsService.getAboutPage();

  return (
    <div className="min-h-screen bg-[var(--surface-page)] surface-page">

      {/* Hero */}
      <section className="relative pt-28 pb-24 bg-gradient-to-br from-[var(--brand-primary)] via-[var(--brand-secondary)] to-[var(--brand-dark)] overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")` }}
        />
        <div className="container-msari relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/90 text-sm font-medium mb-6 border border-white/20">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            {data.hero.badge}
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
            {data.hero.title}
          </h1>
          <p className="text-white/80 text-xl max-w-2xl mx-auto leading-relaxed">
            {data.hero.subtitle}
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="container-msari -mt-10 relative z-10 mb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {data.stats.map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-6 text-center shadow-lg border border-neutral-100 hover:shadow-xl transition-shadow duration-300">
              <div className="text-3xl font-black text-[var(--brand-primary)] mb-1">{s.value}</div>
              <div className="text-sm text-neutral-500 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="container-msari mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] rounded-full text-sm font-bold mb-6">
              {data.story.badge}
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-neutral-900 mb-6 leading-tight">
              {data.story.title}
            </h2>
            {data.story.paragraphs.map((p, idx) => (
              <p key={idx} className="text-neutral-600 text-lg leading-relaxed mb-6">
                {p}
              </p>
            ))}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-neutral-700">
                <MapPin size={18} className="text-[var(--brand-primary)]" />
                <span className="font-semibold">{data.story.locationText}</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src={data.story.image}
                alt="فريق مساري"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--brand-primary)]/50 to-transparent" />
            </div>
            <div className="absolute -bottom-6 -start-6 bg-white rounded-2xl p-5 shadow-xl border border-neutral-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[var(--brand-primary)] rounded-xl flex items-center justify-center">
                  <Users size={22} className="text-white" />
                </div>
                <div>
                  <div className="font-black text-neutral-900 text-lg">+5000</div>
                  <div className="text-sm text-neutral-500">عميل راضٍ</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-[var(--brand-primary)] py-24 mb-24">
        <div className="container-msari">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">قيمنا</h2>
            <p className="text-white/70 text-lg max-w-xl mx-auto">المبادئ التي تحكم كيف نُقدم خدماتنا لكل مسافر</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.values.map((v) => {
              const Icon = ICON_MAP[v.icon] || Shield;
              return (
                <div key={v.title} className="bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 backdrop-blur-sm">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                    <Icon size={24} className="text-white" />
                  </div>
                  <h3 className="text-white font-black text-lg mb-3">{v.title}</h3>
                  <p className="text-white/70 text-sm leading-relaxed">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="container-msari mb-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-neutral-900 mb-4">فريقنا</h2>
          <p className="text-neutral-500 text-lg">نخبة من المحترفين تعمل خلف الكواليس لضمان تجربتك</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {data.team.map((member) => (
            <div key={member.name} className="bg-white rounded-2xl p-8 text-center shadow-md border border-neutral-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="text-5xl mb-4">{member.emoji}</div>
              <h3 className="font-black text-neutral-900 text-xl mb-2">{member.name}</h3>
              <p className="text-neutral-500 font-medium">{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-msari mb-24">
        <div className="bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] rounded-3xl p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <h2 className="text-3xl font-black text-white mb-4 relative z-10">مستعد لسفرتك القادمة؟</h2>
          <p className="text-white/80 text-lg mb-8 relative z-10">احجز الآن واستمتع بأفضل تجربة سفر في اليمن</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <Link href="/hotels" className="btn btn-white">
              تصفح الفنادق
            </Link>
            <Link href="/contact" className="btn btn-outline text-white border-white hover:bg-white hover:text-[var(--brand-primary)]">
              تواصل معنا
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
