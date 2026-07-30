/**
 * upload-images.mjs
 * ────────────────────────────────────────────────────────────────
 * Downloads images from the old WordPress site and uploads them
 * to Supabase Storage, then rewrites the URLs in transformed JSON.
 *
 * Input:  migration-output/transformed/{hotels,rooms}.json
 * Output: migration-output/transformed/{hotels,rooms}-with-storage-urls.json
 *
 * Requires env:  NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *
 * Usage: node scripts/upload-images.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, createWriteStream } from 'fs';
import { join, dirname, extname, basename } from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const IN_DIR    = join(__dirname, '..', 'migration-output', 'transformed');
const TMP_DIR   = join(__dirname, '..', 'migration-output', 'tmp-images');
const OUT_DIR   = IN_DIR; // write back to same dir

// ── Load .env manually (no dotenv package needed) ────────────────
const envPath = join(__dirname, '..', '.env');
try {
  const envContent = readFileSync(envPath, 'utf8');
  for (const line of envContent.split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m && !process.env[m[1].trim()]) {
      let val = m[2].trim();
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      process.env[m[1].trim()] = val;
    }
  }
} catch { /* .env not found — rely on process.env */ }

const SUPABASE_URL      = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY      = process.env.SUPABASE_SERVICE_ROLE_KEY;
const STORAGE_BUCKET    = 'hotel-images'; // bucket name in Supabase Storage

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Constants ────────────────────────────────────────────────────
const CONCURRENCY   = 3;   // parallel uploads
const TIMEOUT_MS    = 15000;
const MAX_RETRIES   = 2;

// ── URL cache: old URL -> new Supabase URL ───────────────────────
const urlCache = new Map();
const CACHE_FILE = join(OUT_DIR, 'image-url-cache.json');
if (existsSync(CACHE_FILE)) {
  const cached = JSON.parse(readFileSync(CACHE_FILE, 'utf8'));
  for (const [k, v] of Object.entries(cached)) urlCache.set(k, v);
  console.log(`  📦 Loaded ${urlCache.size} cached URLs`);
}

function saveCache() {
  writeFileSync(CACHE_FILE, JSON.stringify(Object.fromEntries(urlCache), null, 2), 'utf8');
}

// ── Download helper ──────────────────────────────────────────────
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    const file  = createWriteStream(dest);
    const req   = proto.get(url, { timeout: TIMEOUT_MS }, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        downloadFile(res.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        file.close();
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    });
    req.on('error', err => { file.close(); reject(err); });
    req.on('timeout', () => { req.destroy(); reject(new Error(`Timeout: ${url}`)); });
  });
}

// ── Upload single image ──────────────────────────────────────────
async function uploadImage(wpUrl, folder) {
  if (!wpUrl || !wpUrl.startsWith('http')) return null;

  // Return cached
  if (urlCache.has(wpUrl)) return urlCache.get(wpUrl);

  const ext      = extname(new URL(wpUrl).pathname) || '.jpg';
  const rawName  = basename(new URL(wpUrl).pathname, ext);
  const safeName = rawName.replace(/[^a-z0-9_-]/gi, '_').substring(0, 60);
  const filename = `${safeName}${ext}`;
  const storagePath = `${folder}/${filename}`;

  // Check if already exists in Supabase
  const { data: existingFiles } = await supabase.storage
    .from(STORAGE_BUCKET)
    .list(folder, { search: filename });
  if (existingFiles?.some(f => f.name === filename)) {
    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);
    const pubUrl = data.publicUrl;
    urlCache.set(wpUrl, pubUrl);
    return pubUrl;
  }

  // Download
  mkdirSync(TMP_DIR, { recursive: true });
  const tmpPath = join(TMP_DIR, filename);
  let downloaded = false;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      await downloadFile(wpUrl, tmpPath);
      downloaded = true;
      break;
    } catch (e) {
      if (attempt === MAX_RETRIES) {
        console.warn(`    ⚠️  Failed to download (${attempt+1}/${MAX_RETRIES+1}): ${wpUrl} — ${e.message}`);
        urlCache.set(wpUrl, null);
        return null;
      }
      await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
  if (!downloaded) return null;

  // Upload to Supabase
  const fileBuffer = readFileSync(tmpPath);
  const mimeType   = ext === '.png' ? 'image/png' : ext === '.gif' ? 'image/gif' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
  const { error }  = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, fileBuffer, { contentType: mimeType, upsert: true });

  if (error) {
    console.warn(`    ⚠️  Upload failed for ${storagePath}: ${error.message}`);
    urlCache.set(wpUrl, null);
    return null;
  }

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);
  const pubUrl = data.publicUrl;
  urlCache.set(wpUrl, pubUrl);
  return pubUrl;
}

