'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Sparkles } from 'lucide-react';

interface Props {
  isEn?: boolean;
}

const FAQS = [
  {
    q: 'هل تطبيق مساري مجاني للتحميل والاستخدام؟',
    a: 'نعم، تطبيق مساري مجاني 100% للتحميل على هواتف آيفون وسامسونج وأندرويد، ولا توجد أي رسوم اشتراك أو رسوم حجز إضافية. الأسعار المعروضة في التطبيق هي الأسعار الفعلية المباشرة للفنادق.',
  },
  {
    q: 'هل يلزمني وجود بطاقة بنكية دولية (فيزا / ماستركارد) لإتمام الحجز؟',
    a: 'لا، تطبيق مساري مصمم خصيصاً ليناسب واقع المعاملات في اليمن؛ حيث يمكنك الدفع مباشرة عبر حسابك في بنك الكريمي (إم فلوس)، أو محفظة جيب، أو المحافظ الإلكترونية المحلية، أو بالدفع كاش عند الوصول للفندق.',
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

export default function AppFaqSection({ isEn = false }: Props) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section className="py-20 lg:py-28 bg-[#F4F2F8] text-slate-900 relative overflow-hidden">
      <div className="container-msari relative z-10 max-w-4xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#23096E]/10 border border-[#23096E]/20 text-[#23096E] text-xs font-black">
            <HelpCircle className="w-3.5 h-3.5 text-[#FF3B30]" />
            <span>{isEn ? 'FAQ' : 'الأسئلة الشائعة'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#23096E] tracking-tight">
            {isEn ? 'Frequently Asked Questions' : 'كل ما تحتاج معرفته عن تطبيق مساري'}
          </h2>
          <p className="text-[#423861] text-base sm:text-lg max-w-xl mx-auto font-semibold">
            {isEn
              ? 'Answers to top questions regarding booking, payments, and app features.'
              : 'إجابات واضحة ومباشرة لأهم الأسئلة المتعلقة بالحجز والدفع واستخدام التطبيق.'}
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-sm transition-all duration-300"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full p-5 sm:p-6 text-start flex items-center justify-between gap-4 cursor-pointer select-none hover:bg-slate-50 transition-colors"
                >
                  <span className="text-base sm:text-lg font-black text-slate-900 hover:text-[#23096E] transition-colors leading-snug">
                    {faq.q}
                  </span>
                  <div className={`w-8 h-8 rounded-full bg-[#F4F2F8] text-[#23096E] flex items-center justify-center shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 bg-[#23096E] text-white' : ''}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-[#423861] font-semibold leading-relaxed border-t border-slate-100">
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
