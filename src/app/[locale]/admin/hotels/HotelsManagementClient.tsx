'use client';

import { useState, useTransition } from 'react';
import * as LucideIcons from 'lucide-react';
import {
  Building, Search, Plus, Edit2, Trash2, MapPin, Star, Tag, Check, X,
  Building2, ArrowRight, UploadCloud, Loader2, BedDouble, Users, Bath,
  DoorOpen, Image as ImageIcon
} from 'lucide-react';
import type { Hotel, Room } from '@/types';
import { updateHotel, createHotel, setHotelDiscount, deleteHotel, upsertRoom, deleteRoom } from '@/actions/admin';
import { uploadImage } from '@/actions/storage';
import { DEFAULT_AMENITIES, type GlobalAmenity } from '@/lib/amenities-store';

// ─── Helpers ────────────────────────────────────────────────────────────────
const DynIcon = ({ name, size = 16 }: { name: string; size?: number }) => {
  const Icon = (LucideIcons as any)[name] ?? LucideIcons.Check;
  return <Icon size={size} />;
};

const HOTEL_AMENITIES = DEFAULT_AMENITIES.filter(a => a.type === 'hotel');
const ROOM_AMENITIES  = DEFAULT_AMENITIES.filter(a => a.type === 'room');
const SPACE_DETAILS   = DEFAULT_AMENITIES.filter(a => a.type === 'space');

type Tab = 'basic' | 'amenities' | 'media' | 'rooms';

interface RoomForm {
  id?: string;
  name: string;
  nameEn: string;
  description: string;
  pricePerNight: number;
  capacity: number;
  isAvailable: boolean;
  images: string[];
  selectedAmenities: string[]; // amenity names from DEFAULT_AMENITIES (room type)
  spaceDetails: Record<string, number>; // e.g. { 'عدد الغرف': 1, 'عدد الأسرّه': 2 }
  isNew?: boolean;
}

