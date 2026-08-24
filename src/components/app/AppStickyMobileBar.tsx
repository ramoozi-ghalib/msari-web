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
      <div className="bg-[#1C0657]/95 backdrop-blur-lg border border-white/20 rounded-2xl p-2.5 shadow-2xl flex items-center justify-between gap-2.5 text-white">
        
        {/* App Logo & Info */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#FF3B30] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-md">
            م
          </div>
          <div className="min-w-0">
            <h4 className="text-[11px] font-black text-white truncate">{isEn ? 'Msari Travel App' : 'تطبيق مساري الذكي'}</h4>
            <div className="flex items-center gap-1 text-[9px] text-amber-400 font-bold mt-0.5">
              <span>★ 4.8</span>
              <span className="text-white/70">({isEn ? '5000+ Users' : '+5000 مستخدم'})</span>
            </div>
          </div>
        </div>

        {/* Action Button & Dismiss */}
        <div className="flex items-center gap-1 shrink-0">
          <a
            href={googlePlayUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3.5 py-1.5 bg-[#FF3B30] hover:bg-[#d92217] text-white rounded-xl text-[11px] font-black shadow-md shadow-[#FF3B30]/30 transition-transform active:scale-95"
          >
            <Download className="w-3 h-3" />
            <span>{isEn ? 'Install' : 'تثبيت مجاناً'}</span>
          </a>

          <button
            onClick={() => setIsDismissed(true)}
            aria-label="Close download bar"
            className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-white"
          >
            <X className="w-3 h-3" />
          </button>
        </div>

      </div>
    </div>
  );
}
