const fs = require('fs');
const path = require('path');

// ⚠️  نُقل هذا الملف من جذر المشروع إلى scripts/ (Fix L-5)
// الجذر: migrate.js (المحذوف / القديم)
// الآن:  scripts/migrate.js

const APP_DIR = path.join(__dirname, '..', 'src', 'app');
const LOCALE_DIR = path.join(APP_DIR, '[locale]');
const CONTEXTS_DIR = path.join(__dirname, '..', 'src', 'contexts');

if (!fs.existsSync(LOCALE_DIR)) {
  fs.mkdirSync(LOCALE_DIR, { recursive: true });
}

const KEEP_AT_ROOT = [
  '[locale]',
  'api',
  'favicon.ico',
  'robots.ts',
  'sitemap.ts'
];

try {
  const items = fs.readdirSync(APP_DIR);
  for (const item of items) {
    if (KEEP_AT_ROOT.includes(item)) continue;

    const sourcePath = path.join(APP_DIR, item);
    const destPath = path.join(LOCALE_DIR, item);

    try {
      fs.renameSync(sourcePath, destPath);
      console.log(`✅ Moved: ${item} -> [locale]/${item}`);
    } catch (err) {
      console.error(`❌ Failed to move ${item}:`, err.message);
    }
  }

  const authContextPath = path.join(CONTEXTS_DIR, 'AuthContext.tsx');
  if (fs.existsSync(authContextPath)) {
    fs.unlinkSync(authContextPath);
    console.log(`✅ Deleted: AuthContext.tsx`);
  }

  console.log('\n🎉 Migration completed successfully!');
} catch (error) {
  console.error("Migration failed:", error);
}
