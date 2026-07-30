import { Activity, Wallet, BellDot, ShieldCheck, MapPin } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-black text-neutral-900 mb-8">نظرة عامة (Overview)</h1>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'إجمالي الحجوزات', value: '1,248', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
          { label: 'إجمالي الإيرادات', value: '$84,000', icon: Wallet, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
          { label: 'بانتظار الاعتماد', value: '14', icon: BellDot, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
          { label: 'مستخدمين نشطين', value: '342', icon: ShieldCheck, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
        ].map(s => (
          <div key={s.label} className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 relative overflow-hidden group">
            <div className={`w-12 h-12 rounded-xl ${s.bg} ${s.color} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
               <s.icon size={24} />
            </div>
            <p className="text-sm font-bold text-neutral-500 mb-1">{s.label}</p>
            <p className="text-3xl font-black text-neutral-900">{s.value}</p>
          </div>
        ))}
      </div>
      
      {/* Quick Actions & Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 min-h-[400px]">
           <h2 className="text-lg font-black text-neutral-900 mb-6 flex items-center gap-2">
             <Activity className="text-[#23096e]" size={20} />
             نشاط الحجوزات الأخير
           </h2>
           <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
             <Wallet size={48} className="text-neutral-300 mb-4" />
             <p className="text-neutral-500 font-medium">جدول الحجوزات قيد الإنشاء</p>
           </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
           <h2 className="text-lg font-black text-neutral-900 mb-6 flex items-center gap-2">
             <MapPin className="text-[#23096e]" size={20} />
             الوجهات الأكثر نشاطاً
           </h2>
           <div className="space-y-4">
             {[
               { city: 'صنعاء', perc: 45 },
               { city: 'عدن', perc: 30 },
               { city: 'الحديدة', perc: 15 },
               { city: 'حضرموت', perc: 10 },
             ].map(d => (
               <div key={d.city}>
                 <div className="flex justify-between text-sm font-bold mb-1.5">
                   <span className="text-neutral-700">{d.city}</span>
                   <span className="text-neutral-500">{d.perc}%</span>
                 </div>
                 <div className="w-full h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                   <div className="h-full bg-gradient-to-r from-[#23096e] to-[#3A1C8F] rounded-full" style={{ width: `${d.perc}%` }} />
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
}
