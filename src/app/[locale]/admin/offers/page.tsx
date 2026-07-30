'use client';

import { useState } from 'react';
import type { Offer } from '@/types';
import { 
  Megaphone, Plus, Edit2, Trash2, Search,
  Check, X, UploadCloud, Link as LinkIcon, MoveVertical, ExternalLink
} from 'lucide-react';

const mockOffers: Offer[] = [
  { id: '1', title: 'عروض صيف 2025', titleEn: 'Summer 2025 Deals', image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&q=80&w=1600', link: '/hotels?offers=summer', isActive: true, order: 1 },
  { id: '2', title: 'احجز مبكراً ووفر 30%', titleEn: 'Book Early Save 30%', image: 'https://images.unsplash.com/photo-1576403986427-bc0c12e73ce4?auto=format&fit=crop&q=80&w=1600', link: '/hotels', isActive: true, order: 2 },
  { id: '3', title: 'عروض عيد الأضحى - فنادق عدن', titleEn: 'Eid Al-Adha Deals', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1600', link: '/hotels/aden', isActive: false, order: 3 },
];

export default function OffersManagement() {
  const [offers, setOffers] = useState(mockOffers.sort((a, b) => a.order - b.order));
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    titleEn: '',
    image: '',
    link: '',
    isActive: true,
    order: 1,
  });

  const filteredOffers = offers.filter(o => 
    o.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.titleEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.link.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenEdit = (offer: Offer) => {
    setEditingOffer(offer);
    setFormData({
      title: offer.title,
      titleEn: offer.titleEn,
      image: offer.image,
      link: offer.link,
      isActive: offer.isActive !== undefined ? offer.isActive : true,
      order: offer.order || offers.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingOffer(null);
    setFormData({
      title: '',
      titleEn: '',
      image: '',
      link: '/',
      isActive: true,
      order: offers.length > 0 ? Math.max(...offers.map(o => o.order)) + 1 : 1,
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    let updatedOffers;
    if (editingOffer) {
      updatedOffers = offers.map(o => o.id === editingOffer.id ? { ...o, ...formData } : o);
    } else {
      const newOffer = {
        id: `offer_${Date.now()}`,
        ...formData,
        image: formData.image || 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&q=80&w=1600' // Default fallback
      };
      updatedOffers = [...offers, newOffer];
    }
    
    // Auto-sort by order after saving
    setOffers(updatedOffers.sort((a, b) => a.order - b.order));
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا العرض الإعلاني؟ لن يظهر مجدداً في السلايدر الرئيسي.')) {
      setOffers(offers.filter(o => o.id !== id));
    }
  };

  const toggleActive = (id: string) => {
    setOffers(offers.map(o => o.id === id ? { ...o, isActive: !o.isActive } : o));
  };

  // Helper to move items up/down in order
  const moveOrder = (id: string, direction: 'up' | 'down') => {
    const currentIndex = offers.findIndex(o => o.id === id);
    if (currentIndex < 0) return;
    
    if (direction === 'up' && currentIndex > 0) {
      const newOffers = [...offers];
      // Swap order numbers
      const tempOrder = newOffers[currentIndex].order;
      newOffers[currentIndex].order = newOffers[currentIndex - 1].order;
      newOffers[currentIndex - 1].order = tempOrder;
      setOffers(newOffers.sort((a, b) => a.order - b.order));
    } else if (direction === 'down' && currentIndex < offers.length - 1) {
      const newOffers = [...offers];
      // Swap order numbers
      const tempOrder = newOffers[currentIndex].order;
      newOffers[currentIndex].order = newOffers[currentIndex + 1].order;
      newOffers[currentIndex + 1].order = tempOrder;
      setOffers(newOffers.sort((a, b) => a.order - b.order));
    }
  };

  return (
    <div className="pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 mb-1">إدارة العروض والسلايدر الدعائي</h1>
          <p className="text-neutral-500 font-medium">تحكم بالصور الإعلانية والعروض الترويجية التي تظهر في شريط الصفحة الرئيسية.</p>
        </div>
        
        <button 
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-[#23096e] hover:bg-[#1a0654] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md">
          <Plus size={18} /> إضافة عرض إعلاني جديد
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white justify-between rounded-t-2xl shadow-sm border border-neutral-100 p-4 flex flex-col sm:flex-row items-center gap-4 border-b-0">
        <div className="relative w-full sm:w-96">
          <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input 
            type="text"
            placeholder="ابحث باسم العرض أو الرابط..."
            className="w-full pl-4 pr-10 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:border-[#23096e] focus:bg-white text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
           <div className="px-4 py-2 bg-neutral-50 rounded-xl border border-neutral-200 text-sm font-bold text-neutral-600 flex items-center gap-2">
             <Megaphone size={16}/> إجمالي الإعلانات: {offers.length}
           </div>
           <div className="px-4 py-2 bg-green-50 rounded-xl border border-green-200 text-sm font-bold text-green-700 flex items-center gap-2">
             <Check size={16}/> مفعلة ونشطة: {offers.filter(o => o.isActive).length}
           </div>
        </div>
      </div>

      {/* Offers Grid/List */}
      <div className="bg-white shadow-sm border border-neutral-100 rounded-b-2xl p-6">
        {filteredOffers.length === 0 ? (
          <div className="py-12 text-center text-neutral-500">
            لم يتم العثور على عروض أو إعلانات مسجلة
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredOffers.map((offer, index) => (
              <div key={offer.id} className="flex flex-col md:flex-row gap-6 p-4 rounded-2xl border border-neutral-200 hover:border-[#23096e]/30 transition-colors bg-neutral-50/50 items-center">
                
                {/* Image Preview */}
                <div className="w-full md:w-64 h-32 rounded-xl border border-neutral-200 overflow-hidden relative group shrink-0 shadow-sm">
                  <img src={offer.image} alt={offer.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs font-bold drop-shadow-md">معاينة الصورة</span>
                  </div>
                  {!offer.isActive && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                      غير مفعل
                    </div>
                  )}
                </div>

                {/* Offer Details */}
                <div className="flex-1 space-y-3 w-full">
                  <div>
                    <h3 className="text-lg font-black text-neutral-900 mb-1">{offer.title}</h3>
                    <p className="text-sm font-bold text-neutral-500 dir-ltr text-right">{offer.titleEn}</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 font-medium">
                      <LinkIcon size={12} /> 
                      <span className="dir-ltr">{offer.link}</span>
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-xs text-neutral-600 bg-neutral-100 px-3 py-1.5 rounded-lg border border-neutral-200 font-bold">
                      <MoveVertical size={12} /> الترتيب: {offer.order}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex md:flex-col items-center gap-2 shrink-0 border-t md:border-t-0 md:border-r border-neutral-200 pt-4 md:pt-0 md:pr-6 w-full md:w-auto">
                  
                  <div className="flex items-center bg-white border border-neutral-200 rounded-lg p-1 mr-auto md:mr-0 mb-0 md:mb-2 shadow-sm">
                    <button 
                      onClick={() => moveOrder(offer.id, 'up')}
                      disabled={index === 0}
                      className="p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-[#23096e] rounded disabled:opacity-30 disabled:hover:bg-transparent" title="نقل لأعلى">
                      <MoveVertical size={14} className="rotate-180"/>
                    </button>
                    <div className="w-px h-4 bg-neutral-200"></div>
                    <button 
                      onClick={() => moveOrder(offer.id, 'down')}
                      disabled={index === offers.length - 1}
                      className="p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-[#23096e] rounded disabled:opacity-30 disabled:hover:bg-transparent" title="نقل لأسفل">
                      <MoveVertical size={14} />
                    </button>
                  </div>

                  <button 
                    onClick={() => toggleActive(offer.id)}
                    className={`flex-1 md:flex-none flex justify-center items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border transition-colors ${offer.isActive ? 'bg-white border-amber-200 text-amber-600 hover:bg-amber-50' : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'}`}>
                    {offer.isActive ? 'تعطيل العرض' : 'تفعيل العرض'}
                  </button>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleOpenEdit(offer)}
                      className="p-2 border border-neutral-200 bg-white text-blue-600 hover:bg-blue-50 rounded-lg transition-colors shadow-sm" title="تعديل">
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(offer.id)}
                      className="p-2 border border-neutral-200 bg-white text-red-600 hover:bg-red-50 rounded-lg transition-colors shadow-sm" title="حذف">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- Add / Edit Modal --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="bg-white border-b border-neutral-100 p-6 flex justify-between items-center shrink-0">
              <h2 className="text-2xl font-black text-neutral-900 flex items-center gap-3">
                <Megaphone size={24} className="text-[#23096e]" />
                {editingOffer ? 'تحديث الإعلان / العرض' : 'إضافة إعلان جديد للسلايدر'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-neutral-100 rounded-full text-neutral-400 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 overflow-y-auto max-h-[70vh] space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-neutral-700">عنوان العرض المطبوع (بالعربية)</label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="مثال: خصم 50% على الطيران"
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#23096e] focus:bg-white transition-colors"
                  />
                  <p className="text-[10px] text-neutral-400">يستخدم كبديل نصي ولقارئات الشاشة</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-neutral-700">عنوان العرض المطبوع (بالإنجليزية)</label>
                  <input 
                    type="text" 
                    value={formData.titleEn}
                    onChange={(e) => setFormData({...formData, titleEn: e.target.value})}
                    placeholder="e.g. 50% Off Flights"
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#23096e] focus:bg-white transition-colors text-left dir-ltr"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-neutral-700">رابط التحويل (Link URL)</label>
                <div className="relative">
                  <ExternalLink size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input 
                    type="text" 
                    value={formData.link}
                    onChange={(e) => setFormData({...formData, link: e.target.value})}
                    placeholder="مثال: /hotels أو https://google.com"
                    className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#23096e] focus:bg-white transition-colors text-left dir-ltr"
                    dir="ltr"
                  />
                </div>
                <p className="text-xs text-neutral-500 font-medium">الرابط الذي سينتقل إليه المستخدم عند الضغط على الإعلان (استخدم روابط داخلية مثل /flights أو خارجية).</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-2">
                  <label className="text-sm font-bold text-neutral-700">ترتيب الظهور بالسلايدر</label>
                  <input 
                    type="number" 
                    min="1"
                    value={formData.order}
                    onChange={(e) => setFormData({...formData, order: Number(e.target.value)})}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#23096e] focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div className="border-t border-neutral-100 pt-6">
                <h4 className="font-bold text-lg text-neutral-900 mb-4">بانر الإعلان (الصورة المرئية)</h4>
                <div className="flex flex-col gap-4">
                  {formData.image && (
                    <div className="w-full h-40 bg-neutral-100 rounded-xl border border-neutral-200 overflow-hidden relative shadow-sm">
                      <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="w-full border-2 border-dashed border-neutral-200 rounded-xl p-6 text-center hover:bg-[#23096e]/5 hover:border-[#23096e]/30 transition-colors cursor-pointer flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white shadow flex items-center justify-center text-[#23096e] mb-1">
                      <UploadCloud size={24} />
                    </div>
                    <span className="text-base font-black text-neutral-800">رفع صورة بانر إعلانية</span>
                    <span className="text-sm font-bold text-neutral-500">1600x600 بكسل يفضل (أفقي عريض) لتناسب الشاشات</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-neutral-100 pt-6">
                 <label className="flex items-center gap-4 p-5 rounded-2xl border border-neutral-200 cursor-pointer hover:bg-neutral-50 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    className="w-5 h-5 text-[#23096e] rounded border-neutral-300 focus:ring-[#23096e]" 
                  />
                  <div>
                    <div className="font-bold text-neutral-900 text-sm mb-1">تفعيل ونشر العرض فوراً</div>
                    <div className="text-xs text-neutral-500 leading-relaxed">في حال إيقاف التفعيل، سيتم الاحتفاظ بالبانر كمسودة للعودة إليها مستقبلاً في المواسم القادمة.</div>
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
                {editingOffer ? 'حفظ التغييرات' : 'إضافة البانر للسلايدر'}
              </button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}