interface Props { 
  initialHotels: Hotel[];
  initialCities: any[]; // City[]
  dbAmenities: any[];   // Amenity[]
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function HotelsManagementClient({ initialHotels, initialCities, dbAmenities }: Props) {
  const [hotels, setHotels] = useState<Hotel[]>(initialHotels);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPending, startTransition] = useTransition();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('basic');
  const [roomForm, setRoomForm] = useState<RoomForm | null>(null);
  const [saveMsg, setSaveMsg] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Selected hotel amenities (IDs)
  const [selectedHotelAmenities, setSelectedHotelAmenities] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: '', nameEn: '', cityId: '', stars: 4,
    priceFrom: 0, discountPercentage: 0, isFeatured: false, isActive: true,
    address: '', description: '',
    checkInTime: '14:00', checkOutTime: '12:00', policyAr: '',
    images: [] as string[],
    mapUrl: '',
  });

  // Filter amenities by category (mapped categories are lowercase from mappers.ts)
  const hotelAmenitiesFromDB = dbAmenities.filter(a => a.category !== 'room');
  const roomAmenitiesFromDB  = dbAmenities.filter(a => a.category === 'room');

  const filtered = hotels.filter(h =>
    h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (h.city && h.city.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const openEdit = (hotel: Hotel) => {
    setEditingHotel(hotel);
    setFormData({
      name: hotel.name, nameEn: hotel.nameEn || '',
      cityId: hotel.cityId || '', stars: hotel.stars,
      priceFrom: hotel.priceFrom,
      discountPercentage: hotel.discount?.percentage || 0,
      isFeatured: hotel.isFeatured || false, isActive: hotel.isActive !== false,
      address: hotel.address || '', description: hotel.description || '',
      checkInTime: '14:00', checkOutTime: '12:00', policyAr: hotel.policyAr || '',
      images: hotel.images || [],
      mapUrl: hotel.mapUrl || '',
    });
    // Pre-select amenity IDs
    const hotelAmenityIds = hotel.amenities?.map(a => a.id) || [];
    setSelectedHotelAmenities(hotelAmenityIds);
    setActiveTab('basic');
    setRoomForm(null);
    setSaveMsg('');
    setIsModalOpen(true);
  };

  const openAdd = () => {
    setEditingHotel(null);
    setSelectedHotelAmenities([]);
    const firstCityId = initialCities.length > 0 ? initialCities[0].id : '';
    setFormData({
      name: '', nameEn: '', cityId: firstCityId, stars: 4,
      priceFrom: 50, discountPercentage: 0, isFeatured: false, isActive: true,
      address: '', description: '', checkInTime: '14:00', checkOutTime: '12:00', policyAr: '',
      images: [],
      mapUrl: '',
    });
    setRoomForm(null);
    setSaveMsg('');
    setIsModalOpen(true);
  };

  const toggleHotelAmenity = (id: string) => {
    setSelectedHotelAmenities(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleHotelImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingHotel) return;
    
    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = reader.result as string;
        const res = await uploadImage(base64, 'hotels', file.name);
        if (res.success && res.url) {
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, res.url!]
          }));
        }
        setIsUploading(false);
      };
    } catch (err) {
      console.error(err);
      setIsUploading(false);
    }
  };

  const handleRoomImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !roomForm) return;

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = reader.result as string;
        const res = await uploadImage(base64, 'rooms', file.name);
        if (res.success && res.url) {
          setRoomForm(prev => prev ? {
            ...prev,
            images: [...prev.images, res.url!]
          } : null);
        }
        setIsUploading(false);
      };
    } catch (err) {
      console.error(err);
      setIsUploading(false);
    }
  };

  const handleSave = () => {
    startTransition(async () => {
      setSaveMsg('... جاري الحفظ');
      
      const hotelData = {
        nameAr: formData.name,
        nameEn: formData.nameEn,
        address: formData.address,
        descriptionAr: formData.description,
        stars: formData.stars as 1|2|3|4|5,
        priceFrom: formData.priceFrom,
        isFeatured: formData.isFeatured,
        isActive: formData.isActive,
        cityId: formData.cityId,
        policyAr: formData.policyAr,
        amenities: selectedHotelAmenities, // IDs
        images: formData.images,
        mapUrl: formData.mapUrl,
      };

      try {
        let hotelId = editingHotel?.id;
        let res;

        if (editingHotel) {
          res = await updateHotel(editingHotel.id, hotelData);
        } else {
          // If no city is selected natively, show error
          if (!formData.cityId) {
            setSaveMsg('❌ يرجى اختيار المدينة أولاً');
            return;
          }
          res = await createHotel(hotelData);
          if (res.success && res.id) hotelId = res.id;
        }

        if (res.success && hotelId) {
          const discRes = await setHotelDiscount(hotelId, formData.discountPercentage);
          if (discRes.success) {
            setSaveMsg('✅ تم حفظ التعديلات بنجاح');
            setTimeout(() => {
              setIsModalOpen(false);
              window.location.reload(); // Refresh to show new hotel
            }, 800);
          } else {
            setSaveMsg('❌ حدث خطأ أثناء حفظ الخصم: ' + (discRes.error || ''));
          }
        } else {
          setSaveMsg('❌ حدث خطأ أثناء الحفظ: ' + (res.error || ''));
        }
      } catch (err) {
        setSaveMsg('❌ حدث خطأ غير متوقع');
        console.error(err);
      }
    });
  };

  const handleDelete = (hotel: Hotel) => {
    if (!confirm(`هل أنت متأكد من حذف "${hotel.name}"؟`)) return;
    startTransition(async () => {
      const res = await deleteHotel(hotel.id);
      if (res.success) setHotels(prev => prev.filter(h => h.id !== hotel.id));
      else alert('خطأ في الحذف: ' + res.error);
    });
  };

  const handleSaveRoom = () => {
    if (!roomForm || !editingHotel) return;
    startTransition(async () => {
      setSaveMsg('... جاري حفظ الغرفة');
      const res = await upsertRoom(editingHotel.id, {
        id: roomForm.id,
        nameAr: roomForm.name,
        nameEn: roomForm.nameEn,
        descriptionAr: roomForm.description,
        capacity: roomForm.capacity,
        pricePerNight: roomForm.pricePerNight,
        isAvailable: roomForm.isAvailable,
        amenities: roomForm.selectedAmenities, // IDs
        images: roomForm.images,
      });
      if (res.success) {
        setSaveMsg('✅ تم حفظ الغرفة بنجاح');
        setRoomForm(null);
        // Refresh editing hotel data if possible or just wait for revalidate
      } else {
        alert('خطأ في حفظ الغرفة: ' + res.error);
      }
    });
  };

  const handleDeleteRoom = (roomId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الغرفة؟')) return;
    startTransition(async () => {
      const res = await deleteRoom(roomId);
      if (res.success) {
        setSaveMsg('✅ تم حذف الغرفة');
        // Refresh
      } else {
        alert('خطأ في حذف الغرفة: ' + res.error);
      }
    });
  };

  // ── Room Form helpers ──────────────────────────────────────────────────────
  const openNewRoom = () => setRoomForm({
    isNew: true, name: '', nameEn: '', description: '',
    pricePerNight: 50, capacity: 2, isAvailable: true,
    images: [], selectedAmenities: [], spaceDetails: {},
  });

  const openEditRoom = (room: Room) => setRoomForm({
    id: room.id, isNew: false,
    name: room.name, nameEn: room.nameEn,
    description: room.description || '',
    pricePerNight: room.pricePerNight,
    capacity: room.capacity,
    isAvailable: room.isAvailable,
    images: room.images?.filter(u => u?.startsWith('http')) || [],
    selectedAmenities: room.amenities?.map(a => a.name) || [],
    spaceDetails: {},
  });

  const toggleRoomAmenity = (name: string) => {
    if (!roomForm) return;
    setRoomForm(prev => prev ? {
      ...prev,
      selectedAmenities: prev.selectedAmenities.includes(name)
        ? prev.selectedAmenities.filter(n => n !== name)
        : [...prev.selectedAmenities, name],
    } : null);
  };

  const setSpaceDetail = (name: string, val: number) => {
    if (!roomForm) return;
    setRoomForm(prev => prev ? { ...prev, spaceDetails: { ...prev.spaceDetails, [name]: val } } : null);
  };

  const tabLabels: Record<Tab, string> = {
    basic: 'المعلومات الأساسية',
    amenities: 'المرافق والسياسات',
    media: 'الصور والموقع',
    rooms: 'إدارة الغرف',
  };

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 mb-1">إدارة الفنادق</h1>
          <p className="text-neutral-500 font-medium">أضف، عدل، خصص الخصومات وأظهر المرافق</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-[#23096e] hover:bg-[#1a0654] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all">
          <Plus size={18} /> إضافة فندق جديد
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-t-2xl shadow-sm border border-neutral-100 border-b-0 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input className="w-full pl-4 pr-10 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:border-[#23096e] focus:bg-white text-sm"
            placeholder="بحث بالاسم أو المدينة..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <div className="px-4 py-2 bg-neutral-50 rounded-xl border border-neutral-200 text-sm font-bold text-neutral-600 flex items-center gap-2">
          <Building size={16} /> {hotels.length} فندق إجمالاً
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow-sm border border-neutral-100 rounded-b-2xl overflow-x-auto">
        <table className="w-full">
          <thead className="bg-neutral-50 border-b border-neutral-100 text-neutral-500 text-sm font-bold">
            <tr>
              <th className="py-4 px-6 text-start">الفندق</th>
              <th className="py-4 px-6 text-start">المدينة</th>
              <th className="py-4 px-6 text-start">النجوم</th>
              <th className="py-4 px-6 text-start">السعر</th>
              <th className="py-4 px-6 text-start">الخصم</th>
              <th className="py-4 px-6 text-start">الحالة</th>
              <th className="py-4 px-6 text-end">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filtered.map(hotel => (
              <tr key={hotel.id} className="hover:bg-neutral-50 transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    {hotel.thumbnail?.startsWith('http') ? (
                      <img src={hotel.thumbnail} alt={hotel.name} className="w-12 h-12 rounded-lg object-cover border border-neutral-200" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#23096e15] to-[#3A1C8F25] border border-neutral-200 flex items-center justify-center">
                        <Building2 size={20} className="text-[#23096e50]" />
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-neutral-900">{hotel.name}</div>
                      <div className="text-[11px] text-neutral-400">{hotel.id.slice(0, 10)}…</div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6 text-sm font-medium text-neutral-600">
                  <div className="flex items-center gap-1.5"><MapPin size={13} className="text-neutral-400" />{hotel.city}</div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex gap-0.5 text-amber-500">
                    {Array.from({ length: hotel.stars }).map((_, i) => <Star key={i} size={13} fill="currentColor" />)}
                  </div>
                </td>
                <td className="py-4 px-6 font-black text-neutral-900">${hotel.priceFrom}</td>
                <td className="py-4 px-6">
                  {hotel.discount ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                      <Tag size={11} /> {hotel.discount.percentage}%
                    </span>
                  ) : <span className="text-neutral-400 text-sm">—</span>}
                </td>
                <td className="py-4 px-6">
                  {hotel.isFeatured
                    ? <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#23096e]/10 text-[#23096e] inline-flex items-center gap-1"><Check size={11} /> مميز</span>
                    : <span className="text-xs text-neutral-400">عادي</span>
                  }
                </td>
                <td className="py-4 px-6 text-end">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openEdit(hotel)} className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="تعديل">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(hotel)} disabled={isPending} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50" title="حذف">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="py-16 text-center text-neutral-400 font-medium">لا توجد فنادق مطابقة للبحث</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ═══════════════════════ MODAL ═══════════════════════════ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col">

            {/* Modal header */}
            <div className="p-6 border-b border-neutral-100 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-black text-neutral-900 flex items-center gap-3">
                <Building2 size={22} className="text-[#23096e]" />
                {editingHotel ? `تعديل: ${editingHotel.name}` : 'إضافة فندق جديد'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-neutral-100 rounded-full text-neutral-400">
                <X size={22} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-neutral-100 px-6 bg-white shrink-0 gap-1 overflow-x-auto pt-3">
              {(Object.keys(tabLabels) as Tab[]).map(tab => (
                <button key={tab} onClick={() => { setActiveTab(tab); setRoomForm(null); }}
                  className={`px-5 py-2.5 font-bold whitespace-nowrap border-b-2 text-sm transition-colors ${activeTab === tab ? 'text-[#23096e] border-[#23096e]' : 'text-neutral-400 border-transparent hover:text-neutral-700'}`}>
                  {tabLabels[tab]}
                </button>
              ))}
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto">

              {/* ── TAB: Basic ─────────────────────────────────────────── */}
              {activeTab === 'basic' && (
                <div className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {([
                      { label: 'اسم الفندق (عربي)', key: 'name', placeholder: 'مثال: فندق الريان' },
                      { label: 'اسم الفندق (إنجليزي)', key: 'nameEn', placeholder: 'e.g. Al-Rayyan Hotel', dir: 'ltr' },
                    ] as const).map(f => (
                      <div key={f.key} className="space-y-1.5">
                        <label className="text-sm font-bold text-neutral-700">{f.label}</label>
                        <input type="text" value={formData[f.key]} dir={'dir' in f ? f.dir : undefined}
                          onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
                          placeholder={f.placeholder}
                          className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#23096e] focus:bg-white transition-colors text-sm" />
                      </div>
                    ))}
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-neutral-700">المدينة</label>
                      <select value={formData.cityId} onChange={e => setFormData({ ...formData, cityId: e.target.value })}
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#23096e] focus:bg-white text-sm">
                        {initialCities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-neutral-700">تصنيف النجوم</label>
                      <select value={formData.stars} onChange={e => setFormData({ ...formData, stars: Number(e.target.value) })}
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#23096e] focus:bg-white text-sm">
                        {[5,4,3,2,1].map(s => <option key={s} value={s}>{'⭐'.repeat(s)} ({s} نجوم)</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-neutral-700">السعر الأساسي ($)</label>
                      <input type="number" value={formData.priceFrom} onChange={e => setFormData({ ...formData, priceFrom: Number(e.target.value) })}
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#23096e] text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-neutral-700">حالة الفندق</label>
                      <select value={formData.isActive ? 'active' : 'inactive'} onChange={e => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#23096e] text-sm">
                        <option value="active">✅ نشط — يظهر للزوار</option>
                        <option value="inactive">🚫 مخفي — لا يظهر</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-neutral-700">العنوان التفصيلي</label>
                    <input type="text" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#23096e] text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-neutral-700">وصف الفندق</label>
                    <textarea rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#23096e] resize-none text-sm" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-6 border-t border-neutral-100">
                    <label className="flex items-start gap-4 p-5 rounded-2xl border border-neutral-200 cursor-pointer hover:bg-neutral-50">
                      <div className="relative flex items-center mt-1 shrink-0">
                        <input type="checkbox" checked={formData.isFeatured} onChange={e => setFormData({ ...formData, isFeatured: e.target.checked })} className="sr-only peer" />
                        <div className="w-11 h-6 bg-neutral-200 rounded-full peer peer-checked:bg-[#23096e] after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:-translate-x-5" />
                      </div>
                      <div>
                        <p className="font-bold text-neutral-900 text-sm mb-1">تحديد كـ &quot;فندق مميز&quot;</p>
                        <p className="text-xs text-neutral-500">يظهر في قسم الفنادق المميزة بالصفحة الرئيسية.</p>
                      </div>
                    </label>
                    <div className="p-5 rounded-2xl border border-green-200 bg-green-50/40">
                      <label className="text-sm font-bold text-neutral-800 flex items-center gap-2 mb-2"><Tag size={15} className="text-green-600" /> نسبة الخصم %</label>
                      <p className="text-xs text-neutral-500 mb-3">ضع 0 لإزالة الخصم عن هذا الفندق.</p>
                      <input type="number" value={formData.discountPercentage} min="0" max="100"
                        onChange={e => setFormData({ ...formData, discountPercentage: Number(e.target.value) })}
                        className="w-full px-4 py-2.5 bg-white border border-green-200 rounded-xl focus:outline-none focus:border-green-500 text-sm" />
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB: Amenities & Policy ─────────────────────────────── */}
              {activeTab === 'amenities' && (
                <div className="p-8 space-y-8">
                  {/* Hotel amenities from central list */}
                  <div>
                    <h3 className="font-black text-lg text-neutral-900 mb-1">مرافق الفندق وخدماته</h3>
                    <p className="text-sm text-neutral-500 mb-5">اختر من القائمة المركزية في إعدادات النظام. تظهر هذه المرافق في صفحة تفاصيل الفندق.</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {hotelAmenitiesFromDB.map(am => {
                        const selected = selectedHotelAmenities.includes(am.id);
                        return (
                          <button key={am.id} onClick={() => toggleHotelAmenity(am.id)}
                            className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-start ${selected ? 'border-[#23096e] bg-[#23096e]/5' : 'border-neutral-200 hover:border-neutral-300 bg-white'}`}>
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${selected ? 'bg-[#23096e] text-white' : 'bg-neutral-100 text-neutral-500'}`}>
                              <DynIcon name={am.icon || 'Check'} size={17} />
                            </div>
                            <span className={`text-sm font-bold leading-tight ${selected ? 'text-[#23096e]' : 'text-neutral-700'}`}>{am.nameAr || am.name}</span>
                          </button>
                        );
                      })}
                    </div>
                    {selectedHotelAmenities.length > 0 && (
                      <div className="mt-4 p-3 bg-[#23096e]/5 rounded-xl flex flex-wrap gap-2">
                        <span className="text-xs font-bold text-[#23096e] self-center">المختار:</span>
                        {selectedHotelAmenities.map(n => (
                          <span key={n} className="text-xs font-bold bg-[#23096e] text-white px-2.5 py-1 rounded-full">{n}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Hotel policy */}
                  <div className="border-t border-neutral-100 pt-8">
                    <h3 className="font-black text-lg text-neutral-900 mb-5">سياسة الفندق</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-neutral-700">وقت الدخول (Check-in)</label>
                        <input type="time" value={formData.checkInTime} onChange={e => setFormData({ ...formData, checkInTime: e.target.value })}
                          className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#23096e] text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-neutral-700">وقت المغادرة (Check-out)</label>
                        <input type="time" value={formData.checkOutTime} onChange={e => setFormData({ ...formData, checkOutTime: e.target.value })}
                          className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#23096e] text-sm" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-neutral-700">قواعد الإلغاء وسياسات الأطفال (تظهر في صفحة الفندق)</label>
                      <textarea rows={4} value={formData.policyAr} onChange={e => setFormData({ ...formData, policyAr: e.target.value })}
                        placeholder="مثال: يمكن الإلغاء مجاناً قبل 48 ساعة من موعد الوصول. الأطفال دون 12 سنة مجاناً..."
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#23096e] resize-none text-sm" />
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB: Media ─────────────────────────────────────────── */}
              {activeTab === 'media' && (
                <div className="p-8 space-y-8">
                  <div>
                    <h3 className="font-black text-lg text-neutral-900 mb-4">صور الفندق</h3>
                    <label className="border-2 border-dashed border-neutral-300 rounded-2xl p-8 text-center hover:bg-neutral-50 cursor-pointer transition-colors flex flex-col items-center">
                      <UploadCloud size={36} className="mx-auto text-neutral-400 mb-3" />
                      <p className="font-bold text-neutral-700">{isUploading ? 'جاري الرفع...' : 'اضغط لرفع صور الفندق'}</p>
                      <p className="text-xs text-neutral-400 mt-1">JPG, PNG أو WebP · بحد أقصى 5MB</p>
                      <input type="file" className="hidden" accept="image/*" onChange={handleHotelImageUpload} disabled={isUploading} />
                    </label>
                    {editingHotel?.images && editingHotel.images.filter(u => u?.startsWith('http')).length > 0 && (
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-5">
                        {editingHotel.images.filter(u => u?.startsWith('http')).map((url, i) => (
                          <div key={i} className="aspect-square rounded-xl overflow-hidden border-2 border-neutral-200 relative group">
                            <img src={url} className="w-full h-full object-cover" alt={`صورة ${i+1}`} />
                            <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] font-bold text-center py-1">
                              {i === 0 ? '🌟 رئيسية' : `#${i+1}`}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="border-t border-neutral-100 pt-8">
                    <h3 className="font-black text-lg text-neutral-900 mb-4">الموقع على الخريطة</h3>
                    <input 
                      type="text" 
                      value={formData.mapUrl} 
                      onChange={e => setFormData({ ...formData, mapUrl: e.target.value })}
                      placeholder="رابط Google Maps Embed..." 
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#23096e] text-sm mb-4 text-left" dir="ltr" 
                    />
                    <div className="h-44 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-400 overflow-hidden relative">
                      {formData.mapUrl ? (
                        <iframe src={formData.mapUrl} className="w-full h-full border-0" allowFullScreen loading="lazy"></iframe>
                      ) : (
                        <><MapPin size={20} className="mr-2" /> معاينة الخريطة</>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB: Rooms ─────────────────────────────────────────── */}
              {activeTab === 'rooms' && !roomForm && (
                <div className="p-8">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="font-black text-lg text-neutral-900">الغرف والأجنحة</h3>
                      <p className="text-sm text-neutral-500 mt-1">{editingHotel?.rooms?.length || 0} غرفة مضافة</p>
                    </div>
                    <button onClick={openNewRoom}
                      className="flex items-center gap-2 px-4 py-2 bg-[#23096e] text-white hover:bg-[#1a0654] rounded-xl font-bold text-sm shadow-sm">
                      <Plus size={16} /> إضافة غرفة
                    </button>
                  </div>
                  <div className="space-y-4">
                    {editingHotel?.rooms?.map(room => (
                      <div key={room.id} className="border border-neutral-200 rounded-2xl overflow-hidden flex flex-col sm:flex-row">
                        <div className="w-full sm:w-44 h-32 sm:h-auto bg-neutral-100 shrink-0 relative">
                          {room.images?.find(u => u?.startsWith('http')) ? (
                            <img src={room.images.find(u => u?.startsWith('http'))!} className="w-full h-full object-cover" alt={room.name} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><BedDouble size={28} className="text-neutral-300" /></div>
                          )}
                        </div>
                        <div className="p-5 flex-1 flex justify-between items-center">
                          <div>
                            <h4 className="font-black text-neutral-900">{room.name}</h4>
                            <p className="text-xs text-neutral-500 mt-1">{room.nameEn} · {room.capacity} ضيوف · <span className={room.isAvailable ? 'text-green-600' : 'text-red-500'}>{room.isAvailable ? 'متاحة' : 'محجوزة'}</span></p>
                            {room.amenities && room.amenities.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {room.amenities.slice(0, 4).map(a => (
                                  <span key={a.id} className="text-[10px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full font-medium">{a.name}</span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="font-black text-[#23096e] text-lg">${room.pricePerNight}<span className="text-xs text-neutral-400 font-medium">/ليلة</span></div>
                            <button onClick={() => openEditRoom(room)}
                              className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 flex items-center gap-1">
                              <Edit2 size={12} /> تعديل
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {(!editingHotel?.rooms || editingHotel.rooms.length === 0) && (
                      <div className="text-center py-12 text-neutral-400 font-medium">لا توجد غرف مضافة بعد</div>
                    )}
                  </div>
                </div>
              )}

              {/* ── Room detail form ───────────────────────────────────── */}
              {activeTab === 'rooms' && roomForm && (
                <div className="p-8 space-y-8">
                  {/* Back button */}
                  <div className="flex items-center gap-3">
                    <button onClick={() => setRoomForm(null)} className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200">
                      <ArrowRight size={18} />
                    </button>
                    <h3 className="font-black text-xl text-neutral-900">{roomForm.isNew ? 'إضافة غرفة جديدة' : 'تعديل الغرفة'}</h3>
                  </div>

                  {/* ── Basic room info ── */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-neutral-700">اسم الغرفة (عربي)</label>
                      <input type="text" value={roomForm.name} onChange={e => setRoomForm({ ...roomForm, name: e.target.value })}
                        placeholder="مثال: غرفة ديلوكس مزدوجة" className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#23096e] text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-neutral-700">اسم الغرفة (إنجليزي)</label>
                      <input type="text" value={roomForm.nameEn} dir="ltr" onChange={e => setRoomForm({ ...roomForm, nameEn: e.target.value })}
                        placeholder="e.g. Deluxe Double Room" className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#23096e] text-sm text-left" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-neutral-700">السعر لليلة ($)</label>
                      <input type="number" value={roomForm.pricePerNight} onChange={e => setRoomForm({ ...roomForm, pricePerNight: Number(e.target.value) })}
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#23096e] text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-neutral-700">حالة الغرفة</label>
                      <select value={roomForm.isAvailable ? 'available' : 'unavailable'} onChange={e => setRoomForm({ ...roomForm, isAvailable: e.target.value === 'available' })}
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#23096e] text-sm">
                        <option value="available">✅ متاحة للحجز</option>
                        <option value="unavailable">🚫 غير متاحة (صيانة)</option>
                      </select>
                    </div>
                    <div className="col-span-1 md:col-span-2 space-y-1.5">
                      <label className="text-sm font-bold text-neutral-700">وصف الغرفة</label>
                      <textarea rows={2} value={roomForm.description} onChange={e => setRoomForm({ ...roomForm, description: e.target.value })}
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#23096e] resize-none text-sm" />
                    </div>
                  </div>

                  {/* ── Space details (from settings: space type) ── */}
                  <div className="border-t border-neutral-100 pt-8">
                    <h4 className="font-black text-base text-neutral-900 mb-1 flex items-center gap-2">
                      <DoorOpen size={18} className="text-[#23096e]" /> تفاصيل المساحة والسعة
                    </h4>
                    <p className="text-xs text-neutral-500 mb-4">من قائمة &quot;تفاصيل المساحة&quot; في إعدادات → إدارة المرافق</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {SPACE_DETAILS.map(sp => (
                        <div key={sp.id} className="flex flex-col gap-2 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                          <div className="flex items-center gap-2 text-neutral-700">
                            <DynIcon name={sp.icon} size={16} />
                            <label className="text-xs font-bold">{sp.name}</label>
                          </div>
                          <input type="number" min="0" max="99"
                            value={roomForm.spaceDetails[sp.name] ?? 0}
                            onChange={e => setSpaceDetail(sp.name, Number(e.target.value))}
                            className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:border-[#23096e] text-sm text-center font-bold" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ── Room amenities (from settings: room type) ── */}
                  <div className="border-t border-neutral-100 pt-8">
                    <h4 className="font-black text-base text-neutral-900 mb-1 flex items-center gap-2">
                      <BedDouble size={18} className="text-[#23096e]" /> مميزات وتجهيزات الغرفة
                    </h4>
                    <p className="text-xs text-neutral-500 mb-4">من قائمة &quot;تجهيز غرفة&quot; في إعدادات → إدارة المرافق</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {roomAmenitiesFromDB.map(am => {
                        const selected = roomForm.selectedAmenities.includes(am.id);
                        return (
                          <button key={am.id} onClick={() => toggleRoomAmenity(am.id)}
                            className={`flex items-center gap-2.5 p-3 rounded-xl border-2 text-start transition-all ${selected ? 'border-amber-500 bg-amber-50' : 'border-neutral-200 bg-white hover:border-neutral-300'}`}>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${selected ? 'bg-amber-500 text-white' : 'bg-neutral-100 text-neutral-500'}`}>
                              <DynIcon name={am.icon || 'Check'} size={15} />
                            </div>
                            <span className={`text-sm font-bold ${selected ? 'text-amber-700' : 'text-neutral-700'}`}>{am.nameAr || am.name}</span>
                          </button>
                        );
                      })}
                    </div>
                    {roomForm.selectedAmenities.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {roomForm.selectedAmenities.map(n => (
                          <span key={n} className="text-xs bg-amber-500 text-white font-bold px-2.5 py-1 rounded-full">{n}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* ── Room images ── */}
                  <div className="border-t border-neutral-100 pt-8">
                    <h4 className="font-black text-base text-neutral-900 mb-4 flex items-center gap-2">
                      <ImageIcon size={18} className="text-[#23096e]" /> صور الغرفة
                    </h4>
                    <label className="border-2 border-dashed border-neutral-300 rounded-2xl p-6 text-center hover:bg-neutral-50 cursor-pointer transition-colors flex flex-col items-center">
                      <UploadCloud size={28} className="mx-auto text-neutral-400 mb-2" />
                      <p className="font-bold text-neutral-700 text-sm">{isUploading ? 'جاري الرفع...' : 'اضغط لرفع صور الغرفة'}</p>
                      <p className="text-xs text-neutral-400 mt-1">JPG, PNG أو WebP</p>
                      <input type="file" className="hidden" accept="image/*" onChange={handleRoomImageUpload} disabled={isUploading} />
                    </label>
                    {roomForm.images.length > 0 && (
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-4">
                        {roomForm.images.map((url, i) => (
                          <div key={i} className="aspect-square rounded-xl overflow-hidden border border-neutral-200 relative">
                            <img src={url} className="w-full h-full object-cover" alt={`غرفة ${i+1}`} />
                            <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[9px] font-bold text-center py-0.5">
                              {i === 0 ? 'رئيسية' : `#${i+1}`}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Save room button */}
                  <div className="flex justify-end pt-4 border-t border-neutral-100 gap-3">
                    {!roomForm.isNew && (
                       <button onClick={() => handleDeleteRoom(roomForm.id!)} disabled={isPending}
                        className="px-6 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-bold text-sm flex items-center gap-2">
                         <Trash2 size={16} /> حذف الغرفة
                       </button>
                    )}
                    <button onClick={handleSaveRoom} disabled={isPending}
                      className="px-8 py-3 bg-[#23096e] hover:bg-[#1a0654] text-white rounded-xl font-bold flex items-center gap-2 shadow-md">
                      <Check size={18} /> {isPending ? 'جاري الحفظ...' : 'حفظ بيانات الغرفة'}
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Modal footer */}
            <div className="bg-neutral-50 border-t border-neutral-100 p-5 flex justify-between items-center shrink-0">
              <span className={`text-sm font-bold ${saveMsg.startsWith('✅') ? 'text-green-600' : saveMsg.startsWith('❌') ? 'text-red-600' : 'text-neutral-400'}`}>
                {saveMsg || (activeTab === 'rooms' && roomForm ? 'احفظ الغرفة للعودة للقائمة' : 'تأكد من مراجعة جميع البيانات')}
              </span>
              <div className="flex gap-3">
                <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-neutral-600 hover:bg-neutral-200 rounded-xl font-bold text-sm">
                  إغلاق
                </button>
                {activeTab !== 'rooms' && (
                  <button onClick={handleSave} disabled={isPending || !editingHotel}
                    className="px-8 py-2.5 bg-[#23096e] hover:bg-[#1a0654] text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-md disabled:opacity-60">
                    {isPending ? <><Loader2 size={15} className="animate-spin" /> جاري الحفظ...</> : 'حفظ التعديلات'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
