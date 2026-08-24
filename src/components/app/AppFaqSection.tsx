'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Sparkles } from 'lucide-react';

interface Props {
  isEn?: boolean;
  faqs?: Array<{ q: string; a: string }>;
}

const DEFAULT_FAQS = [
  {
    q: 'هل تطبيق مساري مجاني للتحميل والاستخدام؟',
    a: 'نعم، تطبيق مساري مجاني 100% للتحميل على هواتف آيفون وسامسونج وأندرويد، ولا توجد أي رسوم اشتراك أو رسوم حجز إضافية. الأسعار المعروضة في التطبيق هي الأسعار الفعلية المباشرة للفنادق.',
  },
  {
    q: 'ما هي طرق الدفع المتاحة في تطبيق مساري؟',
    a: 'يوفر التطبيق خيارات دفع متعددة ومرنة؛ حيث يمكنك الدفع بسهولة عبر المحافظ الإلكترونية المتوفرة، أو تحويل بنكي، أو الدفع كاش عند الوصول للفندق.',
  },
  {
    q: 'كيف يتم تأكيد حجز الغرفة وتوثيقه لدى الفندق؟',
    a: 'فور إتمام الحجز، يصدر التطبيق تأكيد حجز رسمي برقم مرجعي معتمد وتفاصيل الوصول الكاملة. يتم إشعار إدارة الفندق مباشرة بحجزك، وتظل تفاصيل الحجز محفوظة على هاتفك ويمكنك فتحها بدون إنترنت (Offline) أو تنزيلها كـ PDF لإبرازها للاستقبال.',
  },
  {
    q: 'هل الفنادق المعروضة في التطبيق توفر كهرباء وتكييف مستمر؟',
    a: 'نعم، توضح بطاقة كل فندق في التطبيق تفاصيل توفر الكهرباء 24/7، خدمات التكييف، الإنترنت المجاني، والموقع الجغرافي لضمان إقامة مريحة ومطابقة لتوقعاتك.',
  },
  {
    q: 'هل يمكنني إلغاء أو تعديل الحجز بعد تأكيده؟',
    a: 'نعم، يتيح التطبيق سياسات إلغاء وتعديل مرنة وواضحة لكل فندق، كما يتوفر فريق دعم فني عبر الواتساب والاتصال لمساعدتك في أي تعديل على تواريخ أو تفاصيل حجزك في أي وقت.',
  },
  {
    q: 'هل يشمل تطبيق مساري حجز الطيران والسيارات بالإضافة للفنادق؟',
    a: 'نعم، يوفر تطبيق مساري منصة سفر شاملة تمكّنك من مقارنة أسعار الفنادق العالمية، حجز تذاكر الطيران، وطلب تأجير السيارات والتنقل بين المدن اليمنية من مكان واحد.',
  },
];

export default function AppFaqSection({ isEn = false, faqs }: Props) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const faqList = (Array.isArray(faqs) && faqs.length > 0) ? faqs : DEFAULT_FAQS;

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section className="py-14 sm:py-20 lg:py-28 bg-[#F4F2F8] text-slate-900 relative overflow-hidden">
      <div className="container-msari relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center space-y-3 sm:space-y-4 mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#23096E]/10 border border-[#23096E]/20 text-[#23096E] text-xs font-black">
            <HelpCircle className="w-3.5 h-3.5 text-[#FF3B30]" />
            <span>{isEn ? 'FAQ' : 'الأسئلة الشائعة'}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#23096E] tracking-tight leading-tight">
            {isEn ? 'Frequently Asked Questions' : 'كل ما تحتاج معرفته عن تطبيق مساري'}
          </h2>
          <p className="text-[#423861] text-sm sm:text-base lg:text-lg max-w-xl mx-auto font-semibold">
            {isEn
              ? 'Answers to top questions regarding booking, payments, and app features.'
              : 'إجابات واضحة ومباشرة لأهم الأسئلة المتعلقة بالحجز والدفع واستخدام التطبيق.'}
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3 sm:space-y-4">
          {faqList.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm transition-all duration-300"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full p-4 sm:p-6 text-start flex items-center justify-between gap-3 sm:gap-4 cursor-pointer select-none hover:bg-slate-50 transition-colors"
                >
                  <span className="text-sm sm:text-lg font-black text-slate-900 hover:text-[#23096E] transition-colors leading-snug">
                    {faq.q}
                  </span>
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#F4F2F8] text-[#23096E] flex items-center justify-center shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 bg-[#23096E] text-white' : ''}`}>
                    <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-1 text-xs sm:text-sm text-[#423861] font-semibold leading-relaxed border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
