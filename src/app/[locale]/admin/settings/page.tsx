'use client';

import { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import {
  Settings, Tags, CheckCircle2, Save,
  Trash2, Plus, PhoneCall, Mail, MapPin, BadgeCheck
} from 'lucide-react';
import { DEFAULT_AMENITIES, type GlobalAmenity } from '@/lib/amenities-store';

const DynamicIcon = ({ name, size = 18, className = '' }: { name: string; size?: number; className?: string }) => {
  const Icon = (LucideIcons as any)[name] || LucideIcons.Check;
  return <Icon size={size} className={className} />;
};

export default function SystemSettings() {
  const [activeTab, setActiveTab] = useState<'general' | 'amenities' | 'badges'>('general');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [generalSettings, setGeneralSettings] = useState({
    siteNameAr: 'مساري',
    siteNameEn: 'Msari',
    supportPhone: '+967 777 000 000',
    supportWhatsapp: '+967 777 000 000',
    supportEmail: 'support@msari.net',
    addressAr: 'شارع الستين، تقاطع المصباحي، الدائري، اليمن',
  });

  const [amenities, setAmenities] = useState<GlobalAmenity[]>(DEFAULT_AMENITIES);
  const [newAmenity, setNewAmenity] = useState<{ name: string; icon: string; type: 'hotel' | 'room' | 'space' }>({
    name: '', icon: 'Check', type: 'hotel',
  });

  const [badges, setBadges] = useState([
    { id: '1', name: 'تأكيد فوري', color: 'bg-green-100 text-green-700 border-green-200' },
    { id: '2', name: 'إلغاء مجاني', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    { id: '3', name: 'الدفع عند الوصول', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  ]);
  const [newBadge, setNewBadge] = useState({ name: '', color: 'bg-neutral-100 text-neutral-700 border-neutral-200' });

  const handleSaveGeneral = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1000);
  };

  const handleAddAmenity = () => {
    if (newAmenity.name) {
      setAmenities([{ id: Date.now().toString(), ...newAmenity }, ...amenities]);
      setNewAmenity({ name: '', icon: 'Check', type: 'hotel' });
    }
  };

  const handleDeleteAmenity = (id: string) => {
    if (confirm('تأكيد حذف المرفق؟')) setAmenities(amenities.filter(a => a.id !== id));
  };

  const handleAddBadge = () => {
    if (newBadge.name) {
      setBadges([{ id: Date.now().toString(), ...newBadge }, ...badges]);
      setNewBadge({ name: '', color: 'bg-neutral-100 text-neutral-700 border-neutral-200' });
    }
  };

  const handleDeleteBadge = (id: string) => {
    if (confirm('تأكيد حذف الشارة؟')) setBadges(badges.filter(b => b.id !== id));
  };

  return (
    <div className="pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 mb-1 flex items-center gap-2">
            <Settings className="text-[#23096e]" /> إعدادات النظام المتقدمة
          </h1>
          <p className="text-neutral-500 font-medium">التحكم في بيانات التواصل، إدارة المرافق العامة للفنادق، وإضافة شارات العروض المركزية.</p>
        </div>
      </div>

      {saveSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 size={20} className="text-green-600" />
          <span className="font-bold text-sm">تم حفظ الإعدادات بنجاح.</span>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full lg:w-64 shrink-0 space-y-2">
          {[
            { id: 'general' as const, label: 'الـعـامــة', icon: Settings },
            { id: 'amenities' as const, label: 'إدارة المرافق', icon: Tags },
            { id: 'badges' as const, label: 'شارات الحجوزات', icon: BadgeCheck },
          ].map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`w-full text-start flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === id ? 'bg-white shadow text-[#23096e] border border-neutral-100' : 'text-neutral-500 hover:bg-neutral-100'}`}>
              <Icon size={18} /> {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1">

          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 sm:p-8 animate-in fade-in">
              <h2 className="text-lg font-black text-neutral-900 mb-6 pb-4 border-b border-neutral-100">بيانات الموقع والتواصل</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {[
                  { label: 'دعم العملاء (رقم هاتف)', key: 'supportPhone', icon: PhoneCall, iconColor: '' },
                  { label: 'رقم الواتساب للتحقق', key: 'supportWhatsapp', icon: PhoneCall, iconColor: 'text-green-500' },
                  { label: 'البريد الإلكتروني للشكاوى', key: 'supportEmail', icon: Mail, iconColor: '' },
                  { label: 'العنوان الجغرافي (للفوتر)', key: 'addressAr', icon: MapPin, iconColor: '' },
                ].map(({ label, key, icon: Icon, iconColor }) => (
                  <div key={key} className="space-y-2">
                    <label className="text-sm font-bold text-neutral-700">{label}</label>
                    <div className="relative">
                      <Icon size={18} className={`absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 ${iconColor}`} />
                      <input type={key === 'supportEmail' ? 'email' : 'text'}
                        value={generalSettings[key as keyof typeof generalSettings]}
                        onChange={e => setGeneralSettings({ ...generalSettings, [key]: e.target.value })}
                        className="w-full pr-12 pl-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#23096e]" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end pt-4 border-t border-neutral-100">
                <button onClick={handleSaveGeneral} disabled={isSaving}
                  className="flex items-center gap-2 bg-[#23096e] hover:bg-[#1a0654] text-white px-8 py-3 rounded-xl font-bold text-sm shadow-md transition-all">
                  <Save size={18} /> {isSaving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
                </button>
              </div>
            </div>
          )}

          {/* Amenities Tab */}
          {activeTab === 'amenities' && (
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 sm:p-8 animate-in fade-in">
              <h2 className="text-lg font-black text-neutral-900 mb-1">إدارة قوائم المرافق والتجهيزات</h2>
              <p className="text-sm text-neutral-500 mb-6 font-medium">
                المرافق المضافة هنا تظهر كخيارات عند إضافة فندق أو غرفة في لوحة التحكم.
              </p>

              {/* Add form */}
              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 mb-8 flex flex-col sm:flex-row gap-4 items-end">
                <div className="w-full space-y-1.5">
                  <label className="text-xs font-bold text-neutral-600">اسم المرفق (عربي)</label>
                  <input type="text" placeholder="مثال: مطعم مأكولات بحرية"
                    className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:border-[#23096e] text-sm"
                    value={newAmenity.name} onChange={e => setNewAmenity({ ...newAmenity, name: e.target.value })} />
                </div>
                <div className="w-full sm:w-48 space-y-1.5">
                  <label className="text-xs font-bold text-neutral-600">النوع</label>
                  <select className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:border-[#23096e] text-sm"
                    value={newAmenity.type} onChange={e => setNewAmenity({ ...newAmenity, type: e.target.value as 'hotel' | 'room' | 'space' })}>
                    <option value="hotel">مرفق عام (للفندق)</option>
                    <option value="room">تجهيز (للغرفة)</option>
                    <option value="space">تفاصيل المساحة والسعة</option>
                  </select>
                </div>
                <button onClick={handleAddAmenity}
                  className="w-full sm:w-auto shrink-0 bg-[#23096e] hover:bg-[#1a0654] text-white px-6 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2">
                  <Plus size={16} /> إضافة مرفق
                </button>
              </div>

              {/* Summary counts */}
              <div className="flex flex-wrap gap-3 mb-6">
                {[
                  { type: 'hotel', label: 'مرافق فندقية', color: 'blue' },
                  { type: 'room', label: 'تجهيزات غرف', color: 'purple' },
                  { type: 'space', label: 'مساحة وسعة', color: 'amber' },
                ].map(({ type, label, color }) => (
                  <div key={type} className={`px-4 py-1.5 rounded-full text-sm font-bold bg-${color}-50 text-${color}-700 border border-${color}-200`}>
                    {amenities.filter(a => a.type === type).length} {label}
                  </div>
                ))}
              </div>

              {/* List */}
              <div className="space-y-3">
                {amenities.map(amenity => (
                  <div key={amenity.id} className="flex items-center justify-between p-4 bg-white border border-neutral-100 rounded-xl hover:border-neutral-300 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        amenity.type === 'hotel' ? 'bg-blue-50 text-blue-600' :
                        amenity.type === 'room'  ? 'bg-purple-50 text-purple-600' :
                        'bg-amber-50 text-amber-600'
                      }`}>
                        <DynamicIcon name={amenity.icon} size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-neutral-900">{amenity.name}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md mt-1 inline-block ${
                          amenity.type === 'hotel' ? 'bg-blue-50 text-blue-700' :
                          amenity.type === 'room'  ? 'bg-purple-50 text-purple-700' :
                          'bg-amber-50 text-amber-700'
                        }`}>
                          {amenity.type === 'hotel' ? 'مرفق فندقي' : amenity.type === 'room' ? 'تجهيز غرفة' : 'مساحة وسعة'}
                        </span>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteAmenity(amenity.id)}
                      className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Badges Tab */}
          {activeTab === 'badges' && (
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 sm:p-8 animate-in fade-in">
              <h2 className="text-lg font-black text-neutral-900 mb-1">إدارة الشارات المركزية (Badges)</h2>
              <p className="text-sm text-neutral-500 mb-6 font-medium">هذه الشارات تظهر تحت الفنادق لتمييزها بنقاط بيع قوية.</p>

              {/* Add form */}
              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 mb-8 flex flex-col sm:flex-row gap-4 items-end">
                <div className="w-full space-y-1.5">
                  <label className="text-xs font-bold text-neutral-600">نص الشارة</label>
                  <input type="text" placeholder="مثال: خصم حصري"
                    className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:border-[#23096e] text-sm"
                    value={newBadge.name} onChange={e => setNewBadge({ ...newBadge, name: e.target.value })} />
                </div>
                <div className="w-full sm:w-64 space-y-1.5">
                  <label className="text-xs font-bold text-neutral-600">النمط اللوني</label>
                  <select className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:border-[#23096e] text-sm"
                    value={newBadge.color} onChange={e => setNewBadge({ ...newBadge, color: e.target.value })}>
                    <option value="bg-green-100 text-green-700 border-green-200">الأخضر (تأكيد / نجاح)</option>
                    <option value="bg-blue-100 text-blue-700 border-blue-200">الأزرق (معلومة هامة)</option>
                    <option value="bg-amber-100 text-amber-700 border-amber-200">الذهبي (أموال / مميز)</option>
                    <option value="bg-red-100 text-red-700 border-red-200">الأحمر (تنبيه / نفاد)</option>
                  </select>
                </div>
                <button onClick={handleAddBadge}
                  className="w-full sm:w-auto shrink-0 bg-[#23096e] hover:bg-[#1a0654] text-white px-6 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2">
                  <Plus size={16} /> إنشاء شارة
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {badges.map(badge => (
                  <div key={badge.id} className="p-4 border border-neutral-200 rounded-xl bg-white flex flex-col gap-4">
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border w-fit ${badge.color}`}>
                      {badge.name}
                    </span>
                    <div className="flex justify-end pt-3 border-t border-neutral-100 mt-auto">
                      <button onClick={() => handleDeleteBadge(badge.id)}
                        className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1">
                        <Trash2 size={12} /> حذف
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
