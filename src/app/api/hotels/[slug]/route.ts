/**
 * /api/hotels/[slug] — REST endpoint للحصول على بيانات فندق بالـ slug.
 *
 * [FIX H-4] إضافة Rate Limiting بـ IP — يمنع استنزاف DB بطلبات آلية.
 * الحد: 60 طلب/دقيقة لكل IP — يتيح الاستخدام الطبيعي ويوقف الـ bots.
 *
 * ملاحظة: هذا الـ endpoint لا يزال مطلوباً للـ backward compatibility.
 * الكود الجديد يستخدم getHotelBySlug() مباشرة في Server Components.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getHotelBySlug } from '@/actions/hotels';
import { publicApiLimiter, getClientIp } from '@/lib/rate-limiter';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  // [FIX H-4] Rate limiting per IP
  const ip     = getClientIp(req.headers);
  const { success } = await publicApiLimiter.limit(ip);

  if (!success) {
    return NextResponse.json(
      { error: 'تم تجاوز الحد الأقصى للطلبات. يرجى الانتظار قبل المحاولة مجدداً.' },
      {
        status: 429,
        headers: { 'Retry-After': '60' },
      }
    );
  }

  const { slug } = await params;
  const hotel = await getHotelBySlug(slug);

  if (!hotel) {
    return NextResponse.json({ error: 'Hotel not found' }, { status: 404 });
  }

  return NextResponse.json(hotel);
}
