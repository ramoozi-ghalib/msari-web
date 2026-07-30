import { getAllCities } from '@/actions/cities';
import DestinationsManagementClient from './DestinationsManagementClient';

export const metadata = { title: 'إدارة الوجهات والمدن | مساري' };

export default async function DestinationsPage() {
  const cities = await getAllCities();

  return (
    <DestinationsManagementClient initialCities={cities} />
  );
}
