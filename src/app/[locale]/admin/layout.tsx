import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/session';
import AdminNavClient from './AdminNavClient';

export const metadata: Metadata = {
  title: 'لوحة التحكم الإدارية — مساري CMS',
  robots: {
    index: false,
    follow: false,
  },
};

interface AdminLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
}

export default async function AdminLayout({ children, params }: AdminLayoutProps) {
  const { locale } = await params;

  // ── Authenticated Server Guard ──────────────────────────────────────────
  // Reads session securely from database/JWT and verifies 'admin.access' policy.
  // Redirects unauthenticated users to /login and unauthorized users to /.
  const user = await requireAdmin(locale);

  return (
    <AdminNavClient locale={locale} user={user}>
      {children}
    </AdminNavClient>
  );
}
