import { getHotels } from '@/actions/hotels';
import { getAllCities } from '@/actions/cities';
import { prisma } from '@/lib/prisma';
import HotelsManagementClient from './HotelsManagementClient';

export const metadata = { title: 'إدارة الفنادق | مساري' };

export default async function HotelsManagementPage() {
  // Fetch all hotels, cities and available amenities from DB sequentially
  // to avoid hitting the Supabase connection pool limit (P1001 timeout error).
  const hotels = await getHotels({ limit: 200 });
  const cities = await getAllCities();
  const dbAmenities = await prisma.amenity.findMany();

  return (
    <HotelsManagementClient 
      initialHotels={hotels} 
      initialCities={cities} 
      dbAmenities={dbAmenities}
    />
  );
}
