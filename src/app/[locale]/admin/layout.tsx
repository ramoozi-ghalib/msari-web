import AdminSidebar from '@/components/admin/AdminSidebar';
import { requireAdmin } from '@/lib/session';
import { Policies } from '@/lib/policies';

export const metadata = {
  title: 'لوحة تحكم الإدارة | مساري',
};

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // ── Defense-in-depth auth check ─────────────────────────────────────────────
  // This check runs even if middleware is bypassed (e.g. direct HTTP calls,
  // locale path variations /ar/admin vs /admin, etc.).
  // requireAdmin() reads the session from the database and verifies the role.
  // If the user is not authenticated or not an admin, they are redirected.
  const { locale } = await params;
  const user = await requireAdmin(locale);
  const isFullAdmin = Policies.isFullAdmin(user);
  // ────────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen bg-[var(--surface-page)] overflow-hidden text-neutral-900 selection:bg-[var(--brand-primary)]/20" dir="rtl">
      {/* Sidebar */}
      <AdminSidebar isFullAdmin={isFullAdmin} />
      
      {/* Main Content Canvas */}
      <main className="flex-1 overflow-y-auto relative">
        {/* Admin Header */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-neutral-200/60 px-8 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-neutral-800">مرحباً بك، {isFullAdmin ? 'مدير النظام' : 'موظف الحجوزات'} 👋</h2>
            <p className="text-xs text-neutral-500">
              {isFullAdmin ? 'تم تسجيل الدخول بحساب الإدارة الكاملة' : 'تم تسجيل الدخول بحساب إدارة الحجوزات'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/20 flex items-center justify-center text-[var(--brand-primary)] font-bold">
            {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

