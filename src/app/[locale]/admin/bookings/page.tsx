'use client';

import { useState } from 'react';
import { 
  Building, Plane, Car, Search, Filter,
  CheckCircle2, XCircle, Eye, Download, Info, MessageCircle
} from 'lucide-react';

// --- MOCK MNGMT DATA ---
const MOCK_BOOKINGS = [
  {
    id: 'BKG-7812',
    user: 'أحمد عبدالله',
    phone: '+967 771 234 567',
    type: 'hotel',
    target: 'فندق تاج سبأ',
    date: '2023-11-15',
    amount: 120,
    status: 'pending', // pending, confirmed, cancelled
    paymentMethod: 'bank_transfer',
    receiptUrl: 'https://via.placeholder.com/400x600?text=Bank+Receipt',
    timestamp: 'منذ ساعتين'
  },
  {
    id: 'BKG-7811',
    user: 'محمد صالح',
    phone: '+967 733 998 877',
    type: 'flight',
    target: 'صنعاء (SAH) - القاهرة (CAI)',
    date: '2023-11-14',
    amount: 450,
    status: 'confirmed',
    paymentMethod: 'bank_transfer',
    receiptUrl: null,
    timestamp: 'منذ يوم'
  },
  {
    id: 'BKG-7810',
    user: 'سارة خالد',
    phone: '+967 711 222 333',
    type: 'car',
    target: 'توصيل مطار سيئون - تريم',
    date: '2023-11-14',
    amount: 35,
    status: 'cancelled',
    paymentMethod: 'cash',
    receiptUrl: null,
    timestamp: 'منذ يومين'
  },
  {
    id: 'BKG-7809',
    user: 'عمر اليماني',
    phone: '+967 777 666 555',
    type: 'hotel',
    target: 'فندق ميركيور عدن',
    date: '2023-11-12',
    amount: 250,
    status: 'pending',
    paymentMethod: 'bank_transfer',
    receiptUrl: 'https://via.placeholder.com/400x600?text=Bank+Receipt',
    timestamp: 'منذ 3 أيام'
  }
];

