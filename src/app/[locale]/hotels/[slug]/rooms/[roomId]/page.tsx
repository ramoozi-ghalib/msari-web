import { notFound } from 'next/navigation';
import { getHotelBySlug } from '@/actions/hotels';
import { apiClient } from '@/lib/api-client';
import RoomDetailClient from './RoomDetailClient';

import { getLocalizedAlternates } from '@/lib/seo';

interface Props {
  params: Promise<{ locale: string; slug: string; roomId: string }>;
}

export async function generateMetadata(props: Props) {
  const { locale, slug, roomId } = await props.params;
  const hotel = await getHotelBySlug(slug);

  if (!hotel) return { title: 'غرفة غير موجودة | مساري' };
  
  const room = hotel.rooms?.find(r => r.id === roomId);
  if (!room) return { title: `${hotel.name} | مساري` };

  const path = `/hotels/${slug}/rooms/${roomId}`;
  const title = `${room.name} - ${hotel.name} | مساري`;
  const description = room.description || `احجز ${room.name} في ${hotel.name} بأفضل الأسعار.`;

  return {
    title,
    description,
    alternates: getLocalizedAlternates(path, locale),
    openGraph: { 
      title, 
      description, 
      url: `https://msari.net/${locale || 'ar'}${path}` 
    },
  };
}

export default async function RoomDetailPage(props: Props) {
  const { slug, roomId } = await props.params;
  const hotel = await getHotelBySlug(slug);

  if (!hotel) {
    notFound();
  }

  // البحث عن الغرفة ضمن الفندق المحمل أولاً
  let room = hotel.rooms?.find(r => r.id === roomId);

  // إذا لم نجدها، نقوم بجلب قائمة غرف الفندق مباشرة من الـ API كحالة احتياطية
  if (!room) {
    const rooms = await apiClient.getRooms(hotel.id);
    room = rooms.find(r => r.id === roomId);

    if (!room) {
      notFound();
    }
  }

  return <RoomDetailClient hotel={hotel} room={room} />;
}
