'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, PlaneTakeoff, Clock, CheckCircle2, 
  ShieldCheck, CreditCard, User, Users, Mail, Phone,
  Luggage, Info, MessageCircle, Building
} from 'lucide-react';

export default function FlightBooking() {
  const [agreed, setAgreed] = useState(false);
  const [payment, setPayment] = useState<'card' | 'whatsapp' | 'transfer'>('transfer');

  const bankAccounts = [
    { id: 1, bank: 'بنك الكريمي', name: 'مساري للسفريات', account: '123456789' },
    { id: 2, bank: 'بنك التضامن', name: 'مساري للسفريات', account: '987654321' },
    { id: 3, bank: 'العمقي للصرافة', name: 'مساري للسفريات', account: '55667788' },
  ];

  // Mock flight details for checkout
  const flight = {
    airline: 'الخطوط الجوية القطرية',
    airlineLogo: 'QR',
    fromTime: '09:00',
    fromCode: 'CAI',
    fromCity: 'القاهرة',
    toTime: '13:30',
    toCode: 'DXB',
    toCity: 'دبي',
    duration: '4 س 30 د',
    date: 'الخميس، 15 أكتوبر 2026',
    class: 'السياحية',
    basePrice: 345,
    taxes: 45,
  };

  const totalPrice = flight.basePrice + flight.taxes;

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      alert('يجب الموافقة على الشروط والأحكام أولاً');
      return;
    }
    
    if (payment === 'whatsapp' || payment === 'transfer') {
      const code = 'MSF-' + Math.random().toString(36).toUpperCase().slice(2, 6);
      const bankMsg = payment === 'transfer' ? `\n(تم السداد عبر حوالة بنكية وسيتم إرفاق السند)\nرقم الحجز المرجعي: ${code}` : `\nرقم الحجز المرجعي: ${code}`;
      const text = `أهلاً مساري،\nأرغب في الاعتماد النهائي لحجز طيران:\nالمسار: رحلة من ${flight.fromCity} (${flight.fromCode}) إلى ${flight.toCity} (${flight.toCode})\nتاريخ المغادرة: ${flight.date}\nإجمالي التكلفة: $${totalPrice}${bankMsg}`;
      const url = `https://wa.me/967735333552?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
      return;
    }

    // Proceed to payment gateway or confirmation
    alert('تم تحويلك إلى صفحة بوابات الدفع لإدخال تفاصيل البطاقة!');
  };

  return (
    <div className="bg-[#f8f8fa] min-h-screen pt-24 pb-20">
      
      {/* ─── Header ─── */}
      <div className="bg-[#23096e] text-white py-8 mb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-4">
          <Link href="/flights/search" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
            <ArrowRight size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-black">إتمام الحجز لتذكرة الطيران</h1>
            <p className="text-white/70 text-sm mt-1">يرجى تعبئة بيانات المسافرين بدقة كما هي في جواز السفر</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col-reverse lg:flex-row gap-8">
          
          {/* ─── Main Form Area ─── */}
          <div className="flex-1 space-y-6">
            
            <form id="flight-booking-form" onSubmit={handleBooking} className="space-y-6">
              
              {/* Login Banner */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-neutral-50 rounded-full bg-[#23096e]/5 flex items-center justify-center text-[#23096e]">
                    <User size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900">هل لديك حساب في مساري؟</h3>
                    <p className="text-sm text-neutral-500">سجل دخولك الآن ووفر وقتك لتعبئة البيانات تلقائياً</p>
                  </div>
                </div>
                <button type="button" className="px-5 py-2 hover:bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-bold text-neutral-700 transition-colors">
                  تسجيل الدخول
                </button>
              </div>

              {/* Passanger Details */}
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-neutral-100">
                <h2 className="text-xl font-black text-neutral-900 mb-6 flex items-center gap-2">
                  <Users className="text-[#23096e]" /> بيانات المسافر الأساسي (بالغ 1)
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-neutral-700 mb-2">الاسم الأول (كما في الجواز) *</label>
                    <input type="text" required placeholder="مثال: Ahmed" 
                           className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 outline-none focus:border-[#23096e] focus:bg-white focus:shadow-[0_0_0_4px_rgba(35,9,110,0.1)] transition-all font-bold" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-neutral-700 mb-2">اسم العائلة (كما في الجواز) *</label>
                    <input type="text" required placeholder="مثال: Ali" 
                           className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 outline-none focus:border-[#23096e] focus:bg-white focus:shadow-[0_0_0_4px_rgba(35,9,110,0.1)] transition-all font-bold" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-neutral-700 mb-2">الجنسية *</label>
                    <select required className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 outline-none focus:border-[#23096e] focus:bg-white font-bold">
                      <option value="">اختر الجنسية</option>
                      <option value="ye">يمني</option>
                      <option value="sa">سعودي</option>
                      <option value="eg">مَصري</option>
                      <option value="other">أخرى</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-neutral-700 mb-2">تاريخ الميلاد *</label>
                    <input type="date" required 
                           className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 outline-none focus:border-[#23096e] focus:bg-white font-bold text-neutral-700" />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-neutral-700 mb-2">رقم جواز السفر *</label>
                    <input type="text" required placeholder="مثال: 01234567" 
                           className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 outline-none focus:border-[#23096e] focus:bg-white transition-all font-bold uppercase" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-neutral-700 mb-2">تاريخ انتهاء الجواز *</label>
                    <input type="date" required 
                           className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 outline-none focus:border-[#23096e] focus:bg-white font-bold text-neutral-700" />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-neutral-100">
                <h2 className="text-xl font-black text-neutral-900 mb-6 flex items-center gap-2">
                  <Phone className="text-[#23096e]" /> بيانات الاتصال
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-neutral-700 mb-2">البريد الإلكتروني للوجة *</label>
                    <div className="relative">
                      <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                      <input type="email" required placeholder="example@msari.net" 
                             className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pr-11 pl-4 py-3 outline-none focus:border-[#23096e] focus:bg-white focus:shadow-[0_0_0_4px_rgba(35,9,110,0.1)] transition-all font-bold text-left space-x-reverse" dir="ltr" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-neutral-700 mb-2">رقم الجوال *</label>
                    <div className="flex relative">
                      <select className="bg-neutral-100 border border-neutral-200 border-l-0 rounded-r-xl px-3 outline-none font-bold text-neutral-700 focus:border-[#23096e] z-10" dir="ltr">
                        <option>+967</option>
                        <option>+966</option>
                        <option>+971</option>
                      </select>
                      <input type="tel" required placeholder="770 000 000" 
                             className="w-full bg-neutral-50 border border-neutral-200 rounded-l-xl px-4 py-3 outline-none focus:border-[#23096e] focus:bg-white focus:shadow-[0_0_0_4px_rgba(35,9,110,0.1)] transition-all font-bold text-left space-x-reverse" dir="ltr" />
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-start gap-2 text-sm text-neutral-500 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                  <Info className="shrink-0 mt-0.5 text-blue-500" size={16} />
                  <p>سيتم إرسال التذاكر الإلكترونية وتأكيد الحجز إلى هذا البريد الإلكتروني ورقم الجوال المذكور أعلاه.</p>
                </div>
              </div>

              {/* Add-ons (Baggage) */}
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-neutral-100">
                <h2 className="text-xl font-black text-neutral-900 mb-6 flex items-center gap-2">
                  <Luggage className="text-[#23096e]" /> الأمتعة المسموح بها (مشمولة)
                </h2>
                <div className="flex items-center justify-between p-4 border border-green-100 bg-green-50 rounded-xl text-green-800">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={24} className="text-green-600" />
                    <div>
                      <h4 className="font-bold">1 حقيبة يد (7 كجم) + 1 حقيبة شحن (30 كجم)</h4>
                      <p className="text-xs mt-0.5 opacity-80">لكل مسافر بالغ (مجانًا مع هذه التذكرة)</p>
                    </div>
                  </div>
                  <span className="font-black text-sm">مشمول</span>
                </div>
              </div>

            </form>
          </div>

          {/* ─── Sidebar (Summary) ─── */}
          <div className="w-full lg:w-96 shrink-0 lg:sticky lg:top-8 self-start">
            
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-200 mb-6">
              <h3 className="font-black text-lg text-neutral-900 mb-6">ملخص الرحلة</h3>
              
              {/* Flight Details snippet */}
              <div className="flex gap-4 items-center mb-6 pb-6 border-b border-neutral-100">
                <div className="w-12 h-12 bg-neutral-50 border border-neutral-100 rounded-xl flex items-center justify-center font-black text-[#23096e] text-lg">
                  {flight.airlineLogo}
                </div>
                <div>
                  <h4 className="font-bold text-neutral-900 leading-tight">{flight.airline}</h4>
                  <p className="text-xs text-neutral-500 mt-1">{flight.class} • مسافر واحد</p>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6 text-sm font-bold text-neutral-900">
                <div className="text-center w-20">
                  <div className="text-xl">{flight.fromTime}</div>
                  <div className="text-neutral-500 uppercase">{flight.fromCode}</div>
                </div>
                <div className="flex-1 flex flex-col items-center">
                  <div className="text-xs text-neutral-400 font-medium mb-1">{flight.duration}</div>
                  <div className="w-full relative flex items-center justify-center">
                    <div className="absolute w-full h-px bg-neutral-200" />
                    <PlaneTakeoff size={14} className="text-[#23096e] bg-white px-1 z-10 box-content rotate-45" />
                  </div>
                  <div className="text-[10px] mt-1 text-neutral-500 bg-neutral-50 px-2 py-0.5 rounded-full border border-neutral-100">
                    مباشر
                  </div>
                </div>
                <div className="text-center w-20">
                  <div className="text-xl">{flight.toTime}</div>
                  <div className="text-neutral-500 uppercase">{flight.toCode}</div>
                </div>
              </div>
              
              <div className="text-sm font-medium text-neutral-600 bg-neutral-50 p-3 rounded-xl border border-neutral-100 text-center mb-6">
                تاريخ المغادرة: {flight.date}
              </div>

              <div className="space-y-4 mb-6 pb-6 border-b border-neutral-100">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">سعر التذكرة (1 بالغ)</span>
                  <span className="font-bold text-neutral-900">${flight.basePrice}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">الضرائب والرسوم</span>
                  <span className="font-bold text-neutral-900">${flight.taxes}</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <div>
                  <h4 className="text-lg font-black text-neutral-900">الإجمالي</h4>
                  <p className="text-xs text-[#23096e] font-bold">شامل ضريبة القيمة المضافة</p>
                </div>
                <div className="text-3xl font-black text-[#23096e]">${totalPrice}</div>
              </div>

              {/* Payment Method Selector */}
              <div className="mb-6">
                <h4 className="font-bold text-neutral-900 mb-3 text-sm">طريقة الدفع للمتابعة</h4>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <button 
                    type="button"
                    onClick={() => setPayment('card')}
                    className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${payment === 'card' ? 'border-[#23096e] bg-[#23096e]/5 text-[#23096e]' : 'border-neutral-200 text-neutral-500 hover:border-neutral-300'}`}
                  >
                    <CreditCard size={20} />
                    <span className="text-xs font-bold whitespace-nowrap">بطاقة ائتمان</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setPayment('transfer')}
                    className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${payment === 'transfer' ? 'border-[#23096e] bg-[#23096e]/5 text-[#23096e]' : 'border-neutral-200 text-neutral-500 hover:border-neutral-300'}`}
                  >
                    <Building size={20} />
                    <span className="text-xs font-bold whitespace-nowrap">حوالة بنكية محلية</span>
                  </button>
                </div>
                
                {payment === 'transfer' && (
                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 mb-3 animate-in fade-in slide-in-from-top-2">
                    <p className="text-xs font-bold text-[#23096e] mb-3">قم بالتحويل إلى أحد حساباتنا:</p>
                    <div className="space-y-2 mb-3">
                      {bankAccounts.map(b => (
                        <div key={b.id} className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-neutral-200 text-xs">
                          <div>
                              <p className="font-bold text-neutral-900">{b.bank}</p>
                              <p className="text-[10px] text-neutral-400 mt-0.5">{b.name}</p>
                          </div>
                          <div className="font-mono font-bold text-[#23096e]">{b.account}</div>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-neutral-500">سوف نولد لك رقم حجز للرحلة، لتتمكن من إرسال السند عبر زر الواتساب أسفله.</p>
                  </div>
                )}
              </div>

              <label className="flex items-start gap-3 cursor-pointer mb-6 group">
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-1 w-4 h-4 rounded border-neutral-300 text-[#23096e] focus:ring-[#23096e]" />
                <span className="text-sm text-neutral-600 leading-relaxed font-medium group-hover:text-neutral-900 transition-colors">
                  أوافق على <span className="text-[#23096e] underline">شروط وأحكام الحجز</span> والسياسة الخاصة بشركة الطيران (الاسترجاع والإلغاء).
                </span>
              </label>

              <button 
                type="submit" 
                form="flight-booking-form"
                className={`w-full h-14 rounded-xl text-white font-black text-lg transition-all shadow-lg flex items-center justify-center gap-2 ${
                  agreed 
                    ? 'hover:-translate-y-0.5 shadow-[#23096e]/20 opacity-100' 
                    : 'opacity-50 cursor-not-allowed shadow-none'
                }`}
                style={{ background: agreed ? 'linear-gradient(135deg, #23096e, #3A1C8F)' : '#a3a3a3' }}
              >
                {payment === 'transfer' ? 'الحصول على الكود وإرسال السند' : payment === 'whatsapp' ? 'تأكيد الحجز ومتابعة واتساب' : 'الدفع وإتمام الحجز'}
                {payment === 'transfer' || payment === 'whatsapp' ? <MessageCircle size={20} /> : <ShieldCheck size={20} />}
              </button>
              
            </div>

            {/* Guarantees */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 text-sm text-neutral-600 bg-white p-3 rounded-xl border border-neutral-100">
                <ShieldCheck size={18} className="text-green-600" /> بياناتك محمية ومشفرة بأعلى المعايير
              </div>
              <div className="flex items-center gap-3 text-sm text-neutral-600 bg-white p-3 rounded-xl border border-neutral-100">
                <CreditCard size={18} className="text-[#23096e]" /> وسائل الدفع مدعومة ومضمونة
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
