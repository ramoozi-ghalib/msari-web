import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getBlogPostBySlug } from '@/actions/blog';
import { 
  ArrowRight, Calendar, Clock, 
  Compass, Hotel, MessageCircle, Share2, Check
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
    <div className="min-h-screen bg-white text-neutral-900 pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />

      {/* ─── 1. Spacious Clean Article Header ─── */}
      <header className="pt-32 pb-12 sm:pt-40 sm:pb-16 bg-[#fafafc] border-b border-neutral-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          
          {/* Back to Blog Breadcrumb */}
          <div className="mb-6">
            <Link
              href={`/${currentLocale}/blog`}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[var(--brand-primary)] hover:opacity-80 transition-opacity"
            >
              <ArrowRight size={16} />
              <span>العودة إلى جميع مقالات وأدلة السفر</span>
            </Link>
          </div>

          {/* Category Pill */}
          <div className="mb-4">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] text-xs sm:text-sm font-bold">
              {post.category}
            </span>
          </div>

          {/* Large Editorial Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-neutral-900 leading-[1.35] tracking-tight mb-8">
            {post.title}
          </h1>

          {/* Clear Metadata Bar (Below Title) */}
          <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-neutral-200/60 text-xs sm:text-sm text-neutral-500 font-semibold">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-[var(--brand-primary)]" />
              <span>تاريخ النشر: {formattedDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-[var(--brand-primary)]" />
              <span>وقت القراءة: {post.readTimeMinutes} دقائق</span>
            </div>
          </div>

        </div>
      </header>

      {/* ─── 2. Main Article Content Container ─── */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16">
        
        {/* Full-Width Featured Cover Image */}
        <div className="relative w-full h-[340px] sm:h-[480px] md:h-[540px] rounded-3xl overflow-hidden shadow-lg border border-neutral-100 mb-14 bg-neutral-100">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            priority
            className="object-cover object-center"
            sizes="(max-width: 1200px) 100vw, 1200px"
          />
        </div>

        {/* Lead Excerpt Callout (High-Readability Editorial Quote) */}
        {post.excerpt && (
          <div className="mb-14 p-7 sm:p-9 rounded-3xl bg-[#fafafc] border-s-4 border-[var(--brand-primary)] text-neutral-800 font-semibold text-lg sm:text-xl leading-[2.2] shadow-sm">
            {post.excerpt}
          </div>
        )}

        {/* ─── Luxury Editorial Typography Body (Explicit CSS Powered) ─── */}
        <article
          className="editorial-article-body"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
        />

        {/* ─── 3. Travel Booking CTA Box (Luxury Brand Card) ─── */}
        <div className="mt-20 rounded-3xl bg-gradient-to-br from-[#120336] via-[#23096e] to-[#3A1C8F] text-white p-8 sm:p-12 shadow-xl space-y-6">
          <div className="flex items-center gap-2.5 text-amber-300 text-sm font-bold">
            <Compass size={20} />
            <span>خطط لرحلتك القادمة مع مساري</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
            هل تخطط لزيارة هذه الوجهة أو استكشاف الفنادق المتاحة؟
          </h3>

          <p className="text-white/80 text-sm sm:text-base leading-[2] max-w-2xl font-medium">
            استعرض أوسع شبكة فنادق معتمدة في اليمن وخيارات الدفع المرنة بالريال اليمني، السعودي والدولار، مع تأكيد حجز فوري ومضمون ودعم محلي 24 ساعة.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
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

        {/* ─── 4. Navigation Footer ─── */}
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
