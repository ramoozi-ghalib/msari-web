import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getBlogPostBySlug } from '@/actions/blog';
import { 
  ArrowRight, Calendar, Clock, Tag, 
  Sparkles, BookOpen, Share2, Compass, Hotel, MessageCircle
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

      {/* ─── 1. Spacious Editorial Header ─── */}
      <header className="pt-32 pb-12 sm:pt-40 sm:pb-16 bg-[#fafafc] border-b border-neutral-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          
          {/* Back to Blog Breadcrumb */}
          <Link
            href={`/${currentLocale}/blog`}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[var(--brand-primary)] hover:opacity-80 transition-opacity mb-8"
          >
            <ArrowRight size={16} />
            <span>العودة إلى جميع مقالات المدونة</span>
          </Link>

          {/* Meta Badges (Category, Read Time, Date - NO AUTHOR) */}
          <div className="flex flex-wrap items-center gap-3.5 text-xs sm:text-sm text-neutral-500 font-semibold mb-6">
            <span className="px-3 py-1 rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] text-xs font-bold">
              {post.category}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={15} className="text-[var(--brand-primary)]" />
              <span>{post.readTimeMinutes} دقائق قراءة</span>
            </span>
            <span className="text-neutral-300">•</span>
            <span className="flex items-center gap-1.5">
              <Calendar size={15} className="text-neutral-400" />
              <span>{formattedDate}</span>
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-neutral-900 leading-[1.3] tracking-tight">
            {post.title}
          </h1>
        </div>
      </header>

      {/* ─── 2. Main Article Body ─── */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14">
        
        {/* Featured Cover Image */}
        <div className="relative w-full h-[320px] sm:h-[460px] md:h-[500px] rounded-3xl overflow-hidden shadow-lg border border-neutral-100 mb-12 bg-neutral-100">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            priority
            className="object-cover object-center"
            sizes="(max-width: 1200px) 100vw, 1200px"
          />
        </div>

        {/* Lead Excerpt Box (Airy and Distinct) */}
        {post.excerpt && (
          <div className="mb-12 p-6 sm:p-8 rounded-2xl bg-[#fafafc] border-s-4 border-[var(--brand-primary)] text-neutral-800 font-medium text-base sm:text-xl leading-[2] shadow-sm">
            {post.excerpt}
          </div>
        )}

        {/* ─── Editorial Article Content with Generous Typography ─── */}
        <article
          className="prose prose-neutral max-w-none 
                     prose-h2:text-2xl prose-h2:sm:text-3xl prose-h2:font-black prose-h2:text-neutral-900 prose-h2:mt-14 prose-h2:mb-6 prose-h2:pt-8 prose-h2:border-t prose-h2:border-neutral-100 prose-h2:leading-snug
                     prose-h3:text-xl prose-h3:sm:text-2xl prose-h3:font-black prose-h3:text-[var(--brand-primary)] prose-h3:mt-10 prose-h3:mb-4 prose-h3:leading-snug
                     prose-p:text-neutral-700 prose-p:text-base prose-p:sm:text-lg prose-p:leading-[2.2] prose-p:mb-8 prose-p:font-normal
                     prose-ul:my-8 prose-ul:space-y-4 prose-ul:list-disc prose-ul:ps-6
                     prose-li:text-neutral-700 prose-li:text-base prose-li:sm:text-lg prose-li:leading-[2.0]
                     prose-strong:font-black prose-strong:text-neutral-900
                     prose-a:text-[var(--brand-primary)] prose-a:font-bold prose-a:underline hover:prose-a:opacity-80"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
        />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-14 pt-8 border-t border-neutral-100 flex flex-wrap items-center gap-2.5">
            <span className="text-xs font-bold text-neutral-400 me-2 flex items-center gap-1">
              <Tag size={14} />
              <span>الكلمات المفتاحية:</span>
            </span>
            {post.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-3.5 py-1.5 bg-[#fafafc] text-neutral-700 text-xs font-semibold rounded-xl border border-neutral-200/70"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* ─── 3. Travel Booking CTA Box (Replaces Author Box) ─── */}
        <div className="mt-14 rounded-3xl bg-gradient-to-br from-[#120336] via-[#23096e] to-[#3A1C8F] text-white p-8 sm:p-10 shadow-xl space-y-6">
          <div className="flex items-center gap-3 text-amber-300 text-sm font-bold">
            <Compass size={20} />
            <span>خطط لرحلتك القادمة مع مساري</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
            هل تخطط لزيارة هذه الوجهة أو استكشاف الفنادق المتاحة؟
          </h3>

          <p className="text-white/80 text-sm sm:text-base leading-relaxed max-w-xl">
            استعرض أوسع شبكة فنادق معتمدة في اليمن وخيارات الدفع المرنة بالريال اليمني، السعودي والدولار، مع تأكيد حجز فوري ومضمون.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/hotels"
              className="px-6 py-3 rounded-xl bg-white text-[var(--brand-primary)] hover:bg-neutral-100 font-bold text-sm transition-all shadow-md inline-flex items-center gap-2"
            >
              <Hotel size={16} />
              <span>تصفح الفنادق المتاحة</span>
            </Link>

            <Link
              href="/contact"
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-all inline-flex items-center gap-2"
            >
              <MessageCircle size={16} />
              <span>تواصل مع خدمة العملاء</span>
            </Link>
          </div>
        </div>

        {/* ─── 4. Navigation Footer ─── */}
        <div className="mt-12 pt-8 border-t border-neutral-100 flex items-center justify-between">
          <Link
            href={`/${currentLocale}/blog`}
            className="inline-flex items-center gap-2 text-sm font-bold text-[var(--brand-primary)] hover:opacity-80 transition-all"
          >
            <ArrowRight size={16} />
            <span>العودة إلى كافة المقالات والأدلة</span>
          </Link>

          <span className="text-xs text-neutral-400 font-medium">
            منصة مساري لخدمات السفر والسياحة
          </span>
        </div>

      </main>
    </div>
  );
}
