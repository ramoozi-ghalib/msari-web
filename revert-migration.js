const fs = require('fs');
const path = require('path');

const APP_DIR = path.join(__dirname, 'src', 'app');
const LOCALE_DIR = path.join(APP_DIR, '[locale]');
const PROXY_FILE = path.join(__dirname, 'src', 'proxy.ts');

try {
  // Move Items out of [locale]
  if (fs.existsSync(LOCALE_DIR)) {
    const items = fs.readdirSync(LOCALE_DIR);
    for (const item of items) {
      const sourcePath = path.join(LOCALE_DIR, item);
      const destPath = path.join(APP_DIR, item);

      try {
        fs.renameSync(sourcePath, destPath);
        console.log(`✅ Returned: [locale]/${item} -> ${item}`);
      } catch (err) {
        console.error(`❌ Failed to return ${item}:`, err.message);
      }
    }
    
    // Delete the now-empty [locale] folder
    fs.rmdirSync(LOCALE_DIR);
    console.log(`✅ Deleted: [locale] folder`);
  } else {
    console.log(`ℹ️ [locale] folder doesn't exist. Skipping...`);
  }

  // Delete proxy.ts
  if (fs.existsSync(PROXY_FILE)) {
    fs.unlinkSync(PROXY_FILE);
    console.log(`✅ Deleted: src/proxy.ts`);
  }

  console.log('\n🎉 Revert migration completed successfully! You can now delete this script.');
} catch (error) {
  console.error("Migration revert failed:", error);
}
