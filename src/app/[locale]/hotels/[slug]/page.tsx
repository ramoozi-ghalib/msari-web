import { notFound } from 'next/navigation';
import { getHotelBySlug } from '@/actions/hotels';
import HotelDetailClient from './HotelDetailClient';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(props: Props) {
  const { slug } = await props.params;
  const hotel = await getHotelBySlug(slug);

  if (!hotel) {
    return { title: 'فندق غير موجود | مساري' };
  }

  return {
    title: `${hotel.name} | مساري`,
    description: hotel.description || `احجز إقامتك في ${hotel.name} عبر منصة مساري بأفضل الأسعار.`,
  };
}

export default async function HotelDetailPage(props: Props) {
  const { slug } = await props.params;
  const hotel = await getHotelBySlug(slug);

  if (!hotel) {
    notFound();
  }

  return <HotelDetailClient hotel={hotel!} />;
}
