import Link from 'next/link';
import {
  Settings,
  ShieldCheck,
  Globe,
  ArrowLeft,
  Sparkles,
  Phone,
  Layers,
  FileText,
  MapPin,
} from 'lucide-react';
import { SettingsCmsService } from '@/services/cms';
import { getCurrentUser } from '@/lib/session';

interface AdminPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function AdminDashboardPage({ params }: AdminPageProps) {
  const { locale } = await params;
  const user = await getCurrentUser();
  const settings = await SettingsCmsService.getSettings();

  const activeModules = [
    {
      id: 'CMS-01',
      title: 'إعدادات الموقع العامة',
      desc: 'بيانات التواصل، واتساب، البريد القانوني، ساعات العمل، وروابط التطبيقات.',
      icon: Settings,
      href: `/${locale}/admin/settings`,
      source: 'website_settings/general',
    },
    {
      id: 'CMS-02',
      title: 'محرر الصفحة الرئيسية',
      desc: 'عنوان الهيرو، النصوص التسويقية، قسم لماذا مساري، بنر التطبيق.',
      icon: Sparkles,
      href: `/${locale}/admin/homepage`,
      source: 'website_homepage/main',
    },
    {
      id: 'CMS-03',
      title: 'الصفحات الثابتة والقانونية',
      desc: 'صفحات من نحن، سياسة الخصوصية، شروط الاستخدام، بوابة المطورين.',
      icon: FileText,
      href: `/${locale}/admin/pages`,
      source: 'website_pages/{slug}',
    },
    {
      id: 'CMS-04',
      title: 'الوجهات السياحية التحريرية',
      desc: 'أدلة المدن والمعالم السياحية — محتوى تحريري فقط، بدون تعديل بيانات تشغيلية.',
      icon: MapPin,
      href: `/${locale}/admin/destinations`,
      source: 'website_destinations/{slug}',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#23096E] via-[#2D1282] to-[#3A1C8F] text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-bold mb-4 border border-white/10">
            <ShieldCheck size={14} className="text-[#E8A93A]" />
            <span>لوحة الإدارة والتحكم الرسمية</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black mb-2 text-white">
            مرحباً بك، {user?.name || user?.email || 'مدير النظام'}
          </h1>
          <p className="text-white/80 text-sm sm:text-base leading-relaxed font-medium">
            هذه المنصة مخصصة لإدارة المحتوى التحريري لموقع مساري للسياحة والسفر مع الحفظ المباشر في قاعدة البيانات وتحديث فوري للكاش.
          </p>
        </div>
      </div>

      {/* Active Modules Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-neutral-900 flex items-center gap-2">
            <Layers size={20} className="text-[#23096E]" />
            <span>الوحدات التحريرية المفعّلة</span>
          </h2>
          <span className="text-xs font-bold text-neutral-500">
            CMS-01 → CMS-04
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeModules.map((mod) => {
            const Icon = mod.icon;
            return (
              <div key={mod.id} className="p-6 rounded-3xl bg-white border border-neutral-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#23096E]/10 text-[#23096E] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon size={24} />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {mod.id}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-neutral-900 mb-1">{mod.title}</h3>
                  <p className="text-neutral-500 text-xs leading-relaxed mb-3 font-medium">{mod.desc}</p>
                  <div className="text-[10px] font-mono text-neutral-400 px-2 py-1 bg-neutral-50 rounded-lg inline-block">
                    {mod.source}
                  </div>
                </div>
                <Link
                  href={mod.href}
                  className="mt-4 inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#23096E] hover:bg-[#1A0554] text-white text-xs font-bold shadow-sm transition-colors"
                >
                  <span>فتح المحرر</span>
                  <ArrowLeft size={16} />
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Verification Strip */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-start">
          <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
            <Phone size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-neutral-900">
              ربط مباشر مع الموقع العام
            </p>
            <p className="text-[11px] text-neutral-500">
              أي تعديل في محرر الإعدادات ينعكس فوراً على الفوتر وزر واتساب العائم وصفحة اتصل بنا.
            </p>
          </div>
        </div>

        <Link
          href={`/${locale}`}
          target="_blank"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-bold transition-colors shrink-0"
        >
          <Globe size={14} />
          <span>فتح الموقع العام</span>
        </Link>
      </div>

    </div>
  );
}
