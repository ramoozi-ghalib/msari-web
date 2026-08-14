'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DestinationEditorialSchema, type DestinationEditorialFormValues } from '@/schemas/cms-destinations.schema';
import { updateDestinationEditorial } from '@/actions/cms-destinations';
import { Save, AlertCircle, CheckCircle2, RefreshCw, Trash2, Plus, Image as ImageIcon } from 'lucide-react';
import type { DestinationEditorialData } from '@/services/cms/types';

interface DestinationEditorFormProps {
  slug: string;
  initialData: DestinationEditorialData | null;
  isPersistedInFirestore: boolean;
}

const CATEGORY_OPTIONS = ['تاريخي', 'طبيعي', 'معماري', 'ثقافي', 'ترفيهي'];

export default function DestinationEditorForm({
  slug,
  initialData,
  isPersistedInFirestore,
}: DestinationEditorFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const defaultValues: DestinationEditorialFormValues = {
    tagline: initialData?.tagline || '',
    taglineEn: initialData?.taglineEn || '',
    heroImage: initialData?.heroImage || '',
    overview: {
      history: initialData?.overview?.history || '',
      climate: initialData?.overview?.climate || '',
      culture: initialData?.overview?.culture || '',
      bestTimeToVisit: initialData?.overview?.bestTimeToVisit || '',
    },
    landmarks: initialData?.landmarks?.map(l => ({
      id: l.id,
      name: l.name,
      nameEn: l.nameEn || '',
      category: l.category || 'تاريخي',
      image: l.image || '',
      description: l.description || '',
      locationText: l.locationText || '',
    })) || [],
  };

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<DestinationEditorialFormValues>({
    resolver: zodResolver(DestinationEditorialSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'landmarks',
  });

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const onSubmit = (data: DestinationEditorialFormValues) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    startTransition(async () => {
      try {
        const result = await updateDestinationEditorial(slug, data);

        if (result.success) {
          setSuccessMsg('تم حفظ بيانات الوجهة بنجاح.');
          reset(data); // reset isDirty state
          router.refresh();
        } else {
          setErrorMsg(result.error?.message || 'حدث خطأ غير متوقع');
        }
      } catch (err) {
        setErrorMsg('حدث خطأ في الاتصال بالخادم.');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Messages */}
      {errorMsg && (
        <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{errorMsg}</p>
        </div>
      )}
      
      {successMsg && (
        <div className="flex items-center gap-3 p-4 bg-green-50 text-green-700 rounded-2xl border border-green-100">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{successMsg}</p>
        </div>
      )}

      {!isPersistedInFirestore && (
        <div className="flex items-center gap-3 p-4 bg-blue-50 text-blue-700 rounded-2xl border border-blue-100">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">هذه الوجهة غير محفوظة في قاعدة البيانات. سيتم إنشاؤها عند الحفظ الأول.</p>
        </div>
      )}

      {/* Section 1: Basic Info */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 overflow-hidden">
        <div className="border-b border-neutral-100 bg-neutral-50/50 p-6">
          <h2 className="text-lg font-black text-[#23096E]">المعلومات الأساسية</h2>
          <p className="text-xs text-neutral-500 mt-1">وصف مختصر للوجهة وصورة الغلاف</p>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-neutral-700">الوصف المختصر (عربي)</label>
              <input
                {...register('tagline')}
                className="w-full rounded-xl bg-neutral-50 border border-neutral-200 px-4 py-2.5 text-sm focus:border-[#23096E] focus:ring-1 focus:ring-[#23096E] transition-all outline-none"
                placeholder="مثال: مدينة السحر والتاريخ..."
              />
              {errors.tagline && <span className="text-xs text-red-500">{errors.tagline.message}</span>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-neutral-700">الوصف المختصر (إنجليزي) - اختياري</label>
              <input
                {...register('taglineEn')}
                className="w-full rounded-xl bg-neutral-50 border border-neutral-200 px-4 py-2.5 text-sm focus:border-[#23096E] focus:ring-1 focus:ring-[#23096E] transition-all outline-none text-left"
                dir="ltr"
                placeholder="e.g. City of Magic and History..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-neutral-700">رابط صورة الغلاف</label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-neutral-400">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <input
                  {...register('heroImage')}
                  className="w-full rounded-xl bg-neutral-50 border border-neutral-200 pr-10 pl-4 py-2.5 text-sm focus:border-[#23096E] focus:ring-1 focus:ring-[#23096E] transition-all outline-none text-left"
                  dir="ltr"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
            {errors.heroImage && <span className="text-xs text-red-500">{errors.heroImage.message}</span>}
          </div>
        </div>
      </div>

      {/* Section 2: Overview */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 overflow-hidden">
        <div className="border-b border-neutral-100 bg-neutral-50/50 p-6">
          <h2 className="text-lg font-black text-[#23096E]">نظرة عامة</h2>
          <p className="text-xs text-neutral-500 mt-1">تاريخ، مناخ، وثقافة الوجهة</p>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-neutral-700">نبذة تاريخية</label>
            <textarea
              {...register('overview.history')}
              rows={3}
              className="w-full rounded-xl bg-neutral-50 border border-neutral-200 px-4 py-3 text-sm focus:border-[#23096E] focus:ring-1 focus:ring-[#23096E] transition-all outline-none resize-y"
            />
            {errors.overview?.history && <span className="text-xs text-red-500">{errors.overview.history.message}</span>}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-neutral-700">المناخ</label>
            <textarea
              {...register('overview.climate')}
              rows={2}
              className="w-full rounded-xl bg-neutral-50 border border-neutral-200 px-4 py-3 text-sm focus:border-[#23096E] focus:ring-1 focus:ring-[#23096E] transition-all outline-none resize-y"
            />
            {errors.overview?.climate && <span className="text-xs text-red-500">{errors.overview.climate.message}</span>}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-neutral-700">الثقافة</label>
            <textarea
              {...register('overview.culture')}
              rows={2}
              className="w-full rounded-xl bg-neutral-50 border border-neutral-200 px-4 py-3 text-sm focus:border-[#23096E] focus:ring-1 focus:ring-[#23096E] transition-all outline-none resize-y"
            />
            {errors.overview?.culture && <span className="text-xs text-red-500">{errors.overview.culture.message}</span>}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-neutral-700">أفضل وقت للزيارة</label>
            <input
              {...register('overview.bestTimeToVisit')}
              className="w-full rounded-xl bg-neutral-50 border border-neutral-200 px-4 py-2.5 text-sm focus:border-[#23096E] focus:ring-1 focus:ring-[#23096E] transition-all outline-none"
            />
            {errors.overview?.bestTimeToVisit && <span className="text-xs text-red-500">{errors.overview.bestTimeToVisit.message}</span>}
          </div>
        </div>
      </div>

      {/* Section 3: Landmarks */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 overflow-hidden">
        <div className="border-b border-neutral-100 bg-neutral-50/50 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-[#23096E]">المعالم السياحية</h2>
            <p className="text-xs text-neutral-500 mt-1">أهم المعالم التي تتميز بها الوجهة</p>
          </div>
          <button
            type="button"
            onClick={() => append({
              id: generateId(),
              name: '',
              nameEn: '',
              category: 'تاريخي',
              image: '',
              description: '',
              locationText: '',
            })}
            className="flex items-center gap-2 text-xs font-bold text-[#23096E] bg-[#23096E]/10 px-4 py-2 rounded-xl hover:bg-[#23096E]/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
            إضافة معلم
          </button>
        </div>
        
        <div className="p-6 space-y-8">
          {fields.length === 0 ? (
            <div className="text-center py-8 text-neutral-500 text-sm">
              لا توجد معالم مضافة بعد. انقر على الزر أعلاه لإضافة معلم.
            </div>
          ) : (
            fields.map((item, index) => (
              <div key={item.id} className="relative p-6 rounded-2xl border border-neutral-100 bg-neutral-50/50">
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="absolute top-4 left-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="حذف المعلم"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                
                <h4 className="text-sm font-bold text-neutral-800 mb-6 border-b border-neutral-200 pb-2 inline-block">
                  معلم #{index + 1}
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-neutral-700">اسم المعلم</label>
                    <input
                      {...register(`landmarks.${index}.name`)}
                      className="w-full rounded-xl bg-white border border-neutral-200 px-4 py-2.5 text-sm focus:border-[#23096E] focus:ring-1 focus:ring-[#23096E] transition-all outline-none"
                    />
                    {errors.landmarks?.[index]?.name && (
                      <span className="text-xs text-red-500">{errors.landmarks[index]?.name?.message}</span>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-black text-neutral-700">التصنيف</label>
                    <select
                      {...register(`landmarks.${index}.category`)}
                      className="w-full rounded-xl bg-white border border-neutral-200 px-4 py-2.5 text-sm focus:border-[#23096E] focus:ring-1 focus:ring-[#23096E] transition-all outline-none"
                    >
                      {CATEGORY_OPTIONS.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    {errors.landmarks?.[index]?.category && (
                      <span className="text-xs text-red-500">{errors.landmarks[index]?.category?.message}</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <label className="text-xs font-black text-neutral-700">وصف المعلم</label>
                  <textarea
                    {...register(`landmarks.${index}.description`)}
                    rows={2}
                    className="w-full rounded-xl bg-white border border-neutral-200 px-4 py-3 text-sm focus:border-[#23096E] focus:ring-1 focus:ring-[#23096E] transition-all outline-none resize-y"
                  />
                  {errors.landmarks?.[index]?.description && (
                    <span className="text-xs text-red-500">{errors.landmarks[index]?.description?.message}</span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-neutral-700">رابط صورة المعلم (اختياري)</label>
                    <input
                      {...register(`landmarks.${index}.image`)}
                      className="w-full rounded-xl bg-white border border-neutral-200 px-4 py-2.5 text-sm focus:border-[#23096E] focus:ring-1 focus:ring-[#23096E] transition-all outline-none text-left"
                      dir="ltr"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-black text-neutral-700">موقع المعلم - نص (اختياري)</label>
                    <input
                      {...register(`landmarks.${index}.locationText`)}
                      className="w-full rounded-xl bg-white border border-neutral-200 px-4 py-2.5 text-sm focus:border-[#23096E] focus:ring-1 focus:ring-[#23096E] transition-all outline-none"
                    />
                  </div>
                  
                  {/* Hidden field for ID */}
                  <input type="hidden" {...register(`landmarks.${index}.id`)} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="sticky bottom-6 flex items-center justify-end gap-3 p-4 bg-white/80 backdrop-blur-md border border-neutral-200/80 rounded-2xl shadow-sm z-10">
        <button
          type="button"
          onClick={() => reset(defaultValues)}
          disabled={!isDirty || isPending}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-neutral-600 hover:bg-neutral-100 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          تجاهل التغييرات
        </button>

        <button
          type="submit"
          disabled={!isDirty || isPending}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-[#23096E] text-white hover:bg-[#1A0554] shadow-md shadow-[#23096E]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isPending ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          حفظ التغييرات
        </button>
      </div>
    </form>
  );
}
