import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getBlogPosts } from '@/actions/blog';
import { BookOpen, Calendar, Clock, User, ArrowLeft, Tag, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'مدونة مساري | دليل السفر والفنادق في اليمن والعالم',
  description: 'اكتشف أفضل النصائح، الأدلة السياحية، وترشيحات الفنادق في صنعاء، عدن، حضرموت، وكافة المدن اليابسة والعالمية.',
};

export default async function BlogIndexPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const currentLocale = locale || 'ar';
  const posts = await getBlogPosts();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 py-16 sm:py-24 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent opacity-60 pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>دليلك الشامل لخدمات السفر والإقامة</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 text-white">
            مدونة مساري والسياحة
          </h1>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            استكشف أفضل نصائح السفر، الأدلة السياحية، وأحدث ترشيحات الفنادق وأسعار الإقامة في اليمن والوجهات العالمية.
          </p>
        </div>
      </section>

      {/* ─── Main Content ─── */}
      <main className="container mx-auto px-4 py-12 sm:py-16">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">أحدث المقالات والأدلة</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">تصفح المقالات الموصى بها للتخطيط لرحلتك القادمة</p>
          </div>
          <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-900">
            {posts.length} مقالات
          </span>
        </div>

        {/* ─── Articles Grid ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article
              key={post.id}
              className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-200/80 dark:border-slate-800 transition-all duration-300 flex flex-col hover:-translate-y-1"
            >
              {/* Image Container */}
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute top-4 start-4 z-10">
                  <span className="inline-block px-3 py-1 bg-blue-600/90 backdrop-blur-sm text-white text-xs font-semibold rounded-md shadow-sm">
                    {post.category}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  {/* Meta Details */}
                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-blue-500" />
                      {post.readTimeMinutes} دقائق قراءة
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(post.publishedAt).toLocaleDateString('ar-YE', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  {/* Article Title */}
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-3">
                    <Link href={`/${currentLocale}/blog/${post.slug}`} className="focus:outline-none">
                      {post.title}
                    </Link>
                  </h3>

                  {/* Excerpt */}
                  <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed mb-4">
                    {post.excerpt}
                  </p>
                </div>

                {/* Author & Action Link */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{post.authorName}</span>
                  </div>

                  <Link
                    href={`/${currentLocale}/blog/${post.slug}`}
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-[-4px] transition-transform"
                  >
                    <span>اقرأ المقال</span>
                    <ArrowLeft className="w-4 h-4" />
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
