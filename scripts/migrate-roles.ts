import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * migrate-roles.ts
 * 
 * A one-time explicit migration script to safely convert deprecated roles 
 * (like 'SUPER_ADMIN') to 'ADMIN' before applying the new database schema.
 * 
 * Usage:
 * npx tsx scripts/migrate-roles.ts
 */
async function main() {
  console.log('🚀 Starting explicit role migration...');

  try {
    // Check how many users have the SUPER_ADMIN role.
    // We use 'as any' to bypass TS compiler errors since SUPER_ADMIN 
    // has been removed from the type definitions.
    const usersToMigrate = await prisma.user.count({
      where: { role: 'SUPER_ADMIN' as any }
    });

    if (usersToMigrate === 0) {
      console.log('✅ No users found with deprecated SUPER_ADMIN role. System is clean.');
      return;
    }

    console.log(`⚠️ Found ${usersToMigrate} user(s) with 'SUPER_ADMIN' role. Migrating to 'ADMIN'...`);

    // Perform the explicit update
    const result = await prisma.user.updateMany({
      where: { role: 'SUPER_ADMIN' as any },
      data: { role: 'ADMIN' as any }
    });

    console.log(`🎉 Successfully migrated ${result.count} user(s).`);
    console.log('You can now safely run `npx prisma db push` or `npx prisma migrate dev`.');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
