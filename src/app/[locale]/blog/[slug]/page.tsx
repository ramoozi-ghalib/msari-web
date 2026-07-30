import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getBlogPostBySlug } from '@/actions/blog';
import { 
  ArrowRight, Calendar, Clock, User, Tag, 
  Sparkles, BookOpen, Share2
} from 'lucide-react';

interface BlogDetailPageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return { title: 'المقال غير موجود | مساري' };
  }

  return {
    title: `${post.title} | مدونة مساري`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [{ url: post.coverImage }],
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

  // JSON-LD Article Schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage,
    datePublished: post.publishedAt,
    author: {
      '@type': 'Person',
      name: post.authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: 'مساري (Msari Travel)',
      url: 'https://msari.net',
    },
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ─── Ultra-Clear Article Header ─── */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800/80 py-8 sm:py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back Navigation Button */}
          <Link
            href={`/${currentLocale}/blog`}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors mb-6"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة لجميع الأدلة والمقالات</span>
          </Link>

          {/* Category & Meta Pills */}
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-semibold mb-4">
            <span className="px-3.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
              {post.category}
            </span>
            <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <Clock className="w-4 h-4 text-blue-500" />
              {post.readTimeMinutes} دقائق قراءة
            </span>
            <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <Calendar className="w-4 h-4 text-amber-500" />
              {new Date(post.publishedAt).toLocaleDateString('ar-YE', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>

          {/* Crystal Clear Title */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
            {post.title}
          </h1>
        </div>
      </header>

      {/* ─── Main Article Content ─── */}
      <main className="container mx-auto px-4 max-w-4xl pt-8 sm:pt-10">
        
        {/* Crystal Clear City Cover Image Banner */}
        <div className="relative w-full h-[300px] sm:h-[450px] md:h-[500px] rounded-3xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 mb-10 bg-slate-200 dark:bg-slate-800">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            priority
            className="object-cover object-center"
            sizes="(max-width: 1200px) 100vw, 1200px"
          />
        </div>

        {/* Article Card Body */}
        <article className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-12 shadow-md border border-slate-200/80 dark:border-slate-800/80">
          
          {/* Excerpt Lead Box */}
          <div className="mb-10 p-6 sm:p-8 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border-s-4 border-blue-600 dark:border-blue-500 text-slate-800 dark:text-slate-200 font-semibold text-base sm:text-lg leading-relaxed">
            {post.excerpt}
          </div>

          {/* Readable Typography */}
          <div
            className="prose prose-slate dark:prose-invert max-w-none 
                       prose-h2:text-2xl prose-h2:sm:text-3xl prose-h2:font-black prose-h2:text-slate-900 dark:prose-h2:text-white prose-h2:mt-10 prose-h2:mb-6 prose-h2:border-b prose-h2:border-slate-100 dark:prose-h2:border-slate-800 prose-h2:pb-3
                       prose-h3:text-xl prose-h3:sm:text-2xl prose-h3:font-bold prose-h3:text-blue-900 dark:prose-h3:text-blue-300 prose-h3:mt-8 prose-h3:mb-4
                       prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-p:text-base prose-p:sm:text-lg prose-p:leading-8 prose-p:mb-6 prose-p:font-normal
                       prose-ul:my-6 prose-ul:space-y-3 prose-ul:list-disc prose-ul:ps-6
                       prose-li:text-slate-700 dark:prose-li:text-slate-300 prose-li:text-base prose-li:sm:text-lg prose-li:leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400 me-2 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" />
                الوسوم:
              </span>
              {post.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg border border-slate-200/60 dark:border-slate-700/60"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* ─── Author Info Box at Bottom of Article ─── */}
          <div className="mt-10 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6 bg-slate-50 dark:bg-slate-800/40 p-6 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-md border-2 border-white dark:border-slate-700">
                {post.authorName.slice(0, 1)}
              </div>
              <div>
                <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-0.5">بقلم الكاتب</p>
                <h4 className="text-lg font-extrabold text-slate-900 dark:text-white">{post.authorName}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">محرر وخبير أدلة السفر في منصة مساري</p>
              </div>
            </div>

            <Link
              href={`/${currentLocale}/blog`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span>استعرض كافة المقالات</span>
            </Link>
          </div>
        </article>
      </main>
    </div>
  );
}
