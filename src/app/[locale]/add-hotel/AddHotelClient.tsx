'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Hotel, User, Send, CheckCircle, Building2, AlertCircle,
  Loader2, MapPin, Globe, Mail, Phone, Upload, X,
  TrendingUp, BadgePercent, Headphones, Check, LogIn, UserPlus,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { whatsappLink } from '@/lib/site-config';

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

export default function AddHotelClient({
  pageContent,
  currentUser,
}: {
  pageContent?: any;
  currentUser?: any;
}) {
  const params = useParams();
  const locale = (params?.locale as string) || 'ar';

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [referenceNumber, setReferenceNumber] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  // Form State initialized with logged in user contact data if available
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
    ownerName: currentUser?.name || '',
    position: '',
    ownerPhone: currentUser?.phone || currentUser?.phoneNumber || '',
    ownerEmail: currentUser?.email || '',
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
  const [, setImageFile] = useState<File | null>(null);
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

    // Check authentication
    if (!currentUser) {
      setErrorMsg('يجب تسجيل الدخول بحسابك أولاً لإرسال طلب إضافة الفندق.');
      return;
    }

    // Strict Validations for mandatory fields
    if (!form.hotelName.trim()) {
      setErrorMsg('يرجى إدخال اسم الفندق.');
      return;
    }
    if (!form.city.trim()) {
      setErrorMsg('يرجى إدخال المدينة / المحافظة.');
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

  const loginUrl = `/${locale}/auth/login?callbackUrl=/${locale}/add-hotel`;
  const registerUrl = `/${locale}/auth/register?callbackUrl=/${locale}/add-hotel`;

  // Success Screen
  if (sent) {
    return (
      <div className="min-h-screen bg-[#F8F9FC] flex items-center justify-center px-4 py-20">
        <div className="text-center max-w-lg bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-neutral-100">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={36} className="text-green-600" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-neutral-900 mb-2.5">تم استلام طلبك بنجاح!</h2>
          <p className="text-neutral-500 text-xs sm:text-sm mb-6 leading-relaxed">
            شكراً لاهتمامك بالانضمام لمنصة مساري. تم استلام طلبك بنجاح وسيقوم فريق علاقات الفنادق بمراجعة البيانات والتواصل معك هاتفياً أو عبر واتساب خلال ٢٤ ساعة لإتمام الإجراءات واعتماد الفندق.
          </p>

          {referenceNumber && (
            <div className="bg-neutral-50 border border-neutral-200/80 rounded-2xl p-3.5 mb-6">
              <span className="text-xs text-neutral-400 font-medium block mb-1">الرقم المرجعي للطلب:</span>
              <span className="text-base sm:text-lg font-bold text-[#1D065C] select-all font-mono tracking-wide">{referenceNumber}</span>
            </div>
          )}

          <div className="space-y-2.5">
            <a
              href={`${whatsappLink()}?text=${encodeURIComponent(`مرحباً مساري، قمت بتقديم طلب انضمام فندق برقم مرجعي: ${referenceNumber}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs sm:text-sm transition-colors shadow-xs"
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
                  ownerName: currentUser?.name || '',
                  position: '',
                  ownerPhone: currentUser?.phone || currentUser?.phoneNumber || '',
                  ownerEmail: currentUser?.email || '',
                  customAmenities: '',
                  message: '',
                  honeypot: '',
                });
                removeImage();
              }}
              className="w-full py-2.5 px-5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-600 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
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
      <section className="relative pt-24 pb-14 sm:pt-28 sm:pb-20 bg-gradient-to-r from-[#1D065C] via-[#23096E] to-[#2E0D80] text-white overflow-hidden border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-white/90 text-xs font-semibold mb-4 border border-white/15 shadow-xs">
            <Building2 size={14} className="text-[#FF3B30]" />
            <span>{badge}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-3 leading-tight">
            {title}
          </h1>
          <p className="text-white/75 text-xs sm:text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>
      </section>

      {/* ── 2. PARTNER BENEFITS (3 Clean Golden Cards) ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 -mt-6 relative z-20 mb-10 sm:mb-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PARTNER_BENEFITS.map((b) => (
            <div
              key={b.title}
              className="bg-white rounded-2xl p-5 shadow-xs hover:shadow-sm border border-neutral-100 transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-xl bg-[#FF3B30]/10 text-[#FF3B30] flex items-center justify-center mb-3">
                <b.icon size={20} />
              </div>
              <h3 className="font-bold text-neutral-900 text-sm sm:text-base mb-1.5">{b.title}</h3>
              <p className="text-neutral-500 text-xs leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. HOW IT WORKS (3 Steps side-by-side in 1 row) ── */}
      <section className="max-w-3xl mx-auto px-3 sm:px-6 mb-10 sm:mb-14 text-center">
        <h2 className="text-base sm:text-lg font-bold text-neutral-800 mb-5">كيف تبدأ الشراكة في 3 خطوات بسيطة؟</h2>
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <div className="bg-white p-2.5 sm:p-4 rounded-2xl border border-neutral-100 shadow-2xs flex flex-col items-center text-center">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FF3B30] text-white flex items-center justify-center font-bold text-[11px] sm:text-xs mb-1.5 shadow-xs">
              1
            </div>
            <h4 className="font-bold text-[11px] sm:text-sm text-neutral-900 mb-0.5 leading-tight">قدم طلبك</h4>
            <p className="text-[10px] sm:text-[11px] text-neutral-400 leading-tight">املأ النموذج بدقيقة</p>
          </div>

          <div className="bg-white p-2.5 sm:p-4 rounded-2xl border border-neutral-100 shadow-2xs flex flex-col items-center text-center">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FF3B30] text-white flex items-center justify-center font-bold text-[11px] sm:text-xs mb-1.5 shadow-xs">
              2
            </div>
            <h4 className="font-bold text-[11px] sm:text-sm text-neutral-900 mb-0.5 leading-tight">المراجعة</h4>
            <p className="text-[10px] sm:text-[11px] text-neutral-400 leading-tight">نتواصل خلال 24 ساعة</p>
          </div>

          <div className="bg-white p-2.5 sm:p-4 rounded-2xl border border-neutral-100 shadow-2xs flex flex-col items-center text-center">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FF3B30] text-white flex items-center justify-center font-bold text-[11px] sm:text-xs mb-1.5 shadow-xs">
              3
            </div>
            <h4 className="font-bold text-[11px] sm:text-sm text-neutral-900 mb-0.5 leading-tight">استقبل الحجوزات</h4>
            <p className="text-[10px] sm:text-[11px] text-neutral-400 leading-tight">يظهر فندقك للمسافرين</p>
          </div>
        </div>
      </section>

      {/* ── 4. APPLICATION FORM / AUTH GATE ── */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 pb-20">
        
        {/* CASE A: USER IS NOT LOGGED IN -> SHOW AUTH REQUIRED PROMPT */}
        {!currentUser ? (
          <div className="bg-white rounded-3xl shadow-xs border border-neutral-100 p-6 sm:p-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#1D065C]/10 text-[#1D065C] flex items-center justify-center mx-auto mb-4">
              <ShieldCheck size={36} className="text-[#FF3B30]" />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold mb-3 border border-amber-200">
              <span>تسجيل الدخول إلزامي لتقديم الطلب</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-neutral-900 mb-2.5">
              يرجى تسجيل الدخول لتقديم طلب إضافة فندقك
            </h2>

            <p className="text-neutral-500 text-xs sm:text-sm max-w-md mx-auto mb-6 leading-relaxed">
              لضمان جدية الطلب والتحقق من هوية مقدم الطلب، يتطلب إرسال النموذج تسجيل الدخول بحسابك في مساري. ستقوم إدارة مساري بمراجعة الطلب والتواصل معك لإتمام الإجراءات.
            </p>

            {/* Quick Benefits Checklist */}
            <div className="bg-neutral-50 rounded-2xl p-4 max-w-md mx-auto mb-6 text-start space-y-2 border border-neutral-200/60">
              <div className="flex items-center gap-2 text-xs text-neutral-700 font-medium">
                <Check size={14} className="text-green-600 shrink-0" />
                <span>التحقق من هوية مقدم الطلب وضمان جدية الطلبات</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-700 font-medium">
                <Check size={14} className="text-green-600 shrink-0" />
                <span>تعبئة تلقائية لبيانات التواصل الخاصة بك لتوفير الوقت</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-700 font-medium">
                <Check size={14} className="text-green-600 shrink-0" />
                <span>مراجعة مباشرة وتواصل سريع من فريق علاقات الفنادق</span>
              </div>
            </div>

            {/* Login & Register Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
              <Link
                href={loginUrl}
                className="flex-1 py-3 px-5 rounded-xl bg-[#1D065C] hover:bg-[#150444] text-white font-bold text-xs sm:text-sm transition-colors shadow-xs flex items-center justify-center gap-2"
              >
                <LogIn size={16} />
                <span>تسجيل الدخول بحسابك</span>
              </Link>
              <Link
                href={registerUrl}
                className="flex-1 py-3 px-5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2"
              >
                <UserPlus size={16} />
                <span>إنشاء حساب جديد</span>
              </Link>
            </div>
          </div>
        ) : (

          /* CASE B: USER IS LOGGED IN -> RENDER ACTIVE SUBMISSION FORM */
          <div className="bg-white rounded-3xl shadow-xs border border-neutral-100 p-5 sm:p-8">
            
            {/* Authenticated User Status Bar */}
            <div className="mb-6 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-emerald-900">
                  مرحباً {currentUser.name || currentUser.email}، يمكنك الآن تعبئة النموذج وإرسال طلبك لإدارة مساري.
                </span>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 mb-1.5">نموذج تقديم طلب إضافة فندق</h2>
              <p className="text-neutral-400 text-xs sm:text-[13px] leading-relaxed">
                أدخل بيانات الفندق بدقة وسيقوم فريق علاقات الفنادق بالتواصل معك لمراجعة البيانات وتفعيل الفندق.
              </p>
            </div>

            {errorMsg && (
              <div className="mb-6 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center gap-2.5">
                <AlertCircle size={18} className="shrink-0 text-red-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              
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

              {/* ═══ SECTION 1: بيانات الفندق ═══ */}
              <div className="space-y-4 pb-6 border-b border-neutral-100">
                <h3 className="font-bold text-neutral-800 text-sm sm:text-base flex items-center gap-2">
                  <Hotel size={18} className="text-[#FF3B30]" />
                  <span>بيانات الفندق</span>
                </h3>

                {/* 1. Hotel Name & Stars Selector in SAME ROW */}
                <div className="grid grid-cols-12 gap-2.5 sm:gap-3.5">
                  <div className="col-span-7 sm:col-span-8">
                    <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
                      اسم الفندق *
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: فندق الأمل الدولي"
                      required
                      value={form.hotelName}
                      onChange={e => set('hotelName', e.target.value)}
                      className="w-full px-3 py-2.5 sm:py-3 rounded-xl border border-neutral-200 focus:border-[#1D065C] focus:ring-1 focus:ring-[#1D065C] text-xs sm:text-sm text-neutral-800 placeholder:text-xs placeholder:text-neutral-400/80 outline-none transition-all bg-neutral-50/40"
                    />
                  </div>

                  <div className="col-span-5 sm:col-span-4">
                    <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
                      عدد النجوم *
                    </label>
                    <select
                      value={form.stars}
                      onChange={e => set('stars', e.target.value)}
                      className="w-full px-2 sm:px-3 py-2.5 sm:py-3 rounded-xl border border-neutral-200 focus:border-[#1D065C] focus:ring-1 focus:ring-[#1D065C] text-xs sm:text-sm text-neutral-800 outline-none transition-all bg-neutral-50/40 cursor-pointer"
                    >
                      <option value="5">5 نجوم ⭐⭐⭐⭐⭐</option>
                      <option value="4">4 نجوم ⭐⭐⭐⭐</option>
                      <option value="3">3 نجوم ⭐⭐⭐</option>
                      <option value="2">2 نجوم ⭐⭐</option>
                      <option value="1">1 نجمة ⭐</option>
                    </select>
                  </div>
                </div>

                {/* 2. City & Detailed Address in SAME ROW */}
                <div className="grid grid-cols-12 gap-2.5 sm:gap-3.5">
                  <div className="col-span-5 sm:col-span-4">
                    <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
                      المدينة / المحافظة *
                    </label>
                    <input
                      type="text"
                      placeholder="صنعاء / عدن..."
                      required
                      value={form.city}
                      onChange={e => set('city', e.target.value)}
                      className="w-full px-3 py-2.5 sm:py-3 rounded-xl border border-neutral-200 focus:border-[#1D065C] focus:ring-1 focus:ring-[#1D065C] text-xs sm:text-sm text-neutral-800 placeholder:text-xs placeholder:text-neutral-400/80 outline-none transition-all bg-neutral-50/40"
                    />
                  </div>

                  <div className="col-span-7 sm:col-span-8">
                    <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
                      العنوان التفصيلي *
                    </label>
                    <input
                      type="text"
                      placeholder="المديرية / الحي / اسم الشارع"
                      required
                      value={form.address}
                      onChange={e => set('address', e.target.value)}
                      className="w-full px-3 py-2.5 sm:py-3 rounded-xl border border-neutral-200 focus:border-[#1D065C] focus:ring-1 focus:ring-[#1D065C] text-xs sm:text-sm text-neutral-800 placeholder:text-xs placeholder:text-neutral-400/80 outline-none transition-all bg-neutral-50/40"
                    />
                  </div>
                </div>

                {/* 3. Google Maps URL */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1.5 flex items-center gap-1.5">
                    <MapPin size={14} className="text-[#FF3B30]" />
                    <span>رابط موقع الفندق على خرائط Google *</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://maps.app.goo.gl/... أو https://google.com/maps/..."
                    required
                    dir="ltr"
                    value={form.googleMapsUrl}
                    onChange={e => set('googleMapsUrl', e.target.value)}
                    className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl border border-neutral-200 focus:border-[#1D065C] focus:ring-1 focus:ring-[#1D065C] text-xs sm:text-sm text-neutral-800 placeholder:text-xs placeholder:text-neutral-400/80 outline-none transition-all bg-neutral-50/40"
                  />
                  <span className="text-[10.5px] text-neutral-400/90 block mt-1">
                    * انسخ رابط مشاركة موقع الفندق من تطبيق خرائط Google لتسهيل التحقق والاعتماد.
                  </span>
                </div>

                {/* 4. Hotel Email & Website in SAME ROW */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1.5 flex items-center gap-1.5">
                      <Mail size={14} className="text-[#FF3B30]" />
                      <span>البريد الإلكتروني للفندق *</span>
                    </label>
                    <input
                      type="email"
                      placeholder="hotel@example.com"
                      required
                      dir="ltr"
                      value={form.hotelEmail}
                      onChange={e => set('hotelEmail', e.target.value)}
                      className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl border border-neutral-200 focus:border-[#1D065C] focus:ring-1 focus:ring-[#1D065C] text-xs sm:text-sm text-neutral-800 placeholder:text-xs placeholder:text-neutral-400/80 outline-none transition-all bg-neutral-50/40"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1.5 flex items-center gap-1.5">
                      <Globe size={14} className="text-[#FF3B30]" />
                      <span>الموقع الإلكتروني للفندق (إن وجد)</span>
                    </label>
                    <input
                      type="url"
                      placeholder="https://www.hotelwebsite.com"
                      dir="ltr"
                      value={form.hotelWebsite}
                      onChange={e => set('hotelWebsite', e.target.value)}
                      className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl border border-neutral-200 focus:border-[#1D065C] focus:ring-1 focus:ring-[#1D065C] text-xs sm:text-sm text-neutral-800 placeholder:text-xs placeholder:text-neutral-400/80 outline-none transition-all bg-neutral-50/40"
                    />
                  </div>
                </div>

                {/* 5. Rooms & Suites in SAME ROW */}
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
                      عدد الغرف *
                    </label>
                    <input
                      type="number"
                      placeholder="مثال: 35"
                      min="1"
                      required
                      value={form.rooms}
                      onChange={e => set('rooms', e.target.value)}
                      className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl border border-neutral-200 focus:border-[#1D065C] focus:ring-1 focus:ring-[#1D065C] text-xs sm:text-sm text-neutral-800 placeholder:text-xs placeholder:text-neutral-400/80 outline-none transition-all bg-neutral-50/40"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
                      عدد الأجنحة
                    </label>
                    <input
                      type="number"
                      placeholder="مثال: 6"
                      min="0"
                      value={form.suites}
                      onChange={e => set('suites', e.target.value)}
                      className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl border border-neutral-200 focus:border-[#1D065C] focus:ring-1 focus:ring-[#1D065C] text-xs sm:text-sm text-neutral-800 placeholder:text-xs placeholder:text-neutral-400/80 outline-none transition-all bg-neutral-50/40"
                    />
                  </div>
                </div>

                {/* 6. Facilities & Amenities (Neat, balanced grid) */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-2">
                    المرافق والخدمات المتوفرة *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2.5">
                    {POPULAR_AMENITIES.map((item) => {
                      const isSelected = selectedAmenities.includes(item);
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => toggleAmenity(item)}
                          className={`h-9 px-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-between gap-1 border cursor-pointer ${
                            isSelected
                              ? 'bg-[#1D065C] border-[#1D065C] text-white shadow-2xs'
                              : 'bg-neutral-50/80 border-neutral-200/80 text-neutral-700 hover:bg-neutral-100'
                          }`}
                        >
                          <span className="truncate">{item}</span>
                          {isSelected ? (
                            <Check size={13} className="text-[#FF3B30] shrink-0" />
                          ) : (
                            <span className="text-neutral-400 text-xs shrink-0">+</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <input
                    type="text"
                    placeholder="مرافق وخدمات إضافية أخرى (اختياري)..."
                    value={form.customAmenities}
                    onChange={e => set('customAmenities', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-xs text-neutral-800 placeholder:text-xs placeholder:text-neutral-400/80 outline-none bg-neutral-50/40"
                  />
                </div>

                {/* 7. Facade Image Upload (REQUIRED) */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1.5 flex items-center gap-1.5">
                    <Upload size={14} className="text-[#FF3B30]" />
                    <span>صورة واجهة الفندق الرسمية * (إجراء مطلوب للتحقق)</span>
                  </label>

                  {imagePreview ? (
                    <div className="relative w-full aspect-video max-h-52 rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-900 shadow-xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imagePreview}
                        alt="معاينة واجهة الفندق"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2.5 end-2.5 p-1.5 rounded-full bg-[#FF3B30] text-white hover:bg-red-700 transition-colors shadow-sm cursor-pointer"
                        title="حذف الصورة"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full border border-dashed border-neutral-300 hover:border-[#FF3B30] rounded-2xl p-5 text-center cursor-pointer transition-colors bg-neutral-50/40 hover:bg-[#FF3B30]/5"
                    >
                      <Upload size={24} className="mx-auto text-[#FF3B30] mb-1.5" />
                      <p className="font-bold text-xs text-neutral-700 mb-0.5">
                        انقر هنا لاختيار صورة واجهة الفندق
                      </p>
                      <p className="text-[10.5px] text-neutral-400">
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
                    <p className="text-xs font-bold text-[#FF3B30] mt-1.5">{imageError}</p>
                  )}
                </div>

              </div>

              {/* ═══ SECTION 2: بيانات مقدم الطلب ═══ */}
              <div className="space-y-4">
                <h3 className="font-bold text-neutral-800 text-sm sm:text-base flex items-center gap-2">
                  <User size={18} className="text-[#FF3B30]" />
                  <span>بيانات مقدم الطلب</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3.5">
                  {/* 1. Owner Name */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
                      اسم المسؤول الرباعي (مقدم الطلب) *
                    </label>
                    <input
                      type="text"
                      placeholder="الاسم الكامل"
                      required
                      value={form.ownerName}
                      onChange={e => set('ownerName', e.target.value)}
                      className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl border border-neutral-200 focus:border-[#1D065C] focus:ring-1 focus:ring-[#1D065C] text-xs sm:text-sm text-neutral-800 placeholder:text-xs placeholder:text-neutral-400/80 outline-none transition-all bg-neutral-50/40"
                    />
                  </div>

                  {/* 2. Position */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
                      الصفة / المسمى الوظيفي *
                    </label>
                    <input
                      type="text"
                      placeholder="مالك الفندق / مدير عام / مسؤول حجوزات"
                      required
                      value={form.position}
                      onChange={e => set('position', e.target.value)}
                      className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl border border-neutral-200 focus:border-[#1D065C] focus:ring-1 focus:ring-[#1D065C] text-xs sm:text-sm text-neutral-800 placeholder:text-xs placeholder:text-neutral-400/80 outline-none transition-all bg-neutral-50/40"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3.5">
                  {/* 3. Phone / WhatsApp */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1.5 flex items-center gap-1.5">
                      <Phone size={14} className="text-[#FF3B30]" />
                      <span>رقم الهاتف / واتساب للتواصل المباشر *</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="+967 7XX XXX XXX"
                      required
                      dir="ltr"
                      value={form.ownerPhone}
                      onChange={e => set('ownerPhone', e.target.value)}
                      className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl border border-neutral-200 focus:border-[#1D065C] focus:ring-1 focus:ring-[#1D065C] text-xs sm:text-sm text-neutral-800 placeholder:text-xs placeholder:text-neutral-400/80 outline-none transition-all bg-neutral-50/40"
                    />
                  </div>

                  {/* 4. Owner Email */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1.5 flex items-center gap-1.5">
                      <Mail size={14} className="text-[#FF3B30]" />
                      <span>البريد الإلكتروني للمسؤول (اختياري)</span>
                    </label>
                    <input
                      type="email"
                      placeholder="manager@example.com"
                      dir="ltr"
                      value={form.ownerEmail}
                      onChange={e => set('ownerEmail', e.target.value)}
                      className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl border border-neutral-200 focus:border-[#1D065C] focus:ring-1 focus:ring-[#1D065C] text-xs sm:text-sm text-neutral-800 placeholder:text-xs placeholder:text-neutral-400/80 outline-none transition-all bg-neutral-50/40"
                    />
                  </div>
                </div>

                {/* 5. Additional Message */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
                    ملاحظات أو تفاصيل إضافية عن الفندق (اختياري)
                  </label>
                  <textarea
                    placeholder="أي تفاصيل ترغب في إطلاع فريقنا عليها (أسعار، ميزات خاصة، عروض موسمية)..."
                    rows={3}
                    value={form.message}
                    onChange={e => set('message', e.target.value)}
                    className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl border border-neutral-200 focus:border-[#1D065C] focus:ring-1 focus:ring-[#1D065C] text-xs sm:text-sm text-neutral-800 placeholder:text-xs placeholder:text-neutral-400/80 outline-none transition-all bg-neutral-50/40 resize-none"
                  />
                </div>
              </div>

              {/* ═══ SUBMIT BUTTON ═══ */}
              <div className="pt-3">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={isSubmitting}
                  className="py-3.5 text-sm sm:text-base font-bold bg-[#1D065C] hover:bg-[#150444] text-white shadow-md rounded-2xl cursor-pointer"
                  icon={isSubmitting ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
                >
                  {isSubmitting ? 'جاري التحقق وإرسال الطلب...' : 'إرسال طلب الانضمام الآن'}
                </Button>

                {/* ⚠️ REQUIRED NOTICE ALERT (Under Submit Button) */}
                <div className="mt-5 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                  <AlertCircle size={18} className="shrink-0 text-amber-600 mt-0.5" />
                  <div className="leading-relaxed text-amber-800/90">
                    <strong className="block font-bold text-amber-900 mb-0.5">تنبيه هام لضمان قبول الطلب:</strong>
                    لن يتم قبول أي طلبات غير مكتملة أو غير صحيحة. يرجى تعبئة جميع الحقول المطلوبة والتأكد من صحة بيانات التواصل وصورة واجهة الفندق قبل الإرسال.
                  </div>
                </div>

                <p className="text-[10.5px] text-neutral-400 text-center mt-3.5">
                  🔒 يتم استلام الطلب ومراجعته من قبل إدارة منصة مساري فقط، وسيتم التواصل معك مباشرة للتحقق واعتماد الفندق.
                </p>
              </div>

            </form>

          </div>
        )}

      </section>

    </div>
  );
}
