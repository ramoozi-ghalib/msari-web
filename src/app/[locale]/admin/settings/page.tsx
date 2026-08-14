import type { Metadata } from 'next';
import { SettingsCmsService } from '@/services/cms';
import { CmsClient } from '@/services/cms/cms.client';
import SettingsEditorForm from './SettingsEditorForm';

export const metadata: Metadata = {
  title: 'إعدادات الموقع العامة — مساري CMS',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminSettingsPage() {
  // Fetch unified settings from CMS service
  const settings = await SettingsCmsService.getSettings();

  // Verify whether the document is physically saved in Firestore or served by fallback
  const rawDoc = await CmsClient.getDoc('website_settings', 'general');
  const isPersistedInFirestore = Boolean(rawDoc);

  return (
    <SettingsEditorForm
      initialData={settings}
      isPersistedInFirestore={isPersistedInFirestore}
    />
  );
}
