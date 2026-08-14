import { Metadata } from 'next';
import Link from 'next/link';
import { PagesCmsService } from '@/services/cms/pages.cms';
import { FileText, Shield, Code, Info } from 'lucide-react';

export const metadata: Metadata = {
  title: 'إدارة الصفحات الثابتة — مساري CMS',
};

export default async function AdminPagesPage({ params }: { params: { locale: string } }) {
  const [aboutPage, privacyPage, termsPage, developersPage] = await Promise.all([
    PagesCmsService.getAboutPage(),
    PagesCmsService.getPrivacyPage(),
    PagesCmsService.getTermsPage(),
    PagesCmsService.getDevelopersPage(),
  ]);

  const pages = [
    {
      id: 'about',
      data: aboutPage,
      icon: <Info size={24} className="text-blue-500" />,
      typeBadge: 'content_page',
    },
    {
      id: 'privacy',
      data: privacyPage,
      icon: <Shield size={24} className="text-emerald-500" />,
      typeBadge: 'legal_page',
    },
    {
      id: 'terms',
      data: termsPage,
      icon: <FileText size={24} className="text-amber-500" />,
      typeBadge: 'legal_page',
    },
    {
      id: 'developers',
      data: developersPage,
      icon: <Code size={24} className="text-purple-500" />,
      typeBadge: 'developers_page',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs">
        <h1 className="text-xl sm:text-2xl font-black text-neutral-900 mb-2">إدارة الصفحات الثابتة</h1>
        <p className="text-sm text-neutral-500 font-medium">
          إدارة وتعديل محتوى الصفحات التسويقية والقانونية للموقع.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pages.map((page) => (
          <div
            key={page.id}
            className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs flex flex-col gap-4 hover:border-[#23096E]/30 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-neutral-50 flex items-center justify-center border border-neutral-100">
                  {page.icon}
                </div>
                <div>
                  <h2 className="text-lg font-black text-neutral-900">{page.data.title}</h2>
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-600 mt-1 inline-block">
                    {page.typeBadge}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
              <span className="text-xs text-neutral-400 font-medium">
                تم التحديث: {('lastUpdatedText' in page.data ? (page.data as any).lastUpdatedText : null) || 'غير محدد'}
              </span>
              <Link
                href={`/${params.locale}/admin/pages/${page.id}`}
                className="px-4 py-2 rounded-xl bg-[#23096E]/5 hover:bg-[#23096E]/10 text-[#23096E] text-xs font-bold transition-colors"
              >
                تعديل المحتوى
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
