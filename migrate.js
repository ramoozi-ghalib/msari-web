const fs = require('fs');
const path = require('path');

const APP_DIR = path.join(__dirname, 'src', 'app');
const LOCALE_DIR = path.join(APP_DIR, '[locale]');
const CONTEXTS_DIR = path.join(__dirname, 'src', 'contexts');

// Create [locale] directory if it doesn't exist
if (!fs.existsSync(LOCALE_DIR)) {
  fs.mkdirSync(LOCALE_DIR, { recursive: true });
}

// Items that should NOT be moved inside [locale]
const KEEP_AT_ROOT = [
  '[locale]',
  'api',
  'favicon.ico',
  'robots.ts',
  'sitemap.ts'
];

try {
  // Move Items
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

  // Delete AuthContext.tsx
  const authContextPath = path.join(CONTEXTS_DIR, 'AuthContext.tsx');
  if (fs.existsSync(authContextPath)) {
    fs.unlinkSync(authContextPath);
    console.log(`✅ Deleted: AuthContext.tsx (Prepared for real Backend Auth)`);
  }

  console.log('\n🎉 Migration completed successfully! You can now delete this script.');
} catch (error) {
  console.error("Migration failed:", error);
}
