import Image from 'next/image';
import HeroSearch from './HeroSearch';
import type { HomepageContentData } from '@/services/cms';

interface HeroSectionProps {
  hero?: HomepageContentData['hero'];
}

// Fallback محلي محسّن — يُقدَّم تلقائياً عبر next/image (AVIF/WebP) بدل Unsplash البعيد
const FALLBACK_HERO = '/images/hero-bg.jpg';

function isUsableHeroUrl(url?: string) {
  return !!url && url.trim() !== '' && url !== '/images/hero-bg.jpg';
}

function renderHeroTitle(title: string) {
  if (title.includes('مع مساري')) {
    const parts = title.split('مع مساري');
    return (
      <>
        {parts[0]}
        <span className="text-[#FF3B30] drop-shadow-md">مع مساري</span>
        {parts.slice(1).join('مع مساري')}
      </>
    );
  }
  if (title.includes('with Msari')) {
    const parts = title.split('with Msari');
    return (
      <>
        {parts[0]}
        <span className="text-[#FF3B30] drop-shadow-md">with Msari</span>
        {parts.slice(1).join('with Msari')}
      </>
    );
  }
  return title;
}

export default function HeroSection({ hero }: HeroSectionProps) {
  // هجين: CMS أولاً، fallback محلي محسّن ثانياً (قرار المستخدم)
  const bgImage = isUsableHeroUrl(hero?.backgroundImageUrl)
    ? hero!.backgroundImageUrl as string
    : FALLBACK_HERO;

  const heroTitle = hero?.titleAr || 'حجزك أسهل... مع مساري';
  const heroSubtitle = hero?.subtitleAr || 'احجز فندقك في اليمن بأفضل سعر';

  return (
    <div className="relative w-full">

      {/* ── 1. Grand Atmospheric Hero Section ── */}
      <section className="relative overflow-hidden w-full text-white min-h-[360px] sm:min-h-[500px] lg:min-h-[560px] pt-24 sm:pt-36 lg:pt-40 pb-36 sm:pb-44 lg:pb-48 flex flex-col items-center justify-center">

        {/* LCP image — عنصر <img> حقيقي قابل للاكتشاف + priority يُحقن preload تلقائياً */}
        <div className="absolute inset-0">
          <Image
            src={bgImage}
            alt=""
            aria-hidden
            fill
            priority
            fetchPriority="high"
            quality={70}
            sizes="100vw"
            className="object-cover object-center"
          />
          {/* Royal Ambient Gradient Overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, rgba(8,2,26,0.78) 0%, rgba(25,6,77,0.65) 45%, rgba(35,9,110,0.92) 100%)',
            }}
          />
        </div>

        {/* Content Container: Dynamic Headline */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center w-full">

          <div className="text-center space-y-2.5 sm:space-y-4 mb-2">
            {/* Line 1: Dynamic Title with Brand Red Highlight */}
            <h1
              className="font-extrabold text-white whitespace-nowrap leading-tight tracking-tight max-w-full drop-shadow-xl"
              style={{ fontSize: 'clamp(18px, 3.5vw, 28px)' }}
            >
              {renderHeroTitle(heroTitle)}
            </h1>

            {/* Line 2: Dynamic Subtitle */}
            <p
              className="font-semibold text-white/95 whitespace-nowrap leading-tight max-w-full drop-shadow-lg"
              style={{ fontSize: 'clamp(11px, 2vw, 15px)' }}
            >
              {heroSubtitle}
            </p>
          </div>

        </div>
      </section>

      {/* ── 2. Floating Search Console (Client Island) ── */}
      <HeroSearch />

    </div>
  );
}
