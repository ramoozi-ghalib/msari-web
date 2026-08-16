/**
 * booking/page.tsx — Server Component (Entry Point)
 *
 * [FIX C-3] هذه الصفحة أصبحت Server Component.
 * تجلب بيانات الفندق مباشرة من Server Action بدلاً من fetch() client-side.
 *
 * السابق: BookingPage كانت Client Component تستدعي fetch('/api/hotels/slug')
 * في useEffect — يسبب loading spinner عند كل دخول ولا يستفيد من SSR.
 *
 * الآن: بيانات الفندق جاهزة قبل وصول الـ HTML للمتصفح.
 */
import { redirect } from 'next/navigation';
import Link from 'next/link';
import BookingPage from './BookingPage';
import { getHotelBySlug } from '@/actions/hotels';
import { auth } from '@/auth';
import { db } from '@/lib/firebase-admin';

function isValidDateString(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function buildBackUrl(input: {
  hotelSlug?: string | null;
  roomId?: string;
  city?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  message: string;
}) {
  const { hotelSlug, roomId, city, checkIn, checkOut, guests, message } = input;
  const params = new URLSearchParams();

  if (city) params.set('city', city);
  if (checkIn) params.set('checkIn', checkIn);
  if (checkOut) params.set('checkOut', checkOut);
  if (guests && Number.isFinite(guests) && guests > 0) {
    params.set('guests', String(guests));
  }
  params.set('bookingError', message);

  if (hotelSlug && roomId) {
    return `/hotels/${hotelSlug}/rooms/${roomId}?${params.toString()}`;
  }
  if (hotelSlug) {
    return `/hotels/${hotelSlug}?${params.toString()}`;
  }
  return `/hotels?${params.toString()}`;
}

export default async function Page(props: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await props.searchParams;
  const { locale } = await props.params;

  const city = typeof params.city === 'string' ? params.city : undefined;
  const hotelSlug = typeof params.hotel === 'string' ? params.hotel : null;
  const hotelIdParam = typeof params.hotelId === 'string' ? params.hotelId : null;
  const roomId = typeof params.room === 'string' ? params.room : undefined;
  const checkIn = typeof params.checkIn === 'string' ? params.checkIn : '';
  const checkOut = typeof params.checkOut === 'string' ? params.checkOut : '';
  const guests = typeof params.guests === 'string' ? Number(params.guests) : NaN;

  // ── Auth User Verification Check ──
  const session = await auth();
  if (!session?.user) {
    const bookingParams = new URLSearchParams();
    if (city) bookingParams.set('city', city);
    if (hotelSlug) bookingParams.set('hotel', hotelSlug);
    if (hotelIdParam) bookingParams.set('hotelId', hotelIdParam);
    if (roomId) bookingParams.set('room', roomId);
    if (checkIn) bookingParams.set('checkIn', checkIn);
    if (checkOut) bookingParams.set('checkOut', checkOut);
    if (Number.isFinite(guests)) bookingParams.set('guests', String(guests));

    const currentPath = `/booking?${bookingParams.toString()}`;
    const loginUrl = `/${locale}/login?redirect=${encodeURIComponent(currentPath)}`;
    const registerUrl = `/${locale}/register?redirect=${encodeURIComponent(currentPath)}`;

    return (
      <div className="min-h-screen bg-[#f8f8fa] flex items-center justify-center px-4 py-24">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-neutral-100/80 text-center animate-scale-in">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-6 border border-amber-100 shadow-sm">
            <span className="text-3xl">🔑</span>
          </div>
          <h2 className="text-xl font-black text-neutral-900 mb-2">تسجيل الدخول مطلوب</h2>
          <p className="text-neutral-600 text-sm mb-8 leading-7 font-bold">
            لإتمام الحجز يرجى تسجيل الدخول أولاً
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href={loginUrl}
              className="w-full text-white font-black text-base py-3.5 rounded-xl transition-all duration-200 shadow-md hover:opacity-90 hover:-translate-y-0.5 text-center flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#23096e,#3A1C8F)' }}
            >
              تسجيل الدخول
            </Link>
            <Link
              href={registerUrl}
              className="w-full bg-white text-neutral-700 font-bold text-base py-3.5 rounded-xl border border-neutral-200 transition-all hover:bg-neutral-50 text-center flex items-center justify-center"
            >
              إنشاء حساب جديد
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!hotelSlug || !checkIn || !checkOut || !Number.isFinite(guests) || guests < 1) {
    redirect(
      buildBackUrl({
        hotelSlug,
        roomId,
        city,
        checkIn,
        checkOut,
        guests: Number.isFinite(guests) ? guests : undefined,
        message: 'يرجى استكمال بيانات الحجز (الفندق، التواريخ، وعدد الضيوف).',
      })
    );
  }

  if (!isValidDateString(checkIn) || !isValidDateString(checkOut)) {
    redirect(
      buildBackUrl({
        hotelSlug,
        roomId,
        city,
        checkIn,
        checkOut,
        guests,
        message: 'صيغة التواريخ غير صحيحة. يرجى اختيار التواريخ مرة أخرى.',
      })
    );
  }

  const checkInDate = new Date(`${checkIn}T12:00:00.000Z`);
  const checkOutDate = new Date(`${checkOut}T12:00:00.000Z`);
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime()) || checkOutDate <= checkInDate || checkInDate < now) {
    redirect(
      buildBackUrl({
        hotelSlug,
        roomId,
        city,
        checkIn,
        checkOut,
        guests,
        message: 'تواريخ الإقامة غير صالحة. يرجى اختيار تاريخ وصول ومغادرة صحيحين.',
      })
    );
  }

  const nights = Math.max(
    1,
    Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / 86_400_000)
  );

  // [FIX C-3] جلب الفندق server-side — لا fetch() في الـ Client
  const hotel = hotelSlug ? await getHotelBySlug(hotelSlug) : null;

  if (!hotel) {
    redirect(
      buildBackUrl({
        city,
        checkIn,
        checkOut,
        guests,
        message: 'الفندق المطلوب غير متاح حالياً. اختر فندقاً آخر للمتابعة.',
      })
    );
  }

  if (hotelIdParam && hotel.id !== hotelIdParam) {
    redirect(
      buildBackUrl({
        hotelSlug,
        roomId,
        city,
        checkIn,
        checkOut,
        guests,
        message: 'بيانات الفندق غير متطابقة. يرجى إعادة اختيار الفندق.',
      })
    );
  }

  const selectedRoom = roomId ? hotel.rooms.find((room) => room.id === roomId) : undefined;

  if (roomId && !selectedRoom) {
    redirect(
      buildBackUrl({
        hotelSlug,
        roomId,
        city,
        checkIn,
        checkOut,
        guests,
        message: 'الغرفة المختارة غير موجودة أو لم تعد متاحة. يرجى اختيار غرفة أخرى.',
      })
    );
  }

  // ── Fetch active bank accounts dynamically from Firestore ──
  let bankAccounts: any[] = [];
  try {
    const snap = await db.collection('bank_accounts')
      .where('isActive', '==', true)
      .orderBy('sortOrder', 'asc')
      .get();
    bankAccounts = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching bank accounts from Firestore:', error);
  }

  const initialUserData = session?.user ? {
    name: session.user.name || '',
    email: session.user.email || '',
    phone: session.user.phone || '',
  } : undefined;

  return (
    <BookingPage
      hotel={hotel}
      city={city || hotel.city}
      hotelId={hotel.id}
      roomId={selectedRoom?.id}
      roomName={selectedRoom?.name}
      checkIn={checkIn}
      checkOut={checkOut}
      guests={guests}
      nights={nights}
      bankAccounts={bankAccounts}
      initialUser={initialUserData}
    />
  );
}
