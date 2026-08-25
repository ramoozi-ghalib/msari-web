'use client';

import React from 'react';
import Image from 'next/image';
import { Star, ShieldCheck, Hotel, Sparkles, MapPin, CheckCircle2 } from 'lucide-react';

interface Props {
  headline?: string;
  subheadline?: string;
  badgeText?: string;
}

export default function AuthVisualSide({
  headline = 'اكتشف روعة السفر مع مساري',
  subheadline = 'بوابتك الذكية لحجز أفخم الفنادق والرحلات في اليمن وحول العالم بأفضل الأسعار وأعلى مستويات الراحة والأمان.',
  badgeText = 'منصة السفر الأولى في اليمن',
}: Props) {
  return (
    <div className="relative hidden lg:flex lg:col-span-6 xl:col-span-7 flex-col justify-between overflow-hidden bg-gradient-to-br from-[#1b0654] via-[#23096e] to-[#3A1C8F] p-12 text-white">
      {/* Background Decorative Pattern & Gradient Glows */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_50%)] pointer-events-none" />
      <div className="absolute -bottom-24 -start-24 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -end-24 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Background Destination Photo with Subtle Blend */}
      <div className="absolute inset-0 opacity-25 mix-blend-overlay pointer-events-none">
        <Image
          src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2000&auto=format&fit=crop"
          alt="Luxury Hotel"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Top Section: Badge */}
      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-bold text-white/90 backdrop-blur-md border border-white/15 shadow-sm">
          <Sparkles size={14} className="text-amber-300" />
          <span>{badgeText}</span>
        </div>
      </div>

      {/* Middle Section: Floating Trust Cards & Testimonials */}
      <div className="relative z-10 my-auto py-8 space-y-6 max-w-lg">
        {/* Main Headline */}
        <div>
          <h2 className="text-xl xl:text-2xl font-bold text-white leading-tight mb-2.5 tracking-tight">
            {headline}
          </h2>
          <p className="text-white/80 text-sm xl:text-base leading-relaxed">
            {subheadline}
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          {/* Card 1: 500+ Hotels */}
          <div className="rounded-2xl bg-white/10 backdrop-blur-md p-4 border border-white/15 shadow-lg flex items-start gap-3.5 hover:bg-white/15 transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0">
              <Hotel size={20} />
            </div>
            <div>
              <div className="font-black text-base text-white">+500 فندق</div>
              <div className="text-xs text-white/70">حجز فوري ومؤكد</div>
            </div>
          </div>

          {/* Card 2: Ratings */}
          <div className="rounded-2xl bg-white/10 backdrop-blur-md p-4 border border-white/15 shadow-lg flex items-start gap-3.5 hover:bg-white/15 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center shrink-0">
              <Star size={20} className="fill-emerald-300" />
            </div>
            <div>
              <div className="font-black text-base text-white">4.9 / 5 تقييم</div>
              <div className="text-xs text-white/70">رضا وثقة العملاء</div>
            </div>
          </div>

          {/* Card 3: Secure & Guaranteed */}
          <div className="rounded-2xl bg-white/10 backdrop-blur-md p-4 border border-white/15 shadow-lg flex items-start gap-3.5 hover:bg-white/15 transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-400/20 text-blue-300 flex items-center justify-center shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <div className="font-black text-base text-white">حجز مضمون</div>
              <div className="text-xs text-white/70">تأكيد مباشر ودفع آمن</div>
            </div>
          </div>

          {/* Card 4: Top Destinations */}
          <div className="rounded-2xl bg-white/10 backdrop-blur-md p-4 border border-white/15 shadow-lg flex items-start gap-3.5 hover:bg-white/15 transition-all">
            <div className="w-10 h-10 rounded-xl bg-rose-400/20 text-rose-300 flex items-center justify-center shrink-0">
              <MapPin size={20} />
            </div>
            <div>
              <div className="font-black text-base text-white">كل محافظات اليمن</div>
              <div className="text-xs text-white/70">عدن، صنعاء، حضرموت...</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Footer Trust Statement */}
      <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-white/70">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>بياناتك ومعاملاتك مشفرة ومحمية بالكامل</span>
        </div>
        <span className="font-medium text-white/60">msari.net</span>
      </div>
    </div>
  );
}
