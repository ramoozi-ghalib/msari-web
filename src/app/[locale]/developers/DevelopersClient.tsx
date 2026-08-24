'use client';

import { useState } from 'react';
import {
  CheckCircle2,
  Zap,
  Server,
  ShieldCheck,
  MessageSquare,
  Code2,
  Copy,
  Check,
  ExternalLink,
  Terminal,
  ArrowRight,
  Coins,
  Lock,
  Layers,
  Sparkles,
  Search,
  Building2,
  CreditCard,
  BellRing,
  CheckCheck,
  Cpu,
  Globe2,
} from 'lucide-react';
import Link from 'next/link';
import type { DevelopersPageData } from '@/services/cms';

interface DevelopersClientProps {
  data: DevelopersPageData;
  whatsappNumber: string;
}

const ICON_MAP: Record<string, any> = {
  Zap,
  Server,
  ShieldCheck,
  MessageSquare,
  Coins,
  Lock,
  Layers,
  Code2,
};

type CodeLang = 'curl' | 'js' | 'python' | 'dart';
type EndpointKey = 'search' | 'details' | 'booking' | 'webhooks';

const HERO_CODE_SNIPPETS: Record<CodeLang, { code: string; langLabel: string; filename: string }> = {
  curl: {
    langLabel: 'cURL',
    filename: 'search-hotels.sh',
    code: `curl -X GET "https://api.msari.net/v1/hotels/search?city=sanaa&checkIn=2026-09-01&checkOut=2026-09-05&guests=2" \\
  -H "Authorization: Bearer msari_live_sec_994827103a" \\
  -H "Accept: application/json"`,
  },
  js: {
    langLabel: 'JavaScript / Node',
    filename: 'searchHotels.js',
    code: `import { MsariClient } from '@msari/sdk';

const msari = new MsariClient({
  apiKey: process.env.MSARI_API_KEY, // msari_live_...
});

const results = await msari.hotels.search({
  city: 'sanaa',
  checkIn: '2026-09-01',
  checkOut: '2026-09-05',
  guests: 2,
  currency: 'USD', // USD, YER, SAR
});

console.log(\`Found \${results.total} available hotels\`);`,
  },
  python: {
    langLabel: 'Python',
    filename: 'search_hotels.py',
    code: `import requests

url = "https://api.msari.net/v1/hotels/search"
headers = {
    "Authorization": "Bearer msari_live_sec_994827103a",
    "Accept": "application/json"
}
params = {
    "city": "sanaa",
    "checkIn": "2026-09-01",
    "checkOut": "2026-09-05",
    "guests": 2,
    "currency": "USD"
}

response = requests.get(url, headers=headers, params=params)
data = response.json()
print(f"Status: {data['status']}, Hotels: {len(data['data'])}")`,
  },
  dart: {
    langLabel: 'Flutter / Dart',
    filename: 'msari_api_service.dart',
    code: `import 'dart:convert';
import 'package:http/http.dart' as http;

Future<List<Hotel>> searchHotels() async {
  final uri = Uri.https('api.msari.net', '/v1/hotels/search', {
    'city': 'sanaa',
    'checkIn': '2026-09-01',
    'checkOut': '2026-09-05',
    'guests': '2',
  });

  final response = await http.get(uri, headers: {
    'Authorization': 'Bearer msari_live_sec_994827103a',
  });

  final json = jsonDecode(response.body);
  return (json['data'] as List).map((h) => Hotel.fromJson(h)).toList();
}`,
  },
};

const HERO_RESPONSE_JSON = `{
  "status": "success",
  "statusCode": 200,
  "executionTime": "84ms",
  "data": {
    "total": 42,
    "city": "صنعاء (Sanaa)",
    "currency": "USD",
    "hotels": [
      {
        "id": "htl_sanaa_grand_01",
        "name": "فندق جراند صنعاء الدولي",
        "stars": 5,
        "location": {
          "address": "شارع حدة، صنعاء",
          "lat": 15.3482,
          "lng": 44.2064
        },
        "rates": {
          "minPrice": 85.00,
          "currency": "USD",
          "convertedYER": 45050,
          "taxIncluded": true
        },
        "availability": {
          "isInstantConfirmation": true,
          "availableRooms": 6
        }
      }
    ]
  }
}`;

