'use client';

import React, { useState, useEffect } from 'react';
import { Download, Star, X } from 'lucide-react';

interface Props {
  isEn?: boolean;
  googlePlayUrl?: string;
  appStoreUrl?: string;
}

export default function AppStickyMobileBar({
  isEn = false,
  googlePlayUrl = 'https://play.google.com/store/apps/details?id=net.msari.app',
  appStoreUrl = 'https://apps.apple.com',
}: Props) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show when scrolled down 300px
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible || isDismissed) return null;

  return (
    <div className="md:hidden fixed bottom-3 inset-x-3 z-50 animate-slide-up">
      <div className="bg-[#1C0657]/95 backdrop-blur-lg border border-white/20 rounded-2xl p-3 shadow-2xl flex items-center justify-between gap-3 text-white">
        
        {/* App Logo & Info */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#FF3B30] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-md">
            م
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-black text-white truncate">{isEn ? 'Msari Travel App' : 'تطبيق مساري الذكي'}</h4>
            <div className="flex items-center gap-1 text-[10px] text-amber-400 font-bold mt-0.5">
              <span>★ 4.8</span>
              <span className="text-white/60">({isEn ? '10k+ Downloads' : '+10 آلاف تحميل'})</span>
            </div>
          </div>
        </div>

        {/* Action Button & Dismiss */}
        <div className="flex items-center gap-1.5 shrink-0">
          <a
            href={googlePlayUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 bg-[#FF3B30] hover:bg-[#d92217] text-white rounded-xl text-xs font-black shadow-lg shadow-[#FF3B30]/30 transition-transform active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isEn ? 'Install' : 'تثبيت مجاناً'}</span>
          </a>

          <button
            onClick={() => setIsDismissed(true)}
            aria-label="Close download bar"
            className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}
