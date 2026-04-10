import type { Metadata } from 'next';
import Link from 'next/link';
import { Tag, Clock, Hotel, Plane, Car, ArrowLeft, Zap, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'العروض والخصومات — مساري',
  description: 'اكتشف أفضل العروض والخصومات الحصرية على الفنادق اليمنية والمحلية، رحلات الطيران، وخدمات السيارات.',
};

const featuredOffers = [
  {
    id: '1',
    title: 'عروض الصيف الكبرى ٢٠٢٥',
    desc: 'خصومات حتى ٤٠٪ على أفضل الفنادق في صنعاء وعدن',
    discount: '40%',
    validUntil: '٣١ أغسطس ٢٠٢٥',
    category: 'فنادق',
    icon: Hotel,
    color: 'from-[#23096e] to-[#3A1C8F]',
    emoji: '🏨',
    href: '/hotels',
  },
  {
    id: '2',
    title: 'احجز مبكراً ووفّر أكثر',
    desc: 'احجز قبل ٣٠ يوم واحصل على خصم ٣٠٪ تلقائياً',
    discount: '30%',
    validUntil: 'مستمر',
    category: 'فنادق',
    icon: Clock,
    color: 'from-amber-500 to-orange-600',
    emoji: '⏰',
    href: '/hotels',
  },
  {
    id: '3',
    title: 'باقة الطيران + الفندق',
    desc: 'وفّر أكثر عند حجز الطيران والإقامة معاً',
    discount: '25%',
    validUntil: 'ديسمبر ٢٠٢٥',
    category: 'باقات',
    icon: Plane,
    color: 'from-blue-600 to-indigo-700',
    emoji: '✈️',
    href: '/flights',
  },
  {
    id: '4',
    title: 'خصم تاكسي المطار',
    desc: 'أول رحلة استقبال من المطار بخصم ٢٠٪',
    discount: '20%',
    validUntil: 'مستمر',
    category: 'سيارات',
    icon: Car,
    color: 'from-green-600 to-emerald-700',
    emoji: '🚗',
    href: '/cars',
  },
];

const regularOffers = [
  { title: 'فندق موفنبيك صنعاء', city: 'صنعاء', discount: 20, price: 68, originalPrice: 85, stars: 5, href: '/hotels/movenpick-sanaa' },
  { title: 'فندق عزيزي عدن', city: 'عدن', discount: 15, price: 56, originalPrice: 66, stars: 4, href: '/hotels/azizi-aden' },
  { title: 'فندق بلقيس تعز', city: 'تعز', discount: 10, price: 36, originalPrice: 40, stars: 4, href: '/hotels/bilqis-taiz' },
  { title: 'فندق الغاردن مأرب', city: 'مأرب', discount: 25, price: 30, originalPrice: 40, stars: 3, href: '/hotels/garden-marib' },
];

export default function OffersPage() {
  return (
    <div className="min-h-screen bg-[#f8f8fa]">

      {/* Hero */}
      <section className="relative pt-28 pb-24 bg-gradient-to-br from-[#23096e] via-[#2d1580] to-[#3A1C8F] overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4z'/%3E%3C/g%3E%3C/svg%3E")` }}
        />
        <div className="container-msari relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/90 text-sm font-medium mb-6 border border-white/20">
            <Tag size={14} />
            عروض حصرية محدودة المدة
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4">العروض والخصومات</h1>
          <p className="text-white/80 text-xl max-w-xl mx-auto">
            وفّر أكثر مع عروض مساري الحصرية على الفنادق، الطيران، والنقل
          </p>
        </div>
      </section>

      {/* Featured Offers */}
      <section className="container-msari -mt-10 relative z-10 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featuredOffers.map((offer) => (
            <Link
              key={offer.id}
              href={offer.href}
              className={`relative bg-gradient-to-br ${offer.color} rounded-3xl p-8 text-white overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group`}
            >
              <div className="absolute -top-6 -right-6 text-8xl opacity-20 group-hover:opacity-30 transition-opacity duration-300">
                {offer.emoji}
              </div>
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <offer.icon size={24} />
                  </div>
                  <div className="bg-white/20 border border-white/30 px-3 py-1 rounded-full text-sm font-bold">
                    خصم {offer.discount}
                  </div>
                </div>
                <h3 className="text-xl font-black mb-2">{offer.title}</h3>
                <p className="text-white/80 text-sm mb-4 leading-relaxed">{offer.desc}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white/70 text-xs">
                    <Clock size={12} />
                    صالح حتى: {offer.validUntil}
                  </div>
                  <div className="flex items-center gap-1 text-sm font-bold group-hover:gap-2 transition-all duration-300">
                    احجز الآن <ArrowLeft size={16} className="rtl:rotate-180" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Hotel Discounts */}
      <section className="container-msari mb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-neutral-900">فنادق بأسعار مخفضة</h2>
            <p className="text-neutral-500 text-sm mt-1">اغتنم هذه العروض قبل نفادها</p>
          </div>
          <Link href="/hotels" className="text-[#23096e] font-bold text-sm hover:underline flex items-center gap-1">
            عرض الكل <ArrowLeft size={14} className="rtl:rotate-180" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {regularOffers.map((offer) => (
            <Link
              key={offer.title}
              href={offer.href}
              className="bg-white rounded-2xl overflow-hidden shadow-md border border-neutral-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
            >
              {/* Image placeholder */}
              <div className="h-44 bg-gradient-to-br from-[#23096e]/20 to-[#3A1C8F]/30 relative flex items-center justify-center">
                <Hotel size={48} className="text-[#23096e]/30" />
                <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-black px-2.5 py-1 rounded-full">
                  خصم {offer.discount}٪
                </div>
                <div className="absolute top-3 right-3 flex">
                  {Array.from({ length: offer.stars }).map((_, i) => (
                    <span key={i} className="text-amber-400 text-xs">★</span>
                  ))}
                </div>
              </div>
              <div className="p-4">
                <div className="text-xs text-neutral-400 mb-1">{offer.city}</div>
                <h3 className="font-bold text-neutral-900 text-sm mb-3 line-clamp-1 group-hover:text-[#23096e] transition-colors duration-300">{offer.title}</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-neutral-400 line-through">${offer.originalPrice}</span>
                    <div className="text-[#23096e] font-black text-lg">${offer.price}</div>
                    <span className="text-xs text-neutral-400">/ ليلة</span>
                  </div>
                  <span className="text-xs bg-[#23096e]/10 text-[#23096e] font-bold px-3 py-1.5 rounded-xl">احجز</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Why Book With Us */}
      <section className="bg-[#23096e] py-16 mb-0">
        <div className="container-msari">
          <h2 className="text-2xl font-black text-white text-center mb-10">لماذا تحجز مع مساري؟</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: 'أفضل الأسعار مضمونة', desc: 'نضمن لك أقل سعر أو نسترد الفرق' },
              { icon: Shield, title: 'حجز آمن وموثوق', desc: 'دفع آمن ومعتمد من أفضل الفنادق' },
              { icon: Clock, title: 'تأكيد فوري', desc: 'تأكيد الحجز خلال دقائق عبر واتساب' },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
                  <item.icon size={26} className="text-white" />
                </div>
                <h3 className="font-black text-white text-lg mb-2">{item.title}</h3>
                <p className="text-white/70 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
