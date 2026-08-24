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

  // Fetch fresh profile data (photoURL, name, phone) from Firestore and Firebase Auth
  try {
    if (user.id && !user.id.startsWith('admin-')) {
      const userDoc = await db.collection('users').doc(user.id).get();
      if (userDoc.exists) {
        const uData = userDoc.data();
        if (uData) {
          const freshImg = uData.photoURL || uData.photoUrl || uData.avatarUrl || uData.image || uData.profilePicture || uData.avatar || '';
          const freshName = uData.displayName || uData.name || (uData.firstName ? `${uData.firstName} ${uData.lastName || ''}`.trim() : '');
          const freshPhone = uData.phoneNumber || uData.phone || '';

          if (freshImg) enrichedUser.image = freshImg;
          if (freshName && !enrichedUser.name) enrichedUser.name = freshName;
          if (freshPhone && !enrichedUser.phone) enrichedUser.phone = freshPhone;
        }
      } else {
        try {
          const authUser = await admin.auth().getUser(user.id);
          if (authUser.photoURL) enrichedUser.image = authUser.photoURL;
          if (authUser.displayName && !enrichedUser.name) enrichedUser.name = authUser.displayName;
          if (authUser.phoneNumber && !enrichedUser.phone) enrichedUser.phone = authUser.phoneNumber;
        } catch {
          // ignore auth lookup error
        }
      }
    }
  } catch (e) {
    console.warn('[ProfilePage] Error fetching user profile from database:', e);
  }

  return <ProfileClient user={enrichedUser} locale={locale} />;
}
