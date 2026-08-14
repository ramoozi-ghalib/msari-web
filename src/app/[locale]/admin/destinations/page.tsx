import { Metadata } from 'next';
import Link from 'next/link';
import { CmsClient } from '@/services/cms/cms.client';
import { MapPin, Edit3 } from 'lucide-react';
import { getDestinationData } from '@/data/destinations'; // Just to get list of cities maybe?

export const metadata: Metadata = {
  title: 'إدارة الوجهات السياحية — مساري CMS',
};

export default async function DestinationsAdminPage({ params: { locale } }: { params: { locale: string } }) {
  // Fetch existing editorial records
  const existingDocs = await CmsClient.getCollection<any>('website_destinations');
  
  // Create a map to quickly see what is saved in DB
  const dbSlugs = new Set(existingDocs.map((doc: any) => doc.id || doc.slug));

  // The actual operational list of cities is not available directly unless I fetch it from destinations or use hardcoded. 
  // Let's just list what's in DB for now, but also provide a way to edit typical ones if needed?
  // Wait, the prompt says: "Fetch all documents from website_destinations... Show cards for each destination with: name (slug), tagline, edit link, status... If no destinations found, show empty state with message".
  
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-[#23096E]">إدارة الوجهات السياحية</h1>
          <p className="text-sm text-neutral-500 mt-1">
            إدارة المحتوى التسويقي والوصفي للوجهات السياحية.
          </p>
        </div>
      </div>

      {existingDocs.length === 0 ? (
        <div className="bg-white border border-neutral-200/80 rounded-3xl p-12 text-center flex flex-col items-center">
          <MapPin className="w-16 h-16 text-neutral-300 mb-4" />
          <h2 className="text-lg font-bold text-neutral-700 mb-2">لا توجد وجهات مسجلة</h2>
          <p className="text-neutral-500 max-w-sm mx-auto mb-6">
            لم يتم إضافة محتوى وصفي لأي وجهة بعد. يمكنك إضافة محتوى بالانتقال إلى الرابط المباشر للوجهة مثل (sanaa).
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {existingDocs.map((doc) => {
            const docSlug = doc.id || doc.slug;
            return (
              <div key={docSlug} className="bg-white border border-neutral-200/80 rounded-3xl overflow-hidden hover:border-[#23096E]/50 transition-colors">
                {doc.heroImage ? (
                  <div 
                    className="h-32 bg-cover bg-center" 
                    style={{ backgroundImage: `url(${doc.heroImage})` }} 
                  />
                ) : (
                  <div className="h-32 bg-neutral-100 flex items-center justify-center">
                    <MapPin className="w-8 h-8 text-neutral-300" />
                  </div>
                )}
                
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-neutral-900 mb-1">{doc.cityId || docSlug}</h3>
                      <p className="text-xs text-neutral-500 font-medium font-mono bg-neutral-100 px-2 py-1 rounded-md inline-block">
                        {docSlug}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                      doc.isPublished || doc.status === 'published' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {doc.isPublished || doc.status === 'published' ? 'منشور' : 'مسودة'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-neutral-600 line-clamp-2 mt-3 min-h-[40px]">
                    {doc.tagline || 'لا يوجد وصف مختصر'}
                  </p>
                  
                  <div className="mt-5 flex justify-end">
                    <Link
                      href={`/${locale}/admin/destinations/${docSlug}`}
                      className="inline-flex items-center gap-2 text-sm font-bold text-[#23096E] bg-neutral-50 px-4 py-2 rounded-xl hover:bg-neutral-100 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                      تعديل المحتوى
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
