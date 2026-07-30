/**
 * test-connection.mjs — اختبار الاتصال بقاعدة البيانات
 */
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env
const envContent = readFileSync(join(__dirname, '..', '.env'), 'utf8');
const env = {};
for (const line of envContent.split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) {
    let val = m[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    env[m[1].trim()] = val;
  }
}

console.log('🔍 اختبار الاتصال بقاعدة البيانات...\n');
console.log('1️⃣  DATABASE_URL (Port 6543 — Pooler):');
console.log(`   ${env.DATABASE_URL?.replace(/:[^:@]+@/, ':***@')}\n`);
console.log('2️⃣  DIRECT_URL (Port 5432 — Direct):');
console.log(`   ${env.DIRECT_URL?.replace(/:[^:@]+@/, ':***@')}\n`);

// Try pg connection with native Node
import('net').then(({ default: net }) => {
  const hosts = [
    { name: 'Pooler (6543)', host: 'aws-1-ap-south-1.pooler.supabase.com', port: 6543 },
    { name: 'Direct (5432)', host: 'aws-1-ap-south-1.pooler.supabase.com', port: 5432 },
  ];

  for (const h of hosts) {
    const socket = net.createConnection({ host: h.host, port: h.port, timeout: 10000 });
    socket.on('connect', () => {
      console.log(`  ✅ ${h.name} — اتصال ناجح!`);
      socket.destroy();
    });
    socket.on('timeout', () => {
      console.log(`  ❌ ${h.name} — timeout بعد 10 ثواني`);
      socket.destroy();
    });
    socket.on('error', (err) => {
      console.log(`  ❌ ${h.name} — خطأ: ${err.message}`);
    });
  }
});
