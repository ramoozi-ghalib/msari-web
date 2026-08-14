import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PagesCmsService } from '@/services/cms/pages.cms';
import { CmsClient } from '@/services/cms/cms.client';
import PageEditorForm from './PageEditorForm';

export async function generateMetadata({ params }: { params: { pageId: string } }): Promise<Metadata> {
  const titles: Record<string, string> = {
    about: 'تعديل من نحن',
    privacy: 'تعديل سياسة الخصوصية',
    terms: 'تعديل شروط الاستخدام',
    developers: 'تعديل بوابة المطورين',
  };
  
  return {
    title: `${titles[params.pageId] || 'تعديل الصفحة'} — مساري CMS`,
  };
}

export default async function AdminPageEditorPage({
  params,
}: {
  params: { locale: string; pageId: string };
}) {
  const { pageId } = params;

  if (!['about', 'privacy', 'terms', 'developers'].includes(pageId)) {
    notFound();
  }

  let initialData: any;
  let pageType = '';

  switch (pageId) {
    case 'about':
      initialData = await PagesCmsService.getAboutPage();
      pageType = 'content_page';
      break;
    case 'privacy':
      initialData = await PagesCmsService.getPrivacyPage();
      pageType = 'legal_page';
      break;
    case 'terms':
      initialData = await PagesCmsService.getTermsPage();
      pageType = 'legal_page';
      break;
    case 'developers':
      initialData = await PagesCmsService.getDevelopersPage();
      pageType = 'developers_page';
      break;
  }

  // Check persistence
  const docRef = await CmsClient.getDoc('website_pages', pageId);
  const isPersistedInFirestore = !!docRef;

  return (
    <PageEditorForm
      pageId={pageId as 'about' | 'privacy' | 'terms' | 'developers'}
      pageType={pageType}
      initialData={initialData}
      isPersistedInFirestore={isPersistedInFirestore}
    />
  );
}
