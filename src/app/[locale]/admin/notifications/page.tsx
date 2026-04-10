'use client';

import { useState } from 'react';
import { 
  Bell, Send, History, CheckCircle2, 
  Trash2, Smartphone, Users, Globe, ExternalLink
} from 'lucide-react';

const mockNotificationHistory = [
  { id: '1', title: 'خصم 50% على رحلات الطيران لفترة محدودة!', body: 'عروض الصيف بدأت الآن. احجز تذكرتك عبر مساري واحصل على خصومات حصرية.', date: '2025-06-01', status: 'sent', target: 'all', readCount: 14500 },
  { id: '2', title: 'تم تأكيد حجزك في فندق موفنبيك صنعاء', body: 'نتمنى لك إقامة سعيدة. يمكنك الاطلاع على تفاصيل الحجز من قائمة حجوزاتي.', date: '2025-05-28', status: 'sent', target: 'specific', readCount: 1 },
  { id: '3', title: 'مرحباً بك في مساري!', body: 'اكتشف أفضل عروض الفنادق والطيران محلياً ودولياً بأفضل الأسعار المضمونة.', date: '2025-05-20', status: 'sent', target: 'new_users', readCount: 3200 },
];

export default function NotificationsManagement() {
  const [history, setHistory] = useState(mockNotificationHistory);
  const [activeTab, setActiveTab] = useState<'compose' | 'history'>('compose');
  
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  // Compose Form State
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    target: 'all',
    link: ''
  });

  const handleSend = () => {
    if (!formData.title || !formData.body) return;
    
    setIsSending(true);
    setSendSuccess(false);
    
    // Simulate API call to Firebase/FCM
    setTimeout(() => {
      setIsSending(false);
      setSendSuccess(true);
      
      const newNotif = {
        id: `notif_${Date.now()}`,
        title: formData.title,
        body: formData.body,
        date: new Date().toISOString().split('T')[0],
        status: 'sent',
        target: formData.target,
        readCount: 0
      };
      
      setHistory([newNotif, ...history]);
      
      // Reset form
      setFormData({ title: '', body: '', target: 'all', link: '' });
      
      setTimeout(() => setSendSuccess(false), 4000);
    }, 1500);
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا السجل؟ (لن يتم سحب الإشعار من هواتف المستخدمين الذين استلموه بالفعل)')) {
      setHistory(history.filter(h => h.id !== id));
    }
  };

  return (
    <div className="pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 mb-1">مركز الإشعارات والتنبيهات</h1>
          <p className="text-neutral-500 font-medium">إرسال تنبيهات (Push Notifications) لمستخدمي التطبيق والموقع، ومتابعة سجل الإرسال.</p>
        </div>
        
        <div className="flex bg-neutral-100 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('compose')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'compose' ? 'bg-white shadow text-[#23096e]' : 'text-neutral-500 hover:text-neutral-700'}`}>
            إرسال إشعار جديد
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-white shadow text-[#23096e]' : 'text-neutral-500 hover:text-neutral-700'}`}>
            سجل الإرسال
          </button>
        </div>
      </div>

      {sendSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 size={24} className="text-green-600" />
          <div>
            <h4 className="font-black text-base">تم إرسال الإشعار بنجاح!</h4>
            <p className="text-sm font-medium mt-1">تم توجيه الإشعار إلى الفئة المستهدفة بنجاح عبر خوادم Firebase.</p>
          </div>
        </div>
      )}

      {activeTab === 'compose' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Form Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-8 space-y-8">
              
              <div className="space-y-3">
                <label className="text-sm font-bold text-neutral-700 flex items-center gap-2">
                  <Globe size={18} className="text-[#23096e]" /> الفئة المستهدفة (الجمهور)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button 
                    onClick={() => setFormData({...formData, target: 'all'})}
                    className={`p-4 rounded-xl border-2 text-start transition-all ${formData.target === 'all' ? 'border-[#23096e] bg-[#23096e]/5' : 'border-neutral-200 bg-white hover:border-neutral-300'}`}>
                    <Users size={20} className={formData.target === 'all' ? 'text-[#23096e] mb-2' : 'text-neutral-400 mb-2'} />
                    <h4 className={`font-bold text-sm mb-1 ${formData.target === 'all' ? 'text-[#23096e]' : 'text-neutral-700'}`}>جميع المستخدمين</h4>
                    <p className="text-xs text-neutral-500 font-medium">إرسال للجميع (حملة عامة)</p>
                  </button>
                  
                  <button 
                    onClick={() => setFormData({...formData, target: 'new_users'})}
                    className={`p-4 rounded-xl border-2 text-start transition-all ${formData.target === 'new_users' ? 'border-[#23096e] bg-[#23096e]/5' : 'border-neutral-200 bg-white hover:border-neutral-300'}`}>
                    <CheckCircle2 size={20} className={formData.target === 'new_users' ? 'text-[#23096e] mb-2' : 'text-neutral-400 mb-2'} />
                    <h4 className={`font-bold text-sm mb-1 ${formData.target === 'new_users' ? 'text-[#23096e]' : 'text-neutral-700'}`}>المستخدمين الجدد</h4>
                    <p className="text-xs text-neutral-500 font-medium">سجلوا آخر 30 يوماً فقط</p>
                  </button>

                  <button 
                    disabled
                    className={`p-4 rounded-xl border-2 text-start transition-all opacity-50 cursor-not-allowed border-neutral-200 bg-neutral-50`}>
                    <Smartphone size={20} className="text-neutral-400 mb-2" />
                    <h4 className="font-bold text-sm mb-1 text-neutral-700">مستخدم مخصص</h4>
                    <p className="text-xs text-neutral-500 font-medium">برقم الهاتف / ايميل (قريباً)</p>
                  </button>
                </div>
              </div>

              <div className="space-y-6 bg-neutral-50 border border-neutral-100 p-6 rounded-2xl">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-neutral-700">عنوان الإشعار الرئيسية (Title)</label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="مثال: خصم هائل بانتظارك!"
                    maxLength={50}
                    className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-[#23096e] transition-colors font-bold text-neutral-900 placeholder:font-medium placeholder:text-neutral-400"
                  />
                  <div className="text-end text-[10px] font-bold text-neutral-400">{formData.title.length}/50</div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-neutral-700">محتوى الرسالة (Body)</label>
                  <textarea 
                    value={formData.body}
                    onChange={(e) => setFormData({...formData, body: e.target.value})}
                    placeholder="اكتب المحتوى الجذاب للإشعار هنا..."
                    rows={4}
                    maxLength={150}
                    className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-[#23096e] transition-colors resize-none text-sm font-medium text-neutral-700"
                  />
                  <div className="text-end text-[10px] font-bold text-neutral-400">{formData.body.length}/150</div>
                </div>

                <div className="space-y-2 relative">
                  <label className="text-sm font-bold text-neutral-700 flex items-center gap-1"><ExternalLink size={14}/> الإجراء عند الضغط (Action Link) - اختياري</label>
                  <input 
                    type="text" 
                    value={formData.link}
                    onChange={(e) => setFormData({...formData, link: e.target.value})}
                    placeholder="مثال: /offers/summer-sale أو اتركها فارغة لفتح التطبيق فقط"
                    className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-[#23096e] transition-colors text-sm dir-ltr text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button 
                  onClick={handleSend}
                  disabled={isSending || !formData.title || !formData.body}
                  className="flex items-center gap-2 bg-[#23096e] hover:bg-[#1a0654] disabled:bg-neutral-300 disabled:cursor-not-allowed text-white px-8 py-3.5 rounded-xl font-bold text-sm transition-all shadow-md">
                  {isSending ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : <Send size={18} className="rotate-180" />}
                  {isSending ? 'جاري البث للشبكة...' : 'إرسال الإشعار الآن'}
                </button>
              </div>

            </div>
          </div>

          {/* Mobile Preview Area */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <h3 className="text-sm font-black text-neutral-900 mb-4 flex items-center gap-2">
                <Smartphone size={18} className="text-[#23096e]" />
                معاينة مباشرة للإشعار
              </h3>
              
              {/* Fake Mobile Device */}
              <div className="w-[300px] h-[600px] bg-white border-[8px] border-neutral-900 rounded-[3rem] mx-auto shadow-2xl relative overflow-hidden flex flex-col items-center pt-8 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600')" }}>
                {/* Dynamic Island / Notch */}
                <div className="absolute top-0 w-32 h-6 bg-neutral-900 rounded-b-3xl"></div>
                
                {/* Clock */}
                <div className="absolute top-2 left-6 text-white text-[10px] font-bold">10:41</div>
                
                {/* Notification Bubble */}
                <div className={`w-[90%] bg-white/95 backdrop-blur-md p-4 rounded-3xl shadow-lg mt-4 transition-all duration-300 transform ${formData.title ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 bg-[#23096e] rounded text-white flex items-center justify-center font-bold text-[10px]">م</div>
                    <span className="text-[10px] font-bold text-neutral-500 tracking-wider">MSARI APP</span>
                    <span className="text-[10px] text-neutral-400 ms-auto">الآن</span>
                  </div>
                  <h4 className="font-bold text-sm text-neutral-900 mb-1 leading-tight">{formData.title || 'عنوان الإشعار سيظهر هنا'}</h4>
                  <p className="text-xs text-neutral-600 font-medium leading-relaxed line-clamp-3">
                    {formData.body || 'محتوى الرسالة يظهر هنا ليعطي العميل نبذة سريعة قبل النقر.'}
                  </p>
                </div>

                <div className="mt-auto mb-10 w-32 h-1 bg-white/50 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* History Tab */
        <div className="bg-white shadow-sm border border-neutral-100 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-neutral-100 bg-neutral-50/50 flex items-center gap-3">
            <History size={20} className="text-[#23096e]" />
            <h2 className="text-lg font-black text-neutral-900">سجل الإشعارات السابقة</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-start">
              <thead className="bg-neutral-50 border-b border-neutral-100 text-neutral-500 text-sm font-bold">
                <tr>
                  <th className="py-4 px-6 text-start">الإشعار (العنوان والمحتوى)</th>
                  <th className="py-4 px-6 text-start">تاريخ الإرسال</th>
                  <th className="py-4 px-6 text-start">الاستهداف</th>
                  <th className="py-4 px-6 text-start">الوصول (المشاهدات)</th>
                  <th className="py-4 px-6 text-end">حذف من السجل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 leading-relaxed">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="py-4 px-6 max-w-md">
                      <div className="font-bold text-neutral-900 mb-1">{item.title}</div>
                      <div className="text-xs text-neutral-500 line-clamp-2">{item.body}</div>
                    </td>
                    <td className="py-4 px-6 text-xs font-bold text-neutral-600 dir-ltr text-right">
                      {item.date}
                    </td>
                    <td className="py-4 px-6">
                      {item.target === 'all' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">الكل</span>}
                      {item.target === 'specific' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-neutral-100 text-neutral-700 border border-neutral-200">مخصص</span>}
                      {item.target === 'new_users' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">الجدد</span>}
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm font-black text-neutral-800">{item.readCount.toLocaleString()}</div>
                      <div className="text-[10px] text-neutral-400">مستلم فتح الإشعار</div>
                    </td>
                    <td className="py-4 px-6 text-end">
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors inline-block" title="حذف السجل فقط">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-neutral-500 font-medium">
                      لا يوجد أي سجلات لإشعارات سابقة
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
