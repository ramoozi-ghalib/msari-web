'use client';

import { useState } from 'react';
import {
  Building2, Plus, Edit2, Trash2, CheckCircle2,
  Eye, EyeOff, Copy, Check
} from 'lucide-react';

interface BankAccount {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  currency: 'USD' | 'SAR' | 'YER_NEW' | 'YER_OLD';
  branchName?: string;
  iban?: string;
  notes?: string;
  isActive: boolean;
  isDefault: boolean;
}

const CURRENCIES = {
  USD: { label: 'دولار', flag: '🇺🇸' },
  SAR: { label: 'سعودي', flag: '🇸🇦' },
  YER_NEW: { label: 'ريال يمني جديد', flag: '🇾🇪' },
  YER_OLD: { label: 'ريال يمني قديم', flag: '🇾🇪' },
};

const INITIAL: BankAccount[] = [
  {
    id: 'ba_001',
    bankName: 'بنك اليمن والخليج',
    accountName: 'مؤسسة مساري للسفر والسياحة',
    accountNumber: '1234567890',
    currency: 'USD',
    branchName: 'فرع صنعاء الرئيسي',
    isActive: true,
    isDefault: true,
    notes: 'الحساب الرئيسي للدولار',
  },
  {
    id: 'ba_002',
    bankName: 'بنك الكريمي',
    accountName: 'مؤسسة مساري للسفر',
    accountNumber: '9876543210',
    currency: 'YER_NEW',
    isActive: true,
    isDefault: false,
  },
];

const EMPTY: Omit<BankAccount, 'id'> = {
  bankName: '',
  accountName: '',
  accountNumber: '',
  currency: 'USD',
  branchName: '',
  iban: '',
  notes: '',
  isActive: true,
  isDefault: false,
};

