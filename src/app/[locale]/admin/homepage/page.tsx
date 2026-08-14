import type { Metadata } from 'next';
import { HomepageCmsService } from '@/services/cms/homepage.cms';
import { CmsClient } from '@/services/cms/cms.client';
import HomepageEditorForm from './HomepageEditorForm';

export const metadata: Metadata = {
  title: 'محتوى الصفحة الرئيسية — مساري CMS',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminHomepagePage() {
  // Fetch homepage content from CMS service
  const homepageContent = await HomepageCmsService.getHomepageContent();

  // Verify whether the document is physically saved in Firestore or served by fallback
  const rawDoc = await CmsClient.getDoc('website_homepage', 'main');
  const isPersistedInFirestore = Boolean(rawDoc);

  return (
    <HomepageEditorForm
      initialData={homepageContent}
      isPersistedInFirestore={isPersistedInFirestore}
    />
  );
}
