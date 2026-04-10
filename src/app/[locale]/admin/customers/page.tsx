'use client';

import { useState } from 'react';
import type { User } from '@/types';
import { 
  Users, Search, Shield, Ban, CheckCircle2, MoreVertical, Mail, Phone, Calendar
} from 'lucide-react';

const mockCustomers: User[] = [
  { id: 'usr_1', name: 'محمد علي', email: 'mohammed@example.com', phone: '+967771234567', role: 'user', status: 'active', createdAt: '2025-07-01T10:00:00Z' },
  { id: 'usr_2', name: 'فاطمة سعد', email: 'fatima@example.com', phone: '+967731234567', role: 'user', status: 'active', createdAt: '2025-07-05T14:30:00Z' },
  { id: 'usr_3', name: 'عمر عبدالله', email: 'omar@example.com', phone: '+967711234567', role: 'user', status: 'inactive', createdAt: '2025-06-20T09:15:00Z' },
  { id: 'usr_4', name: 'نورة سالم', email: 'noura@example.com', phone: '+967701234567', role: 'user', status: 'active', createdAt: '2025-07-10T16:45:00Z' },
] as any;

export default function CustomersManagement() {
  const [customers, setCustomers] = useState<any[]>(mockCustomers);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleStatus = (id: string, currentStatus: string) => {
    setCustomers(customers.map(c => c.id === id ? { ...c, status: currentStatus === 'active' ? 'inactive' : 'active' } : c));
  };

  const filteredCustomers = customers.filter(c => 
    c.name.includes(searchQuery) || 
    c.email.includes(searchQuery) || 
    (c.phone && c.phone.includes(searchQuery))
  );

  return (
    <div className="pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 mb-1 flex items-center gap-2">
            <Users className="text-[#23096e]" /> إدارة مستخدمي الموقع
          </h1>
          <p className="text-neutral-500 font-medium">قائمة بالعملاء المسجلين في منصة مساري للحجوزات.</p>
        </div>
      </div>

      {/* Search & Actions */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-100 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search size={18} className="absolute top-1/2 -translate-y-1/2 end-4 text-neutral-400" />
          <input 
            type="text" 
            placeholder="ابحث بالاسم، البريد أو الهاتف الحساب..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-11 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#23096e] transition-colors text-sm"
          />
        </div>
        <div className="flex items-center gap-3 text-sm text-neutral-500 font-medium w-full md:w-auto">
          <div className="px-4 py-2 bg-neutral-50 rounded-lg border border-neutral-100">
            إجمالي المسجلين: <strong className="text-neutral-900">{customers.length}</strong>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white shadow-sm border border-neutral-100 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start whitespace-nowrap">
            <thead className="bg-neutral-50 border-b border-neutral-100 text-neutral-500 text-sm font-bold">
              <tr>
                <th className="py-4 px-6 text-start">العميل</th>
                <th className="py-4 px-6 text-start">معلومات التواصل</th>
                <th className="py-4 px-6 text-start">تاريخ التسجيل</th>
                <th className="py-4 px-6 text-start">حالة الحساب</th>
                <th className="py-4 px-6 text-end">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredCustomers.length > 0 ? filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#23096e]/10 text-[#23096e] flex items-center justify-center font-bold text-lg border border-[#23096e]/20">
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-neutral-900">{customer.name}</div>
                        <div className="text-xs text-neutral-400 font-mono mt-0.5">ID: {customer.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-neutral-600">
                        <Mail size={14} className="text-neutral-400" /> <span dir="ltr">{customer.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-neutral-600">
                        <Phone size={14} className="text-neutral-400" /> <span dir="ltr">{customer.phone || 'غير محدد'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-neutral-600">
                    <div className="flex items-center gap-2">
                       <Calendar size={14} className="text-neutral-400" />
                       {new Date(customer.createdAt).toLocaleDateString('ar-YE', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border transition-colors ${customer.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                      {customer.status === 'active' ? 'نشط' : 'محظور'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-end">
                    <button 
                      onClick={() => toggleStatus(customer.id, customer.status)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${customer.status === 'active' ? 'bg-white text-red-600 border-red-200 hover:bg-red-50' : 'bg-white text-green-600 border-green-200 hover:bg-green-50'}`}
                    >
                      {customer.status === 'active' ? 'حظر الحساب' : 'تفعيل الحساب'}
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-neutral-500 font-medium">
                    لا يوجد نتائج مطابقة للبحث
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
