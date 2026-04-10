import { NextRequest, NextResponse } from 'next/server';
import { getHotelBySlug } from '@/actions/hotels';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const hotel = await getHotelBySlug(slug);
  if (!hotel) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(hotel);
}
