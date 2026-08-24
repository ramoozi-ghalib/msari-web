import { Metadata } from 'next';
import { requireAuth } from '@/lib/session';
import { db, admin } from '@/lib/firebase-admin';
import ProfileClient from './ProfileClient';

export const metadata: Metadata = {
  title: 'الملف الشخصي | مساري',
  description: 'إدارة وتفاصيل الملف الشخصي لحسابك في منصة مساري.',
  robots: {
    index: false,
    follow: false,
  },
};

interface ProfilePageProps {
  params: Promise<{ locale: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { locale } = await params;
  const user = await requireAuth(locale);

  const enrichedUser = { ...user };

  try {
    if (user.id) {
      // 1. Check in 'customers' collection (where regular users/customers are stored)
      const custDoc = await db.collection('customers').doc(user.id).get();
      if (custDoc.exists) {
        const d = custDoc.data();
        if (d) {
          const freshImg = d.profileImageUrl || d.photoURL || d.photoUrl || d.image || d.avatarUrl || '';
          const freshName = `${d.firstName || ''} ${d.lastName || ''}`.trim() || d.name || d.displayName || '';
          const freshPhone = d.phoneNumber || d.phone || '';

          if (freshImg) enrichedUser.image = freshImg;
          if (freshName) enrichedUser.name = freshName;
          if (freshPhone) enrichedUser.phone = freshPhone;
        }
      } else {
        // 2. Check in 'admins' collection
        const adminDoc = await db.collection('admins').doc(user.id).get();
        if (adminDoc.exists) {
          const d = adminDoc.data();
          if (d) {
            const freshImg = d.profileImageUrl || d.photoURL || d.photoUrl || d.image || '';
            const freshName = `${d.first_name || ''} ${d.last_name || ''}`.trim() || d.name || '';
            const freshPhone = d.phone || d.phoneNumber || '';

            if (freshImg) enrichedUser.image = freshImg;
            if (freshName) enrichedUser.name = freshName;
            if (freshPhone) enrichedUser.phone = freshPhone;
          }
        } else {
          // 3. Fallback to Firebase Auth
          try {
            const authUser = await admin.auth().getUser(user.id);
            if (authUser.photoURL) enrichedUser.image = authUser.photoURL;
            if (authUser.displayName && !enrichedUser.name) enrichedUser.name = authUser.displayName;
            if (authUser.phoneNumber && !enrichedUser.phone) enrichedUser.phone = authUser.phoneNumber;
          } catch {
            // ignore
          }
        }
      }
    }
  } catch (err) {
    console.warn('[ProfilePage] Failed to fetch customer document from Firestore:', err);
  }

  return <ProfileClient user={enrichedUser} locale={locale} />;
}
