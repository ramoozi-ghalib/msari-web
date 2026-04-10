'use client';

import { useState } from 'react';
import { 
  Terminal, Code2, Server, ShieldCheck, 
  Zap, Copy, CheckCircle2, ChevronDown, 
  ChevronUp, KeyRound, ExternalLink, ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

export default function DeveloperPortal() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeEndpoint, setActiveEndpoint] = useState<number>(0);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const endpoints = [
    {
      method: 'GET',
      path: '/v1/hotels',
      title: 'قائمة الفنادق المحلية',
      description: 'استرجاع قائمة الفنادق في اليمن مع إمكانية الفلترة بالمدينة والسعر.',
      request: `curl -X GET "https://api.msari.net/v1/hotels?city=Sanaa&limit=10" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
      response: `{
  "status": "success",
  "data": [
    {
      "id": "htl_001",
      "name_ar": "فندق موفنبيك",
      "city": "Sanaa",
      "star_rating": 5,
      "price_usd": 120,
      "amenities": ["wifi", "pool", "gym"]
    }
  ],
  "meta": {
    "total": 45,
    "page": 1
  }
}`
    },
    {
      method: 'GET',
      path: '/v1/hotels/{id}',
      title: 'تفاصيل الفندق',
      description: 'عرض تفاصيل فندق محدد بما في ذلك الغرف المتاحة والصور المرافق.',
      request: `curl -X GET "https://api.msari.net/v1/hotels/htl_001" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
      response: `{
  "status": "success",
  "data": {
    "id": "htl_001",
    "name_ar": "فندق موفنبيك",
    "description": "فندق 5 نجوم ذو إطلالة بانورامية...",
    "rooms": [
      {
        "id": "rm_101",
        "type": "Standard Double",
        "price_usd": 120,
        "available_qty": 4
      }
    ],
    "images": ["url1.jpg", "url2.jpg"]
  }
}`
    },
    {
      method: 'POST',
      path: '/v1/bookings',
      title: 'إنشاء حجز جديد',
      description: 'إرسال طلب حجز مؤكد لغرفة في فندق. يتطلب صلاحيات قراءة وكتابة.',
      request: `curl -X POST "https://api.msari.net/v1/bookings" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "hotel_id": "htl_001",
    "room_id": "rm_101",
    "check_in": "2025-07-01",
    "check_out": "2025-07-05",
    "guests": { "adults": 2, "children": 0 },
    "customer": {
      "name": "محمد عبدالله",
      "email": "moh@example.com",
      "phone": "+967770000000"
    }
  }'`,
      response: `{
  "status": "success",
  "message": "Booking created successfully",
  "data": {
    "booking_id": "bk_98765432",
    "status": "confirmed",
    "total_usd": 480,
    "payment_status": "pending_arrival"
  }
}`
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      
      {/* Navbar for Dev Portal */}
      <nav className="bg-[#23096e] text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-colors">
                <span className="text-white font-bold text-lg">م</span>
              </div>
              <div>
                <span className="text-xl font-black tracking-wide leading-tight block">مساري <span className="text-blue-300">للمطورين</span></span>
                <span className="block text-[10px] text-white/60">B2B API Portal</span>
              </div>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <a href="#docs" className="text-sm font-bold text-white/80 hover:text-white transition-colors">التوثيق (Docs)</a>
              <a href="#pricing" className="text-sm font-bold text-white/80 hover:text-white transition-colors">خطط الأسعار</a>
              <Link href="/admin/api-keys" className="text-sm font-bold flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors border border-white/10">
                <KeyRound size={16} /> لوحة التحكم (Keys)
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-[#23096e] text-white pt-16 pb-32 relative overflow-hidden">
        {/* Background Patterns */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-96 h-96 rounded-full bg-blue-500/20 blur-3xl"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-500/20 blur-3xl"></div>
          
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm font-bold backdrop-blur-md">
              <Code2 size={16} className="text-blue-300" />
              <span>الإصدار التجريبي v1.0 متاح الآن</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight">
              اربط نظامك مع مخزون <br/> <span className="text-transparent bg-clip-text bg-gradient-to-l from-blue-300 to-purple-300">أكبر شبكة سفر في اليمن</span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/70 font-medium leading-relaxed max-w-2xl mx-auto">
              تتيح واجهة مساري البرمجية (RESTful API) لوكالات السفر، الشركات، والتطبيقات الأخرى استعراض وحجز الفنادق المحلية وتسيير الرحلات بسلاسة تامة.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <a href="#docs" className="w-full sm:w-auto px-8 py-4 bg-white text-[#23096e] rounded-xl font-black text-lg hover:bg-neutral-100 transition-colors shadow-xl flex items-center justify-center gap-2">
                <Terminal size={20} /> تصفح الوثائق
              </a>
              <Link href="/admin/api-keys" className="w-full sm:w-auto px-8 py-4 bg-white/10 text-white border border-white/20 rounded-xl font-black text-lg hover:bg-white/20 transition-colors backdrop-blur-md flex items-center justify-center gap-2">
                <KeyRound size={20} /> توليد مفتاح API
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl shadow-black/5 border border-neutral-100">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
              <Zap size={24} />
            </div>
            <h3 className="text-lg font-black text-neutral-900 mb-3">سرعة فائقة (Low Latency)</h3>
            <p className="text-neutral-500 font-medium leading-relaxed">بنية تحتية موزعة عالمياً تضمن استجابة الواجهة البرمجية في أجزاء من الثانية (أقل من 200ms).</p>
          </div>
          
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl shadow-black/5 border border-neutral-100">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-6">
              <Server size={24} />
            </div>
            <h3 className="text-lg font-black text-neutral-900 mb-3">RESTful & JSON</h3>
            <p className="text-neutral-500 font-medium leading-relaxed">معايير ويب حديثة وموحدة يسهل على أي مطور من أي بيئة برمجية (PHP, Node, Python) التعامل معها.</p>
          </div>
          
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl shadow-black/5 border border-neutral-100">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-6">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-lg font-black text-neutral-900 mb-3">Rate Limiting آمن</h3>
            <p className="text-neutral-500 font-medium leading-relaxed">نظام حماية من هجمات DDoS ومعدل نقل بيانات محمي ومدروس لضمان استقرار الخدمة لجميع الشركاء.</p>
          </div>
        </div>
      </div>

      {/* Interactive Docs Section */}
      <div id="docs" className="container mx-auto px-4 sm:px-6 lg:px-8 mb-24 scroll-mt-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-neutral-900 mb-4">التوثيق البرمجي (API Endpoints)</h2>
          <p className="text-neutral-500 font-medium max-w-2xl mx-auto">تعرف على أهم المسارات المتوفرة لدينا حالياً. اضغط على أي مسار لرؤية شكل الطلب والاستجابة.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-lg border border-neutral-200 overflow-hidden flex flex-col lg:flex-row">
          
          {/* Sidebar Endpoints List */}
          <div className="w-full lg:w-1/3 border-b lg:border-b-0 lg:border-l border-neutral-200 bg-neutral-50 p-6 flex flex-col gap-3">
            <h3 className="text-sm font-black text-neutral-400 uppercase tracking-wider mb-2">المسارات المتوفرة (v1)</h3>
            
            {endpoints.map((ep, index) => (
              <button 
                key={index}
                onClick={() => setActiveEndpoint(index)}
                className={`flex items-center gap-3 p-4 rounded-xl transition-all text-start border ${activeEndpoint === index ? 'bg-white border-[#23096e] shadow-md' : 'bg-transparent border-transparent hover:bg-neutral-100 hover:border-neutral-200'}`}>
                <span className={`px-2.5 py-1 rounded text-[10px] font-black shrink-0 ${
                  ep.method === 'GET' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                }`}>
                  {ep.method}
                </span>
                <div className="overflow-hidden">
                  <div className={`text-sm font-bold truncate dir-ltr text-left ${activeEndpoint === index ? 'text-[#23096e]' : 'text-neutral-700'}`}>{ep.path}</div>
                  <div className={`text-xs mt-1 truncate ${activeEndpoint === index ? 'text-[#23096e]/70' : 'text-neutral-500'}`}>{ep.title}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Interactive Request/Response Console */}
          <div className="w-full lg:w-2/3 p-6 sm:p-8 flex flex-col">
            <div className="mb-6">
              <h3 className="text-2xl font-black text-neutral-900 mb-2">{endpoints[activeEndpoint].title}</h3>
              <p className="text-neutral-600 font-medium leading-relaxed">{endpoints[activeEndpoint].description}</p>
            </div>

            <div className="grid grid-cols-1 gap-6 flex-1">
              
              {/* Request Block */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between text-xs font-bold text-neutral-500 mb-2 px-1">
                  <span>طلب مثال (cURL)</span>
                  <button onClick={() => handleCopy(endpoints[activeEndpoint].request)} className="hover:text-[#23096e] flex items-center gap-1 transition-colors">
                    {copiedCode === endpoints[activeEndpoint].request ? <CheckCircle2 size={14} className="text-green-500" /> : <Copy size={14} />}
                    {copiedCode === endpoints[activeEndpoint].request ? 'تم النسخ' : 'نسخ الكود'}
                  </button>
                </div>
                <div className="bg-[#0d1117] text-gray-300 p-5 rounded-2xl overflow-x-auto text-sm font-mono dir-ltr text-left border border-neutral-800 shadow-inner">
                  <pre><code>{endpoints[activeEndpoint].request}</code></pre>
                </div>
              </div>

              {/* Response Block */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between text-xs font-bold text-neutral-500 mb-2 px-1">
                  <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> استجابة صالحة (200 OK) JSON</span>
                  <button onClick={() => handleCopy(endpoints[activeEndpoint].response)} className="hover:text-[#23096e] flex items-center gap-1 transition-colors">
                    {copiedCode === endpoints[activeEndpoint].response ? <CheckCircle2 size={14} className="text-green-500" /> : <Copy size={14} />}
                    {copiedCode === endpoints[activeEndpoint].response ? 'تم النسخ' : 'نسخ الكود'}
                  </button>
                </div>
                <div className="bg-[#0d1117] text-green-300 p-5 rounded-2xl overflow-x-auto text-sm font-mono dir-ltr text-left border border-neutral-800 shadow-inner">
                  <pre><code>{endpoints[activeEndpoint].response}</code></pre>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Pricing/Plans */}
      <div id="pricing" className="container mx-auto px-4 sm:px-6 lg:px-8 mb-24 scroll-mt-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-neutral-900 mb-4">خطط الشراكة والاستخدام (B2B Plans)</h2>
          <p className="text-neutral-500 font-medium max-w-2xl mx-auto">اختر الخطة التي تناسب حجم أعمال وكالتك السياحية للحصول على مفتاح الـ API والبدء في سحب البيانات.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          
          {/* Monthly Tier */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-neutral-200">
            <h3 className="text-xl font-black text-neutral-900 mb-2">رخصة شهرية</h3>
            <div className="text-neutral-500 font-medium text-sm mb-6">مناسب للشركات الصغيرة والمتوسطة والمطورين.</div>
            <div className="mb-8">
              <span className="text-4xl font-black text-neutral-900">$29</span>
              <span className="text-neutral-500 font-medium"> / شهرياً</span>
            </div>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3 text-sm font-bold text-neutral-700">
                <CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" /> 10,000 طلب (Request) في اليوم
              </li>
              <li className="flex items-start gap-3 text-sm font-bold text-neutral-700">
                <CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" /> وصول لقائمة الفنادق والمدن والوصف
              </li>
              <li className="flex items-start gap-3 text-sm font-bold text-neutral-700">
                <CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" /> قراءة فقط (بدون إمكانية إنشاء حجوزات)
              </li>
              <li className="flex items-start gap-3 text-sm font-bold text-neutral-700">
                <CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" /> دعم فني قياسي (خلال 24 ساعة)
              </li>
            </ul>
            
            <Link href="/admin/api-keys" className="w-full py-3.5 rounded-xl font-bold bg-neutral-100 text-neutral-900 border border-neutral-200 hover:bg-neutral-200 transition-colors flex items-center justify-center">
              اشترك الآن
            </Link>
          </div>

          {/* Commission Tier (Popular) */}
          <div className="bg-[#23096e] text-white rounded-3xl p-8 shadow-2xl relative transform md:-translate-y-4 border border-[#4a1fb8]">
            <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-400 to-purple-400 text-white px-4 py-1 rounded-full text-xs font-black shadow-lg whitespace-nowrap">
              الأكثر طلباً لوكالات السفر
            </div>
            <h3 className="text-xl font-black mb-2">الأعمال (نظام العمولة)</h3>
            <div className="text-white/70 font-medium text-sm mb-6">مشاركة الأرباح بدون رسوم شهرية.</div>
            <div className="mb-8">
              <span className="text-4xl font-black">15%</span>
              <span className="text-white/70 font-medium"> عمولة على الحجوزات</span>
            </div>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3 text-sm font-bold">
                <CheckCircle2 size={18} className="text-blue-300 shrink-0 mt-0.5" /> 50,000 طلب (Request) في اليوم
              </li>
              <li className="flex items-start gap-3 text-sm font-bold">
                <CheckCircle2 size={18} className="text-blue-300 shrink-0 mt-0.5" /> إنشاء وتأكيد الحجوزات برمجياً (Read/Write)
              </li>
              <li className="flex items-start gap-3 text-sm font-bold">
                <CheckCircle2 size={18} className="text-blue-300 shrink-0 mt-0.5" /> لوحة تحكم لتتبع حجوزات عملائك
              </li>
              <li className="flex items-start gap-3 text-sm font-bold">
                <CheckCircle2 size={18} className="text-blue-300 shrink-0 mt-0.5" /> أولوية عالية للدعم الفني (واتساب)
              </li>
            </ul>
            
            <Link href="/admin/api-keys" className="w-full py-3.5 rounded-xl font-bold bg-white text-[#23096e] hover:bg-neutral-100 transition-colors shadow-lg flex items-center justify-center">
              تواصل لطلب التفعيل
            </Link>
          </div>

          {/* Annual Tier */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-neutral-200">
            <h3 className="text-xl font-black text-neutral-900 mb-2">رخصة سنوية</h3>
            <div className="text-neutral-500 font-medium text-sm mb-6">وفر أكثر من 15% مع الاشتراك السنوي.</div>
            <div className="mb-8">
              <span className="text-4xl font-black text-neutral-900">$299</span>
              <span className="text-neutral-500 font-medium"> / سنوياً</span>
            </div>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3 text-sm font-bold text-neutral-700">
                <CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" /> عدد غير محدود من الطلبات
              </li>
              <li className="flex items-start gap-3 text-sm font-bold text-neutral-700">
                <CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" /> عمولة مخفضة جداً (5% فقط بدلاً من 15%)
              </li>
              <li className="flex items-start gap-3 text-sm font-bold text-neutral-700">
                <CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" /> حماية متقدمة Custom IP Whitelisting
              </li>
              <li className="flex items-start gap-3 text-sm font-bold text-neutral-700">
                <CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" /> مدير حساب مخصص (Account Manager)
              </li>
            </ul>
            
            <Link href="/admin/api-keys" className="w-full py-3.5 rounded-xl font-bold bg-neutral-100 text-neutral-900 border border-neutral-200 hover:bg-neutral-200 transition-colors flex items-center justify-center">
              اشترك الآن
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
}
