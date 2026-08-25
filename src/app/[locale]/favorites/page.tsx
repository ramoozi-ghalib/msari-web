'use client';

import Link from 'next/link';
import { Heart, Hotel, ArrowRight } from 'lucide-react';

export default function FavoritesPage() {
  return (
    <div className="min-h-screen bg-[#f8f8fa]">

      {/* Hero */}
      <section className="relative pt-28 pb-16 bg-gradient-to-br from-[#23096e] to-[#3A1C8F]">
        <div className="container-msari text-center">
          <div className="w-16 h-16 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Heart size={32} className="text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white mb-2">المفضلة</h1>
          <p className="text-white/80 text-xs sm:text-sm max-w-md mx-auto">
            احفظ الفنادق المفضلة لديك وارجع إليها في أي وقت
          </p>
        </div>
      </section>

      {/* Empty State */}
      <section className="container-msari py-24 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Heart size={30} className="text-neutral-300" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-neutral-900 mb-2.5">لا توجد عناصر محفوظة بعد</h2>
          <p className="text-neutral-500 text-xs sm:text-sm mb-8 leading-relaxed">
            عند تصفحك للفنادق، اضغط على أيقونة القلب 🤍 لإضافتها إلى مفضلتك وتجدها هنا دائماً.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/hotels" className="btn btn-primary gap-2">
              <Hotel size={18} />
              تصفح الفنادق
            </Link>
            <Link href="/" className="btn btn-outline gap-2">
              <ArrowRight size={18} className="rtl:rotate-180" />
              الصفحة الرئيسية
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