// ── Parallel queue ───────────────────────────────────────────────
async function processQueue(tasks, concurrency) {
  let idx = 0;
  let done = 0;
  const total = tasks.length;

  async function worker() {
    while (idx < tasks.length) {
      const task = tasks[idx++];
      await task();
      done++;
      if (done % 10 === 0 || done === total) {
        process.stdout.write(`\r  ⬆️  Uploaded ${done}/${total} images`);
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker));
  console.log(''); // newline after progress
}

// ── Main ─────────────────────────────────────────────────────────
async function main() {
  console.log('🖼  Starting image upload to Supabase Storage...\n');

  // Ensure bucket exists
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some(b => b.name === STORAGE_BUCKET);
  if (!bucketExists) {
    const { error } = await supabase.storage.createBucket(STORAGE_BUCKET, { public: true });
    if (error) {
      console.error(`❌ Failed to create bucket "${STORAGE_BUCKET}":`, error.message);
      process.exit(1);
    }
    console.log(`  ✅ Created Supabase Storage bucket: ${STORAGE_BUCKET}`);
  } else {
    console.log(`  📦 Using existing bucket: ${STORAGE_BUCKET}`);
  }

  // Load transformed data
  const hotelsPath = join(IN_DIR, 'hotels.json');
  const roomsPath  = join(IN_DIR, 'rooms.json');
  const hotels = JSON.parse(readFileSync(hotelsPath, 'utf8'));
  const rooms  = JSON.parse(readFileSync(roomsPath, 'utf8'));

  console.log(`  🏨 Hotels: ${hotels.length} | 🛏 Rooms: ${rooms.length}`);

  // Collect all image upload tasks
  const tasks = [];

  for (const hotel of hotels) {
    const folder = `hotels/${hotel._wpId}`;
    // thumbnail
    if (hotel.thumbnailUrl) {
      tasks.push(async () => {
        hotel.thumbnailUrl = await uploadImage(hotel.thumbnailUrl, folder);
      });
    }
    // gallery images
    for (const img of hotel.images ?? []) {
      const origUrl = img.url;
      tasks.push(async () => {
        img.url = await uploadImage(origUrl, folder);
      });
    }
    // update thumbnailUrl from gallery after upload
  }

  for (const room of rooms) {
    const folder = `rooms/${room._wpId}`;
    for (const img of room.images ?? []) {
      const origUrl = img.url;
      tasks.push(async () => {
        img.url = await uploadImage(origUrl, folder);
      });
    }
  }

  console.log(`\n  📋 Total images to process: ${tasks.length}`);
  if (tasks.length === 0) {
    console.log('  ℹ️  No images found — did you run transform-wp-data.mjs first?');
    process.exit(0);
  }

  await processQueue(tasks, CONCURRENCY);
  saveCache();

  // Filter out null image URLs
  for (const hotel of hotels) {
    hotel.images = (hotel.images ?? []).filter(img => img.url);
    if (!hotel.thumbnailUrl) {
      hotel.thumbnailUrl = hotel.images[0]?.url ?? null;
    }
  }
  for (const room of rooms) {
    room.images = (room.images ?? []).filter(img => img.url);
  }

  // Save updated files
  const hotelsOut = join(OUT_DIR, 'hotels-with-storage-urls.json');
  const roomsOut  = join(OUT_DIR, 'rooms-with-storage-urls.json');
  writeFileSync(hotelsOut, JSON.stringify(hotels, null, 2), 'utf8');
  writeFileSync(roomsOut,  JSON.stringify(rooms,  null, 2), 'utf8');

  const uploadedCount = [...urlCache.values()].filter(Boolean).length;
  const failedCount   = tasks.length - uploadedCount;

  console.log('\n══════════════════════════════════════════════');
  console.log(`✅ Image upload complete!`);
  console.log(`   ✅ Uploaded: ${uploadedCount}`);
  console.log(`   ⚠️  Failed:  ${failedCount}`);
  console.log('\n📌 Next step: npx tsx scripts/seed-from-json.ts');
}

main().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