export default function BankAccountsPage() {
  const [accounts, setAccounts] = useState<BankAccount[]>(INITIAL);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<BankAccount | null>(null);
  const [form, setForm] = useState<Omit<BankAccount, 'id'>>(EMPTY);
  const [saved, setSaved] = useState(false);
  const [hidden, setHidden] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState('');

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (a: BankAccount) => {
    setEditing(a);
    setForm({ bankName: a.bankName, accountName: a.accountName, accountNumber: a.accountNumber, currency: a.currency, branchName: a.branchName || '', iban: a.iban || '', notes: a.notes || '', isActive: a.isActive, isDefault: a.isDefault });
    setModal(true);
  };

  const save = () => {
    if (editing) {
      setAccounts(prev => prev.map(a => {
        if (form.isDefault && a.id !== editing.id) return { ...a, isDefault: false };
        if (a.id === editing.id) return { ...a, ...form };
        return a;
      }));
    } else {
      const newAcc = { ...form, id: `ba_${Date.now()}` };
      if (form.isDefault) setAccounts(prev => [...prev.map(a => ({ ...a, isDefault: false })), newAcc]);
      else setAccounts(prev => [...prev, newAcc]);
    }
    setModal(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const del = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الحساب البنكي؟')) {
      setAccounts(prev => prev.filter(a => a.id !== id));
    }
  };

  const toggleStatus = (id: string) => setAccounts(prev => prev.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a));

  const copyNumber = (id: string, number: string) => {
    navigator.clipboard.writeText(number).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(''), 2000);
    });
  };

  return (
    <div className="pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 mb-1 flex items-center gap-2">
            <Building2 className="text-[#23096e]" /> إدارة الحسابات البنكية
          </h1>
          <p className="text-neutral-500 font-medium">الحسابات المرتبطة بخيار الدفع عبر الحوالة البنكية</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-[#23096e] hover:bg-[#1a0654] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md">
          <Plus size={18} /> إضافة حساب بنكي
        </button>
      </div>

      {saved && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl flex items-center gap-3">
          <CheckCircle2 size={20} className="text-green-600" />
          <span className="font-bold text-sm">تم حفظ بيانات الحساب البنكي بنجاح.</span>
        </div>
      )}

      {/* Info box */}
      <div className="mb-6 bg-blue-50 border border-blue-100 rounded-2xl p-5 text-sm text-blue-800">
        💡 هذه الحسابات ستظهر تلقائياً للعميل عند اختيار طريقة الدفع "حوالة بنكية" في صفحة الحجز. يمكنك تحديد حساب واحد كافتراضي.
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {accounts.map(acc => (
          <div key={acc.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${acc.isActive ? 'border-neutral-100' : 'border-red-100 opacity-70'}`}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-50">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{CURRENCIES[acc.currency]?.flag}</div>
                <div>
                  <div className="font-black text-neutral-900 text-sm">{acc.bankName}</div>
                  <div className="text-xs text-neutral-400">{CURRENCIES[acc.currency]?.label}</div>
                </div>
                {acc.isDefault && (
                  <span className="text-xs bg-[#23096e] text-white font-bold px-2 py-0.5 rounded-full">افتراضي</span>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={() => toggleStatus(acc.id)} className={`text-xs font-bold px-3 py-1 rounded-lg border transition-colors ${acc.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                  {acc.isActive ? 'نشط' : 'موقوف'}
                </button>
                <button onClick={() => openEdit(acc)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Edit2 size={15} />
                </button>
                <button onClick={() => del(acc.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-4 space-y-3">
              <div>
                <div className="text-xs text-neutral-400 mb-0.5">اسم المستفيد</div>
                <div className="text-sm font-semibold text-neutral-800">{acc.accountName}</div>
              </div>
              <div>
                <div className="text-xs text-neutral-400 mb-0.5">رقم الحساب</div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-bold text-neutral-800 tracking-wider" dir="ltr">
                    {hidden[acc.id] ? acc.accountNumber : acc.accountNumber.replace(/./g, '•')}
                  </span>
                  <button onClick={() => setHidden(h => ({ ...h, [acc.id]: !h[acc.id] }))} className="text-neutral-400 hover:text-neutral-600">
                    {hidden[acc.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button onClick={() => copyNumber(acc.id, acc.accountNumber)} className="text-neutral-400 hover:text-[#23096e]">
                    {copied === acc.id ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
              {acc.branchName && (
                <div>
                  <div className="text-xs text-neutral-400 mb-0.5">الفرع</div>
                  <div className="text-sm text-neutral-600">{acc.branchName}</div>
                </div>
              )}
              {acc.notes && (
                <div className="text-xs text-neutral-400 italic border-t border-neutral-50 pt-2">{acc.notes}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm" onClick={() => setModal(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-100">
              <h2 className="text-xl font-black text-neutral-900">
                {editing ? 'تعديل الحساب البنكي' : 'إضافة حساب بنكي جديد'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-1.5">البنك *</label>
                <input type="text" value={form.bankName} onChange={e => setForm(f => ({ ...f, bankName: e.target.value }))} placeholder="اكتب اسم البنك المتوافق معه حسابك" className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#23096e] transition-colors text-sm" />
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-1.5">اسم المستفيد *</label>
                <input type="text" value={form.accountName} onChange={e => setForm(f => ({ ...f, accountName: e.target.value }))} placeholder="الاسم كما هو في البنك" className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#23096e] transition-colors text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-neutral-700 mb-1.5">رقم الحساب *</label>
                  <input type="text" value={form.accountNumber} onChange={e => setForm(f => ({ ...f, accountNumber: e.target.value }))} placeholder="XXXXXXXXXXXX" dir="ltr" className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#23096e] transition-colors text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-neutral-700 mb-1.5">العملة</label>
                  <select value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value as BankAccount['currency'] }))} className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#23096e] transition-colors text-sm">
                    {Object.entries(CURRENCIES).map(([k, v]) => <option key={k} value={k}>{v.flag} {v.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-1.5">اسم الفرع</label>
                <input type="text" value={form.branchName} onChange={e => setForm(f => ({ ...f, branchName: e.target.value }))} placeholder="مثال: الفرع الرئيسي صنعاء" className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#23096e] transition-colors text-sm" />
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-1.5">IBAN (اختياري)</label>
                <input type="text" value={form.iban} onChange={e => setForm(f => ({ ...f, iban: e.target.value }))} placeholder="YE00 0000 0000 0000" dir="ltr" className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#23096e] transition-colors text-sm" />
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-1.5">ملاحظات</label>
                <input type="text" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="ملاحظات للمستخدمين" className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#23096e] transition-colors text-sm" />
              </div>
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4 accent-[#23096e]" />
                  <span className="text-sm font-semibold text-neutral-700">حساب نشط</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isDefault} onChange={e => setForm(f => ({ ...f, isDefault: e.target.checked }))} className="w-4 h-4 accent-[#23096e]" />
                  <span className="text-sm font-semibold text-neutral-700">حساب افتراضي</span>
                </label>
              </div>
            </div>
            <div className="p-6 border-t border-neutral-100 flex justify-end gap-3">
              <button onClick={() => setModal(false)} className="px-6 py-2.5 text-neutral-600 hover:bg-neutral-100 rounded-xl font-bold text-sm transition-colors">إلغاء</button>
              <button onClick={save} disabled={!form.bankName || !form.accountName || !form.accountNumber} className="px-8 py-2.5 bg-[#23096e] disabled:opacity-50 text-white rounded-xl font-bold text-sm flex items-center gap-2">
                <CheckCircle2 size={16} /> حفظ الحساب
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