const ENDPOINTS_DATA: Record<
  EndpointKey,
  {
    title: string;
    method: 'GET' | 'POST';
    path: string;
    desc: string;
    icon: any;
    params: { name: string; type: string; required: boolean; desc: string }[];
    requestSnippet: string;
    responseSnippet: string;
  }
> = {
  search: {
    title: 'البحث عن الفنادق والغرف المتاحة',
    method: 'GET',
    path: '/v1/hotels/search',
    desc: 'البحث اللحظي في مخزون الفنادق بجميع المدن اليمنية مع التصفية حسب المدينة والتواريخ والأسعار.',
    icon: Search,
    params: [
      { name: 'city', type: 'string', required: true, desc: 'معرف المدينة (sanaa, aden, mukalla, seiyun...)' },
      { name: 'checkIn', type: 'string (YYYY-MM-DD)', required: true, desc: 'تاريخ الوصول' },
      { name: 'checkOut', type: 'string (YYYY-MM-DD)', required: true, desc: 'تاريخ المغادرة' },
      { name: 'guests', type: 'number', required: false, desc: 'عدد النزلاء (الافتراضي: 1)' },
      { name: 'currency', type: 'string', required: false, desc: 'عملة التسعير: USD, YER, SAR (الافتراضي: USD)' },
    ],
    requestSnippet: `GET /v1/hotels/search?city=aden&checkIn=2026-09-10&checkOut=2026-09-15&guests=2&currency=USD HTTP/1.1
Host: api.msari.net
Authorization: Bearer YOUR_API_KEY
Accept: application/json`,
    responseSnippet: `{
  "status": "success",
  "data": {
    "total": 18,
    "city": "عدن",
    "hotels": [
      {
        "id": "htl_aden_coral_02",
        "name": "فندق ومنتجع كورال عدن",
        "stars": 4,
        "pricePerNight": 75,
        "currency": "USD",
        "instantConfirmation": true,
        "roomsCount": 4
      }
    ]
  }
}`,
  },
  details: {
    title: 'تفاصيل الفندق والصور والمرافق',
    method: 'GET',
    path: '/v1/hotels/{hotelId}',
    desc: 'جلب الملف الكامل للفندق متضمناً صور الغرف العالية الدقة، قائمة المرافق، الكهرباء، وخيارات الإلغاء.',
    icon: Building2,
    params: [
      { name: 'hotelId', type: 'string (path)', required: true, desc: 'المعرف الفريد للفندق (مثال: htl_sanaa_grand_01)' },
      { name: 'includeRooms', type: 'boolean', required: false, desc: 'تضمين تفاصيل وأنواع الغرف المتوفرة (true/false)' },
    ],
    requestSnippet: `GET /v1/hotels/htl_sanaa_grand_01?includeRooms=true HTTP/1.1
Host: api.msari.net
Authorization: Bearer YOUR_API_KEY
Accept: application/json`,
    responseSnippet: `{
  "status": "success",
  "data": {
    "id": "htl_sanaa_grand_01",
    "nameAr": "فندق جراند صنعاء الدولي",
    "nameEn": "Sanaa Grand International Hotel",
    "stars": 5,
    "electricity24_7": true,
    "amenities": ["واي فاي مجاني", "مكيف مركزي", "موقف سيارات", "إفطار مجاني"],
    "rooms": [
      {
        "roomId": "rm_dlx_01",
        "type": "غرفة ديلوكس كينج",
        "pricePerNight": 85.00,
        "capacity": 2,
        "images": ["https://cdn.msari.net/hotels/rm1.webp"]
      }
    ]
  }
}`,
  },
  booking: {
    title: 'إنشاء وتأكيد الحجز الفوري (Instant Booking)',
    method: 'POST',
    path: '/v1/bookings/create',
    desc: 'إصدار حجز فوري مؤكد برقم مرجعي رسمي مباشرة في نظام الفندق وخصم التوفر لحظياً.',
    icon: CreditCard,
    params: [
      { name: 'hotelId', type: 'string', required: true, desc: 'معرف الفندق' },
      { name: 'roomId', type: 'string', required: true, desc: 'معرف نوع الغرفة' },
      { name: 'checkIn', type: 'string', required: true, desc: 'تاريخ الدخول' },
      { name: 'checkOut', type: 'string', required: true, desc: 'تاريخ الخروج' },
      { name: 'guestInfo', type: 'object', required: true, desc: 'بيانات النزيل الرئيسي (الاسم، الهاتف، البريد)' },
      { name: 'paymentMethod', type: 'string', required: true, desc: 'طريقة التسوية (wallet, bank, b2b_credit, pay_at_hotel)' },
    ],
    requestSnippet: `POST /v1/bookings/create HTTP/1.1
Host: api.msari.net
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "hotelId": "htl_sanaa_grand_01",
  "roomId": "rm_dlx_01",
  "checkIn": "2026-09-01",
  "checkOut": "2026-09-05",
  "guestInfo": {
    "fullName": "محمد أحمد العولقي",
    "phone": "+967770000000",
    "email": "guest@example.com"
  },
  "paymentMethod": "b2b_credit",
  "partnerReferenceId": "PARTNER_ORD_88492"
}`,
    responseSnippet: `{
  "status": "success",
  "statusCode": 201,
  "data": {
    "bookingReference": "MSR-2026-89412",
    "partnerReferenceId": "PARTNER_ORD_88492",
    "status": "CONFIRMED",
    "hotelConfirmationCode": "HTL-CONF-7712",
    "totalAmount": 340.00,
    "currency": "USD",
    "voucherPdfUrl": "https://api.msari.net/v1/vouchers/MSR-2026-89412.pdf"
  }
}`,
  },
  webhooks: {
    title: 'إشعارات الويب هوك اللحظية (Webhooks)',
    method: 'POST',
    path: '/v1/webhooks',
    desc: 'استقبال إشعارات تلقائية وفورية في نظامك عند تغيير حالة أي حجز أو تحديث الأسعار.',
    icon: BellRing,
    params: [
      { name: 'event', type: 'string', required: true, desc: 'نوع الحدث (booking.confirmed, booking.cancelled, hotel.rate_update)' },
      { name: 'signature', type: 'string (header)', required: true, desc: 'توقيع HMAC-SHA256 للتحقق من أمان الإشعار' },
    ],
    requestSnippet: `POST /your-webhook-endpoint HTTP/1.1
Host: your-server.com
X-Msari-Signature: t=1786294954,v1=9e3c...8f2a
Content-Type: application/json

{
  "event": "booking.confirmed",
  "timestamp": "2026-08-25T01:30:00Z",
  "data": {
    "bookingReference": "MSR-2026-89412",
    "status": "CONFIRMED",
    "hotelId": "htl_sanaa_grand_01",
    "checkIn": "2026-09-01"
  }
}`,
    responseSnippet: `HTTP/1.1 200 OK
Content-Type: application/json

{
  "received": true
}`,
  },
};

