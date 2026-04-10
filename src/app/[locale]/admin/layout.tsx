import AdminSidebar from '@/components/admin/AdminSidebar';
import { requireAdmin } from '@/lib/session';

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
  await requireAdmin(locale);
  // ────────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen bg-[#f8f8fa] overflow-hidden text-neutral-900 selection:bg-[#23096e]/20" dir="rtl">
      {/* Sidebar */}
      <AdminSidebar />
      
      {/* Main Content Canvas */}
      <main className="flex-1 overflow-y-auto relative">
        {/* Admin Header */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-neutral-200/60 px-8 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-neutral-800">مرحباً بك، مدير النظام 👋</h2>
            <p className="text-xs text-neutral-500">تم تسجيل الدخول بحساب الإدارة الكاملة</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#23096e]/10 border border-[#23096e]/20 flex items-center justify-center text-[#23096e] font-bold">
            A
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

