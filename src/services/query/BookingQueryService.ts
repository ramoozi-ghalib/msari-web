import { db } from '@/lib/firebase-admin';
import { BookingStatus } from '@prisma/client';

export type AdminBookingView = {
  id: string;
  code: string;
  status: BookingStatus;
  paymentStatus: string;
  paymentMethod: string;
  paymentVerified: boolean;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  totalPrice: number;
  currency: string;
  notes: string | null;
  createdAt: string;
  hotel: { id: string; nameAr: string; nameEn: string; slug: string };
  room: { id: string; nameAr: string; nameEn: string } | null;
  user: { id: string; name: string | null; email: string | null } | null;
};

function generateSlugFromHotel(id: string, name: string): string {
  const idMap: Record<string, string> = {
    'h_movenpick': 'movenpick-hotel-sanaa',
    'h_hilton': 'hilton-sanaa',
    'h_sheraton': 'sheraton-sanaa-resort',
    'h_qamar': 'qamar-aden-hotel',
    'h_saif': 'saif-aden-hotel',
    'h_seyun': 'seyun-almukalla-hotel',
    'h_eastern': 'eastern-taiz-hotel',
    'h_seashore': 'hudaydah-seashore-hotel',
  };

  if (idMap[id]) return idMap[id];
  if (idMap[id.toLowerCase()]) return idMap[id.toLowerCase()];
  
  if (id.includes('-')) return id;

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  if (!slug || slug === '-') {
    return id;
  }
  return slug;
}

export class BookingQueryService {
  static async getAdminBookings(filters: {
    status?: BookingStatus;
    q?: string;
    cursor?: string;
    take: number;
  }): Promise<{ data: AdminBookingView[]; nextCursor?: string }> {
    
    let query: any = db.collectionGroup('entries')
      .orderBy('createdAt', 'desc');

    if (filters.status) {
      query = query.where('status', '==', filters.status.toLowerCase());
    }

    if (filters.cursor) {
      const cursorSnapshot = await db.collectionGroup('entries')
        .where('id', '==', filters.cursor)
        .limit(1)
        .get();

      if (!cursorSnapshot.empty) {
        query = query.startAfter(cursorSnapshot.docs[0]);
      }
    }

    const limitAmount = filters.q ? 200 : (filters.take + 1);
    const snapshot = await query.limit(limitAmount).get();

    const parentCache = new Map<string, any>();
    let data: AdminBookingView[] = [];

    for (const doc of snapshot.docs) {
      const bData = doc.data();
      const parentRef = doc.ref.parent.parent;
      if (!parentRef) continue;

      const parentId = parentRef.id;
      let parentData = parentCache.get(parentId);
      if (!parentData) {
        const parentSnap = await parentRef.get();
        parentData = parentSnap.exists ? parentSnap.data() : {};
        parentCache.set(parentId, parentData);
      }

      const guestName = (bData.otherGuest?.enabled && bData.otherGuest?.name) ? bData.otherGuest.name : (parentData.userName || 'عميل مساري');
      const guestEmail = parentData.userEmail || '';
      const guestPhone = (bData.otherGuest?.enabled && bData.otherGuest?.phone) ? bData.otherGuest.phone : (parentData.userPhone || '');
      const code = bData.bookingNumber || doc.id;

      if (filters.q) {
        const qLower = filters.q.toLowerCase();
        const matches = 
          code.toLowerCase().includes(qLower) ||
          guestName.toLowerCase().includes(qLower) ||
          guestEmail.toLowerCase().includes(qLower) ||
          guestPhone.toLowerCase().includes(qLower);
        
        if (!matches) continue;
      }

      const checkInDate = bData.stay?.fromDate?.toDate ? bData.stay.fromDate.toDate() : new Date((bData.stay?.fromDate?._seconds || 0) * 1000);
      const checkOutDate = bData.stay?.toDate?.toDate ? bData.stay.toDate.toDate() : new Date((bData.stay?.toDate?._seconds || 0) * 1000);
      const createdDate = bData.createdAt?.toDate ? bData.createdAt.toDate() : new Date((bData.createdAt?._seconds || 0) * 1000);

      data.push({
        id: doc.id,
        code,
        status: (bData.status || 'PENDING').toUpperCase() as BookingStatus,
        paymentStatus: (bData.payment?.status || 'PENDING').toUpperCase(),
        paymentMethod: bData.payment?.method || 'CASH',
        paymentVerified: bData.payment?.verified || false,
        guestName,
        guestEmail,
        guestPhone,
        checkIn: checkInDate.toISOString(),
        checkOut: checkOutDate.toISOString(),
        nights: bData.stay?.nightsCount || 1,
        guests: bData.stay?.guestsCount || 1,
        totalPrice: bData.pricing?.totalUsd || 0,
        currency: 'USD',
        notes: bData.notes || null,
        createdAt: createdDate.toISOString(),
        hotel: {
          id: bData.hotel?.id || '',
          nameAr: bData.hotel?.name || 'فندق',
          nameEn: bData.hotel?.name || 'Hotel',
          slug: bData.hotel?.name ? generateSlugFromHotel(bData.hotel.id, bData.hotel.name) : '',
        },
        room: bData.room ? {
          id: bData.room.id || '',
          nameAr: bData.room.name || 'غرفة',
          nameEn: bData.room.name || 'Room',
        } : null,
        user: {
          id: parentId,
          name: parentData.userName || null,
          email: parentData.userEmail || null,
        },
      });
    }

    let nextCursor: string | undefined = undefined;
    if (data.length > filters.take) {
      const nextItem = data[filters.take];
      nextCursor = nextItem.id;
      data = data.slice(0, filters.take);
    }

    return { data, nextCursor };
  }
}
