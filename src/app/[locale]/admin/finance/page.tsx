'use client';

import { useState } from 'react';
import { 
  CircleDollarSign, Calculator, RefreshCw, Save, 
  TrendingUp, ArrowRightLeft, AlertCircle, CheckCircle2
} from 'lucide-react';

export default function FinanceManagement() {
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Base Exchange Rates (1 USD = ...)
  const [rates, setRates] = useState({
    SAR: 3.76,         // Saudi Riyal
    YER_OLD: 530,      // Sana'a Rate
    YER_NEW: 1650,     // Aden Rate
  });

  // Demo Calculator State
  const [demoUsd, setDemoUsd] = useState<number>(100);

  const handleSaveRates = () => {
    setIsSaving(true);
    setSaveSuccess(false);
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 800);
  };

  const resetToDefaults = () => {
    if (confirm('هل أنت متأكد من استعادة أسعار الصرف الافتراضية؟')) {
      setRates({
        SAR: 3.76,
        YER_OLD: 530,
        YER_NEW: 1650,
      });
    }
  };

  return (
    <div className="pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 mb-1">الإدارة المالية وأسعار الصرف</h1>
          <p className="text-neutral-500 font-medium">التحكم المركزي في أسعار الصرف للعملات المدعومة في المنصة مقارنة بالدولار الأمريكي (USD).</p>
        </div>
        
        <button 
          onClick={handleSaveRates}
          disabled={isSaving}
          className="flex items-center gap-2 bg-[#23096e] hover:bg-[#1a0654] disabled:opacity-70 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md">
          {isSaving ? (
            <RefreshCw size={18} className="animate-spin" />
          ) : (
            <Save size={18} />
          )}
          {isSaving ? 'جاري الحفظ...' : 'حفظ أسعار الصرف'}
        </button>
      </div>

      {saveSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 size={20} className="text-green-600" />
          <span className="font-bold text-sm">تم حفظ أسعار الصرف بنجاح! سيتم تطبيقها فوراً على جميع الحجوزات في المنصة.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Rates Editor */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
            <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
              <h2 className="text-lg font-black text-neutral-900 flex items-center gap-2">
                <ArrowRightLeft size={20} className="text-[#23096e]" />
                لوحة تحكم الصرف (تحديث يدوي)
              </h2>
              <button 
                onClick={resetToDefaults}
                className="text-xs font-bold text-neutral-500 hover:text-red-600 transition-colors underline underline-offset-2">
                استعادة الافتراضي
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex gap-3 text-blue-800 text-sm mb-2">
                <AlertCircle size={20} className="shrink-0 text-blue-600" />
                <p className="leading-relaxed font-medium">
                  العملة المرجعية للنظام هي <strong>الدولار الأمريكي (USD)</strong>. جميع أسعار الفنادق، السيارات والطيران تُخزن بالدولار، ويتم ضرب السعر الأساسي بالقيم المدخلة أدناه لعرضها للعميل بالعملة التي يختارها.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* SAR Rate */}
                <div className="space-y-3">
                  <label className="text-sm font-bold text-neutral-700 flex justify-between">
                    <span>الريال السعودي (SAR)</span>
                    <span className="text-neutral-400 font-medium dir-ltr text-xs">1 USD =</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-bold">SAR</div>
                    <input 
                      type="number" 
                      step="0.01"
                      value={rates.SAR}
                      onChange={(e) => setRates({...rates, SAR: Number(e.target.value)})}
                      className="w-full pl-14 pr-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#23096e] focus:bg-white transition-colors text-lg font-black text-neutral-900"
                    />
                  </div>
                </div>

                {/* Empty Col for layout balance if needed, or we put YER OLD here */}
                {/* YER OLD Rate */}
                <div className="space-y-3">
                  <label className="text-sm font-bold text-neutral-700 flex justify-between">
                    <span>الريال اليمني - صنعاء (YER)</span>
                    <span className="text-neutral-400 font-medium dir-ltr text-xs">1 USD =</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-bold">YER</div>
                    <input 
                      type="number" 
                      value={rates.YER_OLD}
                      onChange={(e) => setRates({...rates, YER_OLD: Number(e.target.value)})}
                      className="w-full pl-14 pr-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#23096e] focus:bg-white transition-colors text-lg font-black text-neutral-900"
                    />
                  </div>
                </div>
                
                {/* YER NEW Rate */}
                <div className="space-y-3">
                  <label className="text-sm font-bold text-neutral-700 flex justify-between">
                    <span>الريال اليمني - عدن (YER)</span>
                    <span className="text-neutral-400 font-medium dir-ltr text-xs">1 USD =</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-bold">YER</div>
                    <input 
                      type="number" 
                      value={rates.YER_NEW}
                      onChange={(e) => setRates({...rates, YER_NEW: Number(e.target.value)})}
                      className="w-full pl-14 pr-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#23096e] focus:bg-white transition-colors text-lg font-black text-neutral-900"
                    />
                  </div>
                </div>

              </div>
              
            </div>
          </div>
          
          {/* Quick Stats Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-neutral-500 mb-1">إجمالي الإيرادات (المقدرة)</p>
                <h4 className="text-xl font-black text-neutral-900">$24,500<span className="text-xs text-neutral-400 font-medium ml-1">.00</span></h4>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                <TrendingUp size={24} />
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-neutral-500 mb-1">حوالات بانتظار التأكيد اليها</p>
                <h4 className="text-xl font-black text-[#23096e]">12 <span className="text-xs text-neutral-400 font-medium ml-1">حوالة</span></h4>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#23096e]/5 text-[#23096e] flex items-center justify-center">
                <CircleDollarSign size={24} />
              </div>
            </div>
          </div>

        </div>

        {/* Sidebar: Demo Calculator */}
        <div className="lg:col-span-1">
          <div className="bg-neutral-900 rounded-2xl shadow-lg border border-neutral-800 text-white overflow-hidden sticky top-6">
            <div className="p-6 border-b border-white/10 bg-black/20">
              <h2 className="text-lg font-black flex items-center gap-2">
                <Calculator size={20} className="text-amber-400" />
                حاسبة المعاينة
              </h2>
              <p className="text-neutral-400 text-xs mt-1">تأكد من دقة الأسعار التي ستظهر للعميل بعد إدخالك للمعدلات الجديدة.</p>
            </div>
            
            <div className="p-6 space-y-6">
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-400">أدخل مبلغ تجريبي بالدولار (USD)</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white font-black text-xl">$</div>
                  <input 
                    type="number" 
                    value={demoUsd}
                    onChange={(e) => setDemoUsd(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl focus:outline-none focus:border-amber-400 transition-colors text-2xl font-black text-white dir-ltr"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="h-px w-full bg-white/10 my-4"></div>

              <div className="space-y-4">
                <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
                  <span className="text-sm font-bold text-neutral-300">السعودي (SAR)</span>
                  <span className="text-xl font-black text-white dir-ltr">
                    {(demoUsd * rates.SAR).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                
                <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
                  <span className="text-sm font-bold text-neutral-300">يمني - صنعاء (YER)</span>
                  <span className="text-xl font-black text-emerald-400 dir-ltr">
                    {(demoUsd * rates.YER_OLD).toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
                  <span className="text-sm font-bold text-neutral-300">يمني - عدن (YER)</span>
                  <span className="text-xl font-black text-amber-400 dir-ltr">
                    {(demoUsd * rates.YER_NEW).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="pt-4 text-center">
                <p className="text-[10px] text-neutral-500 font-medium">الأسعار المعروضة في الحاسبة هي فقط للتأكيد وليست للحفظ في قاعدة البيانات.</p>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
