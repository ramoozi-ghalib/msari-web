'use client';

import { useState } from 'react';
import { KeyRound, Plus, Trash2, Copy, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';

interface ApiKey {
  id: string;
  name: string;
  keyString: string;
  createdAt: string;
  expiresAt: string;
  plan: string;
  status: 'active' | 'revoked';
  requestsUsage: number;
}

// Mock Data for API Keys
const initialKeys: ApiKey[] = [
  {
    id: 'key_1',
    name: 'موقع وكريستي للسياحة',
    keyString: 'msari_live_98h32y498hf23nf2309f',
    createdAt: '2025-06-20',
    expiresAt: '2026-06-20',
    plan: 'عمولة 15%',
    status: 'active',
    requestsUsage: 12450 // out of 50000 limit
  },
  {
    id: 'key_2',
    name: 'تطبيق رحلات الجوال',
    keyString: 'msari_live_2348n7f2h348f9h3249f',
    createdAt: '2025-07-01',
    expiresAt: '2026-07-01',
    plan: 'سنوية ($299)',
    status: 'active',
    requestsUsage: 89000 // unlimited plan
  }
];

export default function ApiKeysManagement() {
  const [keys, setKeys] = useState<ApiKey[]>(initialKeys);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // New Key Form State
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyPlan, setNewKeyPlan] = useState('عمولة 15%');

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    // TODO: This must be replaced with a secure Server Action / API call
    // Generating keys on the client side using Math.random is a security risk.
    const newKey: ApiKey = {
      id: `key_${Date.now()}`,
      name: newKeyName,
      keyString: `msari_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      createdAt: new Date().toISOString().split('T')[0],
      expiresAt: '2026-12-31', // Mock expiry
      plan: newKeyPlan,
      status: 'active',
      requestsUsage: 0
    };

    setKeys([newKey, ...keys]);
    setIsModalOpen(false);
    setNewKeyName('');
    
    // Auto-copy the new key for the user
    handleCopy(newKey.keyString);
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المفتاح؟ لن تتمكن التطبيقات التي تستخدمه من الوصول للبيانات بعد الآن.')) {
      setKeys(keys.filter(k => k.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 flex items-center gap-2">
            <KeyRound className="text-[--brand-primary]" size={28} />
            إدارة مفاتيح الـ API
          </h1>
          <p className="text-neutral-500 text-sm mt-1">توليد وإدارة مفاتيح الربط البرمجي للوكالات والشركاء الساحبين للبيانات (B2B).</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[--brand-primary] text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-[--brand-primary-light] transition-colors whitespace-nowrap"
        >
          <Plus size={20} />
          توليد مفتاح جديد
        </button>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-start gap-3">
        <ShieldCheck className="text-blue-500 shrink-0 mt-0.5" size={20} />
        <div>
          <h4 className="font-bold text-blue-900 text-sm mb-1">تنبيه أمني هام</h4>
          <p className="text-neutral-600 text-sm leading-relaxed">يرجى حفظ مفاتيح الـ API في مكان آمن وعدم تضمينها في الكود المصدري لجهة العميل (Frontend). جميع المفاتيح تبدأ بالبادئة <code className="bg-blue-100 px-1 py-0.5 rounded text-xs text-blue-800 font-mono">msari_live_</code> للمفاتيح الفعلية.</p>
        </div>
      </div>

      {/* API Keys Table/List */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
        {keys.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <KeyRound size={48} className="text-neutral-300 mb-4" />
            <h3 className="text-lg font-bold text-neutral-700 mb-2">لا يوجد مفاتيح حالياً</h3>
            <p className="text-neutral-500 text-sm">اضغط على زر (توليد مفتاح جديد) لإنشاء مفتاح للوكلاء.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-4 text-sm font-bold text-neutral-700 w-1/4">اسم التطبيق / الوكالة</th>
                  <th className="px-6 py-4 text-sm font-bold text-neutral-700 w-1/4">المفتاح (API Key)</th>
                  <th className="px-6 py-4 text-sm font-bold text-neutral-700">الخطة</th>
                  <th className="px-6 py-4 text-sm font-bold text-neutral-700 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {keys.map((key) => (
                  <tr key={key.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-neutral-900">{key.name}</div>
                      <div className="text-xs text-neutral-400 mt-1">تاريخ الإنشاء: <span className="dir-ltr inline-block">{key.createdAt}</span></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="bg-neutral-100 text-neutral-600 font-mono text-xs px-3 py-1.5 rounded-lg border border-neutral-200 truncate max-w-[180px] dir-ltr text-left">
                          {key.keyString.substring(0, 15)}...
                        </div>
                        <button 
                          onClick={() => handleCopy(key.keyString)}
                          className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 text-neutral-600 transition-colors focus:outline-none"
                          title="نسخ المفتاح كاملاً"
                        >
                          {copiedKey === key.keyString ? <CheckCircle2 size={14} className="text-green-600" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 whitespace-nowrap">
                        {key.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleDelete(key.id)}
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors mx-auto"
                        title="حذف المفتاح"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Key Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
              <h3 className="text-lg font-black text-neutral-900 flex items-center gap-2">
                <KeyRound size={20} className="text-[--brand-primary]" />
                إضافة مفتاح جديد
              </h3>
            </div>
            
            <form onSubmit={handleCreateKey} className="p-6">
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-neutral-700 mb-2">اسم الوكالة أو التطبيق الطالب للبيانات</label>
                  <input
                    type="text"
                    required
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="مثال: شركة سياحة الأفق"
                    className="w-full xl px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-[--brand-primary] focus:border-transparent outline-none transition-all text-sm font-medium"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-neutral-700 mb-2">خطة الشراكة (B2B Plan)</label>
                  <select
                    value={newKeyPlan}
                    onChange={(e) => setNewKeyPlan(e.target.value)}
                    className="w-full xl px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-[--brand-primary] outline-none text-sm font-medium"
                  >
                    <option value="شهرية ($29)">خطة شهرية ($29/شهر) - قراءة فقط</option>
                    <option value="عمولة 15%">نظام العمولة (15%) - شامل الحجز</option>
                    <option value="سنوية ($299)">خطة سنوية ($299/سنة) - مميزات كاملة</option>
                  </select>
                </div>

                <div className="bg-red-50 border border-red-100 text-red-700 p-3 rounded-xl text-xs flex items-start gap-2 mt-4">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>بمجرد التوليد، سيظهر المفتاح كاملاً مرة واحدة. يرجى إعطائه للوكالة و برمجته في نظامهم.</span>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-[--brand-primary] text-white py-3 rounded-xl font-bold hover:bg-[--brand-primary-light] transition-colors"
                >
                  توليد وحفظ
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 bg-neutral-100 text-neutral-700 rounded-xl font-bold hover:bg-neutral-200 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
