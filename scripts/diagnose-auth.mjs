/**
 * diagnose-auth.mjs — تشخيص شامل لمشكلة تسجيل الدخول
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({ log: ['error'] });

const EMAIL    = 'admin@msari.net';
const PASSWORD = 'Msari@Admin2024!';

async function main() {
  console.log('='.repeat(60));
  console.log('  AUTH DIAGNOSIS');
  console.log('='.repeat(60));

  // 1. هل المستخدم موجود؟
  const user = await prisma.user.findUnique({
    where: { email: EMAIL },
    select: {
      id: true, email: true, name: true,
      role: true, isActive: true, passwordHash: true,
    },
  });

  if (!user) {
    console.error('\n❌ المستخدم غير موجود في قاعدة البيانات!');
    return;
  }

  console.log('\n✅ المستخدم موجود:');
  console.table([{
    id:       user.id,
    email:    user.email,
    role:     user.role,
    isActive: user.isActive,
    hasHash:  !!user.passwordHash,
    hashStart: user.passwordHash?.substring(0, 10) + '...',
  }]);

  // 2. هل كلمة المرور صحيحة؟
  const match = await bcrypt.compare(PASSWORD, user.passwordHash ?? '');
  console.log(`\n🔑 bcrypt.compare("${PASSWORD}", hash): ${match ? '✅ MATCH' : '❌ NO MATCH'}`);

  // 3. هل الـ role صحيح؟
  const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
  console.log(`\n👤 role = "${user.role}" → isAdmin: ${isAdmin ? '✅ YES' : '❌ NO'}`);

  // 4. هل isActive صحيح؟
  console.log(`\n✅ isActive: ${user.isActive}`);

  // 5. AUTH_SECRET موجود؟
  const secret = process.env.AUTH_SECRET;
  const secretOk = !!secret && !secret.startsWith('REPLACE_ME');
  console.log(`\n🔐 AUTH_SECRET: ${secretOk ? '✅ مضبوط' : '❌ مفقود أو placeholder!'}`);
  if (!secretOk) {
    console.log(`   القيمة الحالية: "${secret?.substring(0, 20)}..."`);
  }

  // 6. DATABASE_URL 
  const dbUrl = process.env.DATABASE_URL;
  console.log(`\n🗄️  DATABASE_URL port: ${dbUrl?.includes(':6543') ? '✅ 6543' : dbUrl?.includes(':5432') ? '⚠️  5432' : '❌ غير معروف'}`);

  console.log('\n' + '='.repeat(60));
  if (match && isAdmin && user.isActive && secretOk) {
    console.log('✅ كل البيانات صحيحة — المشكلة في مسار الـ redirect');
  } else {
    console.log('❌ توجد مشكلة في البيانات — راجع النقاط أعلاه');
  }
  console.log('='.repeat(60) + '\n');
}

main()
  .catch(e => { console.error('[FATAL]', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
