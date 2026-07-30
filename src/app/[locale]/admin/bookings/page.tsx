import { getAdminBookings } from '@/actions/bookings';
import BookingsManagementClient from './BookingsManagementClient';

export const metadata = { title: 'إدارة الحجوزات | مساري' };

export default async function BookingsManagementPage() {
  // Fetch initial page of bookings
  const res = await getAdminBookings({ pageSize: 50 });
  
  const initialBookings = res.success ? res.data : [];
  const nextCursor = res.success ? res.nextCursor : undefined;

  return (
    <BookingsManagementClient
      initialBookings={initialBookings}
      initialNextCursor={nextCursor}
    />
  );
}
