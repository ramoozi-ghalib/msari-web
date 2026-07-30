/**
 * check-room-meta.mjs — يتحقق من meta keys الخاصة بالغرف في WordPress
 */
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const IN_DIR = join(__dirname, '..', 'migration-output', 'extracted');

const wpPostmeta = JSON.parse(readFileSync(join(IN_DIR, 'wp_postmeta.json'), 'utf8'));
const wpHotelRoom = JSON.parse(readFileSync(join(IN_DIR, 'wp_hotel_room.json'), 'utf8'));

// Get first 5 room post_ids
const roomIds = wpHotelRoom.slice(0, 5).map(r => r.post_id);

console.log('🔍 فحص postmeta للغرف الأولى...\n');

for (const roomId of roomIds) {
  const metas = wpPostmeta.filter(m => m.post_id === roomId);
  console.log(`\n═══ Room post_id: ${roomId} ═══`);
  console.log(`  Total meta keys: ${metas.length}`);
  for (const m of metas) {
    const val = String(m.meta_value || '').substring(0, 120);
    const isGallery = /gallery|image|img|photo|media|slider|attach/i.test(m.meta_key);
    console.log(`  ${isGallery ? '🖼 ' : '   '} ${m.meta_key} = ${val}`);
  }
}
