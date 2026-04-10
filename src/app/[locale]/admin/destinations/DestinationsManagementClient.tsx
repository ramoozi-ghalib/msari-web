'use client';

import { useState, useTransition } from 'react';
import type { City } from '@/types';
import { 
  MapPin, Search, Plus, Edit2, Trash2, 
  Check, X, UploadCloud, Star, Globe, Loader2
} from 'lucide-react';
import { createCity, updateCity, deleteCity } from '@/actions/cities';
import { uploadImage } from '@/actions/storage';

interface Props {
  initialCities: City[];
}

export default function DestinationsManagementClient({ initialCities }: Props) {
  const [cities, setCities] = useState(initialCities);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [saveError, setSaveError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    nameAr: '',
    nameEn: '',
    governorateAr: '',
    governorateEn: '',
    imageUrl: '',
    isActive: true,
  });

  const filteredCities = cities.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.governorate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenEdit = (city: City) => {
    setEditingCity(city);
    setFormData({
      nameAr: city.name,
      nameEn: city.nameEn,
      governorateAr: city.governorate,
      governorateEn: city.governorateEn,
      imageUrl: city.image,
      isActive: city.isActive !== false,
    });
    setSaveError('');
    setIsModalOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingCity(null);
    setFormData({
      nameAr: '',
      nameEn: '',
      governorateAr: '',
      governorateEn: '',
      imageUrl: '',
      isActive: true,
    });
    setSaveError('');
    setIsModalOpen(true);
  };

  const handleSave = () => {
    setSaveError('');
    startTransition(async () => {
      const res = editingCity 
        ? await updateCity(editingCity.id, formData)
        : await createCity(formData);

      if (res.success) {
        setIsModalOpen(false);
        window.location.reload(); 
      } else {
        setSaveError(res.error || 'حدث خطأ ما');
      }
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size < 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert('حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت.');
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = reader.result as string;
        const res = await uploadImage(base64, 'destinations', file.name);
        if (res.success && res.url) {
          setFormData(prev => ({ ...prev, imageUrl: res.url! }));
        } else {
          alert('فشل الرفع: ' + res.error);
        }
        setIsUploading(false);
      };
    } catch (err) {
      console.error(err);
      setIsUploading(false);
      alert('خطأ أثناء معالجة الصورة');
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الوجهة بالكامل من النظام؟')) {
      startTransition(async () => {
        const res = await deleteCity(id);
        if (res.success) {
          setCities(cities.filter(c => c.id !== id));
        } else {
          alert('خطأ: ' + res.error);
        }
      });
    }
  };

  return (
    <div className="pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 mb-1">إدارة الوجهات والمدن</h1>
          <p className="text-neutral-500 font-medium">أضف المدن، تحكم بالصور والبيانات، وحدد الوجهات المميزة لتعُرض في الصفحة الرئيسية.</p>
        </div>
        
        <button 
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-[#23096e] hover:bg-[#1a0654] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md">
          <Plus size={18} /> إضافة وجهة / مدينة جديدة
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white justify-between rounded-t-2xl shadow-sm border border-neutral-100 p-4 flex flex-col sm:flex-row items-center gap-4 border-b-0">
        <div className="relative w-full sm:w-96">
          <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input 
            type="text"
            placeholder="ابحث باسم المدينة عربي/إنجليزي..."
            className="w-full pl-4 pr-10 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:border-[#23096e] focus:bg-white text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
           <div className="px-4 py-2 bg-neutral-50 rounded-xl border border-neutral-200 text-sm font-bold text-neutral-600 flex items-center gap-2">
             <MapPin size={16}/> إجمالي الوجهات: {cities.length}
           </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow-sm border border-neutral-100 rounded-b-2xl overflow-x-auto">
        <table className="w-full text-start">
          <thead className="bg-neutral-50 border-b border-neutral-100 text-neutral-500 text-sm font-bold">
            <tr>
              <th className="py-4 px-6 text-start">المدينة / المعلم (AR/EN)</th>
              <th className="py-4 px-6 text-start">المحافظة / الإقليم</th>
              <th className="py-4 px-6 text-start">فنادق</th>
              <th className="py-4 px-6 text-start">الحالة</th>
              <th className="py-4 px-6 text-end">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filteredCities.map((city) => (
              <tr key={city.id} className="hover:bg-neutral-50 transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-4">
                    {city.image ? (
                       <img src={city.image} alt={city.name} className="w-16 h-12 rounded-lg object-cover border border-neutral-200" />
                    ) : (
                       <div className="w-16 h-12 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-300"><MapPin size={20}/></div>
                    )}
                    <div>
                      <div className="font-black text-[#23096e] text-base mb-1">{city.name}</div>
                      <div className="text-xs text-neutral-500 font-bold flex items-center gap-1"><Globe size={10} /> {city.nameEn}</div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex flex-col gap-1 text-sm font-bold text-neutral-700">
                    <div>{city.governorate}</div>
                    <div className="text-xs text-neutral-500 font-medium">{city.governorateEn}</div>
                  </div>
                </td>
                <td className="py-4 px-6">
                   <span className="text-sm font-bold text-neutral-600">{city.hotelCount} فندق</span>
                </td>
                <td className="py-4 px-6">
                  {city.isActive !== false ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                      <Check size={12} /> مفعلة
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-neutral-100 text-neutral-600">
                      <X size={12} /> مسودة
                    </span>
                  )}
                </td>
                <td className="py-4 px-6 text-end">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => handleOpenEdit(city)}
                      className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="تعديل">
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(city.id)} disabled={isPending}
                      className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50" title="حذف">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            
            {(filteredCities.length === 0 && !isPending) && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-neutral-500">
                  لم يتم العثور على مدن مطابقة لبحثك
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- Add / Edit Modal --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="bg-white border-b border-neutral-100 p-6 flex justify-between items-center shrink-0">
              <h2 className="text-2xl font-black text-neutral-900 flex items-center gap-3">
                <MapPin size={24} className="text-[#23096e]" />
                {editingCity ? 'تعديل بيانات الوجهة' : 'إضافة وجهة سياحية / مدينة جديدة'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-neutral-100 rounded-full text-neutral-400 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 overflow-y-auto max-h-[70vh] space-y-6">
              
              {saveError && (
                <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 text-sm font-bold">
                  ⚠️ {saveError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-neutral-700">اسم المدينة (بالعربية)</label>
                  <input 
                    type="text" 
                    value={formData.nameAr}
                    onChange={(e) => setFormData({...formData, nameAr: e.target.value})}
                    placeholder="مثال: عدن"
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#23096e] focus:bg-white transition-colors text-sm"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-neutral-700">اسم المدينة (بالإنجليزية)</label>
                  <input 
                    type="text" 
                    value={formData.nameEn}
                    onChange={(e) => setFormData({...formData, nameEn: e.target.value})}
                    placeholder="مثال: Aden"
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#23096e] focus:bg-white transition-colors text-sm text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-neutral-700">المحافظة / الإقليم (بالعربية)</label>
                  <input 
                    type="text" 
                    value={formData.governorateAr}
                    onChange={(e) => setFormData({...formData, governorateAr: e.target.value})}
                    placeholder="مثال: محافظة عدن"
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#23096e] focus:bg-white transition-colors text-sm"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-neutral-700">المحافظة / الإقليم (بالإنجليزية)</label>
                  <input 
                    type="text" 
                    value={formData.governorateEn}
                    onChange={(e) => setFormData({...formData, governorateEn: e.target.value})}
                    placeholder="مثال: Aden Governorate"
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#23096e] focus:bg-white transition-colors text-sm text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="border-t border-neutral-100 pt-6">
                <h4 className="font-bold text-lg text-neutral-900 mb-4">صورة غلاف الوجهة</h4>
                <div className="flex items-center gap-6">
                  <div className="w-40 h-28 bg-neutral-100 rounded-2xl border border-neutral-200 overflow-hidden flex-shrink-0 relative group shadow-sm">
                    {formData.imageUrl ? (
                      <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-neutral-300 text-xs text-center p-2">
                        <UploadCloud size={24} className="mb-1 opacity-50" />
                        لا توجد صورة
                      </div>
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center">
                        <Loader2 size={24} className="animate-spin text-[#23096e]" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-col gap-2">
                      <label className="inline-flex items-center justify-center gap-2 bg-[#23096e]/10 text-[#23096e] hover:bg-[#23096e]/20 px-4 py-2.5 rounded-xl font-bold text-xs cursor-pointer transition-all border border-[#23096e]/20 w-fit">
                        <UploadCloud size={16} />
                        {isUploading ? 'جاري الرفع...' : 'اختر صورة من الجهاز'}
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={isUploading} />
                      </label>
                      <p className="text-[10px] text-neutral-400 font-medium">يفضل استخدام صور أفقية بنسبة 1200x800 بكسل بحد أقصى 5MB.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-neutral-100 pt-6 space-y-3">
                <label className="flex items-center gap-4 p-5 rounded-2xl border border-neutral-200 cursor-pointer hover:bg-neutral-50 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    className="w-5 h-5 text-[#23096e] rounded border-neutral-300 focus:ring-[#23096e]" 
                  />
                  <div>
                    <div className="font-bold text-neutral-900 text-sm mb-1 line-clamp-1">تفعيل هذه المدينة في الموقع (متاحة للبحث)</div>
                    <div className="text-xs text-neutral-500 leading-relaxed">أزل علامة التحديد إذا أردت إخفاء المدينة من قوائم البحث والمنصة مؤقتاً.</div>
                  </div>
                </label>
              </div>

            </div>

            <div className="bg-neutral-50 border-t border-neutral-100 p-6 flex justify-end gap-3 shrink-0">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 text-neutral-600 hover:bg-neutral-200 rounded-xl font-bold text-sm transition-colors">
                إلغاء
              </button>
              <button 
                onClick={handleSave} disabled={isPending}
                className="px-8 py-2.5 bg-[#23096e] hover:bg-[#1a0654] text-white rounded-xl font-bold text-sm transition-all shadow-md flex items-center gap-2">
                {isPending && <Loader2 size={16} className="animate-spin"/>}
                {editingCity ? 'حفظ التعديلات' : 'إضافة الوجهة'}
              </button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}
