'use client';

import { useState } from 'react';
import { 
  Car, Search, Plus, Edit2, Trash2, 
  Users, BaggageClaim, Check, X, Tag as TagIcon, ArrowRight, UploadCloud, MapPin, PlaneTakeoff
} from 'lucide-react';

const initialAirportCars = [
  { id: 'a1', city: 'عدن', name: 'تويوتا يارس أو مشابه', tag: 'اقتصادية', desc: 'سيارة عمليه ومناسبة', cap: 4, bags: 2, price: 35, img: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=600', isAvailable: true },
  { id: 'a2', city: 'صنعاء', name: 'تويوتا برادو', tag: 'عائلية SUV', desc: 'دفع رباعي قوي', cap: 7, bags: 4, price: 80, img: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&q=80&w=600', isAvailable: true }
];

const initialIntercityCars = [
  { id: 'i1', from: 'عدن', to: 'صنعاء', name: 'تويوتا هايس 14 راكب', tag: 'فان نقل', desc: 'باص كبير مريح للخطوط الطويلة', cap: 14, bags: 10, price: 150, img: 'https://images.unsplash.com/photo-1619682817481-e994891bf1e5?auto=format&fit=crop&q=80&w=600', isAvailable: true },
  { id: 'i2', from: 'سيئون', to: 'المكلا', name: 'تويوتا كامري', tag: 'أعمال', desc: 'لرحلات الأعمال الخاصة والمريحة', cap: 4, bags: 2, price: 100, img: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&q=80&w=600', isAvailable: true }
];

type CarEntry = {
  id: string;
  city?: string;
  from?: string;
  to?: string;
  name: string;
  tag: string;
  desc: string;
  cap: number;
  bags: number;
  price: number;
  img: string;
  isAvailable: boolean;
};

export default function CarsManagement() {
  const [activeTab, setActiveTab] = useState<'airport' | 'intercity'>('airport');
  
  const [airportCars, setAirportCars] = useState<CarEntry[]>(initialAirportCars);
  const [intercityCars, setIntercityCars] = useState<CarEntry[]>(initialIntercityCars);
  
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CarEntry | null>(null);

  // Unified Form State (we use optional keys for `city`, `from`, `to`)
  const [formData, setFormData] = useState({
    city: 'عدن',     // Used for Airport
    from: 'عدن',     // Used for Intercity
    to: 'صنعاء',      // Used for Intercity
    name: '',
    tag: 'اقتصادية',
    desc: '',
    cap: 4,
    bags: 2,
    price: 35,
    img: '',
    isAvailable: true,
  });

  const filteredData = activeTab === 'airport' 
    ? airportCars.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.city.toLowerCase().includes(searchTerm.toLowerCase()))
    : intercityCars.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.from.toLowerCase().includes(searchTerm.toLowerCase()) || c.to.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleOpenEdit = (item: CarEntry) => {
    setEditingItem(item);
    setFormData({
      city: item.city || 'عدن',
      from: item.from || 'عدن',
      to: item.to || 'صنعاء',
      name: item.name || '',
      tag: item.tag || 'اقتصادية',
      desc: item.desc || '',
      cap: item.cap || 4,
      bags: item.bags || 2,
      price: item.price || 50,
      img: item.img || '',
      isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
    });
    setIsModalOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      city: 'عدن',
      from: 'عدن',
      to: 'صنعاء',
      name: '',
      tag: 'اقتصادية',
      desc: '',
      cap: 4,
      bags: 2,
      price: 50,
      img: '',
      isAvailable: true,
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (activeTab === 'airport') {
      const newItem = {
        id: editingItem ? editingItem.id : `a${Date.now()}`,
        name: formData.name,
        tag: formData.tag,
        desc: formData.desc,
        cap: formData.cap,
        bags: formData.bags,
        price: formData.price,
        img: formData.img || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=600',
        isAvailable: formData.isAvailable,
        city: formData.city
      };

      if (editingItem) {
        setAirportCars(airportCars.map(c => c.id === editingItem.id ? newItem : c));
      } else {
        setAirportCars([newItem, ...airportCars]);
      }
    } else {
      const newItem = {
        id: editingItem ? editingItem.id : `i${Date.now()}`,
        name: formData.name,
        tag: formData.tag,
        desc: formData.desc,
        cap: formData.cap,
        bags: formData.bags,
        price: formData.price,
        img: formData.img || 'https://images.unsplash.com/photo-1619682817481-e994891bf1e5?auto=format&fit=crop&q=80&w=600',
        isAvailable: formData.isAvailable,
        from: formData.from,
        to: formData.to
      };

      if (editingItem) {
        setIntercityCars(intercityCars.map(c => c.id === editingItem.id ? newItem : c));
      } else {
        setIntercityCars([newItem, ...intercityCars]);
      }
    }
    
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه السيارة من النظام؟')) {
      if (activeTab === 'airport') {
        setAirportCars(airportCars.filter(c => c.id !== id));
      } else {
        setIntercityCars(intercityCars.filter(c => c.id !== id));
      }
    }
  };

  return (
    <div className="pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 mb-1">إدارة سيارات النقل والتوصيل</h1>
          <p className="text-neutral-500 font-medium">إضافة وإدارة أسطول سيارات النقل بين المدن، وسيارات توصيل المطار بالتفصيل.</p>
        </div>
        
        <button 
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-[#23096e] hover:bg-[#1a0654] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md">
          <Plus size={18} /> {activeTab === 'airport' ? 'إضافة سيارة مطار' : 'إضافة سيارة نقل لخط ملاحي'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-neutral-200">
        <button 
          onClick={() => { setActiveTab('airport'); setSearchTerm(''); }}
          className={`flex flex-1 md:flex-none items-center justify-center gap-2 px-6 py-4 font-bold text-sm transition-colors border-b-2 ${activeTab === 'airport' ? 'border-[#23096e] text-[#23096e] bg-[#23096e]/5' : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50'}`}>
          <PlaneTakeoff size={18} /> سيارات توصيل المطار
        </button>
        <button 
          onClick={() => { setActiveTab('intercity'); setSearchTerm(''); }}
          className={`flex flex-1 md:flex-none items-center justify-center gap-2 px-6 py-4 font-bold text-sm transition-colors border-b-2 ${activeTab === 'intercity' ? 'border-[#23096e] text-[#23096e] bg-[#23096e]/5' : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50'}`}>
          <MapPin size={18} /> سيارات النقل بين المدن
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white justify-between rounded-t-2xl shadow-sm border border-neutral-100 p-4 flex flex-col sm:flex-row items-center gap-4 border-b-0">
        <div className="relative w-full sm:w-96">
          <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input 
            type="text"
            placeholder={activeTab === 'airport' ? 'ابحث باسم المدينة أو المطار أو السيارة...' : 'ابحث باسم المدينة (من/إلى) أو السيارة...'}
            className="w-full pl-4 pr-10 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:border-[#23096e] focus:bg-white text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
           <div className="px-4 py-2 bg-neutral-50 rounded-xl border border-neutral-200 text-sm font-bold text-neutral-600 flex items-center gap-2">
             <Car size={16}/> إجمالي السيارات المُدرجة: {filteredData.length}
           </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow-sm border border-neutral-100 rounded-b-2xl overflow-x-auto">
        <table className="w-full text-start">
          <thead className="bg-neutral-50 border-b border-neutral-100 text-neutral-500 text-sm font-bold">
            <tr>
              <th className="py-4 px-6 text-start">السيارة والمواصفات</th>
              {activeTab === 'airport' ? (
                <th className="py-4 px-6 text-start">المدينة / المطار</th>
              ) : (
                <th className="py-4 px-6 text-start">مسار النقل (من - إلى)</th>
              )}
              <th className="py-4 px-6 text-start">السعة والتفاصيل</th>
              <th className="py-4 px-6 text-start">سعر التوصيلة / الرحلة</th>
              <th className="py-4 px-6 text-start">الحالة</th>
              <th className="py-4 px-6 text-end">تعديل / حذف</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filteredData.map((item: CarEntry) => (
              <tr key={item.id} className="hover:bg-neutral-50 transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-4">
                    <img src={item.img} alt={item.name} className="w-16 h-12 rounded-lg object-cover border border-neutral-200" />
                    <div>
                      <div className="font-black text-neutral-900 mb-1">{item.name} <span className="text-[10px] font-bold bg-[#23096e]/10 text-[#23096e] px-2 py-0.5 rounded mr-1 leading-none">{item.tag}</span></div>
                      <div className="text-xs text-neutral-500 font-medium max-w-xs">{item.desc}</div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6 font-bold text-neutral-800">
                  {activeTab === 'airport' ? (
                    <span className="flex items-center gap-1"><PlaneTakeoff size={14} className="text-[#23096e]" /> {item.city}</span>
                  ) : (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-neutral-500 flex items-center gap-1">من: <strong className="text-neutral-900 text-sm">{item.from}</strong></span>
                      <span className="text-xs text-neutral-500 flex items-center gap-1">إلى: <strong className="text-neutral-900 text-sm">{item.to}</strong></span>
                    </div>
                  )}
                </td>
                <td className="py-4 px-6">
                  <div className="flex flex-col gap-1 text-sm font-bold text-neutral-700">
                    <div className="flex items-center gap-1.5"><Users size={14} className="text-[#23096e]" /> {item.cap} ركاب</div>
                    <div className="flex items-center gap-1.5"><BaggageClaim size={14} className="text-[#23096e]" /> {item.bags} حقائب</div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="font-black text-neutral-900 text-lg">${item.price}</div>
                </td>
                <td className="py-4 px-6">
                  {item.isAvailable ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                      <Check size={12} /> متوفرة / مفعلة
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-neutral-100 text-neutral-600">
                      <X size={12} /> متوقفة مؤقتاً
                    </span>
                  )}
                </td>
                <td className="py-4 px-6 text-end">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => handleOpenEdit(item)}
                      className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="تعديل">
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors" title="حذف">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-neutral-500">
                  لم يتم العثور على سيارات مطابقة لبحثك في هذا القسم
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
          
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="bg-white border-b border-neutral-100 p-6 flex justify-between items-center shrink-0">
              <h2 className="text-2xl font-black text-neutral-900 flex items-center gap-3">
                {activeTab === 'airport' ? <PlaneTakeoff size={24} className="text-[#23096e]" /> : <MapPin size={24} className="text-[#23096e]" />}
                {editingItem ? 'تعديل بيانات وبيانات سيارة النقل' : (activeTab === 'airport' ? 'تخصيص سيارة لتوصيل المطار' : 'تخصيص سيارة لخط نقل بين المدن')}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-neutral-100 rounded-full text-neutral-400 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 overflow-y-auto max-h-[70vh] space-y-8">

              {/* Location Data */}
              <div className="bg-neutral-50 p-5 rounded-2xl border border-neutral-100 mb-2">
                <h3 className="text-sm font-black text-[#23096e] mb-4 flex items-center gap-2">
                  <MapPin size={16} /> تحديد النطاق / الخط המلاحي للسيارة
                </h3>
                {activeTab === 'airport' ? (
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-neutral-700">المدينة / المطار المدعوم في هذه التوصيلة</label>
                    <input 
                      type="text" 
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      placeholder="مثال: مطار عدن أو مدينة عدن"
                      className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-[#23096e] transition-colors"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-neutral-700">مدينة الانطلاق (من)</label>
                      <input 
                        type="text" 
                        value={formData.from}
                        onChange={(e) => setFormData({...formData, from: e.target.value})}
                        placeholder="مثال: صنعاء"
                        className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-[#23096e] transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-neutral-700">مدينة الوصول (إلى)</label>
                      <input 
                        type="text" 
                        value={formData.to}
                        onChange={(e) => setFormData({...formData, to: e.target.value})}
                        placeholder="مثال: تعز"
                        className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-[#23096e] transition-colors"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-neutral-700">اسم السيارة / الموديل</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="مثال: تويوتا كامري 2024"
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#23096e] focus:bg-white transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-neutral-700">الفئة</label>
                  <select 
                    value={formData.tag}
                    onChange={(e) => setFormData({...formData, tag: e.target.value})}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#23096e] focus:bg-white transition-colors">
                    <option value="اقتصادية">اقتصادية</option>
                    <option value="أعمال">أعمال / رجال أعمال</option>
                    <option value="عائلية SUV">عائلية SUV</option>
                    <option value="فان نقل">فان نقل ركاب</option>
                    <option value="سيدان فارهة">سيدان فارهة</option>
                    <option value="دفع رباعي">دفع رباعي 4x4</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-neutral-700">سعر {activeTab === 'airport' ? 'توصيلة المطار' : 'الرحلة'} ($)</label>
                  <input 
                    type="number" 
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#23096e] focus:bg-white transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-neutral-700">المواصفات المختصرة / نبذة عن السيارة</label>
                  <input 
                    type="text" 
                    value={formData.desc}
                    onChange={(e) => setFormData({...formData, desc: e.target.value})}
                    placeholder="مثال: مريحة ومناسبة للمدينة والرحلات القصيرة..."
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#23096e] focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-neutral-700 flex items-center gap-1"><Users size={16}/> أقصى عدد ركاب تستوعبه</label>
                  <input 
                    type="number" 
                    min="1"
                    value={formData.cap}
                    onChange={(e) => setFormData({...formData, cap: Number(e.target.value)})}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#23096e] focus:bg-white transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-neutral-700 flex items-center gap-1"><BaggageClaim size={16}/> سعة الحقائب الممكن جلبها</label>
                  <input 
                    type="number" 
                    min="0"
                    value={formData.bags}
                    onChange={(e) => setFormData({...formData, bags: Number(e.target.value)})}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#23096e] focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div className="border-t border-neutral-100 pt-6">
                <h4 className="font-bold text-lg text-neutral-900 mb-4">الصورة التمثيلية للسيارة</h4>
                <div className="flex items-center gap-4">
                  <div className="w-32 h-24 bg-neutral-100 rounded-xl border border-neutral-200 overflow-hidden flex-shrink-0">
                    {formData.img ? (
                      <img src={formData.img} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-400 text-xs text-center p-2">بدون صورة</div>
                    )}
                  </div>
                  <div className="flex-1 border-2 border-dashed border-neutral-200 rounded-xl p-4 text-center hover:bg-neutral-50 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2">
                    <UploadCloud size={20} className="text-[#23096e]" />
                    <span className="text-sm font-bold text-neutral-700">رفع صورة جديدة لتشجيع العميل</span>
                    <span className="text-xs text-neutral-400">تدعم الصيغ PNG و JPG</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-neutral-100 pt-6">
                 <label className="flex items-center gap-4 p-5 rounded-2xl border border-neutral-200 cursor-pointer hover:bg-neutral-50 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({...formData, isAvailable: e.target.checked})}
                    className="w-5 h-5 text-[#23096e] rounded border-neutral-300 focus:ring-[#23096e]" 
                  />
                  <div>
                    <div className="font-bold text-neutral-900 text-sm mb-1">السيارة متاحة لتلقي الحجوزات {activeTab === 'airport' ? 'لتوصيل المطار' : 'في هذا الخط الملاحي'}</div>
                    <div className="text-xs text-neutral-500 leading-relaxed">أزل علامة التحديد لإخفاء وحجب الحجوزات مؤقتاً عند عدم توفر السيارة.</div>
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
                onClick={handleSave}
                className="px-8 py-2.5 bg-[#23096e] hover:bg-[#1a0654] text-white rounded-xl font-bold text-sm transition-all shadow-md">
                {editingItem ? 'حفظ التعديلات' : 'إضافة إلى النظام'}
              </button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}
