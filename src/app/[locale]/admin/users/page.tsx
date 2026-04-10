'use client';

import { useState } from 'react';
import type { User } from '@/types';
import { 
  Users, UserPlus, Shield, ShieldCheck, 
  Trash2, Edit2, Mail, KeyRound, CheckCircle2,
  MoreVertical, ShieldAlert
} from 'lucide-react';

const mockUsers: User[] = [
  { id: '1', name: 'أحمد عبدالله', email: 'ahmed@msari.net', role: 'admin', status: 'active', lastLogin: '2025-06-15 09:30 AM' },
  { id: '2', name: 'سارة محمد', email: 'sara@msari.net', role: 'supervisor', status: 'active', lastLogin: '2025-06-15 10:15 AM' },
  { id: '3', name: 'خالد يحيى', email: 'khaled@msari.net', role: 'supervisor', status: 'inactive', lastLogin: '2025-05-20 02:00 PM' },
];

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'supervisor' as 'admin' | 'supervisor',
    status: 'active' as 'active' | 'inactive',
  });

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Leave blank when editing unless changing
      role: user.role,
      status: user.status,
    });
    setIsModalOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'supervisor',
      status: 'active',
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    let updatedUsers;
    if (editingUser) {
      updatedUsers = users.map(u => u.id === editingUser.id ? { ...u, ...formData, password: undefined } : u);
    } else {
      updatedUsers = [
        ...users, 
        { 
          id: `usr_${Date.now()}`, 
          ...formData, 
          lastLogin: 'لم يسجل الدخول',
          password: undefined 
        }
      ];
    }
    setUsers(updatedUsers);
    setIsModalOpen(false);
    
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleDelete = (id: string, role: string) => {
    if (role === 'admin') {
      alert('لا يمكن حذف حساب المدير العام (المالك) من لوحة التحكم.');
      return;
    }
    if (confirm('هل أنت متأكد من حذف هذا المشرف بصفة نهائية؟ لن يتمكن من تسجيل الدخول مجدداً.')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const toggleStatus = (id: string, role: string, currentStatus: string) => {
    if (role === 'admin') {
      alert('لا يمكن إيقاف حساب المدير العام السوبر.');
      return;
    }
    setUsers(users.map(u => u.id === id ? { ...u, status: currentStatus === 'active' ? 'inactive' : 'active' } : u));
  };

  return (
    <div className="pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 mb-1 flex items-center gap-2">
            <Users className="text-[#23096e]" /> إدارة المشرفين والصلاحيات
          </h1>
          <p className="text-neutral-500 font-medium">إضافة حسابات لمدخلي البيانات والمشرفين للتحكم بالمنصة بفاعلية.</p>
        </div>
        
        <button 
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-[#23096e] hover:bg-[#1a0654] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md">
          <UserPlus size={18} /> إضافة مشرف جديد
        </button>
      </div>

      {saveSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 size={20} className="text-green-600" />
          <span className="font-bold text-sm">تم حفظ بيانات المشرف بنجاح.</span>
        </div>
      )}

      {/* Permissions Guide Info Box */}
      <div className="mb-8 bg-blue-50/50 border border-blue-100 rounded-2xl p-6 flex flex-col sm:flex-row gap-6">
        <div className="w-12 h-12 bg-white rounded-full flex justify-center items-center shadow-sm shrink-0">
          <ShieldAlert className="text-blue-600" size={24} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
           <div>
             <h4 className="font-bold text-blue-900 mb-1 flex items-center gap-2"><ShieldCheck size={16} /> مدير عام (Admin)</h4>
             <p className="text-sm text-blue-800 leading-relaxed font-medium">صلاحيات كاملة مطلقة. يمكنه تعديل إعدادات النظام، أسعار الصرف، إضافة وحذف المشرفين، ومراجعة الإيرادات والمالية.</p>
           </div>
           <div>
             <h4 className="font-bold text-neutral-800 mb-1 flex items-center gap-2"><Shield size={16} className="text-neutral-500" /> مشرف (Supervisor)</h4>
             <p className="text-sm text-neutral-600 leading-relaxed font-medium">صلاحيات عملية فقط. يمكنه إضافة/تعديل الفنادق، إدارة الحجوزات اليومية للرحلات والتكاسي، ومراجعة بيانات العملاء. لا يرى الإعدادات الحساسة.</p>
           </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow-sm border border-neutral-100 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start">
            <thead className="bg-neutral-50 border-b border-neutral-100 text-neutral-500 text-sm font-bold">
              <tr>
                <th className="py-4 px-6 text-start">الاسم والبريد</th>
                <th className="py-4 px-6 text-start">الدور (الصلاحية)</th>
                <th className="py-4 px-6 text-start">حالة الحساب</th>
                <th className="py-4 px-6 text-start">آخر تسجيل دخول</th>
                <th className="py-4 px-6 text-end">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 italic gap-2">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#23096e] to-[#4a1fb8] text-white flex items-center justify-center font-bold text-lg shadow-sm">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-neutral-900 not-italic">{user.name}</div>
                        <div className="text-xs text-neutral-500 font-medium not-italic">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 not-italic">
                    {user.role === 'admin' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <ShieldCheck size={14} /> مدير عام
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        <Shield size={14} /> مشرف منصة
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 not-italic">
                    <button 
                      onClick={() => toggleStatus(user.id, user.role, user.status)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${user.role === 'admin' ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'} ${user.status === 'active' ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'}`}>
                      {user.status === 'active' ? 'نشط ومفعل' : 'موقوف مؤقتاً'}
                    </button>
                  </td>
                  <td className="py-4 px-6 text-sm font-medium text-neutral-500 dir-ltr text-right not-italic">
                    {user.lastLogin}
                  </td>
                  <td className="py-4 px-6 text-end not-italic">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleOpenEdit(user)}
                        className="p-2 border border-neutral-200 bg-white text-blue-600 hover:bg-blue-50 rounded-lg transition-colors shadow-sm" title="تعديل البيانات">
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id, user.role)}
                        className={`p-2 border border-neutral-200 bg-white shadow-sm rounded-lg transition-colors ${user.role === 'admin' ? 'text-neutral-300 cursor-not-allowed' : 'text-red-600 hover:bg-red-50'}`} 
                        disabled={user.role === 'admin'}
                        title="حذف الحساب">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Add / Edit Modal --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="bg-white border-b border-neutral-100 p-6 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-black text-neutral-900 flex items-center gap-2">
                {editingUser ? <Edit2 size={24} className="text-[#23096e]" /> : <UserPlus size={24} className="text-[#23096e]" />}
                {editingUser ? 'تعديل بيانات المشرف' : 'إضافة حساب مشرف جديد'}
              </h2>
            </div>

            <div className="p-8 space-y-5">
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-neutral-700">الاسم الكامل</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="مثال: صالح محمد"
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#23096e] focus:bg-white transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-neutral-700">البريد الإلكتروني (لتسجيل الدخول)</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="supervisor@msari.net"
                    className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#23096e] focus:bg-white transition-colors text-left dir-ltr"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-neutral-700">كلمة المرور المؤقتة</label>
                <div className="relative">
                  <KeyRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input 
                    type="password" 
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder={editingUser ? 'اتركه فارغاً للاحتفاظ بكلمة المرور السابقة' : 'أدخل كلمة مرور قوية للمشرف'}
                    className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#23096e] focus:bg-white transition-colors text-left dir-ltr"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-neutral-700">الصلاحية الدور</label>
                  <select 
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value as 'admin'|'supervisor'})}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#23096e] focus:bg-white transition-colors"
                  >
                    <option value="supervisor">مشرف المنصة</option>
                    <option value="admin">مدير عام سوبر</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-neutral-700">حالة الحساب</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as 'active'|'inactive'})}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#23096e] focus:bg-white transition-colors"
                  >
                    <option value="active">نشط وفعال</option>
                    <option value="inactive">موقوف مؤقتاً</option>
                  </select>
                </div>
              </div>

            </div>

            <div className="bg-neutral-50 border-t border-neutral-100 p-6 flex justify-end gap-3 shrink-0">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 text-neutral-600 hover:bg-neutral-200 rounded-xl font-bold text-sm transition-colors">
                إلغاء
              </button>
              <button 
                onClick={handleSave}
                disabled={!formData.name || !formData.email || (!editingUser && !formData.password)}
                className="px-8 py-2.5 bg-[#23096e] hover:bg-[#1a0654] disabled:opacity-50 text-white rounded-xl font-bold text-sm transition-all shadow-md flex items-center gap-2">
                <ShieldCheck size={18} /> حفظ بيانات المشرف
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
