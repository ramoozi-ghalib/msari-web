import { notFound } from 'next/navigation';
import { getHotelBySlug } from '@/actions/hotels';
import { apiClient } from '@/lib/api-client';
import RoomDetailClient from './RoomDetailClient';

interface Props {
  params: Promise<{ slug: string; roomId: string }>;
}

export async function generateMetadata(props: Props) {
  const { slug, roomId } = await props.params;
  const hotel = await getHotelBySlug(slug);

  if (!hotel) return { title: 'غرفة غير موجودة | مساري' };
  
  const room = hotel.rooms?.find(r => r.id === roomId);
  if (!room) return { title: `${hotel.name} | مساري` };

  const pageUrl = `https://msari.net/ar/hotels/${slug}/rooms/${roomId}`;
  const title = `${room.name} - ${hotel.name} | مساري`;
  const description = room.description || `احجز ${room.name} في ${hotel.name} بأفضل الأسعار.`;

  return {
    title,
    description,
    alternates: { canonical: pageUrl },
    openGraph: { title, description, url: pageUrl },
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
