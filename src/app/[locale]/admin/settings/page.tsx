import { getAllAmenities } from '@/actions/amenities';
import SettingsClient from './SettingsClient';

export const metadata = { title: 'الإعدادات العامة | مساري' };

export default async function SettingsPage() {
  const res = await getAllAmenities();
  const amenities = res.success ? res.data : [];

  return <SettingsClient initialAmenities={amenities || []} />;
}