export default function DevelopersClient({ data, whatsappNumber }: DevelopersClientProps) {
  const [activeLang, setActiveLang] = useState<CodeLang>('curl');
  const [heroView, setHeroView] = useState<'request' | 'response'>('request');
  const [copiedCode, setCopiedCode] = useState(false);

  const [activeEndpoint, setActiveEndpoint] = useState<EndpointKey>('search');
  const [endpointView, setEndpointView] = useState<'request' | 'response'>('request');
  const [copiedEndpointCode, setCopiedEndpointCode] = useState(false);

  const handleCopy = (text: string, isHero: boolean) => {
    navigator.clipboard.writeText(text);
    if (isHero) {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedEndpointCode(true);
      setTimeout(() => setCopiedEndpointCode(false), 2000);
    }
  };

  const openWhatsApp = (planName: string) => {
    const text = `مرحباً فريق مساري، نود طلب مفتاح واجهة برمجة التطبيقات (API Key) والاشتراك في ${planName} للربط المباشر.`;
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const currentHeroCode =
    heroView === 'request'
      ? HERO_CODE_SNIPPETS[activeLang].code
      : HERO_RESPONSE_JSON;

  const currentEndpoint = ENDPOINTS_DATA[activeEndpoint];
  const currentEndpointCode =
    endpointView === 'request'
      ? currentEndpoint.requestSnippet
      : currentEndpoint.responseSnippet;

  return (
    <div className="min-h-screen bg-[#0D0B18] text-slate-100 font-sans selection:bg-[#FF3B30] selection:text-white pb-24">
      
      {/* ── Top Navigation Bar ────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0D0B18]/85 border-b border-white/10 transition-all">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Brand Logo & Portal Badge */}
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#23096E] via-[#3A1C8F] to-[#FF3B30] flex items-center justify-center shadow-lg shadow-[#23096E]/50 group-hover:scale-105 transition-transform">
                  <span className="text-white font-black text-xl">م</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black tracking-tight text-white">مساري</span>
                    <span className="text-xs font-black px-2 py-0.5 rounded-md bg-[#3A1C8F] text-purple-200 border border-purple-400/30">
                      API للمطورين
                    </span>
                  </div>
                  <span className="block text-[10px] text-slate-400 font-semibold tracking-wider">
                    B2B TRAVEL ENGINE API v1.0
                  </span>
                </div>
              </Link>

              {/* Status Indicator */}
              <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mr-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>النظام يعمل بكفاءة 99.9%</span>
              </div>
            </div>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-6">
              <a href="#endpoints" className="text-sm font-bold text-slate-300 hover:text-white transition-colors">
                نقاط الاتصال (Endpoints)
              </a>
              <a href="#quickstart" className="text-sm font-bold text-slate-300 hover:text-white transition-colors">
                البدء السريع
              </a>
              <a href="#pricing" className="text-sm font-bold text-slate-300 hover:text-white transition-colors">
                خطة الشراكة
              </a>
              <a href="#faq" className="text-sm font-bold text-slate-300 hover:text-white transition-colors">
                الأسئلة الشائعة
              </a>
            </nav>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
              >
                <span>الموقع الرئيسي</span>
                <ExternalLink size={13} />
              </Link>
              <button
                onClick={() => openWhatsApp('خطة الشراكة والربط البرمجي')}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-gradient-to-r from-[#23096E] to-[#3A1C8F] hover:from-[#3A1C8F] hover:to-[#5B2AC9] text-white shadow-lg shadow-[#23096E]/40 border border-purple-400/30 transition-all cursor-pointer flex items-center gap-2"
              >
                <Terminal size={15} className="text-[#FF3B30]" />
                <span>طلب مفتاح الـ API</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* ── Hero Section with Code Playground ──────────────────────────── */}
      <section className="relative pt-12 pb-20 overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-[-150px] right-1/4 w-[600px] h-[600px] bg-[#3A1C8F]/25 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-[100px] left-[-100px] w-[500px] h-[500px] bg-[#FF3B30]/15 rounded-full blur-[130px] pointer-events-none" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Right Column: Hero Content */}
            <div className="lg:col-span-6 space-y-6 text-start">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-purple-300 text-xs font-black shadow-inner">
                <Sparkles size={14} className="text-[#FF3B30]" />
                <span>{data.hero.badge || 'B2B Travel API v1.0'}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-[1.2] tracking-tight text-white">
                {data.hero.title}
              </h1>

              <p className="text-base sm:text-lg text-slate-300 font-medium leading-relaxed">
                {data.hero.subtitle}
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => openWhatsApp('خطة الشراكة والربط البرمجي')}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#23096E] via-[#3A1C8F] to-[#FF3B30] text-white font-black text-sm sm:text-base shadow-xl shadow-[#23096E]/50 hover:opacity-95 transition-all flex items-center gap-2.5 cursor-pointer"
                >
                  <MessageSquare size={18} />
                  <span>تواصل لطلب مفتاح الـ API والبدء فوراً</span>
                </button>
                <a
                  href="#endpoints"
                  className="px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-bold text-sm sm:text-base transition-all flex items-center gap-2"
                >
                  <Code2 size={18} className="text-purple-400" />
                  <span>استكشاف نقاط الاتصال</span>
                </a>
              </div>

              {/* Key Trust Signals */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10 text-center sm:text-start">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="text-lg sm:text-xl font-black text-emerald-400">{'< 150ms'}</div>
                  <div className="text-[11px] text-slate-400 font-bold">وقت الاستجابة</div>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="text-lg sm:text-xl font-black text-purple-300">99.9%</div>
                  <div className="text-[11px] text-slate-400 font-bold">ضمان الاستقرار SLA</div>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="text-lg sm:text-xl font-black text-[#FF3B30]">فوري</div>
                  <div className="text-[11px] text-slate-400 font-bold">تأكيد الحجز اللحظي</div>
                </div>
              </div>
            </div>

            {/* Left Column: Interactive Code Playground */}
            <div className="lg:col-span-6">
              <div className="rounded-3xl bg-[#131127] border border-white/15 shadow-2xl shadow-black/80 overflow-hidden">
                
                {/* Terminal Window Header */}
                <div className="px-4 py-3 bg-[#0A0815] border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block"></span>
                    <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block"></span>
                    <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block"></span>
                    <span className="text-xs font-mono text-slate-400 ml-2">
                      {heroView === 'request'
                        ? HERO_CODE_SNIPPETS[activeLang].filename
                        : 'response.json'}
                    </span>
                  </div>

                  {/* Request vs Response Switcher */}
                  <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
                    <button
                      onClick={() => setHeroView('request')}
                      className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                        heroView === 'request'
                          ? 'bg-[#3A1C8F] text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Request
                    </button>
                    <button
                      onClick={() => setHeroView('response')}
                      className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                        heroView === 'response'
                          ? 'bg-emerald-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Response (200 OK)
                    </button>
                  </div>
                </div>

                {/* Language Bar (Only for Request view) */}
                {heroView === 'request' && (
                  <div className="px-4 py-2 bg-[#0E0C1F] border-b border-white/5 flex items-center justify-between overflow-x-auto">
                    <div className="flex items-center gap-1.5">
                      {(['curl', 'js', 'python', 'dart'] as CodeLang[]).map((lang) => (
                        <button
                          key={lang}
                          onClick={() => setActiveLang(lang)}
                          className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                            activeLang === lang
                              ? 'bg-white/15 text-purple-200 border border-white/20'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                          }`}
                        >
                          {HERO_CODE_SNIPPETS[lang].langLabel}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => handleCopy(currentHeroCode, true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                      title="نسخ الكود"
                    >
                      {copiedCode ? (
                        <>
                          <Check size={14} className="text-emerald-400" />
                          <span className="text-emerald-400 font-bold">تم النسخ!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          <span>نسخ</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Code Body */}
                <div className="p-5 overflow-x-auto font-mono text-xs sm:text-sm leading-relaxed max-h-[360px] scrollbar-thin scrollbar-thumb-purple-900">
                  <pre className="text-slate-200 whitespace-pre">
                    <code>{currentHeroCode}</code>
                  </pre>
                </div>

                {/* Terminal Footer Bar */}
                <div className="px-4 py-2.5 bg-[#0A0815] border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Globe2 size={12} className="text-purple-400" />
                    <span>Production URL: https://api.msari.net/v1</span>
                  </span>
                  <span className="font-mono text-emerald-400 font-bold">HTTPS RESTful</span>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Engineering Performance Highlights ────────────────────────── */}
      <section className="py-12 border-y border-white/10 bg-[#120F24]/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#23096E]/50 border border-purple-400/30 flex items-center justify-center shrink-0 text-purple-300">
                <Zap size={22} className="text-[#FF3B30]" />
              </div>
              <div>
                <h4 className="font-black text-white text-base mb-1">استجابة فائقة السرعة</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  خوادم مجهزة بمعايير Edge Caching بمتوسط سرعة يقل عن 150ms للطلبات اللحظية.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#23096E]/50 border border-purple-400/30 flex items-center justify-center shrink-0 text-purple-300">
                <ShieldCheck size={22} className="text-emerald-400" />
              </div>
              <div>
                <h4 className="font-black text-white text-base mb-1">أمان وتشفير متكامل</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  توثيق دقيق بمفاتيح API مشفرة، وتوقيع Webhooks عبر خوارزميات HMAC-SHA256.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#23096E]/50 border border-purple-400/30 flex items-center justify-center shrink-0 text-purple-300">
                <Coins size={22} className="text-amber-400" />
              </div>
              <div>
                <h4 className="font-black text-white text-base mb-1">دعم العملات المتعددة</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  تسعير مباشر ومحدث بالريال اليمني والدولار والريال السعودي بدون عمولات خفية.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#23096E]/50 border border-purple-400/30 flex items-center justify-center shrink-0 text-purple-300">
                <Cpu size={22} className="text-indigo-400" />
              </div>
              <div>
                <h4 className="font-black text-white text-base mb-1">تأكيد حجز رسمي فوري</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  ربط مباشر مع إدارة الفندق وإصدار رقم مرجعي رسمي وقسيمة إلكترونية معتمدة.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Interactive Endpoints Explorer ────────────────────────────── */}
      <section id="endpoints" className="py-20 scroll-mt-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-black uppercase tracking-wider text-[#FF3B30] bg-[#FF3B30]/10 px-3.5 py-1.5 rounded-full border border-[#FF3B30]/20 inline-block mb-3">
              API Endpoints Reference
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              نقاط الاتصال وتوثيق العمليات الأساسية
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              واجهات برمجية نظيفة ومعيارية تدعم كامل دورة حياة الحجز الفندقي من البحث حتى التأكيد وإشعارات الويب هوك.
            </p>
          </div>

          {/* Endpoints Tabs Selector */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            {(Object.keys(ENDPOINTS_DATA) as EndpointKey[]).map((key) => {
              const ep = ENDPOINTS_DATA[key];
              const Icon = ep.icon;
              const isActive = activeEndpoint === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveEndpoint(key)}
                  className={`p-4 rounded-2xl border text-start transition-all cursor-pointer flex flex-col justify-between ${
                    isActive
                      ? 'bg-[#1D1838] border-purple-400/50 shadow-xl shadow-[#23096E]/30 ring-1 ring-purple-400/50'
                      : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.05] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-xl ${isActive ? 'bg-[#3A1C8F] text-white' : 'bg-white/5 text-slate-400'}`}>
                      <Icon size={18} />
                    </div>
                    <span
                      className={`text-[10px] font-black font-mono px-2 py-0.5 rounded ${
                        ep.method === 'GET'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                      }`}
                    >
                      {ep.method}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-white mb-1 line-clamp-1">{ep.title}</h3>
                    <code className="text-[11px] text-slate-400 font-mono block line-clamp-1">{ep.path}</code>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Endpoint Detail Box */}
          <div className="rounded-3xl bg-[#131026] border border-white/15 p-6 sm:p-8 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Endpoint Specs & Parameters */}
              <div className="lg:col-span-5 space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`text-xs font-black font-mono px-2.5 py-1 rounded-md ${
                        currentEndpoint.method === 'GET'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40'
                      }`}
                    >
                      {currentEndpoint.method}
                    </span>
                    <code className="text-sm sm:text-base font-mono text-purple-200 font-bold">
                      {currentEndpoint.path}
                    </code>
                  </div>
                  <h3 className="text-xl font-black text-white mb-2">{currentEndpoint.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                    {currentEndpoint.desc}
                  </p>
                </div>

                {/* Parameters Table */}
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
                    معاملات الطلب (Parameters / Payload):
                  </h4>
                  <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
                    {currentEndpoint.params.map((param, pIdx) => (
                      <div key={pIdx} className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                        <div className="flex items-center justify-between mb-1">
                          <code className="text-xs font-mono font-bold text-amber-300">{param.name}</code>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-slate-400">{param.type}</span>
                            {param.required ? (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-500/20 text-red-300">مطلوب</span>
                            ) : (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-700 text-slate-400">اختياري</span>
                            )}
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-400">{param.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Endpoint Code Box (Request & Response) */}
              <div className="lg:col-span-7">
                <div className="rounded-2xl bg-[#0A0815] border border-white/10 overflow-hidden h-full flex flex-col justify-between">
                  
                  <div className="px-4 py-3 bg-white/[0.02] border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEndpointView('request')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          endpointView === 'request'
                            ? 'bg-[#3A1C8F] text-white shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Request Sample
                      </button>
                      <button
                        onClick={() => setEndpointView('response')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          endpointView === 'response'
                            ? 'bg-emerald-600 text-white shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        JSON Response (200 OK)
                      </button>
                    </div>

                    <button
                      onClick={() => handleCopy(currentEndpointCode, false)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      {copiedEndpointCode ? (
                        <>
                          <Check size={14} className="text-emerald-400" />
                          <span className="text-emerald-400 font-bold">تم النسخ!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          <span>نسخ</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-4 sm:p-5 overflow-x-auto font-mono text-xs leading-relaxed max-h-[360px] flex-1">
                    <pre className="text-slate-200 whitespace-pre">
                      <code>{currentEndpointCode}</code>
                    </pre>
                  </div>

                  <div className="px-4 py-2.5 bg-white/[0.01] border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Authentication: Bearer Token</span>
                    <span className="text-emerald-400 font-mono">Response: application/json</span>
                  </div>

                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ── 3-Step Quickstart Guide ────────────────────────────────────── */}
      <section id="quickstart" className="py-20 border-t border-white/10 bg-[#0F0C21]/60 scroll-mt-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-black uppercase tracking-wider text-purple-300 bg-purple-900/30 px-3.5 py-1.5 rounded-full border border-purple-500/30 inline-block mb-3">
              3-Step Quickstart
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              كيف تبدأ التكامل مع مساري خلال دقائق؟
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              مسار تكامل سريع ومبسط مصمم للمطورين لتقليل وقت الإطلاق والتجربة الآمنة قبل الإنتاج.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Step 1 */}
            <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 relative overflow-hidden group hover:border-purple-400/50 transition-all">
              <div className="text-6xl font-black text-white/5 absolute -top-2 -left-2 font-mono group-hover:text-purple-500/10 transition-colors">
                01
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#23096E] to-[#3A1C8F] flex items-center justify-center mb-6 shadow-lg shadow-[#23096E]/50">
                <Terminal size={22} className="text-white" />
              </div>
              <h3 className="text-xl font-black text-white mb-3">١. طلب مفتاح الـ API</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6 font-medium">
                تواصل معنا عبر واتساب الشركاء لتزويدك بمفتاح API فوري وبيانات الاعتماد وبيئة الـ Sandbox الخاصة بك.
              </p>
              <div className="text-xs font-mono text-purple-300 font-bold bg-white/5 p-2.5 rounded-xl border border-white/5">
                msari_test_sec_...
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 relative overflow-hidden group hover:border-purple-400/50 transition-all">
              <div className="text-6xl font-black text-white/5 absolute -top-2 -left-2 font-mono group-hover:text-purple-500/10 transition-colors">
                02
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#3A1C8F] to-[#5B2AC9] flex items-center justify-center mb-6 shadow-lg shadow-[#3A1C8F]/50">
                <Code2 size={22} className="text-white" />
              </div>
              <h3 className="text-xl font-black text-white mb-3">٢. الاختبار في Sandbox</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6 font-medium">
                اختبر استعلامات البحث وتأكيد الحجز وتجربة إشعارات الويب هوك بدون أي مدفوعات حقيقية لضمان سلامة التكامل.
              </p>
              <div className="text-xs font-mono text-emerald-400 font-bold bg-white/5 p-2.5 rounded-xl border border-white/5">
                HTTP 200 OK — Ready
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 relative overflow-hidden group hover:border-purple-400/50 transition-all">
              <div className="text-6xl font-black text-white/5 absolute -top-2 -left-2 font-mono group-hover:text-purple-500/10 transition-colors">
                03
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF3B30] to-[#e02d23] flex items-center justify-center mb-6 shadow-lg shadow-[#FF3B30]/50">
                <Zap size={22} className="text-white" />
              </div>
              <h3 className="text-xl font-black text-white mb-3">٣. إطلاق الإنتاج المباشر</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6 font-medium">
                قم بالتحويل إلى مفتاح الإنتاج الحي (Live Key) وابدأ بتقديم خدمات حجز الفنادق لعملائك مع تأكيد فوري وعمولات مخصصة.
              </p>
              <div className="text-xs font-mono text-amber-300 font-bold bg-white/5 p-2.5 rounded-xl border border-white/5">
                msari_live_sec_...
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Unified B2B Partnership Plan ──────────────────────────────── */}
      <section id="pricing" className="py-20 scroll-mt-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-500/30 inline-block mb-3">
              B2B Partnership Plan
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              خطة الشراكة والربط البرمجي الموحدة
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              حلول مرنة ومخصصة للتطبيقات، مواقع السفر، الوكالات السياحية، والشركات للربط المباشر مع منصة مساري.
            </p>
          </div>

          {/* Unified Plan Card */}
          <div className="max-w-3xl mx-auto">
            {data.plans && data.plans.length > 0 ? (
              data.plans.map((plan) => (
                <div
                  key={plan.id}
                  className="rounded-3xl bg-[#16122E] border-2 border-purple-500/40 p-8 sm:p-10 shadow-2xl shadow-[#23096E]/40 relative overflow-hidden"
                >
                  {/* Top Gradient Banner */}
                  <div className="absolute top-0 right-0 left-0 h-2.5 bg-gradient-to-r from-[#23096E] via-[#3A1C8F] to-[#FF3B30]" />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-purple-500/20 text-purple-200 text-xs font-black mb-2 border border-purple-400/30">
                        <Zap size={14} className="text-[#FF3B30]" />
                        خطة الشراكة الشاملة (Full B2B Access)
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-black text-white">{plan.name}</h3>
                    </div>
                    <div className="text-start sm:text-end">
                      <div className="text-xl sm:text-2xl font-black text-purple-300">{plan.price}</div>
                      <span className="text-xs text-slate-400 font-bold block mt-0.5">عمولات وأسعار جملة مخصصة للشركاء</span>
                    </div>
                  </div>

                  <p className="text-slate-300 text-sm sm:text-base mb-8 leading-relaxed font-medium">
                    {plan.description}
                  </p>

                  {/* Features List */}
                  <div className="border-t border-b border-white/10 py-6 mb-8">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4">
                      المزايا والقدرات التقنية المضمنة في الخطة:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {plan.features.map((feat, i) => (
                        <div key={i} className="flex items-center gap-3 text-slate-200 text-sm font-bold">
                          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                            <CheckCircle2 size={14} className="text-emerald-400" />
                          </div>
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => openWhatsApp(plan.name)}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#23096E] via-[#3A1C8F] to-[#FF3B30] hover:opacity-95 text-white text-base font-black transition-all shadow-xl shadow-[#23096E]/50 flex items-center justify-center gap-2.5 cursor-pointer"
                  >
                    <MessageSquare size={18} />
                    <span>تواصل معنا لطلب مفتاح الـ API وتفعيل الربط المباشر</span>
                  </button>
                </div>
              ))
            ) : null}
          </div>

        </div>
      </section>

      {/* ── FAQ Section ───────────────────────────────────────────────── */}
      {data.faq && data.faq.length > 0 && (
        <section id="faq" className="py-20 border-t border-white/10 bg-[#0F0C21]/60 scroll-mt-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
            
            <div className="text-center mb-12">
              <span className="text-xs font-black uppercase tracking-wider text-purple-300 bg-purple-900/30 px-3.5 py-1.5 rounded-full border border-purple-500/30 inline-block mb-3">
                Got Questions?
              </span>
              <h2 className="text-3xl font-black text-white mb-2">الأسئلة الشائعة للمطورين</h2>
              <p className="text-slate-400 text-sm">كل ما تحتاج معرفته حول الربط، التوثيق، وطرق التسوية.</p>
            </div>

            <div className="space-y-4">
              {data.faq.map((item, i) => (
                <div
                  key={i}
                  className="rounded-2xl bg-white/[0.03] border border-white/10 p-6 transition-all hover:border-white/20"
                >
                  <h3 className="font-black text-white mb-2 text-base flex items-center gap-2">
                    <span className="text-purple-400 font-mono">Q{i + 1}.</span>
                    <span>{item.q}</span>
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed font-medium pr-6">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </section>
      )}

      {/* ── Engineering Support & CTA Banner ──────────────────────────── */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-[#23096E] via-[#3A1C8F] to-[#1F0752] p-8 sm:p-12 border border-purple-400/30 text-center relative overflow-hidden shadow-2xl shadow-[#23096E]/40">
            <div className="max-w-2xl mx-auto space-y-6 relative z-10">
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                جاهز لبناء تجربة سفر متكاملة في تطبيقك؟
              </h3>
              <p className="text-slate-200 text-sm sm:text-base leading-relaxed font-medium">
                فريقنا الهندسي مستعد لمساعدتك في عملية الربط والتحقق خطوة بخطوة عبر قناة دعم مباشرة.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <button
                  onClick={() => openWhatsApp('خطة الشراكة والربط البرمجي')}
                  className="btn btn-white text-base font-black px-10 py-4 shadow-xl cursor-pointer"
                >
                  ابدأ الربط البرمجي الآن
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

