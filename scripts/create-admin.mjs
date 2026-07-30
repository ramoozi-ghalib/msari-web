/**
 * create-admin.mjs — إنشاء حساب مدير النظام
 * Run: node scripts/create-admin.mjs
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({ log: ['error'] });

// ─── بيانات الأدمن ─────────────────────────────────────────────────────────
const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    || 'admin@msari.net';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Msari@Admin2024';
const ADMIN_NAME     = 'مدير النظام';

async function main() {
  console.log('='.repeat(50));
  console.log('  CREATE ADMIN USER — MSARI');
  console.log('='.repeat(50));
  console.log(`\n📧 Email    : ${ADMIN_EMAIL}`);
  console.log(`🔑 Password : ${ADMIN_PASSWORD}`);

  // تحقق من وجود المستخدم مسبقاً
  const existing = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
    select: { id: true, role: true, email: true },
  });

  if (existing) {
    console.log(`\n⚠️  المستخدم موجود بالفعل (role: ${existing.role})`);

    // تحديث الـ role إلى SUPER_ADMIN إذا لم يكن كذلك
    if (existing.role !== 'SUPER_ADMIN') {
      await prisma.user.update({
        where: { email: ADMIN_EMAIL },
        data: {
          role: 'SUPER_ADMIN',
          passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 12),
        },
      });
      console.log('✅ تم ترقية الحساب إلى SUPER_ADMIN وتحديث كلمة المرور.');
    } else {
      // فقط حدّث كلمة المرور
      await prisma.user.update({
        where: { email: ADMIN_EMAIL },
        data: { passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 12) },
      });
      console.log('✅ تم تحديث كلمة المرور.');
    }
  } else {
    // إنشاء مستخدم جديد
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
    const user = await prisma.user.create({
      data: {
        email:        ADMIN_EMAIL,
        name:         ADMIN_NAME,
        passwordHash,
        role:         'SUPER_ADMIN',
        isActive:     true,
      },
    });
    console.log(`\n✅ تم إنشاء حساب الأدمن: ${user.id}`);
  }

  // التحقق النهائي
  const admin = await prisma.user.findUnique({
    where:  { email: ADMIN_EMAIL },
    select: { id: true, email: true, name: true, role: true, isActive: true },
  });
  console.log('\n📋 بيانات الحساب:');
  console.table([admin]);

  console.log('\n✅ يمكنك الآن تسجيل الدخول على:');
  console.log('   http://localhost:3000/ar/auth/login');
  console.log(`   Email    : ${ADMIN_EMAIL}`);
  console.log(`   Password : ${ADMIN_PASSWORD}`);
  console.log('\n   ثم انتقل إلى:');
  console.log('   http://localhost:3000/ar/admin\n');
}

main()
  .catch(e => { console.error('\n[FATAL]', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
