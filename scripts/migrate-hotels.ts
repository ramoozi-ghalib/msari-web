/**
 * سكربت هجرة بيانات مساري
 * يقوم بسحب الفنادق والمدن من موقع msari.net عبر WordPress REST API
 * ثم تحويلها إلى الصيغة المناسبة للموقع الجديد
 *
 * الاستخدام:
 *   npx tsx scripts/migrate-hotels.ts
 *
 * المتطلبات: قم بإنشاء ملف .env.local يحتوي على:
 *   WP_API_URL=https://msari.net/wp-json
 *   WP_USERNAME=your_admin_username
 *   WP_APP_PASSWORD=xxxx xxxx xxxx xxxx xxxx xxxx
 */

import * as fs from 'fs';
import * as path from 'path';

const WP_API = process.env.WP_API_URL || 'https://msari.net/wp-json';
const WP_USER = process.env.WP_USERNAME || '';
const WP_PASS = process.env.WP_APP_PASSWORD || '';

const authHeader = WP_USER && WP_PASS
  ? 'Basic ' + Buffer.from(`${WP_USER}:${WP_PASS}`).toString('base64')
  : '';

const headers: Record<string, string> = {
  'Content-Type': 'application/json',
  ...(authHeader ? { Authorization: authHeader } : {}),
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface WPPost {
  id: number;
  slug: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  meta?: Record<string, unknown>;
  _embedded?: {
    'wp:featuredmedia'?: Array<{ source_url: string; alt_text: string }>;
    'wp:term'?: Array<Array<{ id: number; name: string; slug: string; taxonomy: string }>>;
  };
  acf?: Record<string, unknown>;
  [key: string]: unknown;
}

interface WPMedia {
  id: number;
  source_url: string;
  alt_text: string;
  media_details: { width: number; height: number };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function wpFetch<T>(endpoint: string): Promise<T> {
  const url = `${WP_API}${endpoint}`;
  console.log(`  📡 Fetching: ${url}`);
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API Error ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&[a-z]+;/gi, ' ').trim();
}

// ─── Discover available routes ────────────────────────────────────────────────

async function discoverRoutes(): Promise<string[]> {
  console.log('\n🔍 Discovering WordPress API routes...');
  try {
    const root = await wpFetch<{ routes: Record<string, unknown> }>('/');
    return Object.keys(root.routes || {});
  } catch (e) {
    console.warn('Could not fetch root routes:', e);
    return [];
  }
}

// ─── Fetch all hotels with pagination ────────────────────────────────────────

async function fetchAllHotels(): Promise<WPPost[]> {
  console.log('\n🏨 Fetching hotels...');
  const all: WPPost[] = [];

  // Try different endpoint patterns used by the Traveler theme
  const endpointCandidates = [
    '/wp/v2/st_hotel?per_page=100&_embed=1',
    '/wp/v2/hotel?per_page=100&_embed=1',
    '/traveler/v1/hotels?per_page=100',
    '/wp/v2/posts?post_type=st_hotel&per_page=100&_embed=1',
  ];

  for (const endpoint of endpointCandidates) {
    try {
      const page1 = await wpFetch<WPPost[]>(`${endpoint}&page=1`);
      if (Array.isArray(page1) && page1.length > 0) {
        all.push(...page1);
        console.log(`  ✅ Found ${page1.length} hotels via ${endpoint}`);

        // Fetch remaining pages
        let page = 2;
        while (true) {
          try {
            const next = await wpFetch<WPPost[]>(`${endpoint}&page=${page}`);
            if (!Array.isArray(next) || next.length === 0) break;
            all.push(...next);
            console.log(`  📄 Page ${page}: +${next.length} hotels`);
            page++;
          } catch {
            break;
          }
        }
        return all;
      }
    } catch {
      console.log(`  ⚠️  Endpoint ${endpoint} not available`);
    }
  }

  console.error('❌ Could not find hotels endpoint. Saving raw API routes for inspection.');
  return [];
}

// ─── Fetch hotel images ───────────────────────────────────────────────────────

async function fetchHotelImages(hotelId: number): Promise<string[]> {
  try {
    const media = await wpFetch<WPMedia[]>(`/wp/v2/media?parent=${hotelId}&per_page=10`);
    return media.map((m) => m.source_url).filter(Boolean);
  } catch {
    return [];
  }
}

// ─── Transform WP Hotel to Msari Hotel format ─────────────────────────────────

function extractMeta(post: WPPost, keys: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  const meta = (post.meta || post.acf || {}) as Record<string, unknown>;
  for (const key of keys) {
    if (meta[key] !== undefined && meta[key] !== '') {
      result[key] = String(meta[key]);
    }
  }
  return result;
}

function transformHotel(post: WPPost, images: string[]) {
  const meta = extractMeta(post, [
    'st_price', 'price', 'price_from', 'hotel_price',
    'st_stars', 'stars', 'hotel_stars',
    'st_address', 'address', 'hotel_address',
    'st_city', 'city',
    'st_lat', 'lat', 'latitude',
    'st_lng', 'lng', 'longitude',
    'st_rating', 'rating',
    'st_map_lat', 'st_map_lng',
  ]);

  const title = stripHtml(post.title.rendered);
  const description = stripHtml(post.content.rendered || post.excerpt.rendered);

  // Try to extract location from embedded terms
  const terms = post._embedded?.['wp:term']?.flat() || [];
  const locationTerm = terms.find((t) => t.taxonomy === 'st_location' || t.taxonomy === 'location');
  const city = meta.st_city || meta.city || locationTerm?.name || '';

  // Thumbnail
  const thumbnail =
    post._embedded?.['wp:featuredmedia']?.[0]?.source_url ||
    images[0] ||
    '';

  const priceFrom = parseFloat(
    meta.st_price || meta.price || meta.price_from || meta.hotel_price || '0'
  ) || 0;

  const stars = parseInt(meta.st_stars || meta.stars || meta.hotel_stars || '3') || 3;

  return {
    wp_id: post.id,
    slug: post.slug,
    name: title,
    nameEn: title, // Will need manual translation later
    description: description.slice(0, 500),
    descriptionEn: description.slice(0, 500),
    city,
    cityEn: city,
    governorate: city,
    governorateEn: city,
    address: meta.st_address || meta.address || city,
    lat: parseFloat(meta.st_lat || meta.lat || meta.latitude || meta.st_map_lat || '0') || null,
    lng: parseFloat(meta.st_lng || meta.lng || meta.longitude || meta.st_map_lng || '0') || null,
    stars,
    rating: parseFloat(meta.st_rating || meta.rating || '4.0') || 4.0,
    reviewCount: 0,
    priceFrom,
    currency: 'USD',
    thumbnail,
    images: images.length > 0 ? images : (thumbnail ? [thumbnail] : []),
    amenities: [],
    rooms: [],
    isFeatured: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    // Raw WordPress data for debugging
    _raw_meta: post.meta || post.acf || {},
  };
}

// ─── Main Migration ───────────────────────────────────────────────────────────

async function main() {
  console.log('🚀 Msari Data Migration Script');
  console.log('================================');
  console.log(`📌 Source: ${WP_API}`);
  console.log(`🔑 Auth: ${authHeader ? 'Enabled' : 'None (public API only)'}\n`);

  // Output directory
  const outDir = path.join(process.cwd(), 'migration-output');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // Step 1: Discover routes
  const routes = await discoverRoutes();
  fs.writeFileSync(
    path.join(outDir, 'api-routes.json'),
    JSON.stringify(routes, null, 2)
  );
  console.log(`✅ Saved ${routes.length} API routes → migration-output/api-routes.json`);

  // Step 2: Fetch hotels
  const wpHotels = await fetchAllHotels();
  console.log(`\n✅ Total hotels found: ${wpHotels.length}`);

  if (wpHotels.length === 0) {
    console.log('\n⚠️  No hotels fetched via REST API.');
    console.log('👉 This usually means the post type is not registered with "show_in_rest: true".');
    console.log('👉 See migration-output/api-routes.json for available routes.');
    console.log('👉 Alternatively, use the database export method (see MIGRATION_GUIDE.md).');
    return;
  }

  // Save raw WP data
  fs.writeFileSync(
    path.join(outDir, 'wp-hotels-raw.json'),
    JSON.stringify(wpHotels, null, 2)
  );

  // Step 3: Transform
  console.log('\n🔄 Transforming hotels...');
  const transformedHotels = [];

  for (const hotel of wpHotels) {
    const images = await fetchHotelImages(hotel.id);
    const transformed = transformHotel(hotel, images);
    transformedHotels.push(transformed);
    console.log(`  ✅ ${transformed.name} (ID: ${hotel.id}) — ${transformed.priceFrom}$ — ${transformed.city}`);
  }

  // Save transformed
  fs.writeFileSync(
    path.join(outDir, 'hotels-transformed.json'),
    JSON.stringify(transformedHotels, null, 2)
  );

  // Save as TypeScript mock-data format
  const mockDataContent = `// Auto-generated by migrate-hotels.ts
// Generated: ${new Date().toISOString()}
// Source: ${WP_API}
// Total hotels: ${transformedHotels.length}

import type { Hotel } from '@/types';

export const migratedHotels: Hotel[] = ${JSON.stringify(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    transformedHotels.map(({ wp_id: _wpId, _raw_meta: _raw, ...h }) => h),
    null,
    2
  )};
`;

  fs.writeFileSync(path.join(outDir, 'migrated-hotels.ts'), mockDataContent);

  // Summary
  console.log('\n📊 Migration Summary');
  console.log('====================');
  console.log(`✅ Hotels migrated: ${transformedHotels.length}`);
  console.log(`📁 Output files:`);
  console.log(`   - migration-output/wp-hotels-raw.json (raw WP data)`);
  console.log(`   - migration-output/hotels-transformed.json (transformed data)`);
  console.log(`   - migration-output/migrated-hotels.ts (ready for import)`);
  console.log(`   - migration-output/api-routes.json (available WP API routes)`);
  console.log('\n🎉 Done! Check migration-output/ folder.');
}

main().catch((err) => {
  console.error('\n❌ Migration failed:', err.message);
  process.exit(1);
});
