'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, Clock, CheckCircle2, ShieldCheck, 
  CreditCard, User, Users, Mail, Phone, Luggage, 
  Info, MessageCircle, MapPin, Car, Calendar, Banknote, Building
} from 'lucide-react';

export default function CarBooking() {
  const [agreed, setAgreed] = useState(false);
  const [payment, setPayment] = useState<'transfer' | 'card' | 'whatsapp'>('transfer');

  const bankAccounts = [
    { id: 1, bank: 'بنك الكريمي', name: 'مساري للسفريات', account: '123456789' },
    { id: 2, bank: 'بنك التضامن', name: 'مساري للسفريات', account: '987654321' },
    { id: 3, bank: 'العمقي للصرافة', name: 'مساري للسفريات', account: '55667788' },
  ];

  // Mock ride details for checkout
  const ride = {
    serviceType: 'توصيل مطار', // Or 'نقل بين المدن'
    carType: 'عائلية SUV (تويوتا برادو أو مشابه)',
    carImage: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&q=80&w=400',
    pickupLocation: 'مطار عدن الدولي (ADE)',
    dropoffLocation: 'فندق أزال، خور مكسر',
    date: 'الخميس، 15 أكتوبر 2026',
    time: '14:30',
    passengers: 4,
    luggage: 3,
    basePrice: 80,
    taxes: 5,
  };

  const totalPrice = ride.basePrice + ride.taxes;

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      alert('يجب الموافقة على الشروط والأحكام أولاً');
      return;
    }
    
    if (payment === 'whatsapp' || payment === 'transfer') {
      const code = 'MSC-' + Math.random().toString(36).toUpperCase().slice(2, 6);
      const bankMsg = payment === 'transfer' ? `\n(تم السداد عبر حوالة بنكية بقيمة $${totalPrice} وسيتم إرفاق السند)\nرقم الحجز المرجعي: ${code}` : `\nالإجمالي: $${totalPrice}\nرقم الحجز: ${code}`;
      const text = `أهلاً مساري،\nأرغب في إتمام الاعتماد لحجز سيارة:\nنوع الخدمة: ${ride.serviceType}\nالسيارة: ${ride.carType}\nمن/إلى: ${ride.pickupLocation} -> ${ride.dropoffLocation}\nالتاريخ: ${ride.date} - ${ride.time}${bankMsg}`;
      const url = `https://wa.me/967735333552?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
      return;
    } else if (payment === 'card') {
      alert('تم تحويلك إلى صفحة بوابات الدفع لإدخال تفاصيل البطاقة!');
      return;
    }
  };

  return (
    <div className="bg-[#f8f8fa] min-h-screen pt-24 pb-20">
      
      {/* ─── Header ─── */}
      <div className="bg-[#23096e] text-white py-8 mb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-4">
          <Link href="/cars" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
            <ArrowRight size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-black">إتمام حجز السيارة</h1>
            <p className="text-white/70 text-sm mt-1">يرجى تعبئة بيانات الاتصال وتفاصيل الرحلة بدقة</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col-reverse lg:flex-row gap-8">
          
          {/* ─── Main Form Area ─── */}
          <div className="flex-1 space-y-6">
            
            <form id="car-booking-form" onSubmit={handleBooking} className="space-y-6">
              
              {/* Trip Details (Specific to Cars) */}
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-neutral-100">
                <h2 className="text-xl font-black text-neutral-900 mb-6 flex items-center gap-2">
                  <MapPin className="text-[#23096e]" /> تفاصيل الرحلة الدقيقة
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-neutral-700 mb-2">رقم رحلة الطيران (اختياري)</label>
                    <input type="text" placeholder="مثال: IY 601 (لتتبع موعد وصولك في حال التأخير)" 
                           className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 outline-none focus:border-[#23096e] focus:bg-white transition-all font-bold" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-neutral-700 mb-2">عنوان التوصيل أو الاستلام بالتفصيل *</label>
                    <textarea required placeholder="اسم الفندق، الشارع، أو أي علامات مميزة..." rows={3}
                           className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 outline-none focus:border-[#23096e] focus:bg-white transition-all font-bold resize-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-neutral-700 mb-2">عدد الركاب الفعلي *</label>
                    <select required className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 outline-none focus:border-[#23096e] focus:bg-white font-bold">
                      <option value="1">1 راكب</option>
                      <option value="2">2 ركاب</option>
                      <option value="3">3 ركاب</option>
                      <option value="4">4 ركاب</option>
                      <option value="5">5 ركاب أو أكثر</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-neutral-700 mb-2">عدد الحقائب التقريبي *</label>
                    <select required className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 outline-none focus:border-[#23096e] focus:bg-white font-bold">
                      <option value="0">بدون حقائب كبيرة</option>
                      <option value="1">1-2 حقائب</option>
                      <option value="3">3-4 حقائب</option>
                      <option value="5">5 حقائب أو أكثر</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Passanger Details */}
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-neutral-100">
                <h2 className="text-xl font-black text-neutral-900 mb-6 flex items-center gap-2">
                  <User className="text-[#23096e]" /> بيانات المنسق / الراكب الأساسي
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-neutral-700 mb-2">الاسم الكامل *</label>
                    <input type="text" required placeholder="أدخل اسمك الثلاثي" 
                           className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 outline-none focus:border-[#23096e] focus:bg-white transition-all font-bold" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-neutral-700 mb-2">البريد الإلكتروني *</label>
                    <div className="relative">
                      <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                      <input type="email" required placeholder="example@msari.net" 
                             className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pr-11 pl-4 py-3 outline-none focus:border-[#23096e] focus:bg-white transition-all font-bold text-left space-x-reverse" dir="ltr" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-neutral-700 mb-2">رقم الجوال للتواصل (واتساب) *</label>
                    <div className="flex relative">
                      <select className="bg-neutral-100 border border-neutral-200 border-l-0 rounded-r-xl px-3 outline-none font-bold text-neutral-700 focus:border-[#23096e] z-10" dir="ltr">
                        <option>+967</option>
                        <option>+966</option>
                        <option>+971</option>
                      </select>
                      <input type="tel" required placeholder="770 000 000" 
                             className="w-full bg-neutral-50 border border-neutral-200 rounded-l-xl px-4 py-3 outline-none focus:border-[#23096e] focus:bg-white transition-all font-bold text-left space-x-reverse" dir="ltr" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-neutral-100">
                <h2 className="text-xl font-black text-neutral-900 mb-6 flex items-center gap-2">
                  <CreditCard className="text-[#23096e]" /> طريقة الدفع
                </h2>
                <div className="grid grid-cols-1 gap-3">
                  {/* Bank Transfer */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setPayment('transfer')}
                      className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 text-start transition-all ${payment === 'transfer' ? 'border-[#23096e] bg-[#23096e]/4' : 'border-neutral-200 hover:border-neutral-300'}`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${payment === 'transfer' ? 'text-white' : 'text-emerald-600 bg-emerald-50'}`}
                        style={payment === 'transfer' ? { background: 'linear-gradient(135deg,#23096e,#3A1C8F)' } : {}}>
                        <Building size={22} />
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-neutral-900">حوالة بنكية للشركة</p>
                        <p className="text-sm text-neutral-400 mt-0.5">ادفع مسبقاً عبر حسابات شبكات الصرافة المحلية لتأكيد سيارتك</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${payment === 'transfer' ? 'border-[#23096e]' : 'border-neutral-300'}`}>
                        {payment === 'transfer' && <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#23096e' }} />}
                      </div>
                    </button>
                    
                    {payment === 'transfer' && (
                      <div className="mt-3 p-4 rounded-xl bg-neutral-50 border border-neutral-100 animate-in fade-in slide-in-from-top-2">
                        <p className="text-sm font-bold text-neutral-500 mb-3">حسابات الشركة المعتمدة للحوالات:</p>
                        <div className="space-y-2 mb-3">
                          {bankAccounts.map(b => (
                            <div key={b.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-neutral-200">
                              <div>
                                 <p className="text-sm font-bold text-[#23096e]">{b.bank}</p>
                                 <p className="text-xs text-neutral-500 mt-0.5">{b.name}</p>
                              </div>
                              <div className="text-end">
                                 <p className="text-xs text-neutral-400">الحساب</p>
                                 <p className="font-mono font-bold text-neutral-800">{b.account}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-neutral-500 leading-relaxed bg-emerald-50 text-emerald-700 p-3 rounded-lg border border-emerald-100">
                          <span className="font-bold">ملاحظة هامة:</span> لتأكيد رحلتك بأسرع وقت، اختر الحساب المناسب وقم بتحويل المبلغ. بعد التخزين ستتمكن من التقاط صورة إشعار الدفع وإرساله عبر الواتساب لاحقاً بالضغط على زر المتابعة.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Card */}
                  <button
                    type="button"
                    onClick={() => setPayment('card')}
                    className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 text-start transition-all ${payment === 'card' ? 'border-[#23096e] bg-[#23096e]/4' : 'border-neutral-200 hover:border-neutral-300'}`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${payment === 'card' ? 'text-white' : 'text-blue-600 bg-blue-50'}`}
                      style={payment === 'card' ? { background: 'linear-gradient(135deg,#23096e,#3A1C8F)' } : {}}>
                      <CreditCard size={22} />
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-neutral-900">بطاقة ائتمانية / دفع إلكتروني</p>
                      <p className="text-sm text-neutral-400 mt-0.5">ادفع الآن لتأكيد حجزك فوراً</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${payment === 'card' ? 'border-[#23096e]' : 'border-neutral-300'}`}>
                      {payment === 'card' && <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#23096e' }} />}
                    </div>
                  </button>

                  {/* WhatsApp */}
                  <button
                    type="button"
                    onClick={() => setPayment('whatsapp')}
                    className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 text-start transition-all ${payment === 'whatsapp' ? 'border-[#23096e] bg-[#23096e]/4' : 'border-neutral-200 hover:border-neutral-300'}`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${payment === 'whatsapp' ? 'text-white' : 'text-green-500 bg-green-50'}`}
                      style={payment === 'whatsapp' ? { background: 'linear-gradient(135deg,#23096e,#3A1C8F)' } : {}}>
                      <MessageCircle size={22} />
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-neutral-900">حجز عبر واتساب</p>
                      <p className="text-sm text-neutral-400 mt-0.5">تأكيد يدوي عبر خدمة العملاء (متاح للدفع عبر الحوالات الداخلية)</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${payment === 'whatsapp' ? 'border-[#23096e]' : 'border-neutral-300'}`}>
                      {payment === 'whatsapp' && <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#23096e' }} />}
                    </div>
                  </button>
                </div>
              </div>

            </form>
          </div>

          {/* ─── Sidebar (Summary) ─── */}
          <div className="w-full lg:w-96 shrink-0 lg:sticky lg:top-8 self-start">
            
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-200 mb-6 overflow-hidden">
              <h3 className="font-black text-lg text-neutral-900 mb-6">ملخص الخدمة</h3>
              
              <div className="h-32 -mx-6 -mt-2 mb-6 bg-neutral-100 relative">
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url('${ride.carImage}')` }}
                />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 right-4 text-white">
                  <span className="text-xs font-bold bg-[#23096e] px-2 py-0.5 rounded-full">{ride.serviceType}</span>
                </div>
              </div>

              <h4 className="font-black text-neutral-900 text-lg mb-4">{ride.carType}</h4>

              <div className="space-y-4 mb-6 pb-6 border-b border-neutral-100">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-[#23096e] shrink-0">
                    <MapPin size={14} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-neutral-400">نقطة الانطلاق</p>
                    <p className="text-sm font-bold text-neutral-800">{ride.pickupLocation}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-[#23096e] shrink-0">
                    <MapPin size={14} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-neutral-400">الوجهة أو التوصيل</p>
                    <p className="text-sm font-bold text-neutral-800">{ride.dropoffLocation}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-[#23096e] shrink-0">
                    <Calendar size={14} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-neutral-400">الموعد</p>
                    <p className="text-sm font-bold text-neutral-800">{ride.date} — {ride.time}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pb-6 border-b border-neutral-100 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">سعر الخدمة</span>
                  <span className="font-bold text-neutral-900">${ride.basePrice}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">الضرائب ورسوم المنصة</span>
                  <span className="font-bold text-neutral-900">${ride.taxes}</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <div>
                  <h4 className="text-lg font-black text-neutral-900">الإجمالي</h4>
                  <p className="text-xs text-[#23096e] font-bold">شامل جميع الرسوم</p>
                </div>
                <div className="text-3xl font-black text-[#23096e]">${totalPrice}</div>
              </div>

              <label className="flex items-start gap-3 cursor-pointer mb-6 group">
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-1 w-4 h-4 rounded border-neutral-300 text-[#23096e] focus:ring-[#23096e]" />
                <span className="text-sm text-neutral-600 leading-relaxed font-medium group-hover:text-neutral-900 transition-colors">
                  أوافق على <span className="text-[#23096e] underline">شروط استخدام الخدمة</span> وقوانين الإلغاء.
                </span>
              </label>

              <button 
                type="submit" 
                form="car-booking-form"
                className={`w-full h-14 rounded-xl text-white font-black text-lg transition-all shadow-lg flex items-center justify-center gap-2 ${
                  agreed 
                    ? 'hover:-translate-y-0.5 shadow-[#23096e]/20 opacity-100' 
                    : 'opacity-50 cursor-not-allowed shadow-none'
                }`}
                style={{ background: agreed ? 'linear-gradient(135deg, #23096e, #3A1C8F)' : '#a3a3a3' }}
              >
                {payment === 'transfer' ? 'الحصول على الكود وإرسال السند' : payment === 'whatsapp' ? 'تأكيد الطلب عبر واتساب' : 'إتمام حجز السيارة'}
                {payment === 'whatsapp' || payment === 'transfer' ? <MessageCircle size={20} /> : <CheckCircle2 size={20} />}
              </button>
            </div>

            {/* Guarantees */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 text-sm text-neutral-600 bg-white p-3 rounded-xl border border-neutral-100">
                <ShieldCheck size={18} className="text-green-600" /> سائقون موثوقون ومدربون معيارات عالية
              </div>
              <div className="flex items-center gap-3 text-sm text-neutral-600 bg-white p-3 rounded-xl border border-neutral-100">
                <Clock size={18} className="text-[#23096e]" /> التزام بالمواعيد ومتابعة الرحلة
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
