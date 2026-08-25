import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getBlogPosts } from '@/actions/blog';
import { Calendar, Clock, ArrowLeft, Sparkles, BookOpen } from 'lucide-react';

export const metadata: Metadata = {
  title: 'مدونة مساري — دليل السفر والفنادق في اليمن والعالم',
  description: 'اكتشف أفضل النصائح، الأدلة السياحية، وترشيحات الفنادق وأسعار الإقامة في عدن، صنعاء، حضرموت، وأشهر الوجهات العالمية.',
  alternates: { canonical: 'https://msari.net/ar/blog' },
  openGraph: {
    title: 'مدونة مساري — دليل السفر والفنادق في اليمن والعالم',
    description: 'اكتشف أفضل النصائح، الأدلة السياحية، وترشيحات الفنادق وأسعار الإقامة في عدن، صنعاء، حضرموت، وأشهر الوجهات العالمية.',
    url: 'https://msari.net/ar/blog',
  },
};

export default async function BlogIndexPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const currentLocale = locale || 'ar';
  const posts = await getBlogPosts();

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      
      {/* ─── 1. Royal Brand Hero Header ─── */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 bg-gradient-to-br from-[#120336] via-[#23096e] to-[#3A1C8F] text-white overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_50%)] pointer-events-none" />
        <div className="absolute -bottom-20 -start-20 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white/90 text-xs sm:text-sm font-bold mb-6 border border-white/15 backdrop-blur-md">
            <Sparkles size={14} className="text-amber-300" />
            <span>أدلة وتجارب السفر في اليمن والعالم</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-4 tracking-tight leading-tight">
            مدونة مساري السياحية
          </h1>

          <p className="text-white/80 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed font-medium">
            استكشف أفضل نصائح السفر، الأدلة السياحية، وأحدث ترشيحات الفنادق وأسعار الإقامة في اليمن والوجهات العالمية.
          </p>
        </div>
      </section>

      {/* ─── 2. Main Articles Grid (Spacious & Clean) ─── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        
        {/* Section Title Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12 pb-6 border-b border-neutral-100">
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-neutral-900 tracking-tight">
              أحدث المقالات والأدلة
            </h2>
            <p className="text-sm text-neutral-500 mt-1">
              مقالات موثوقة ومحدثة للتخطيط لرحلتك القادمة بكل ثقة
            </p>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-neutral-100 text-neutral-700 text-xs font-bold">
            <BookOpen size={14} className="text-[var(--brand-primary)]" />
            <span>{posts.length} مقالات منشورة</span>
          </span>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
          {posts.map((post) => (
            <article
              key={post.id}
              className="group bg-white rounded-3xl overflow-hidden border border-neutral-200/70 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col hover:-translate-y-1"
            >
              {/* Image Container */}
              <Link href={`/${currentLocale}/blog/${post.slug}`} className="block relative aspect-[16/10] overflow-hidden bg-neutral-100">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute top-4 start-4 z-10">
                  <span className="inline-block px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-bold">
                    {post.category}
                  </span>
                </div>
              </Link>

              {/* Card Body */}
              <div className="p-7 flex-1 flex flex-col justify-between">
                <div>
                  {/* Meta Details */}
                  <div className="flex items-center gap-4 text-xs text-neutral-500 mb-3.5 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} className="text-[var(--brand-primary)]" />
                      <span>{post.readTimeMinutes} دقائق قراءة</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-neutral-400" />
                      <span>
                        {new Date(post.publishedAt).toLocaleDateString('ar-YE', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-black text-neutral-900 group-hover:text-[var(--brand-primary)] transition-colors leading-snug line-clamp-2 mb-3">
                    <Link href={`/${currentLocale}/blog/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h3>

                  {/* Excerpt */}
                  <p className="text-sm text-neutral-600 leading-relaxed line-clamp-3 mb-6">
                    {post.excerpt}
                  </p>
                </div>

                {/* Footer Action (Without Author) */}
                <div className="pt-4 border-t border-neutral-100 flex items-center justify-end">
                  <Link
                    href={`/${currentLocale}/blog/${post.slug}`}
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--brand-primary)] group-hover:gap-2.5 transition-all"
                  >
                    <span>اقرأ المقال الكامل</span>
                    <ArrowLeft size={16} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>

    </div>
  );
}
