import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DestinationsCmsService } from '@/services/cms/destinations.cms';
import { CmsClient } from '@/services/cms/cms.client';
import DestinationEditorForm from './DestinationEditorForm';
import { MapPin } from 'lucide-react';

export async function generateMetadata({ params: { slug } }: { params: { slug: string } }): Promise<Metadata> {
  return {
    title: `تعديل وجهة: ${slug} — مساري CMS`,
  };
}

export default async function DestinationEditorPage({
  params: { slug, locale },
}: {
  params: { slug: string; locale: string };
}) {
  if (!slug) {
    notFound();
  }

  // 1. Fetch from caching service
  const serviceData = await DestinationsCmsService.getEditorialGuide(slug);
  
  // 2. Also check if it physically exists in Firestore (as service might fall back to local JSON)
  const rawData = await CmsClient.getDoc('website_destinations', slug);
  const isPersistedInFirestore = !!rawData;

  // For the form, we can pass serviceData, or an empty default if both fail.
  // We'll prepare it.
  const initialData = serviceData || null;

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-[#23096E]/10 p-2 rounded-xl text-[#23096E]">
            <MapPin className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-black text-neutral-900">
            تعديل وجهة: <span className="text-[#23096E] font-mono">{slug}</span>
          </h1>
        </div>
        <p className="text-sm text-neutral-500">
          إدارة المحتوى الوصفي والتسويقي للوجهة. هذا المحتوى مستقل عن بيانات الفنادق والرحلات.
        </p>
      </div>

      <DestinationEditorForm 
        slug={slug} 
        initialData={initialData} 
        isPersistedInFirestore={isPersistedInFirestore} 
      />
    </div>
  );
}
