const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/middleware.ts');

if (fs.existsSync(filePath)) {
  fs.unlinkSync(filePath);
  console.log('✅ تم حذف ملف middleware.ts بنجاح!');
} else {
  console.log('ℹ️ ملف middleware.ts غير موجود مسبقاً.');
}
