'use client';

import { whatsappLink } from '@/lib/site-config';
import type { HomepageContentData } from '@/services/cms';

interface SocialLink {
  name: string;
  nameAr: string;
  href: string;
  icon: (className: string) => React.ReactNode;
  bgGradient: string;
  hoverShadow: string;
  borderAccent: string;
}

interface SocialFollowSectionProps {
  socialFollow?: HomepageContentData['socialFollow'];
}

export default function SocialFollowSection({ socialFollow }: SocialFollowSectionProps) {
  if (socialFollow?.isVisible === false) {
    return null;
  }

  const title = socialFollow?.titleAr || 'صفحاتنا على وسائل التواصل الاجتماعي';
  const subtitle = socialFollow?.subtitleAr || 'تابع مساري وابقَ على اطلاع بأحدث العروض والوجهات السياحية';

  const socialLinks: SocialLink[] = [
    {
      name: 'WhatsApp',
      nameAr: 'واتساب',
      href: socialFollow?.whatsappUrl || whatsappLink(),
      bgGradient: 'from-[#25D366] to-[#128C7E]',
      hoverShadow: 'hover:shadow-[0_12px_25px_rgba(37,211,102,0.4)]',
      borderAccent: 'border-emerald-400/30',
      icon: (cn) => (
        <svg className={cn} viewBox="0 0 24 24" fill="white">
          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.41-1.75-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08s.89 2.41 1.01 2.58c.13.17 1.76 2.68 4.26 3.76.6.26 1.06.41 1.42.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.07-.1-.23-.17-.48-.29z"/>
        </svg>
      ),
    },
    {
      name: 'Facebook',
      nameAr: 'فيسبوك',
      href: socialFollow?.facebookUrl || 'https://facebook.com/msariapp',
      bgGradient: 'from-[#1877F2] to-[#0D5BC6]',
      hoverShadow: 'hover:shadow-[0_12px_25px_rgba(24,119,242,0.4)]',
      borderAccent: 'border-blue-400/30',
      icon: (cn) => (
        <svg className={cn} viewBox="0 0 24 24" fill="white">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
    },
    {
      name: 'Instagram',
      nameAr: 'انستقرام',
      href: socialFollow?.instagramUrl || 'https://instagram.com/msariapp',
      bgGradient: 'from-[#833ab4] via-[#fd1d1d] to-[#fcb045]',
      hoverShadow: 'hover:shadow-[0_12px_25px_rgba(253,29,29,0.4)]',
      borderAccent: 'border-pink-400/30',
      icon: (cn) => (
        <svg className={cn} viewBox="0 0 24 24" fill="white">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
    },
    {
      name: 'TikTok',
      nameAr: 'تيك توك',
      href: socialFollow?.tiktokUrl || 'https://tiktok.com/@msariapp',
      bgGradient: 'from-[#010101] via-[#111111] to-[#010101]',
      hoverShadow: 'hover:shadow-[0_12px_25px_rgba(0,0,0,0.5)]',
      borderAccent: 'border-cyan-400/30',
      icon: (cn) => (
        <svg className={cn} viewBox="0 0 24 24" fill="white">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01v8.43c0 2.07-.67 4.19-2.07 5.75-1.4 1.56-3.47 2.45-5.56 2.45-2.09 0-4.16-.89-5.56-2.45-1.4-1.56-2.07-3.68-2.07-5.75 0-2.07.67-4.19 2.07-5.75 1.4-1.56 3.47-2.45 5.56-2.45.47 0 .94.05 1.4.14v4.12c-.44-.14-.91-.21-1.38-.21-1.08 0-2.15.46-2.87 1.26-.72.8-1.06 1.89-1.06 2.97 0 1.08.34 2.17 1.06 2.97.72.8 1.79 1.26 2.87 1.26 1.08 0 2.15-.46 2.87-1.26.72-.8 1.06-1.89 1.06-2.97V.02z"/>
        </svg>
      ),
    },
    {
      name: 'X',
      nameAr: 'إكس',
      href: socialFollow?.xUrl || 'https://x.com/msariapp',
      bgGradient: 'from-[#000000] via-[#14171A] to-[#000000]',
      hoverShadow: 'hover:shadow-[0_12px_25px_rgba(0,0,0,0.5)]',
      borderAccent: 'border-white/20',
      icon: (cn) => (
        <svg className={cn} viewBox="0 0 24 24" fill="white">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
    },
    {
      name: 'Telegram',
      nameAr: 'تليجرام',
      href: socialFollow?.telegramUrl || 'https://t.me/msariapp',
      bgGradient: 'from-[#2AABEE] to-[#229ED9]',
      hoverShadow: 'hover:shadow-[0_12px_25px_rgba(42,171,238,0.4)]',
      borderAccent: 'border-sky-400/30',
      icon: (cn) => (
        <svg className={cn} viewBox="0 0 24 24" fill="white">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
        </svg>
      ),
    },
  ];

  return (
    <section className="py-8 sm:py-14 bg-white border-t border-neutral-100 overflow-hidden w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-5 sm:mb-8 max-w-xl mx-auto" style={{ direction: 'rtl' }}>
          <h3 className="text-base sm:text-xl font-black text-[var(--brand-primary)] tracking-tight mb-1">
            {title}
          </h3>
          <p className="text-neutral-500 text-[11px] sm:text-sm font-medium">
            {subtitle}
          </p>
        </div>

        {/* ── 6 Social Badges Strictly in 1 Single Horizontal Row (No Wrapping on Mobile) ── */}
        <div className="flex flex-row flex-nowrap items-center justify-center gap-2 xs:gap-3 sm:gap-5 lg:gap-6 w-full max-w-3xl mx-auto px-2">
          {socialLinks.map((social) => (
            <a
              key={social.name}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`group relative flex items-center justify-center w-11 h-11 xs:w-12 xs:h-12 sm:w-16 sm:h-16 lg:w-18 lg:h-18 rounded-xl xs:rounded-2xl sm:rounded-3xl bg-gradient-to-br ${social.bgGradient} border ${social.borderAccent} shadow-md ${social.hoverShadow} hover:-translate-y-1.5 hover:scale-110 active:scale-95 transition-all duration-300 shrink-0`}
              aria-label={social.name}
              title={social.nameAr}
            >
              {/* Responsive Icon */}
              <div className="transform group-hover:scale-110 transition-transform duration-300 flex items-center justify-center">
                {social.icon('w-5 h-5 xs:w-5.5 xs:h-5.5 sm:w-7 sm:h-7')}
              </div>

              {/* Tooltip on Hover */}
              <span className="absolute -bottom-7 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none px-2 py-0.5 rounded-md bg-neutral-900 text-white text-[10px] font-bold shadow-md whitespace-nowrap z-20">
                {social.nameAr}
              </span>
            </a>
          ))}
        </div>

      </div>
    </section>
  );
}
