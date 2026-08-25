import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getBlogPostBySlug } from '@/actions/blog';
import { 
  ArrowRight, Calendar, Clock, 
  Compass, Hotel, MessageCircle, ChevronRight
} from 'lucide-react';
import { sanitizeHtml, safeJsonLd } from '@/lib/sanitize';

interface BlogDetailPageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return { title: 'المقال غير موجود — مساري' };
  }

  return {
    title: `${post.title} — مدونة مساري`,
    description: post.excerpt,
    alternates: { canonical: `https://msari.net/ar/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [{ url: post.coverImage }],
      url: `https://msari.net/ar/blog/${post.slug}`,
    },
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug, locale } = await params;
  const currentLocale = locale || 'ar';
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Structured Article Schema (Published by Msari Travel)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage,
    datePublished: post.publishedAt,
    publisher: {
      '@type': 'Organization',
      name: 'مساري (Msari Travel)',
      url: 'https://msari.net',
      logo: {
        '@type': 'ImageObject',
        url: 'https://msari.net/logo.png',
      },
    },
  };

  const formattedDate = new Date(post.publishedAt).toLocaleDateString('ar-YE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-white text-neutral-900 pb-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />

      {/* ─── 1. Cinematic Hero Section (Official Cover Image as Hero) ─── */}
      <section className="pt-24 sm:pt-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        {/* Top Floating Navigation Bar */}
        <div className="flex items-center justify-between py-4 mb-4">
          <Link
            href={`/${currentLocale}/blog`}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-neutral-600 hover:text-[var(--brand-primary)] transition-colors group"
          >
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform rtl:rotate-0" />
            <span>العودة إلى جميع مقالات وأدلة السفر</span>
          </Link>

          <span className="text-xs font-semibold text-neutral-400 hidden sm:inline-block">
            دليل سياحي رسمي معتمد
          </span>
        </div>

        {/* Cinematic Cover Image Hero Canvas */}
        <div className="relative w-full h-[360px] sm:h-[500px] md:h-[580px] lg:h-[640px] rounded-3xl sm:rounded-[2.5rem] overflow-hidden shadow-2xl bg-neutral-950 border border-neutral-200/60">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            priority
            className="object-cover object-center"
            sizes="(max-width: 1400px) 100vw, 1400px"
          />
          {/* Artistic Ambient Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />
          
          {/* Floating Category Badge inside Hero Corner */}
          <div className="absolute bottom-6 start-6 sm:bottom-8 sm:start-8 z-10">
            <span className="inline-block px-4 py-2 rounded-2xl bg-white/90 backdrop-blur-md text-[var(--brand-primary)] text-xs sm:text-sm font-black shadow-lg border border-white/40">
              {post.category}
            </span>
          </div>
        </div>
      </section>

      {/* ─── 2. Article Title & Metadata Section (Directly Below the Hero) ─── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-8">
        
        {/* Large Artistic Headline */}
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-neutral-900 leading-[1.3] tracking-tight mb-5">
          {post.title}
        </h1>

        {/* Clean Metadata Strip */}
        <div className="flex flex-wrap items-center gap-6 pb-8 border-b border-neutral-100 text-xs sm:text-sm text-neutral-500 font-semibold">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-[var(--brand-primary)]" />
            <span>تاريخ النشر: {formattedDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-[var(--brand-primary)]" />
            <span>وقت القراءة: {post.readTimeMinutes} دقائق</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-600 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>محتوى مدقق ومحدث 2026</span>
          </div>
        </div>
      </section>

      {/* ─── 3. Main Editorial Reading Canvas ─── */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        
        {/* Lead Excerpt Callout */}
        {post.excerpt && (
          <div className="mb-14 p-7 sm:p-10 rounded-3xl bg-[#fafafc] border-s-4 border-[var(--brand-primary)] text-neutral-800 font-semibold text-lg sm:text-2xl leading-[2.2] shadow-sm">
            {post.excerpt}
          </div>
        )}

        {/* ─── Luxury Editorial Typography Body (Explicit CSS Powered) ─── */}
        <article
          className="editorial-article-body"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
        />

        {/* ─── 4. Travel Booking CTA Box (Luxury Brand Card) ─── */}
        <div className="mt-20 rounded-3xl bg-gradient-to-br from-[#120336] via-[#23096e] to-[#3A1C8F] text-white p-8 sm:p-12 shadow-xl space-y-6 relative overflow-hidden">
          {/* Subtle Ambient Lighting */}
          <div className="absolute top-0 end-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-2.5 text-amber-300 text-sm font-bold relative z-10">
            <Compass size={20} />
            <span>خطط لرحلتك القادمة مع مساري</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug relative z-10">
            هل تخطط لزيارة هذه الوجهة أو استكشاف الفنادق المتاحة؟
          </h3>

          <p className="text-white/80 text-sm sm:text-base leading-[2] max-w-2xl font-medium relative z-10">
            استعرض أوسع شبكة فنادق معتمدة في اليمن وخيارات الدفع المرنة بالريال اليمني، السعودي والدولار، مع تأكيد حجز فوري ومضمون ودعم محلي 24 ساعة.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2 relative z-10">
            <Link
              href="/hotels"
              className="px-7 py-3.5 rounded-xl bg-white text-[var(--brand-primary)] hover:bg-neutral-100 font-bold text-sm transition-all shadow-md inline-flex items-center gap-2"
            >
              <Hotel size={16} />
              <span>تصفح الفنادق المتاحة</span>
            </Link>

            <Link
              href="/contact"
              className="px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-all inline-flex items-center gap-2"
            >
              <MessageCircle size={16} />
              <span>تواصل مع خدمة العملاء</span>
            </Link>
          </div>
        </div>

        {/* ─── 5. Navigation Footer ─── */}
        <div className="mt-14 pt-8 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href={`/${currentLocale}/blog`}
            className="inline-flex items-center gap-2 text-sm font-bold text-[var(--brand-primary)] hover:opacity-80 transition-all"
          >
            <ArrowRight size={16} />
            <span>العودة إلى كافة المقالات والأدلة السياحية</span>
          </Link>

          <span className="text-xs text-neutral-400 font-medium">
            منصة مساري لخدمات السفر والسياحة
          </span>
        </div>

      </main>
    </div>
  );
}
