'use client';

import { useState, useTransition } from 'react';
import {
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  List,
  Users,
  Settings,
  Plus,
  Trash2,
} from 'lucide-react';
import { updateAboutPage, updateLegalPage, updateDevelopersPage } from '@/actions/cms-pages';

interface PageEditorFormProps {
  pageId: 'about' | 'privacy' | 'terms' | 'developers';
  pageType: string;
  initialData: any;
  isPersistedInFirestore: boolean;
}

export default function PageEditorForm({
  pageId,
  pageType,
  initialData,
  isPersistedInFirestore,
}: PageEditorFormProps) {
  const [formData, setFormData] = useState(initialData);
  const [isPending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setSuccessNotice(null);
    setFieldErrors({});

    startTransition(async () => {
      let result;
      if (pageId === 'about') {
        result = await updateAboutPage(formData);
      } else if (pageId === 'privacy' || pageId === 'terms') {
        result = await updateLegalPage(pageId, formData);
      } else if (pageId === 'developers') {
        result = await updateDevelopersPage(formData);
      }

      if (!result?.success) {
        if (result?.error?.fieldErrors) {
          setFieldErrors(result.error.fieldErrors);
        }
        setServerError(result?.error?.message || 'تعذر حفظ البيانات، يرجى مراجعة الحقول.');
      } else {
        setSuccessNotice('تم حفظ الإعدادات بنجاح وتحديث كاش الموقع!');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  };

  const handleReset = () => {
    if (confirm('هل أنت متأكد من رغبتك في استعادة القيم الأصلية؟')) {
      setFormData(initialData);
      setFieldErrors({});
      setServerError(null);
    }
  };

  const renderInput = (label: string, fieldPath: string[], placeholder: string = '', dir: 'rtl' | 'ltr' = 'rtl', type: string = 'text') => {
    const value = fieldPath.reduce((acc, part) => acc && acc[part], formData) || '';
    const errorKey = fieldPath.join('.');
    
    return (
      <div className="space-y-1.5">
        <label className="block text-xs font-black text-neutral-800">{label}</label>
        {type === 'textarea' ? (
          <textarea
            dir={dir}
            value={value}
            onChange={(e) => {
              const newData = { ...formData };
              let current = newData;
              for (let i = 0; i < fieldPath.length - 1; i++) {
                current[fieldPath[i]] = { ...current[fieldPath[i]] };
                current = current[fieldPath[i]];
              }
              current[fieldPath[fieldPath.length - 1]] = e.target.value;
              setFormData(newData);
            }}
            placeholder={placeholder}
            rows={4}
            className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-[#23096E] focus:ring-2 focus:ring-[#23096E]/10 outline-none text-xs sm:text-sm font-semibold transition-all resize-y"
          />
        ) : (
          <input
            type={type}
            dir={dir}
            value={value}
            onChange={(e) => {
              const newData = { ...formData };
              let current = newData;
              for (let i = 0; i < fieldPath.length - 1; i++) {
                current[fieldPath[i]] = { ...current[fieldPath[i]] };
                current = current[fieldPath[i]];
              }
              current[fieldPath[fieldPath.length - 1]] = type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
              setFormData(newData);
            }}
            placeholder={placeholder}
            className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-[#23096E] focus:ring-2 focus:ring-[#23096E]/10 outline-none text-xs sm:text-sm font-semibold transition-all"
          />
        )}
        {fieldErrors[errorKey] && (
          <p className="text-[11px] font-bold text-red-500">{fieldErrors[errorKey][0]}</p>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-black text-neutral-900">
              تعديل {initialData.title || pageId}
            </h1>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#23096E]/10 text-[#23096E]">
              website_pages/{pageId}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 font-medium">
            إدارة محتوى الصفحة الثابتة وتعديل النصوص والصور
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

      {/* Persistence Banner */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-neutral-200/80 text-xs font-medium">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isPersistedInFirestore ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          <span className="text-neutral-700">حالة الوثيقة في Firestore:</span>
          <span className={`font-bold ${isPersistedInFirestore ? 'text-emerald-700' : 'text-amber-700'}`}>
            {isPersistedInFirestore ? 'وثيقة مخزنة ومطابقة' : 'قيم افتراضية احتياطية (سيتم التخزين عند أول حفظ)'}
          </span>
        </div>
      </div>

      {/* Alerts */}
      {serverError && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-bold flex items-center gap-3">
          <AlertCircle size={20} className="shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {successNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-3">
          <CheckCircle2 size={20} className="shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Sections Based on Page Type */}
      <div className="space-y-6">
        {/* General Info */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-neutral-100 text-[#23096E]">
            <Settings size={18} />
            <h2 className="text-base font-black text-neutral-900">معلومات عامة</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderInput('العنوان (عربي)', ['title'])}
            {renderInput('العنوان (إنجليزي)', ['titleEn'], '', 'ltr')}
            {pageType !== 'developers_page' && renderInput('تاريخ آخر تحديث', ['lastUpdatedText'])}
          </div>
        </div>

        {/* Hero Section */}
        {(pageType === 'content_page' || pageType === 'developers_page') && (
          <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 pb-4 border-b border-neutral-100 text-[#23096E]">
              <ImageIcon size={18} />
              <h2 className="text-base font-black text-neutral-900">الهيرو</h2>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {renderInput('الوسام (Badge)', ['hero', 'badge'])}
              {renderInput('العنوان الرئيسي', ['hero', 'title'])}
              {renderInput('النص الفرعي', ['hero', 'subtitle'], '', 'rtl', 'textarea')}
            </div>
          </div>
        )}

        {/* About: Stats, Story, Values, Team */}
        {pageType === 'content_page' && (
          <>
            <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs space-y-5">
              <div className="flex items-center gap-2.5 pb-4 border-b border-neutral-100 text-[#23096E]">
                <List size={18} />
                <h2 className="text-base font-black text-neutral-900">الإحصائيات</h2>
              </div>
              <div className="space-y-4">
                {formData.stats?.map((stat: any, index: number) => (
                  <div key={index} className="flex gap-4 items-end bg-neutral-50 p-4 rounded-xl">
                    <div className="flex-1">
                      {renderInput('القيمة', ['stats', index.toString(), 'value'])}
                    </div>
                    <div className="flex-1">
                      {renderInput('التسمية', ['stats', index.toString(), 'label'])}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newStats = [...formData.stats];
                        newStats.splice(index, 1);
                        setFormData({ ...formData, stats: newStats });
                      }}
                      className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors mb-1.5"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, stats: [...(formData.stats || []), { value: '', label: '' }] })}
                  className="flex items-center gap-2 text-sm text-[#23096E] font-bold"
                >
                  <Plus size={16} /> إضافة إحصائية
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs space-y-5">
              <div className="flex items-center gap-2.5 pb-4 border-b border-neutral-100 text-[#23096E]">
                <FileText size={18} />
                <h2 className="text-base font-black text-neutral-900">القصة</h2>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {renderInput('الوسام', ['story', 'badge'])}
                {renderInput('العنوان', ['story', 'title'])}
                {renderInput('رابط الصورة', ['story', 'image'], '', 'ltr')}
                {renderInput('الموقع الجغرافي', ['story', 'locationText'])}
                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-neutral-800">الفقرات</label>
                  <textarea
                    value={formData.story?.paragraphs?.join('\n\n') || ''}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        story: {
                          ...formData.story,
                          paragraphs: e.target.value.split('\n\n').filter(Boolean),
                        },
                      });
                    }}
                    rows={6}
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-[#23096E] outline-none text-xs sm:text-sm font-semibold transition-all resize-y"
                    placeholder="أدخل الفقرات (افصل بين كل فقرة بمسافة سطرين)"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs space-y-5">
              <div className="flex items-center gap-2.5 pb-4 border-b border-neutral-100 text-[#23096E]">
                <Settings size={18} />
                <h2 className="text-base font-black text-neutral-900">القيم</h2>
              </div>
              <div className="space-y-4">
                {formData.values?.map((val: any, index: number) => (
                  <div key={index} className="flex gap-4 items-end bg-neutral-50 p-4 rounded-xl">
                    <div className="w-32">{renderInput('الأيقونة', ['values', index.toString(), 'icon'])}</div>
                    <div className="w-1/3">{renderInput('العنوان', ['values', index.toString(), 'title'])}</div>
                    <div className="flex-1">{renderInput('الوصف', ['values', index.toString(), 'desc'])}</div>
                    <button
                      type="button"
                      onClick={() => {
                        const newVals = [...formData.values];
                        newVals.splice(index, 1);
                        setFormData({ ...formData, values: newVals });
                      }}
                      className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors mb-1.5"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, values: [...(formData.values || []), { icon: '', title: '', desc: '' }] })}
                  className="flex items-center gap-2 text-sm text-[#23096E] font-bold"
                >
                  <Plus size={16} /> إضافة قيمة
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs space-y-5">
              <div className="flex items-center gap-2.5 pb-4 border-b border-neutral-100 text-[#23096E]">
                <Users size={18} />
                <h2 className="text-base font-black text-neutral-900">الفريق</h2>
              </div>
              <div className="space-y-4">
                {formData.team?.map((member: any, index: number) => (
                  <div key={index} className="flex gap-4 items-end bg-neutral-50 p-4 rounded-xl">
                    <div className="flex-1">{renderInput('الاسم', ['team', index.toString(), 'name'])}</div>
                    <div className="flex-1">{renderInput('الدور', ['team', index.toString(), 'role'])}</div>
                    <div className="w-24">{renderInput('الإيموجي', ['team', index.toString(), 'emoji'])}</div>
                    <button
                      type="button"
                      onClick={() => {
                        const newTeam = [...formData.team];
                        newTeam.splice(index, 1);
                        setFormData({ ...formData, team: newTeam });
                      }}
                      className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors mb-1.5"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, team: [...(formData.team || []), { name: '', role: '', emoji: '' }] })}
                  className="flex items-center gap-2 text-sm text-[#23096E] font-bold"
                >
                  <Plus size={16} /> إضافة عضو
                </button>
              </div>
            </div>
          </>
        )}

        {/* Legal Pages: Intro, Sections */}
        {pageType === 'legal_page' && (
          <>
            <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs space-y-5">
              <div className="flex items-center gap-2.5 pb-4 border-b border-neutral-100 text-[#23096E]">
                <FileText size={18} />
                <h2 className="text-base font-black text-neutral-900">المقدمة</h2>
              </div>
              {renderInput('النص التمهيدي', ['intro'], '', 'rtl', 'textarea')}
            </div>

            <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs space-y-5">
              <div className="flex items-center gap-2.5 pb-4 border-b border-neutral-100 text-[#23096E]">
                <List size={18} />
                <h2 className="text-base font-black text-neutral-900">الأقسام</h2>
              </div>
              <div className="space-y-6">
                {formData.sections?.map((section: any, index: number) => (
                  <div key={index} className="bg-neutral-50 p-4 rounded-xl space-y-4 border border-neutral-200">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-sm">قسم {index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => {
                          const newSections = [...formData.sections];
                          newSections.splice(index, 1);
                          setFormData({ ...formData, sections: newSections });
                        }}
                        className="text-red-500 hover:text-red-600 text-xs font-bold"
                      >
                        حذف القسم
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {renderInput('المعرف (ID)', ['sections', index.toString(), 'id'], '', 'ltr')}
                      {renderInput('العنوان', ['sections', index.toString(), 'title'])}
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-black text-neutral-800">المحتوى</label>
                      <textarea
                        value={section.content?.join('\n\n') || ''}
                        onChange={(e) => {
                          const newSections = [...formData.sections];
                          newSections[index].content = e.target.value.split('\n\n').filter(Boolean);
                          setFormData({ ...formData, sections: newSections });
                        }}
                        rows={5}
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-neutral-200 focus:border-[#23096E] outline-none text-xs sm:text-sm font-semibold transition-all resize-y"
                        placeholder="أدخل محتوى القسم (افصل بين كل فقرة بمسافة سطرين)"
                      />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, sections: [...(formData.sections || []), { id: '', title: '', content: [] }] })}
                  className="flex items-center gap-2 text-sm text-[#23096E] font-bold"
                >
                  <Plus size={16} /> إضافة قسم
                </button>
              </div>
            </div>
          </>
        )}

        {/* Developers Page: Features, Plans, FAQ */}
        {pageType === 'developers_page' && (
          <>
            <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs space-y-5">
              <div className="flex items-center gap-2.5 pb-4 border-b border-neutral-100 text-[#23096E]">
                <Settings size={18} />
                <h2 className="text-base font-black text-neutral-900">المميزات</h2>
              </div>
              <div className="space-y-4">
                {formData.features?.map((feat: any, index: number) => (
                  <div key={index} className="flex gap-4 items-end bg-neutral-50 p-4 rounded-xl">
                    <div className="w-32">{renderInput('الأيقونة', ['features', index.toString(), 'icon'])}</div>
                    <div className="w-1/3">{renderInput('العنوان', ['features', index.toString(), 'title'])}</div>
                    <div className="flex-1">{renderInput('الوصف', ['features', index.toString(), 'desc'])}</div>
                    <button
                      type="button"
                      onClick={() => {
                        const newFeats = [...formData.features];
                        newFeats.splice(index, 1);
                        setFormData({ ...formData, features: newFeats });
                      }}
                      className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors mb-1.5"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, features: [...(formData.features || []), { icon: '', title: '', desc: '' }] })}
                  className="flex items-center gap-2 text-sm text-[#23096E] font-bold"
                >
                  <Plus size={16} /> إضافة ميزة
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs space-y-5">
              <div className="flex items-center gap-2.5 pb-4 border-b border-neutral-100 text-[#23096E]">
                <List size={18} />
                <h2 className="text-base font-black text-neutral-900">الخطط</h2>
              </div>
              <div className="space-y-6">
                {formData.plans?.map((plan: any, index: number) => (
                  <div key={index} className="bg-neutral-50 p-4 rounded-xl space-y-4 border border-neutral-200">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-sm">خطة {index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => {
                          const newPlans = [...formData.plans];
                          newPlans.splice(index, 1);
                          setFormData({ ...formData, plans: newPlans });
                        }}
                        className="text-red-500 hover:text-red-600 text-xs font-bold"
                      >
                        حذف الخطة
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {renderInput('المعرف (ID)', ['plans', index.toString(), 'id'], '', 'ltr')}
                      {renderInput('الاسم', ['plans', index.toString(), 'name'])}
                      {renderInput('السعر', ['plans', index.toString(), 'price'])}
                      <div className="flex items-center gap-2 pt-6">
                        <input
                          type="checkbox"
                          checked={plan.popular || false}
                          onChange={(e) => {
                            const newPlans = [...formData.plans];
                            newPlans[index].popular = e.target.checked;
                            setFormData({ ...formData, plans: newPlans });
                          }}
                          className="w-4 h-4 text-[#23096E] rounded border-neutral-300"
                        />
                        <label className="text-sm font-bold text-neutral-800">الأكثر شيوعاً</label>
                      </div>
                    </div>
                    {renderInput('الوصف', ['plans', index.toString(), 'description'])}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-black text-neutral-800">المميزات (ميزة في كل سطر)</label>
                      <textarea
                        value={plan.features?.join('\n') || ''}
                        onChange={(e) => {
                          const newPlans = [...formData.plans];
                          newPlans[index].features = e.target.value.split('\n').filter(Boolean);
                          setFormData({ ...formData, plans: newPlans });
                        }}
                        rows={4}
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-neutral-200 focus:border-[#23096E] outline-none text-xs sm:text-sm font-semibold transition-all resize-y"
                      />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, plans: [...(formData.plans || []), { id: '', name: '', price: '', description: '', features: [] }] })}
                  className="flex items-center gap-2 text-sm text-[#23096E] font-bold"
                >
                  <Plus size={16} /> إضافة خطة
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs space-y-5">
              <div className="flex items-center gap-2.5 pb-4 border-b border-neutral-100 text-[#23096E]">
                <FileText size={18} />
                <h2 className="text-base font-black text-neutral-900">الأسئلة الشائعة</h2>
              </div>
              <div className="space-y-4">
                {formData.faq?.map((item: any, index: number) => (
                  <div key={index} className="flex gap-4 items-start bg-neutral-50 p-4 rounded-xl">
                    <div className="flex-1 space-y-4">
                      {renderInput('السؤال', ['faq', index.toString(), 'q'])}
                      {renderInput('الإجابة', ['faq', index.toString(), 'a'], '', 'rtl', 'textarea')}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newFaq = [...formData.faq];
                        newFaq.splice(index, 1);
                        setFormData({ ...formData, faq: newFaq });
                      }}
                      className="p-2.5 mt-6 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, faq: [...(formData.faq || []), { q: '', a: '' }] })}
                  className="flex items-center gap-2 text-sm text-[#23096E] font-bold"
                >
                  <Plus size={16} /> إضافة سؤال
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom Save Bar */}
      <div className="flex items-center justify-end gap-3 pt-2">
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
