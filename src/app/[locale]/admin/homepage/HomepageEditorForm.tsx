'use client';

/**
 * src/app/[locale]/admin/homepage/HomepageEditorForm.tsx
 *
 * Interactive CMS Form for Homepage Content (website_homepage/main).
 * Respects Source of Truth: Does not edit store URLs (handled in Global Settings).
 */

import { useState, useTransition } from 'react';
import {
  Save,
  Image as ImageIcon,
  HelpCircle,
  Users,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { updateHomepageContent } from '@/actions/cms-homepage';
import type { HomepageContentData } from '@/services/cms/types';

interface HomepageEditorFormProps {
  initialData: HomepageContentData;
  isPersistedInFirestore: boolean;
}

export default function HomepageEditorForm({
  initialData,
  isPersistedInFirestore,
}: HomepageEditorFormProps) {
  const [formData, setFormData] = useState({
    hero: {
      titleAr: initialData.hero.titleAr || '',
      subtitleAr: initialData.hero.subtitleAr || '',
      backgroundImageUrl: initialData.hero.backgroundImageUrl || '',
    },
    whyMsari: {
      badgeAr: initialData.whyMsari.badgeAr || '',
      sectionTitleAr: initialData.whyMsari.sectionTitleAr || '',
      partnerCta: {
        titleAr: initialData.whyMsari.partnerCta.titleAr || '',
        buttonTextAr: initialData.whyMsari.partnerCta.buttonTextAr || '',
        href: initialData.whyMsari.partnerCta.href || '',
      },
    },
    appDownload: {
      titleAr: initialData.appDownload.titleAr || '',
      subtitleAr: initialData.appDownload.subtitleAr || '',
    },
  });

  const [isPending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(initialData.updatedAt || null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setSuccessNotice(null);
    setFieldErrors({});

    startTransition(async () => {
      const payload = {
        hero: {
          titleAr: formData.hero.titleAr,
          subtitleAr: formData.hero.subtitleAr,
          backgroundImageUrl: formData.hero.backgroundImageUrl,
        },
        whyMsari: {
          badgeAr: formData.whyMsari.badgeAr,
          sectionTitleAr: formData.whyMsari.sectionTitleAr,
          partnerCta: {
            titleAr: formData.whyMsari.partnerCta.titleAr,
            buttonTextAr: formData.whyMsari.partnerCta.buttonTextAr,
            href: formData.whyMsari.partnerCta.href,
          },
        },
        appDownload: {
          titleAr: formData.appDownload.titleAr,
          subtitleAr: formData.appDownload.subtitleAr,
        },
      };

      const result = await updateHomepageContent(payload);

      if (!result.success) {
        if (result.error?.fieldErrors) {
          setFieldErrors(result.error.fieldErrors);
        }
        setServerError(result.error?.message || 'تعذر حفظ البيانات، يرجى مراجعة الحقول.');
      } else {
        setSuccessNotice('تم حفظ المحتوى بنجاح في قاعدة البيانات وتحديث كاش الصفحة الرئيسية!');
        setLastSavedAt(new Date().toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  };

  const handleReset = () => {
    if (confirm('هل أنت متأكد من رغبتك في استعادة القيم الأصلية؟')) {
      setFormData({
        hero: {
          titleAr: initialData.hero.titleAr || '',
          subtitleAr: initialData.hero.subtitleAr || '',
          backgroundImageUrl: initialData.hero.backgroundImageUrl || '',
        },
        whyMsari: {
          badgeAr: initialData.whyMsari.badgeAr || '',
          sectionTitleAr: initialData.whyMsari.sectionTitleAr || '',
          partnerCta: {
            titleAr: initialData.whyMsari.partnerCta.titleAr || '',
            buttonTextAr: initialData.whyMsari.partnerCta.buttonTextAr || '',
            href: initialData.whyMsari.partnerCta.href || '',
          },
        },
        appDownload: {
          titleAr: initialData.appDownload.titleAr || '',
          subtitleAr: initialData.appDownload.subtitleAr || '',
        },
      });
      setFieldErrors({});
      setServerError(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in pb-12">
      
      {/* Header & Action Bar */}
      <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-black text-neutral-900">
              محتوى الصفحة الرئيسية
            </h1>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#23096E]/10 text-[#23096E]">
              website_homepage/main
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 font-medium">
            تعديل النصوص والصور في أقسام الصفحة الرئيسية (الهيرو، لماذا مساري، دعوة الشركاء، وتحميل التطبيق).
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleReset}
            disabled={isPending}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-bold transition-colors disabled:opacity-50"
          >
            <RotateCcw size={14} />
            <span>استعادة</span>
          </button>

          <button
            type="submit"
            disabled={isPending}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#23096E] hover:bg-[#1A0554] text-white text-xs font-black shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            {isPending ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save size={16} />
            )}
            <span>{isPending ? 'جاري الحفظ...' : 'حفظ التغييرات'}</span>
          </button>
        </div>
      </div>

      {/* Persistence State Banner */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-neutral-200/80 text-xs font-medium">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isPersistedInFirestore ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          <span className="text-neutral-700">
            حالة الوثيقة في Firestore:
          </span>
          <span className={`font-bold ${isPersistedInFirestore ? 'text-emerald-700' : 'text-amber-700'}`}>
            {isPersistedInFirestore ? 'وثيقة مخزنة ومطابقة' : 'قيم افتراضية احتياطية (سيتم التخزين عند أول حفظ)'}
          </span>
        </div>

        {lastSavedAt && (
          <span className="text-neutral-400 text-[11px] font-mono">
            آخر تحديث: {lastSavedAt}
          </span>
        )}
      </div>

      {/* Alerts */}
      {serverError && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-bold flex items-center gap-3 animate-shake">
          <AlertCircle size={20} className="shrink-0 text-red-600" />
          <span>{serverError}</span>
        </div>
      )}

      {successNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-3 animate-fade-in">
          <CheckCircle2 size={20} className="shrink-0 text-emerald-600" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* ── Section 1: بيانات الهيرو ───────────────────────────────── */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-neutral-200/80 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 pb-4 border-b border-neutral-100 text-[#23096E]">
          <div className="w-9 h-9 rounded-xl bg-[#23096E]/10 flex items-center justify-center">
            <ImageIcon size={18} />
          </div>
          <div>
            <h2 className="text-base font-black text-neutral-900">
              1. بيانات الهيرو (القسم العلوي)
            </h2>
            <p className="text-[11px] text-neutral-400 font-medium">
              العنوان الرئيسي، النص الفرعي، وصورة الخلفية.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-neutral-800">
              العنوان الرئيسي (عربي) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.hero.titleAr}
              onChange={(e) => setFormData({
                ...formData,
                hero: { ...formData.hero, titleAr: e.target.value }
              })}
              placeholder="مثال: سافر مع مساري"
              className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-[#23096E] focus:ring-2 focus:ring-[#23096E]/10 outline-none text-xs sm:text-sm transition-all"
            />
            {fieldErrors['hero.titleAr'] && (
              <p className="text-[11px] font-bold text-red-500">{fieldErrors['hero.titleAr'][0]}</p>
            )}
            <p className="text-[10px] text-neutral-400">سيتم تلوين كلمة "مساري" باللون الأحمر تلقائياً.</p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-black text-neutral-800">
              النص الفرعي (عربي) <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.hero.subtitleAr}
              onChange={(e) => setFormData({
                ...formData,
                hero: { ...formData.hero, subtitleAr: e.target.value }
              })}
              placeholder="اكتشف العالم مع خدماتنا المتكاملة..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-[#23096E] focus:ring-2 focus:ring-[#23096E]/10 outline-none text-xs sm:text-sm transition-all resize-none"
            />
            {fieldErrors['hero.subtitleAr'] && (
              <p className="text-[11px] font-bold text-red-500">{fieldErrors['hero.subtitleAr'][0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-black text-neutral-800">
              رابط صورة الخلفية
            </label>
            <input
              type="text"
              dir="ltr"
              value={formData.hero.backgroundImageUrl}
              onChange={(e) => setFormData({
                ...formData,
                hero: { ...formData.hero, backgroundImageUrl: e.target.value }
              })}
              placeholder="/images/hero-bg.jpg"
              className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-[#23096E] focus:ring-2 focus:ring-[#23096E]/10 outline-none text-xs sm:text-sm font-mono transition-all"
            />
            {fieldErrors['hero.backgroundImageUrl'] && (
              <p className="text-[11px] font-bold text-red-500">{fieldErrors['hero.backgroundImageUrl'][0]}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Section 2: قسم لماذا مساري ───────────────────────────── */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-neutral-200/80 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 pb-4 border-b border-neutral-100 text-[#23096E]">
          <div className="w-9 h-9 rounded-xl bg-[#23096E]/10 flex items-center justify-center">
            <HelpCircle size={18} />
          </div>
          <div>
            <h2 className="text-base font-black text-neutral-900">
              2. قسم لماذا مساري
            </h2>
            <p className="text-[11px] text-neutral-400 font-medium">
              الوسام وعنوان القسم (الميزات الثابتة الـ 6 مبرمجة مسبقاً).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-neutral-800">
              الوسام (Badge) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.whyMsari.badgeAr}
              onChange={(e) => setFormData({
                ...formData,
                whyMsari: { ...formData.whyMsari, badgeAr: e.target.value }
              })}
              placeholder="مثال: لماذا مساري؟"
              className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-[#23096E] focus:ring-2 focus:ring-[#23096E]/10 outline-none text-xs sm:text-sm transition-all"
            />
            {fieldErrors['whyMsari.badgeAr'] && (
              <p className="text-[11px] font-bold text-red-500">{fieldErrors['whyMsari.badgeAr'][0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-black text-neutral-800">
              عنوان القسم <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.whyMsari.sectionTitleAr}
              onChange={(e) => setFormData({
                ...formData,
                whyMsari: { ...formData.whyMsari, sectionTitleAr: e.target.value }
              })}
              placeholder="نقدم لك تجربة سفر لا تنسى"
              className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-[#23096E] focus:ring-2 focus:ring-[#23096E]/10 outline-none text-xs sm:text-sm transition-all"
            />
            {fieldErrors['whyMsari.sectionTitleAr'] && (
              <p className="text-[11px] font-bold text-red-500">{fieldErrors['whyMsari.sectionTitleAr'][0]}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Section 3: دعوة الشركاء ─────────────────────── */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-neutral-200/80 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 pb-4 border-b border-neutral-100 text-[#23096E]">
          <div className="w-9 h-9 rounded-xl bg-[#23096E]/10 flex items-center justify-center">
            <Users size={18} />
          </div>
          <div>
            <h2 className="text-base font-black text-neutral-900">
              3. دعوة الشركاء (CTA)
            </h2>
            <p className="text-[11px] text-neutral-400 font-medium">
              القسم الذي يدعو الشركات أو الأفراد للانضمام كشركاء.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5 sm:col-span-2">
            <label className="block text-xs font-black text-neutral-800">
              عنوان الدعوة <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.whyMsari.partnerCta.titleAr}
              onChange={(e) => setFormData({
                ...formData,
                whyMsari: {
                  ...formData.whyMsari,
                  partnerCta: { ...formData.whyMsari.partnerCta, titleAr: e.target.value }
                }
              })}
              placeholder="انضم إلى شبكة شركاء مساري..."
              className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-[#23096E] focus:ring-2 focus:ring-[#23096E]/10 outline-none text-xs sm:text-sm transition-all"
            />
            {fieldErrors['whyMsari.partnerCta.titleAr'] && (
              <p className="text-[11px] font-bold text-red-500">{fieldErrors['whyMsari.partnerCta.titleAr'][0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-black text-neutral-800">
              نص الزر <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.whyMsari.partnerCta.buttonTextAr}
              onChange={(e) => setFormData({
                ...formData,
                whyMsari: {
                  ...formData.whyMsari,
                  partnerCta: { ...formData.whyMsari.partnerCta, buttonTextAr: e.target.value }
                }
              })}
              placeholder="انضم الآن"
              className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-[#23096E] focus:ring-2 focus:ring-[#23096E]/10 outline-none text-xs sm:text-sm transition-all"
            />
            {fieldErrors['whyMsari.partnerCta.buttonTextAr'] && (
              <p className="text-[11px] font-bold text-red-500">{fieldErrors['whyMsari.partnerCta.buttonTextAr'][0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-black text-neutral-800">
              رابط الزر (Href) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              dir="ltr"
              value={formData.whyMsari.partnerCta.href}
              onChange={(e) => setFormData({
                ...formData,
                whyMsari: {
                  ...formData.whyMsari,
                  partnerCta: { ...formData.whyMsari.partnerCta, href: e.target.value }
                }
              })}
              placeholder="/partners"
              className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-[#23096E] focus:ring-2 focus:ring-[#23096E]/10 outline-none text-xs sm:text-sm font-mono transition-all"
            />
            {fieldErrors['whyMsari.partnerCta.href'] && (
              <p className="text-[11px] font-bold text-red-500">{fieldErrors['whyMsari.partnerCta.href'][0]}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Section 4: قسم تحميل التطبيق ────────────────────────────── */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-neutral-200/80 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 pb-4 border-b border-neutral-100 text-[#23096E]">
          <div className="w-9 h-9 rounded-xl bg-[#23096E]/10 flex items-center justify-center">
            <Smartphone size={18} />
          </div>
          <div>
            <h2 className="text-base font-black text-neutral-900">
              4. قسم تحميل التطبيق
            </h2>
            <p className="text-[11px] text-neutral-400 font-medium">
              نصوص بنر تحميل التطبيق الذكي.
            </p>
          </div>
        </div>

        <div className="bg-[#23096E]/5 border border-[#23096E]/10 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle size={18} className="text-[#23096E] shrink-0 mt-0.5" />
          <p className="text-xs text-[#23096E] leading-relaxed font-semibold">
            ملاحظة: تتم إدارة روابط متاجر التطبيقات (Play Store & App Store) من خلال <a href="/admin/settings" className="underline font-black">الإعدادات العامة</a> لضمان توحيدها في جميع أنحاء الموقع (Source of Truth).
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-neutral-800">
              عنوان القسم <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.appDownload.titleAr}
              onChange={(e) => setFormData({
                ...formData,
                appDownload: { ...formData.appDownload, titleAr: e.target.value }
              })}
              placeholder="حمل تطبيق مساري"
              className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-[#23096E] focus:ring-2 focus:ring-[#23096E]/10 outline-none text-xs sm:text-sm transition-all"
            />
            {fieldErrors['appDownload.titleAr'] && (
              <p className="text-[11px] font-bold text-red-500">{fieldErrors['appDownload.titleAr'][0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-black text-neutral-800">
              النص الفرعي <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.appDownload.subtitleAr}
              onChange={(e) => setFormData({
                ...formData,
                appDownload: { ...formData.appDownload, subtitleAr: e.target.value }
              })}
              placeholder="احجز رحلاتك بكل سهولة من خلال تطبيقنا..."
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-[#23096E] focus:ring-2 focus:ring-[#23096E]/10 outline-none text-xs sm:text-sm transition-all resize-none"
            />
            {fieldErrors['appDownload.subtitleAr'] && (
              <p className="text-[11px] font-bold text-red-500">{fieldErrors['appDownload.subtitleAr'][0]}</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Save Bar */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={handleReset}
          disabled={isPending}
          className="px-5 py-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-bold transition-colors disabled:opacity-50"
        >
          إلغاء التغييرات
        </button>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-[#23096E] hover:bg-[#1A0554] text-white text-xs sm:text-sm font-black shadow-md hover:shadow-xl transition-all disabled:opacity-50"
        >
          {isPending ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save size={18} />
          )}
          <span>{isPending ? 'جاري الحفظ في Firestore...' : 'حفظ ونشر التغييرات'}</span>
        </button>
      </div>

    </form>
  );
}
