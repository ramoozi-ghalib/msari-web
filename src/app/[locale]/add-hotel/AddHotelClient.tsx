'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import {
  Hotel, User, Send, CheckCircle, Building2, AlertCircle,
  Loader2, MapPin, Globe, Mail, Phone, Upload, X, Star,
  TrendingUp, BadgePercent, Headphones, Check
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { whatsappLink } from '@/lib/site-config';

const CITIES = [
  'صنعاء', 'عدن', 'المكلا', 'مأرب', 'تعز', 'إب',
  'الحديدة', 'سيئون', 'ذمار', 'حضرموت', 'شبوة', 'المهرة', 'سقطرى', 'أخرى'
];

const POPULAR_AMENITIES = [
  'واي فاي مجاني',
  'تكييف هواء',
  'موقف سيارات مجاني',
  'مسبح',
  'مطعم وكافيه',
  'مصعد',
  'خدمة الغرف 24/7',
  'صالة رياضية (جيم)',
  'مكتب استقبال 24 ساعة',
  'شاشات ذكية',
  'مياه ساخنة مستمرة',
  'خدمة غسيل وكي الملابس',
  'طاقة كهربائية مستمرة (24h)',
];

const PARTNER_BENEFITS = [
  {
    icon: TrendingUp,
    title: 'حجوزات أكثر يومياً',
    desc: 'وصول لآلاف المسافرين شهرياً وزيادة نسبة إشغال الغرف على مدار العام من داخل وخارج اليمن.',
  },
  {
    icon: BadgePercent,
    title: 'عمولة منخفضة ومنافسة',
    desc: 'أفضل وأقل نسبة عمولة في السوق اليمني مع ضمان مستحقاتك وتحويلات مالية منتظمة وموثوقة.',
  },
  {
    icon: Headphones,
    title: 'دعم وتسويق مخصص',
    desc: 'فريق مبيعات وتسويق محلي يعمل معك لدعم فندقك ومساعدتك على مدار الساعة في إدارة الحجوزات.',
  },
];

