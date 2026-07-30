import { getHotels } from '@/actions/hotels';
import { getAllCities } from '@/actions/cities';
import { getAllAmenities } from '@/actions/amenities';
import HotelsManagementClient from './HotelsManagementClient';

export const metadata = { title: 'إدارة الفنادق | مساري' };

export default async function HotelsManagementPage() {
  // [FIX H-3] getHotels الآن تُرجع { data, total, page, pageSize }
  const [{ data: hotels }, cities, amenitiesRes] = await Promise.all([
    getHotels({ pageSize: 100 }),
    getAllCities(),
    getAllAmenities(),
  ]);

  const dbAmenities = (amenitiesRes.success && amenitiesRes.data) ? amenitiesRes.data : [];

  return (
    <HotelsManagementClient
      initialHotels={hotels}
      initialCities={cities}
      dbAmenities={dbAmenities}
    />
  );
}
