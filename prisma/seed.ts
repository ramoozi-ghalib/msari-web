/**
 * prisma/seed.ts — Seeds the initial SUPER_ADMIN user.
 *
 * Run with:  npx prisma db seed
 *
 * Requires the environment variable ADMIN_PASSWORD to be set.
 * The admin email defaults to admin@msari.net but can be overridden
 * via ADMIN_EMAIL.
 *
 * Security:
 *  - Password is hashed with bcrypt (cost factor 12) before storing
 *  - Credentials are read from environment variables, never hardcoded
 *  - Uses `upsert` so re-running the seed does not duplicate the user
 */
import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Seed scripts must use a direct DB connection (port 5432), not the pgBouncer
// pooled connection (port 6543). pgBouncer can be unreachable from local dev
// environments and does not support all operations needed during seeding.
const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DIRECT_URL },
  },
});

async function main() {
  const email = process.env.ADMIN_EMAIL ?? 'admin@msari.net';
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    throw new Error(
      '❌ ADMIN_PASSWORD environment variable is required.\n' +
        '   Set it in your .env file before running: npx prisma db seed'
    );
  }

  if (password.length < 10) {
    throw new Error(
      '❌ ADMIN_PASSWORD must be at least 10 characters for security.'
    );
  }

  // bcrypt with cost factor 12 — ~250ms on modern hardware (good balance)
  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      // Do NOT update the password on re-seed — only update role if needed
      role: UserRole.SUPER_ADMIN,
      isActive: true,
    },
    create: {
      email,
      name: 'مدير النظام',
      passwordHash,
      role: UserRole.SUPER_ADMIN,
      isActive: true,
    },
  });

  console.log(`✅ Admin user ready: ${admin.email} (role: ${admin.role})`);
  console.log(
    '   ⚠️  Remember to remove ADMIN_PASSWORD from .env after seeding.'
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