export default function BookingsManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'hotels' | 'flights' | 'cars'>('all');
  const [selectedBooking, setSelectedBooking] = useState<typeof MOCK_BOOKINGS[number] | null>(null);

  const filteredBookings = MOCK_BOOKINGS.filter(b => {
    const matchSearch = b.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        b.user.includes(searchTerm) || 
                        b.target.includes(searchTerm);
    const matchType = activeFilter === 'all' || 
                      (activeFilter === 'pending' && b.status === 'pending') ||
                      (activeFilter === 'hotels' && b.type === 'hotel') ||
                      (activeFilter === 'flights' && b.type === 'flight') ||
                      (activeFilter === 'cars' && b.type === 'car');
    
    return matchSearch && matchType;
  });

  const getTypeStyle = (type: string) => {
    switch(type) {
      case 'hotel': return { icon: Building, color: 'text-blue-600 bg-blue-50', label: 'فندق' };
      case 'flight': return { icon: Plane, color: 'text-purple-600 bg-purple-50', label: 'طيران' };
      case 'car': return { icon: Car, color: 'text-amber-600 bg-amber-50', label: 'سيارة' };
      default: return { icon: Building, color: 'text-neutral-600 bg-neutral-50', label: 'أخرى' };
    }
  };

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-neutral-100 text-neutral-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'pending': return 'قيد المراجعة';
      case 'confirmed': return 'مؤكد';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  return (
    <div className="pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 mb-1">إدارة الحجوزات</h1>
          <p className="text-neutral-500 font-medium">مراجعة وتأكيد الحجوزات الواردة وإشعارات التحويل البنكي</p>
        </div>
        
        <div className="flex bg-white rounded-xl shadow-sm border border-neutral-100 p-1">
          <button 
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeFilter==='all' ? 'bg-[#23096e] text-white' : 'text-neutral-500 hover:bg-neutral-50'}`}>
            الكل
          </button>
          <button 
            onClick={() => setActiveFilter('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeFilter==='pending' ? 'bg-[#23096e] text-white' : 'text-neutral-500 hover:bg-neutral-50'}`}>
            بانتظار المراجعة
          </button>
          <button 
            onClick={() => setActiveFilter('hotels')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeFilter==='hotels' ? 'bg-[#23096e] text-white' : 'text-neutral-500 hover:bg-neutral-50'}`}>
            فنـادق
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-t-2xl shadow-sm border border-neutral-100 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-b-0">
        <div className="relative w-full sm:w-96">
          <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input 
            type="text"
            placeholder="البحث برقم الحجز، اسم العميل..."
            className="w-full pl-4 pr-10 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:border-[#23096e] focus:bg-white text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-neutral-50 text-neutral-700 rounded-xl border border-neutral-200 hover:bg-neutral-100 font-bold text-sm">
          <Filter size={16} /> فلترة متقدمة
        </button>
      </div>

      {/* Table */}
      <div className="bg-white shadow-sm border border-neutral-100 rounded-b-2xl overflow-x-auto">
        <table className="w-full text-start">
          <thead className="bg-neutral-50 border-b border-neutral-100 text-neutral-500 text-sm font-bold">
            <tr>
              <th className="py-4 px-6 text-start">رقم الحجز</th>
              <th className="py-4 px-6 text-start">العميل</th>
              <th className="py-4 px-6 text-start">الخدمة</th>
              <th className="py-4 px-6 text-start">المبلغ</th>
              <th className="py-4 px-6 text-start">الحالة</th>
              <th className="py-4 px-6 text-start">تاريخ الحجز</th>
              <th className="py-4 px-6 text-end">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filteredBookings.map((booking) => {
              const typeStyling = getTypeStyle(booking.type);
              const TypeIcon = typeStyling.icon;
              return (
                <tr key={booking.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="py-4 px-6">
                    <span className="font-bold text-[#23096e]">{booking.id}</span>
                    {booking.paymentMethod === 'bank_transfer' && (
                      <div className="text-[10px] text-neutral-400 font-bold mt-1">حوالة بنكية</div>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-bold text-neutral-900">{booking.user}</div>
                    <div className="text-xs text-neutral-500">{booking.phone}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${typeStyling.color}`}>
                        <TypeIcon size={16} />
                      </div>
                      <div>
                        <div className="font-bold text-neutral-800 text-sm">{typeStyling.label}</div>
                        <div className="text-xs text-neutral-500 truncate max-w-[150px]">{booking.target}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-black text-neutral-900">${booking.amount}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusStyle(booking.status)}`}>
                      {getStatusLabel(booking.status)}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-neutral-500">
                    <div>{booking.date}</div>
                    <div className="text-xs">{booking.timestamp}</div>
                  </td>
                  <td className="py-4 px-6 text-end">
                    <button 
                      onClick={() => setSelectedBooking(booking)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#23096e]/5 text-[#23096e] hover:bg-[#23096e]/10 rounded-lg text-sm font-bold transition-colors">
                      <Eye size={16} /> عرض
                    </button>
                  </td>
                </tr>
              )
            })}
            
            {filteredBookings.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-neutral-500">
                  لا توجد حجوزات تطابق بحثك
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- Modal / Drawer --- */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm" onClick={() => setSelectedBooking(null)}></div>
          
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in duration-200">
            
            {/* Left side: Guide (If bank transfer) */}
            <div className="w-full md:w-2/5 bg-neutral-50 border-e border-neutral-100 p-8 flex flex-col justify-center text-center">
              <h3 className="font-black text-neutral-900 mb-6 flex items-center justify-center gap-2 text-lg">
                <Info size={20} className="text-[#23096e]" /> إجراءات الدفع
              </h3>
              
              {selectedBooking.paymentMethod === 'bank_transfer' ? (
                <div className="bg-white rounded-2xl border border-neutral-200 p-8 shadow-sm">
                  <div className="w-16 h-16 bg-[#23096e]/10 text-[#23096e] rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle size={28} />
                  </div>
                  <h4 className="font-bold text-neutral-900 text-lg mb-2">حوالة بنكية</h4>
                  <p className="text-neutral-500 text-sm leading-relaxed mb-6">
                    العميل اختار الدفع عبر حوالة بنكية. يرجى مراجعة رسائل تطبيق <strong>الواتساب</strong> للرقم المخصص لخدمة العملاء للتأكد من إرسال العميل لإشعار التحويل المرفق برقم الحجز:
                  </p>
                  <div className="bg-neutral-50 py-3 px-4 rounded-xl border border-neutral-100 inline-block">
                    <span className="font-black text-[#23096e] text-xl tracking-wider">{selectedBooking.id}</span>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-neutral-200 p-8 shadow-sm">
                  <h4 className="font-bold text-neutral-900 text-lg mb-2">الدفع الإلكتروني / نقداً</h4>
                  <p className="text-neutral-500 text-sm leading-relaxed">
                    هذا الحجز لا يتطلب المطابقة اليدوية عبر الواتساب.
                  </p>
                </div>
              )}
            </div>

            {/* Right side: Booking Details */}
            <div className="flex-1 flex flex-col h-full max-h-[60vh] md:max-h-none overflow-y-auto">
              <div className="p-8 pb-4 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2.5 py-1 inline-flex rounded-md text-xs font-black ${getStatusStyle(selectedBooking.status)}`}>
                      {getStatusLabel(selectedBooking.status)}
                    </span>
                    <span className="text-xs text-neutral-400 font-bold">{selectedBooking.timestamp}</span>
                  </div>
                  <h2 className="text-3xl font-black text-neutral-900">{selectedBooking.id}</h2>
                </div>
                <button onClick={() => setSelectedBooking(null)} className="p-2 hover:bg-neutral-100 rounded-full text-neutral-400 transition-colors">
                  <XCircle size={24} />
                </button>
              </div>

              <div className="px-8 py-4 space-y-6 flex-1">
                <div className="grid grid-cols-2 gap-6 bg-neutral-50 rounded-2xl p-5 border border-neutral-100">
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 uppercase mb-1 block">اسم العميل</label>
                    <p className="font-bold text-neutral-900">{selectedBooking.user}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 uppercase mb-1 block">رقم الهاتف</label>
                    <p className="font-bold text-neutral-900">{selectedBooking.phone}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase mb-1 block">الخدمة المطلوبة ({getTypeStyle(selectedBooking.type).label})</label>
                    <p className="font-bold text-neutral-900">{selectedBooking.target}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 uppercase mb-1 block">تاريخ العملية</label>
                    <p className="font-bold text-neutral-900">{selectedBooking.date}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 uppercase mb-1 block">إجمالي المبلغ</label>
                    <p className="font-black text-[#23096e] text-lg">${selectedBooking.amount}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-8 pt-4 border-t border-neutral-100 flex justify-end gap-3 mt-auto">
                {selectedBooking.status === 'pending' && (
                  <>
                    <button 
                      onClick={() => setSelectedBooking(null) /* Here we would dispatch an API call */}
                      className="px-6 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-bold text-sm transition-colors">
                      رفض / إلغاء
                    </button>
                    <button 
                      onClick={() => setSelectedBooking(null) /* Here we would dispatch an API call */}
                      className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-black text-sm transition-all shadow-md">
                      <CheckCircle2 size={18} /> تأكيد إشعار الدفع واعتماد الحجز
                    </button>
                  </>
                )}
                
                {selectedBooking.status !== 'pending' && (
                  <button 
                    onClick={() => setSelectedBooking(null)}
                    className="px-6 py-2.5 bg-neutral-100 text-neutral-700 hover:bg-neutral-200 rounded-xl font-bold text-sm border border-neutral-200 transition-colors">
                    إغلاق النافذة
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
