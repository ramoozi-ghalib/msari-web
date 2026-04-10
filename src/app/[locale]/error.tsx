'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#23096e] via-[#2d1580] to-[#3A1C8F] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background circles */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-[#ff3b30]/10 rounded-full blur-3xl" />

      <div className="relative z-10 text-center max-w-lg mx-auto">
        {/* Icon */}
        <div className="w-24 h-24 bg-red-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-red-400/30 backdrop-blur-sm">
          <AlertTriangle size={44} className="text-red-400" />
        </div>

        {/* Text */}
        <h1 className="text-3xl md:text-4xl font-black text-white mb-4">
          حدث خطأ غير متوقع
        </h1>
        <p className="text-white/70 text-base mb-4 leading-relaxed">
          نأسف على هذا الانقطاع. نصيحتنا أن تحاول تحديث الصفحة أو العودة للرئيسية.
        </p>

        {/* Error digest for debugging */}
        {error.digest && (
          <div className="mb-8 px-4 py-2 bg-white/10 rounded-xl border border-white/20 inline-block">
            <span className="text-white/50 text-xs font-mono">رمز الخطأ: {error.digest}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 bg-white text-[#23096e] font-black px-7 py-3.5 rounded-2xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
          >
            <RefreshCw size={18} />
            إعادة المحاولة
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-7 py-3.5 rounded-2xl border border-white/20 transition-all duration-300 hover:-translate-y-1"
          >
            <Home size={18} />
            الصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