export default function AddHotelClient({ pageContent }: { pageContent?: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [referenceNumber, setReferenceNumber] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  // Form State
  const [form, setForm] = useState({
    hotelName: '',
    city: '',
    stars: '3',
    address: '',
    googleMapsUrl: '',
    hotelWebsite: '',
    hotelEmail: '',
    hotelPhone: '',
    rooms: '',
    suites: '0',
    ownerName: '',
    position: '',
    ownerPhone: '',
    ownerEmail: '',
    customAmenities: '',
    message: '',
    honeypot: '',
  });

  // Selected Amenities Chips
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'واي فاي مجاني',
    'تكييف هواء',
    'مكتب استقبال 24 ساعة'
  ]);

  // Image Upload State
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith('image/')) {
      setImageError('يرجى اختيار ملف صورة صالح (JPEG, PNG, WebP).');
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setImageError('حجم الصورة كبير جداً. الحد الأقصى المسموح به هو 5 ميجابايت.');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Strict Validations for mandatory fields
    if (!form.hotelName.trim()) {
      setErrorMsg('يرجى إدخال اسم الفندق.');
      return;
    }
    if (!form.city.trim()) {
      setErrorMsg('يرجى اختيار المدينة.');
      return;
    }
    if (!form.address.trim()) {
      setErrorMsg('يرجى إدخال العنوان التفصيلي للفندق.');
      return;
    }
    if (!form.googleMapsUrl.trim()) {
      setErrorMsg('يرجى إدخال رابط موقع الفندق على خرائط Google.');
      return;
    }
    if (!form.hotelEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.hotelEmail.trim())) {
      setErrorMsg('يرجى إدخال بريد إلكتروني صحيح للفندق.');
      return;
    }
    if (!form.rooms.trim() || isNaN(Number(form.rooms)) || Number(form.rooms) < 1) {
      setErrorMsg('يرجى إدخال عدد الغرف بالفندق (رقم صحيح 1 على الأقل).');
      return;
    }
    if (!imagePreview) {
      setErrorMsg('صورة واجهة الفندق مطلوبة كإجراء أساسي للتحقق من الفندق.');
      return;
    }
    if (!form.ownerName.trim()) {
      setErrorMsg('يرجى إدخال اسم المسؤول الرباعي (مقدم الطلب).');
      return;
    }
    if (!form.position.trim()) {
      setErrorMsg('يرجى تحديد الصفة / المسمى الوظيفي لمقدم الطلب.');
      return;
    }
    if (!form.ownerPhone.trim()) {
      setErrorMsg('يرجى إدخال رقم هاتف / واتساب المسؤول للتواصل المباشر.');
      return;
    }

    const allAmenitiesList = [
      ...selectedAmenities,
      ...(form.customAmenities.trim() ? [form.customAmenities.trim()] : [])
    ];

    if (allAmenitiesList.length === 0) {
      setErrorMsg('يرجى اختيار أو كتابة المرافق والخدمات المتوفرة بالفندق.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/partners/hotel-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hotelName: form.hotelName.trim(),
          city: form.city.trim(),
          stars: form.stars,
          address: form.address.trim(),
          googleMapsUrl: form.googleMapsUrl.trim(),
          hotelWebsite: form.hotelWebsite.trim(),
          hotelEmail: form.hotelEmail.trim(),
          rooms: form.rooms.trim(),
          suites: form.suites.trim() || '0',
          amenities: allAmenitiesList.join('، '),
          facadeImageUrl: imagePreview,
          ownerName: form.ownerName.trim(),
          position: form.position.trim(),
          phone: form.ownerPhone.trim(),
          ownerEmail: form.ownerEmail.trim(),
          message: form.message.trim(),
          honeypot: form.honeypot,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'حدث خطأ أثناء إرسال الطلب');
      }

      setReferenceNumber(data.referenceNumber || null);
      setSent(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'تعذر إرسال الطلب، يرجى المحاولة لاحقاً أو التواصل معنا عبر واتساب.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const badge = pageContent?.hero?.badge || 'انضم كشريك في مساري';
  const title = pageContent?.hero?.title || 'اعرض فندقك أمام آلاف المسافرين وضاعف حجوزاتك';
  const subtitle = pageContent?.hero?.subtitle || 'انضم لأكبر شبكة فندقية في اليمن واحصل على حجوزات يومية مؤكدة مع أفضل شروط تسوية وعمولة منافسة.';

  // Success Screen
  if (sent) {
    return (
      <div className="min-h-screen bg-[#F8F9FC] flex items-center justify-center px-4 py-20">
        <div className="text-center max-w-lg bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-neutral-100">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={44} className="text-green-600" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 mb-3">تم استلام طلبك بنجاح!</h2>
          <p className="text-neutral-600 text-sm mb-6 leading-relaxed">
            شكراً لاهتمامك بالانضمام لمنصة مساري. سيقوم فريق علاقات الفنادق بمراجعة بيانات فندقك والتواصل معك خلال ٢٤ ساعة لإتمام إجراءات التفعيل.
          </p>

          {referenceNumber && (
            <div className="bg-neutral-50 border border-neutral-200/80 rounded-2xl p-4 mb-6">
              <span className="text-xs text-neutral-500 font-bold block mb-1">الرقم المرجعي للطلب:</span>
              <span className="text-lg font-black text-[#1D065C] select-all font-mono tracking-wide">{referenceNumber}</span>
            </div>
          )}

          <div className="space-y-3">
            <a
              href={`${whatsappLink()}?text=${encodeURIComponent(`مرحباً مساري، قمت بتقديم طلب انضمام فندق برقم مرجعي: ${referenceNumber}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm transition-colors shadow-sm"
            >
              متابعة الطلب مباشرة عبر واتساب
            </a>

            <button
              onClick={() => {
                setSent(false);
                setReferenceNumber(null);
                setForm({
                  hotelName: '',
                  city: '',
                  stars: '3',
                  address: '',
                  googleMapsUrl: '',
                  hotelWebsite: '',
                  hotelEmail: '',
                  hotelPhone: '',
                  rooms: '',
                  suites: '0',
                  ownerName: '',
                  position: '',
                  ownerPhone: '',
                  ownerEmail: '',
                  customAmenities: '',
                  message: '',
                  honeypot: '',
                });
                removeImage();
              }}
              className="w-full py-3 px-6 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-sm transition-colors"
            >
              تقديم طلب لفندق آخر
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      
      {/* ── 1. HERO BANNER ── */}
      <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-24 bg-gradient-to-r from-[#1D065C] via-[#23096E] to-[#2E0D80] text-white overflow-hidden border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 text-white text-xs sm:text-sm font-bold mb-5 border border-white/20 shadow-xs">
            <Building2 size={15} />
            <span>{badge}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
            {title}
          </h1>
          <p className="text-white/80 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            {subtitle}
          </p>

          {/* Stats Bar */}
          <div className="inline-flex flex-wrap items-center justify-center gap-4 sm:gap-8 bg-white/10 backdrop-blur-md px-6 py-3.5 rounded-2xl border border-white/15 text-xs sm:text-sm font-bold">
            <div className="flex items-center gap-2">
              <span className="text-[#FF3B30] text-base">●</span>
              <span>+500 فندق مسجل في اليمن</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-white/20" />
            <div className="flex items-center gap-2">
              <span className="text-[#FF3B30] text-base">●</span>
              <span>عمولة منافسة وضمان المستحقات</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-white/20" />
            <div className="flex items-center gap-2">
              <span className="text-[#FF3B30] text-base">●</span>
              <span>دعم فندقي وتسويق 24/7</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. PARTNER BENEFITS (3 Clean Golden Cards) ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 mb-12 sm:mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {PARTNER_BENEFITS.map((b) => (
            <div
              key={b.title}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md border border-neutral-100 transition-all duration-200"
            >
              <div className="w-12 h-12 rounded-xl bg-[#1D065C]/10 text-[#1D065C] flex items-center justify-center mb-4">
                <b.icon size={22} />
              </div>
              <h3 className="font-black text-neutral-900 text-base mb-2">{b.title}</h3>
              <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. HOW IT WORKS (3 Simple Steps) ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 mb-12 sm:mb-16 text-center">
        <h2 className="text-xl sm:text-2xl font-black text-neutral-900 mb-8">كيف تبدأ الشراكة في 3 خطوات بسيطة؟</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-xs flex items-center gap-3.5 sm:flex-col sm:text-center">
            <div className="w-10 h-10 rounded-full bg-[#1D065C] text-white flex items-center justify-center font-black text-sm shrink-0">
              1
            </div>
            <div>
              <h4 className="font-bold text-sm text-neutral-900 mb-0.5">قدم طلبك الآن</h4>
              <p className="text-xs text-neutral-500">املأ النموذج بالبيانات الأساسية</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-xs flex items-center gap-3.5 sm:flex-col sm:text-center">
            <div className="w-10 h-10 rounded-full bg-[#1D065C] text-white flex items-center justify-center font-black text-sm shrink-0">
              2
            </div>
            <div>
              <h4 className="font-bold text-sm text-neutral-900 mb-0.5">المراجعة والاعتماد</h4>
              <p className="text-xs text-neutral-500">يتواصل معك فريقنا خلال 24 ساعة</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-xs flex items-center gap-3.5 sm:flex-col sm:text-center">
            <div className="w-10 h-10 rounded-full bg-[#1D065C] text-white flex items-center justify-center font-black text-sm shrink-0">
              3
            </div>
            <div>
              <h4 className="font-bold text-sm text-neutral-900 mb-0.5">استقبل الحجوزات</h4>
              <p className="text-xs text-neutral-500">يظهر فندقك وتبدأ الأرباح الفورية</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. APPLICATION FORM ── */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-20">
        <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 p-6 sm:p-10">
          
          <div className="mb-6">
            <h2 className="text-2xl font-black text-neutral-900 mb-2">نموذج تقديم طلب إضافة فندق</h2>
            <p className="text-neutral-500 text-xs sm:text-sm">
              أدخل البيانات بدقة وسيقوم فريق علاقات الفنادق بالتواصل معك لمراجعة البيانات وتفعيل الفندق.
            </p>
          </div>

          {/* ⚠️ REQUIRED NOTICE ALERT */}
          <div className="mb-8 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-3">
            <AlertCircle size={20} className="shrink-0 text-amber-600 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="block font-bold mb-0.5">تنبيه هام لضمان قبول الطلب:</strong>
              لن يتم قبول أي طلبات غير مكتملة أو غير صحيحة. يرجى تعبئة جميع الحقول المطلوبة والتأكد من صحة بيانات التواصل وصورة واجهة الفندق قبل الإرسال.
            </div>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
              <AlertCircle size={20} className="shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Honeypot field for bot spam */}
            <input
              type="text"
              name="honeypot"
              value={form.honeypot}
              onChange={e => set('honeypot', e.target.value)}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
            />

            {/* ═══ SECTION 1: HOTEL INFORMATION ═══ */}
            <div className="space-y-4 pb-8 border-b border-neutral-100">
              <h3 className="font-black text-neutral-900 text-base sm:text-lg flex items-center gap-2 text-[#1D065C]">
                <Hotel size={20} />
                <span>أولاً: بيانات ومعلومات الفندق</span>
              </h3>

              {/* 1. Hotel Name */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-neutral-700 mb-1.5">
                  اسم الفندق الرسمي *
                </label>
                <input
                  type="text"
                  placeholder="مثال: فندق الأمل الدولي"
                  required
                  value={form.hotelName}
                  onChange={e => set('hotelName', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-[#1D065C] focus:ring-1 focus:ring-[#1D065C] text-sm text-neutral-900 outline-none transition-all bg-neutral-50/50"
                />
              </div>

              {/* 2. City & Stars Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-neutral-700 mb-1.5">
                    المدينة / المحافظة *
                  </label>
                  <select
                    required
                    value={form.city}
                    onChange={e => set('city', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-[#1D065C] focus:ring-1 focus:ring-[#1D065C] text-sm text-neutral-900 outline-none transition-all bg-neutral-50/50 cursor-pointer"
                  >
                    <option value="">اختر المدينة</option>
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Stars Interactive Selector */}
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-neutral-700 mb-1.5">
                    تصنيف الفندق (النجوم) *
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {['1', '2', '3', '4', '5'].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => set('stars', star)}
                        className={`h-11 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all ${
                          form.stars === star
                            ? 'bg-[#1D065C] text-white shadow-sm ring-2 ring-[#1D065C]/30'
                            : 'bg-neutral-50 border border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                        }`}
                      >
                        <span>{star}</span>
                        <Star size={13} className={form.stars === star ? 'fill-amber-400 text-amber-400' : 'text-neutral-400'} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. Address */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-neutral-700 mb-1.5">
                  العنوان التفصيلي *
                </label>
                <input
                  type="text"
                  placeholder="المديرية / الحي / اسم الشارع / أقرب معلم بارز"
                  required
                  value={form.address}
                  onChange={e => set('address', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-[#1D065C] focus:ring-1 focus:ring-[#1D065C] text-sm text-neutral-900 outline-none transition-all bg-neutral-50/50"
                />
              </div>

              {/* 4. Google Maps URL (Required for verification) */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-neutral-700 mb-1.5 flex items-center gap-1.5">
                  <MapPin size={15} className="text-[#1D065C]" />
                  <span>رابط موقع الفندق على خرائط Google *</span>
                </label>
                <input
                  type="url"
                  placeholder="https://maps.app.goo.gl/... أو https://google.com/maps/..."
                  required
                  dir="ltr"
                  value={form.googleMapsUrl}
                  onChange={e => set('googleMapsUrl', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-[#1D065C] focus:ring-1 focus:ring-[#1D065C] text-sm text-neutral-900 outline-none transition-all bg-neutral-50/50"
                />
                <span className="text-[11px] text-neutral-400 block mt-1">
                  * انسخ رابط مشاركة موقع الفندق من تطبيق خرائط Google لتسهيل التحقق والاعتماد.
                </span>
              </div>

              {/* 5. Hotel Email & Website */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-neutral-700 mb-1.5 flex items-center gap-1.5">
                    <Mail size={15} className="text-[#1D065C]" />
                    <span>البريد الإلكتروني للفندق *</span>
                  </label>
                  <input
                    type="email"
                    placeholder="hotel@example.com"
                    required
                    dir="ltr"
                    value={form.hotelEmail}
                    onChange={e => set('hotelEmail', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-[#1D065C] focus:ring-1 focus:ring-[#1D065C] text-sm text-neutral-900 outline-none transition-all bg-neutral-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold text-neutral-700 mb-1.5 flex items-center gap-1.5">
                    <Globe size={15} className="text-[#1D065C]" />
                    <span>الموقع الإلكتروني للفندق (إن وجد)</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.hotelwebsite.com"
                    dir="ltr"
                    value={form.hotelWebsite}
                    onChange={e => set('hotelWebsite', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-[#1D065C] focus:ring-1 focus:ring-[#1D065C] text-sm text-neutral-900 outline-none transition-all bg-neutral-50/50"
                  />
                </div>
              </div>

              {/* 6. Rooms & Suites */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-neutral-700 mb-1.5">
                    إجمالي عدد الغرف *
                  </label>
                  <input
                    type="number"
                    placeholder="مثال: 35"
                    min="1"
                    required
                    value={form.rooms}
                    onChange={e => set('rooms', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-[#1D065C] focus:ring-1 focus:ring-[#1D065C] text-sm text-neutral-900 outline-none transition-all bg-neutral-50/50"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-neutral-700 mb-1.5">
                    عدد الأجنحة (إن وجدت)
                  </label>
                  <input
                    type="number"
                    placeholder="مثال: 6"
                    min="0"
                    value={form.suites}
                    onChange={e => set('suites', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-[#1D065C] focus:ring-1 focus:ring-[#1D065C] text-sm text-neutral-900 outline-none transition-all bg-neutral-50/50"
                  />
                </div>
              </div>

              {/* 7. Facilities & Amenities (Interactive Chips) */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-neutral-700 mb-2">
                  المرافق والخدمات المتوفرة بالفندق * (اختر بنقرة واحدة):
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {POPULAR_AMENITIES.map((item) => {
                    const isSelected = selectedAmenities.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleAmenity(item)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-[#1D065C] text-white shadow-xs'
                            : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                        }`}
                      >
                        {isSelected ? <Check size={14} /> : <span>+</span>}
                        <span>{item}</span>
                      </button>
                    );
                  })}
                </div>
                <input
                  type="text"
                  placeholder="مرافق وخدمات إضافية أخرى (اختياري)..."
                  value={form.customAmenities}
                  onChange={e => set('customAmenities', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-xs text-neutral-900 outline-none bg-neutral-50/50"
                />
              </div>

              {/* 8. Facade Image Upload (REQUIRED) */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-neutral-700 mb-1.5 flex items-center gap-1.5">
                  <Upload size={15} className="text-[#1D065C]" />
                  <span>صورة واجهة الفندق الرسمية * (إجراء مطلوب للتحقق)</span>
                </label>

                {imagePreview ? (
                  <div className="relative w-full aspect-video max-h-56 rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-900 shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePreview}
                      alt="معاينة واجهة الفندق"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-3 end-3 p-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors shadow-md"
                      title="حذف الصورة"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-neutral-300 hover:border-[#1D065C] rounded-2xl p-6 text-center cursor-pointer transition-colors bg-neutral-50/50 hover:bg-[#1D065C]/5"
                  >
                    <Upload size={28} className="mx-auto text-neutral-400 mb-2" />
                    <p className="font-bold text-xs sm:text-sm text-neutral-700 mb-1">
                      انقر هنا لاختيار صورة واجهة الفندق
                    </p>
                    <p className="text-[11px] text-neutral-400">
                      الصيغ المدعومة: JPG, PNG, WebP (الحد الأقصى: 5 ميجابايت)
                    </p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />

                {imageError && (
                  <p className="text-xs font-bold text-red-600 mt-1.5">{imageError}</p>
                )}
              </div>

            </div>

            {/* ═══ SECTION 2: OWNER / MANAGER CONTACT ═══ */}
            <div className="space-y-4">
              <h3 className="font-black text-neutral-900 text-base sm:text-lg flex items-center gap-2 text-[#1D065C]">
                <User size={20} />
                <span>ثانياً: بيانات المسؤول للتواصل والاعتماد</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Owner Name */}
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-neutral-700 mb-1.5">
                    اسم المسؤول الرباعي (مقدم الطلب) *
                  </label>
                  <input
                    type="text"
                    placeholder="الاسم الكامل"
                    required
                    value={form.ownerName}
                    onChange={e => set('ownerName', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-[#1D065C] focus:ring-1 focus:ring-[#1D065C] text-sm text-neutral-900 outline-none transition-all bg-neutral-50/50"
                  />
                </div>

                {/* 2. Position */}
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-neutral-700 mb-1.5">
                    الصفة / المسمى الوظيفي *
                  </label>
                  <input
                    type="text"
                    placeholder="مالك الفندق / مدير عام / مسؤول حجوزات"
                    required
                    value={form.position}
                    onChange={e => set('position', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-[#1D065C] focus:ring-1 focus:ring-[#1D065C] text-sm text-neutral-900 outline-none transition-all bg-neutral-50/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 3. Phone / WhatsApp */}
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-neutral-700 mb-1.5 flex items-center gap-1.5">
                    <Phone size={15} className="text-[#1D065C]" />
                    <span>رقم الهاتف / واتساب للتواصل المباشر *</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="+967 7XX XXX XXX"
                    required
                    dir="ltr"
                    value={form.ownerPhone}
                    onChange={e => set('ownerPhone', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-[#1D065C] focus:ring-1 focus:ring-[#1D065C] text-sm text-neutral-900 outline-none transition-all bg-neutral-50/50"
                  />
                </div>

                {/* 4. Owner Email */}
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-neutral-700 mb-1.5 flex items-center gap-1.5">
                    <Mail size={15} className="text-[#1D065C]" />
                    <span>البريد الإلكتروني للمسؤول (اختياري)</span>
                  </label>
                  <input
                    type="email"
                    placeholder="manager@example.com"
                    dir="ltr"
                    value={form.ownerEmail}
                    onChange={e => set('ownerEmail', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-[#1D065C] focus:ring-1 focus:ring-[#1D065C] text-sm text-neutral-900 outline-none transition-all bg-neutral-50/50"
                  />
                </div>
              </div>

              {/* 5. Additional Message */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-neutral-700 mb-1.5">
                  ملاحظات أو تفاصيل إضافية عن الفندق (اختياري)
                </label>
                <textarea
                  placeholder="أي تفاصيل ترغب في إطلاع فريقنا عليها (أسعار، ميزات خاصة، عروض موسمية)..."
                  rows={3}
                  value={form.message}
                  onChange={e => set('message', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-[#1D065C] focus:ring-1 focus:ring-[#1D065C] text-sm text-neutral-900 outline-none transition-all bg-neutral-50/50 resize-none"
                />
              </div>
            </div>

            {/* ═══ SUBMIT BUTTON ═══ */}
            <div className="pt-4">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={isSubmitting}
                className="py-4 text-base font-bold bg-[#1D065C] hover:bg-[#150444] text-white shadow-md rounded-2xl cursor-pointer"
                icon={isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              >
                {isSubmitting ? 'جاري التحقق وإرسال الطلب...' : 'إرسال طلب الانضمام الآن'}
              </Button>

              <p className="text-[11px] text-neutral-400 text-center mt-3">
                🔒 يتم التعامل مع جميع البيانات بسرية تامة وسيتم التواصل معك مباشرة للتحقق وتفعيل الحساب.
              </p>
            </div>

          </form>

        </div>
      </section>

    </div>
  );
}
