'use client';

import { useState } from 'react';
import {
  Smartphone, Save, CheckCircle2, Star, Download, Building2,
  Headphones, Link as LinkIcon, Image as ImageIcon, Sparkles, AlertCircle
} from 'lucide-react';

export default function AppLandingAdminClient() {
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Editable Form State
  const [formData, setFormData] = useState({
    // Hero Section
    badge: 'تطبيق مساري الذكي للجوال',
    title: 'سفرك بأكمله في جيبك — حمّل تطبيق مساري الآن',
    subtitle: 'احجز أفضل فنادق اليمن وقارن أسعار الفنادق العالمية ورحلات الطيران والسيارات بسهولة بضغطة زر واحدة.',
    
    // Store Links
    googlePlayUrl: 'https://play.google.com/store/apps/details?id=net.msari.app',
    appStoreUrl: 'https://apps.apple.com',

    // Stats Section
    downloads: '5000+',
    rating: '4.0',
    hotels: '100+',
    support: '24/7',

    // Phone Screenshots Images
    heroPhoneImage1: 'https://firebasestorage.googleapis.com/v0/b/msariapp-v2.firebasestorage.app/o/hotels%2FIOfiz4EpAILtuN0nc7zg%2Fimg_0.jpg?alt=media&token=2b00ded4-8b95-4efe-bc46-62e0ebdb178e',
    heroPhoneImage2: 'https://firebasestorage.googleapis.com/v0/b/msariapp-v2.firebasestorage.app/o/hotels%2FBmS2C5c4z23UfUv3T0oG%2Fimg_0.jpg?alt=media&token=7fa51dd1-b3b3-4f05-8968-3f596a77d542',

    // Tab Screenshots Showcase Images
    tab1Image: 'https://firebasestorage.googleapis.com/v0/b/msariapp-v2.firebasestorage.app/o/hotels%2FBmS2C5c4z23UfUv3T0oG%2Fimg_0.jpg?alt=media&token=7fa51dd1-b3b3-4f05-8968-3f596a77d542',
    tab2Image: 'https://firebasestorage.googleapis.com/v0/b/msariapp-v2.firebasestorage.app/o/hotels%2FIOfiz4EpAILtuN0nc7zg%2Fimg_0.jpg?alt=media&token=2b00ded4-8b95-4efe-bc46-62e0ebdb178e',
    tab3Image: 'https://firebasestorage.googleapis.com/v0/b/msariapp-v2.firebasestorage.app/o/hotels%2FIOfiz4EpAILtuN0nc7zg%2Fimg_1.jpg?alt=media&token=d33cdf0e-18fb-4dbe-ac1c-0ad1bbb78ef7',
    tab4Image: 'https://firebasestorage.googleapis.com/v0/b/msariapp-v2.firebasestorage.app/o/hotels%2FBmS2C5c4z23UfUv3T0oG%2Fimg_1.jpg?alt=media&token=e110c710-53ab-453d-8e43-ef4675e4eeb0',

    // CTA Banner
    ctaTitle: 'جاهز لتجربة حجز فريدة وسريعة؟',
    ctaSubtitle: 'حمل تطبيق مساري الآن وانطلق في رحلتك القادمة بكل راحة وأمان.',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // Save to LocalStorage / State for real-time persistence
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('msari_app_landing_settings', JSON.stringify(formData));
      }
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    }, 800);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#23096e]/10 border border-[#23096e]/20 rounded-2xl flex items-center justify-center text-[#23096e]">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-neutral-900">إدارة محتوى صفحة التطبيق (App Landing Page)</h1>
            <p className="text-xs text-neutral-500 font-medium">التحكم الكامل بنصوص وإحصائيات ورابط المتاجر وصور شاشات الهاتف من الداشبورد</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center justify-center gap-2 bg-[#23096e] hover:bg-[#160549] text-white px-6 py-3 rounded-2xl font-extrabold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50"
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          <span>{isSaving ? 'جاري الحفظ...' : 'حفظ التغيرات'}</span>
        </button>
      </div>

      {/* Success Notification Alert */}
      {saveSuccess && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl animate-fade-in shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-sm font-bold">تم حفظ جميع إعدادات ومحتويات صفحة التطبيق بنجاح!</p>
        </div>
      )}

      {/* Form Form Sections */}
      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Section 1: Main Hero Content & Badges */}
        <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-neutral-100 pb-4 text-[#23096e]">
            <Sparkles className="w-5 h-5" />
            <h2 className="text-lg font-black">1. محتوى قسم الهيرو الرئيسي (Hero Section)</h2>
          </div>

          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className="block text-xs font-extrabold text-neutral-700 mb-2">شريط الترحيب (Badge Text)</label>
              <input
                type="text"
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-sm focus:bg-white focus:border-[#23096e] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-neutral-700 mb-2">العنوان الرئيسي (Headline)</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-sm focus:bg-white focus:border-[#23096e] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-neutral-700 mb-2">الوصف التوضيحي (Subtitle)</label>
              <textarea
                rows={3}
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl font-medium text-sm focus:bg-white focus:border-[#23096e] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Statistics & Ratings */}
        <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-neutral-100 pb-4 text-[#23096e]">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <h2 className="text-lg font-black">2. إحصائيات الصفحة والتقييم (Statistics & Ratings)</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div>
              <label className="block text-xs font-extrabold text-neutral-700 mb-2">عدد عمليات التحميل</label>
              <input
                type="text"
                value={formData.downloads}
                onChange={(e) => setFormData({ ...formData, downloads: e.target.value })}
                placeholder="5000+"
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-sm focus:bg-white focus:border-[#23096e] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-neutral-700 mb-2">تقييم المستخدمين (0 - 5.0)</label>
              <input
                type="text"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                placeholder="4.0"
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-sm focus:bg-white focus:border-[#23096e] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-neutral-700 mb-2">عدد الفنادق المتاحة</label>
              <input
                type="text"
                value={formData.hotels}
                onChange={(e) => setFormData({ ...formData, hotels: e.target.value })}
                placeholder="100+"
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-sm focus:bg-white focus:border-[#23096e] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-neutral-700 mb-2">توفر الدعم الفني</label>
              <input
                type="text"
                value={formData.support}
                onChange={(e) => setFormData({ ...formData, support: e.target.value })}
                placeholder="24/7"
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-sm focus:bg-white focus:border-[#23096e] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: App Store Links */}
        <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-neutral-100 pb-4 text-[#23096e]">
            <LinkIcon className="w-5 h-5" />
            <h2 className="text-lg font-black">3. روابط المتاجر المباشرة (App Store Links)</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-extrabold text-neutral-700 mb-2">رابط Google Play Store</label>
              <input
                type="url"
                value={formData.googlePlayUrl}
                onChange={(e) => setFormData({ ...formData, googlePlayUrl: e.target.value })}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl font-semibold text-xs focus:bg-white focus:border-[#23096e] outline-none"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-neutral-700 mb-2">رابط Apple App Store</label>
              <input
                type="url"
                value={formData.appStoreUrl}
                onChange={(e) => setFormData({ ...formData, appStoreUrl: e.target.value })}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl font-semibold text-xs focus:bg-white focus:border-[#23096e] outline-none"
                dir="ltr"
              />
            </div>
          </div>
        </div>

        {/* Section 4: App Phone Screenshots */}
        <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-neutral-100 pb-4 text-[#23096e]">
            <ImageIcon className="w-5 h-5" />
            <h2 className="text-lg font-black">4. صور شاشات الجوال الواقعية (Real App Screenshots)</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-extrabold text-neutral-700 mb-2">صورة الهاتف الرئيسية (Hero Front Screen)</label>
              <input
                type="text"
                value={formData.heroPhoneImage1}
                onChange={(e) => setFormData({ ...formData, heroPhoneImage1: e.target.value })}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl font-mono text-xs focus:bg-white focus:border-[#23096e] outline-none"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-neutral-700 mb-2">صورة الهاتف الخلفية (Hero Back Screen)</label>
              <input
                type="text"
                value={formData.heroPhoneImage2}
                onChange={(e) => setFormData({ ...formData, heroPhoneImage2: e.target.value })}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl font-mono text-xs focus:bg-white focus:border-[#23096e] outline-none"
                dir="ltr"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-neutral-100">
            <div>
              <label className="block text-xs font-extrabold text-neutral-700 mb-2">شاشة التبويب 1 (الرئيسية والبحث)</label>
              <input
                type="text"
                value={formData.tab1Image}
                onChange={(e) => setFormData({ ...formData, tab1Image: e.target.value })}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl font-mono text-xs focus:bg-white focus:border-[#23096e] outline-none"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-neutral-700 mb-2">شاشة التبويب 2 (تفاصيل الفندق)</label>
              <input
                type="text"
                value={formData.tab2Image}
                onChange={(e) => setFormData({ ...formData, tab2Image: e.target.value })}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl font-mono text-xs focus:bg-white focus:border-[#23096e] outline-none"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-neutral-700 mb-2">شاشة التبويب 3 (تأكيد الحجز)</label>
              <input
                type="text"
                value={formData.tab3Image}
                onChange={(e) => setFormData({ ...formData, tab3Image: e.target.value })}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl font-mono text-xs focus:bg-white focus:border-[#23096e] outline-none"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-neutral-700 mb-2">شاشة التبويب 4 (إدارة الحجوزات)</label>
              <input
                type="text"
                value={formData.tab4Image}
                onChange={(e) => setFormData({ ...formData, tab4Image: e.target.value })}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl font-mono text-xs focus:bg-white focus:border-[#23096e] outline-none"
                dir="ltr"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Footer CTA Banner */}
        <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-neutral-100 pb-4 text-[#23096e]">
            <Download className="w-5 h-5" />
            <h2 className="text-lg font-black">5. بنر التحويل الختامي (Footer CTA Banner)</h2>
          </div>

          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className="block text-xs font-extrabold text-neutral-700 mb-2">عنوان بنر التحويل (CTA Title)</label>
              <input
                type="text"
                value={formData.ctaTitle}
                onChange={(e) => setFormData({ ...formData, ctaTitle: e.target.value })}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-sm focus:bg-white focus:border-[#23096e] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-neutral-700 mb-2">الوصف الختامي (CTA Subtitle)</label>
              <input
                type="text"
                value={formData.ctaSubtitle}
                onChange={(e) => setFormData({ ...formData, ctaSubtitle: e.target.value })}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl font-medium text-sm focus:bg-white focus:border-[#23096e] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit Button Bar */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center justify-center gap-2 bg-[#23096e] hover:bg-[#160549] text-white px-8 py-4 rounded-2xl font-black text-base transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            <span>{isSaving ? 'جاري الحفظ...' : 'حفظ التغيرات'}</span>
          </button>
        </div>

      </form>
    </div>
  );
}
