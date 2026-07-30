/**
 * transform-wp-data.mjs  (v2 — based on actual extracted data)
 * ────────────────────────────────────────────────────────────────
 * Transforms extracted JSON files into Prisma-ready format.
 *
 * Key discoveries from the real data:
 *  - Cities come from wp_st_location_nested (location_id field)
 *  - Hotel→City link is via wp_st_hotel.multi_location  "_17764_,_20084_"
 *  - Hotel stars/price/address are in wp_st_hotel directly
 *  - Terms include hotel amenities (hotel_facilities taxonomy)
 *  - wp_postmeta has thumbnail + gallery for images
 *  - wp_hotel_room links rooms to hotels
 *
 * Usage: node scripts/transform-wp-data.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname }  from 'path';
import { fileURLToPath }  from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const IN_DIR    = join(__dirname, '..', 'migration-output', 'extracted');
const OUT_DIR   = join(__dirname, '..', 'migration-output', 'transformed');

// ── Helpers ──────────────────────────────────────────────────────
function load(file) {
  const p = join(IN_DIR, `${file}.json`);
  if (!existsSync(p)) { console.warn(`  ⚠️  ${file}.json not found`); return []; }
  const data = JSON.parse(readFileSync(p, 'utf8'));
  console.log(`  📥 ${file}.json  → ${data.length.toLocaleString()} rows`);
  return data;
}
function save(filename, data) {
  const p = join(OUT_DIR, filename);
  writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
  console.log(`  ✅ ${filename}  ← ${data.length.toLocaleString()} records`);
}

// Strip HTML tags & decode common HTML entities
function stripHtml(html) {
  if (!html || typeof html !== 'string') return '';
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g,   '&')
    .replace(/&lt;/g,    '<')
    .replace(/&gt;/g,    '>')
    .replace(/&nbsp;/g,  ' ')
    .replace(/&#8220;/g, '"').replace(/&#8221;/g, '"')
    .replace(/&#8216;/g, "'").replace(/&#8217;/g, "'")
    .replace(/&#8211;/g, '–').replace(/&#8212;/g, '—')
    .replace(/\s+/g, ' ')
    .trim();
}

// Decode URL-encoded Arabic slugs
function decodeSlug(slug) {
  if (!slug) return '';
  try { return decodeURIComponent(slug); } catch { return slug; }
}

// Build a clean slug from any text
function slugify(text, suffix = '') {
  const base = String(text || '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-\u0621-\u064A\u0660-\u0669]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
  return suffix ? `${base}-${suffix}` : base;
}

// Extract numeric IDs from multi_location string "_17764_,_20084_"
function parseMultiLocation(str) {
  if (!str) return [];
  return [...str.matchAll(/_(\d+)_/g)].map(m => parseInt(m[1], 10));
}

// Parse gallery: handles both PHP serialized arrays AND comma-separated IDs
function extractGalleryIds(serialized) {
  if (!serialized) return [];
  const str = String(serialized).trim();
  const nums = [];

  // Format 1: Comma-separated IDs (e.g. "16625,19912,19913")
  if (/^\d[\d,\s]*$/.test(str)) {
    for (const part of str.split(',')) {
      const n = parseInt(part.trim(), 10);
      if (n > 0) nums.push(n);
    }
    return [...new Set(nums)];
  }

  // Format 2: PHP serialized — match patterns like i:0;i:12345
  const re = /i:\d+;i:(\d+)/g;
  let m;
  while ((m = re.exec(str)) !== null) nums.push(parseInt(m[1], 10));
  // Also match simple array-of-integers: a:N:{i:0;i:ID; i:1;i:ID2;}
  if (nums.length === 0) {
    const re2 = /i:(\d+);/g;
    while ((m = re2.exec(str)) !== null) {
      const n = parseInt(m[1], 10);
      if (n > 100) nums.push(n); // filter out array-index numbers (< 100)
    }
  }
  return [...new Set(nums)];
}

// ── Amenity icon mapping (by slug / name keywords) ───────────────
const ICON_MAP = [
  [['wifi','wi-fi','internet','واي فاي'],         'wifi'],
  [['pool','مسبح','حمام سباحة'],                  'waves'],
  [['parking','موقف','مواقف سيارات'],             'car'],
  [['restaurant','مطعم'],                          'utensils'],
  [['gym','صالة','رياضة'],                         'dumbbell'],
  [['spa','صحي','سبا'],                            'sparkles'],
  [['air','تكييف'],                               'wind'],
  [['tv','تلفاز','تلفزيون','flat'],               'tv'],
  [['bar','مشروبات'],                             'wine'],
  [['laundry','غسيل','مغسلة'],                    'shirt'],
  [['breakfast','إفطار','فطور'],                  'coffee'],
  [['elevator','lift','مصعد'],                    'building-2'],
  [['safe','آمن','خزنة'],                         'lock'],
  [['room service','خدمة الغرف'],                 'bell'],
  [['transfer','shuttle','نقل'],                  'bus'],
  [['airport','مطار'],                             'plane'],
  [['conference','اجتماع'],                       'presentation'],
  [['kids','children','أطفال'],                   'baby'],
  [['pet','حيوانات'],                             'paw-print'],
  [['balcony','شرفة'],                            'sunset'],
  [['kitchen','مطبخ'],                            'chef-hat'],
  [['minibar','mini-bar','ثلاجة'],                'refrigerator'],
  [['phone','هاتف'],                              'phone'],
  [['wheelchair','disability','كراسي'],           'accessibility'],
  [['heater','تدفئة'],                             'thermometer'],
  [['dryer','مجفف'],                              'wind'],
  [['smoking','تدخين'],                           'cigarette'],
];
function amenityIcon(name, slug) {
  const text = `${name} ${slug}`.toLowerCase();
  for (const [keywords, icon] of ICON_MAP) {
    if (keywords.some(k => text.includes(k))) return icon;
  }
  return 'star';
}

// ── Country → governorate mapping ────────────────────────────────
const COUNTRY_GOV = { YE: 'اليمن', SA: 'السعودية', EG: 'مصر', TR: 'تركيا', JO: 'الأردن', QA: 'قطر', AE: 'الإمارات' };
const COUNTRY_GOV_EN = { YE: 'Yemen', SA: 'Saudi Arabia', EG: 'Egypt', TR: 'Turkey', JO: 'Jordan', QA: 'Qatar', AE: 'UAE' };

// ── MAIN ─────────────────────────────────────────────────────────
async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  console.log('🔄 Transforming WordPress data → Prisma format\n');
  console.log('📥 Loading extracted files:');

  const wpPosts       = load('wp_posts');
  const wpPostmeta    = load('wp_postmeta');
  const wpStHotel     = load('wp_st_hotel');
  const wpHotelRoom   = load('wp_hotel_room');
  const wpTerms       = load('wp_terms');
  const wpTermTax     = load('wp_term_taxonomy');
  const wpTermRel     = load('wp_term_relationships');
  const wpLocNested   = load('wp_st_location_nested');

  // ── Index: postmeta by post_id ────────────────────────────────
  const metaByPost = {};
  for (const m of wpPostmeta) {
    const pid = m.post_id;
    const key = m.meta_key;
    const val = m.meta_value;
    if (!metaByPost[pid]) metaByPost[pid] = {};
    // Support multiple values per key (arrays)
    if (metaByPost[pid][key] === undefined) {
      metaByPost[pid][key] = val;
    } else if (!Array.isArray(metaByPost[pid][key])) {
      metaByPost[pid][key] = [metaByPost[pid][key], val];
    } else {
      metaByPost[pid][key].push(val);
    }
  }

  // ── Index: wp_st_hotel by post_id ────────────────────────────
  const stHotelByPost = {};
  for (const h of wpStHotel) stHotelByPost[h.post_id] = h;

  // ── Index: wp_hotel_room by post_id ──────────────────────────
  const hotelRoomByPost = {};
  for (const r of wpHotelRoom) hotelRoomByPost[r.post_id] = r;

  // ── Index: locations by location_id ──────────────────────────
  // Only keep published or meaningful locations
  const locationByLocId = {};
  for (const loc of wpLocNested) {
    if (loc.location_id && loc.name && loc.name !== 'root') {
      locationByLocId[loc.location_id] = loc;
    }
  }

  // ── Index: terms by term_id ───────────────────────────────────
  const termsById = {};
  for (const t of wpTerms) termsById[t.term_id] = t;

  // term_taxonomy: taxonomy by term_taxonomy_id
  const taxById = {};
  for (const tx of wpTermTax) taxById[tx.term_taxonomy_id] = tx;

  // term_relationships: post_id -> Set<term_taxonomy_id>
  const termRelByPost = {};
  for (const tr of wpTermRel) {
    const oid  = tr.object_id;
    const ttid = tr.term_taxonomy_id;
    if (!termRelByPost[oid]) termRelByPost[oid] = [];
    termRelByPost[oid].push(ttid);
  }

  // ── Separate posts by type ────────────────────────────────────
  const attachmentById = {};  // id -> guid (URL)
  const hotelPosts     = [];
  const postTitleById  = {};  // id -> post_title (for room names)

  for (const post of wpPosts) {
    const postType = post.post_type;
    const status   = post.post_status;
    const id       = post.ID;

    // Store all post titles for later room name lookup
    postTitleById[id] = post.post_title || `Room ${id}`;

    if (postType === 'attachment') {
      attachmentById[id] = post.guid || null;
    } else if (postType === 'st_hotel' && status === 'publish') {
      hotelPosts.push(post);
    }
  }

  // Also grab attachment URLs from postmeta (_wp_attached_file)
  for (const [pid, meta] of Object.entries(metaByPost)) {
    if (meta['_wp_attached_file'] && !attachmentById[parseInt(pid)]) {
      // Build URL from wp-content/uploads path
      const relPath = meta['_wp_attached_file'];
      attachmentById[parseInt(pid)] = `https://msari.net/wp-content/uploads/${relPath}`;
    }
  }

  console.log(`\n  🏨 Hotel posts (publish):  ${hotelPosts.length}`);
  console.log(`  🖼  Attachment records:     ${Object.keys(attachmentById).length}\n`);

  // ── Step 1: Build Cities from st_location_nested ──────────────
  console.log('🏙  Building cities...');

  // Collect all location IDs actually used by hotels
  const usedLocIds = new Set();
  for (const h of wpStHotel) {
    for (const locId of parseMultiLocation(h.multi_location)) {
      usedLocIds.add(locId);
    }
  }

  const cities   = [];
  const cityByLocId = {};  // locId -> city record
  let cityIdx = 1;

  for (const loc of wpLocNested) {
    if (!loc.location_id || loc.name === 'root' || loc.status === 'private_root') continue;
    // Only include locations that are actually used OR have status=publish
    if (!usedLocIds.has(loc.location_id) && loc.status !== 'publish') continue;

    const country    = loc.location_country || '';
    const govAr      = COUNTRY_GOV[country]    || 'اليمن';
    const govEn      = COUNTRY_GOV_EN[country] || 'Yemen';
    // Build English name from fullname (has Arabic) — use city name as placeholder
    const nameAr = loc.name.trim();
    const nameEn = nameAr; // Will be translated later — no English data available

    const city = {
      _locId:       loc.location_id,
      id:           `city_${cityIdx++}`,
      nameAr,
      nameEn,
      governorateAr: govAr,
      governorateEn: govEn,
      country:      country || 'YE',
      imageUrl:     null,
      isActive:     loc.status === 'publish',
    };
    cities.push(city);
    cityByLocId[loc.location_id] = city;
  }
  save('cities.json', cities);

  // ── Step 2: Build Amenities from term_taxonomy ─────────────────
  console.log('\n🛎  Building amenities...');

  // Find taxonomy types used for hotel/room amenities
  const HOTEL_FACILITY_TAXONS = new Set(['hotel_facilities', 'hotel_facility', 'hotel_amenity', 'hotel_class']);
  const ROOM_FACILITY_TAXONS  = new Set(['hotel_room_type', 'room_type', 'room_facilities', 'room_facility']);

  const amenities    = [];
  const amenityByTid = {};  // term_id -> amenity record
  let amenityIdx = 1;

  // Index of hotel post IDs (used to filter term relationships)
  const hotelPostIds = new Set(hotelPosts.map(h => h.ID));

  for (const tx of wpTermTax) {
    const tax    = tx.taxonomy;
    const termId = tx.term_id;
    const ttid   = tx.term_taxonomy_id;
    const term   = termsById[termId];
    if (!term) continue;
    if (amenityByTid[termId]) continue; // already added

    let category = null;
    if (HOTEL_FACILITY_TAXONS.has(tax)) category = 'HOTEL_AMENITIES';
    else if (ROOM_FACILITY_TAXONS.has(tax)) category = 'ROOM_FEATURES';
    else continue; // not an amenity taxonomy

    const nameAr = stripHtml(term.name);
    if (!nameAr || nameAr.length < 2) continue;
    const slug = decodeSlug(term.slug);

    const amenity = {
      _wpTermId: termId,
      id:        `amenity_${amenityIdx++}`,
      nameAr,
      nameEn:    term.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      icon:      amenityIcon(nameAr, slug),
      category,
    };
    amenities.push(amenity);
    amenityByTid[termId] = amenity;
  }
  save('amenities.json', amenities);

  // ── Amenity lookup by term_taxonomy_id ───────────────────────
  const amenityByTtid = {};
  for (const tx of wpTermTax) {
    if (amenityByTid[tx.term_id]) {
      amenityByTtid[tx.term_taxonomy_id] = amenityByTid[tx.term_id];
    }
  }

  // ── Step 3: Build Hotels ───────────────────────────────────────
  console.log('\n🏨  Building hotels...');

  const hotels    = [];
  const hotelById = {};  // wpPostId -> hotel record
  let hotelIdx = 1;


  for (const post of hotelPosts) {
    const wpId   = post.ID;
    const stData = stHotelByPost[wpId] ?? {};
    const meta   = metaByPost[wpId]   ?? {};

    // ── City: from multi_location ──────────────────────────────
    let cityId     = null;
    let cityNameAr = null;
    const locIds = parseMultiLocation(stData.multi_location ?? '');
    for (const locId of locIds) {
      const city = cityByLocId[locId];
      if (city) {
        cityId     = city.id;
        cityNameAr = city.nameAr;
        break;
      }
    }
    // Fallback to first available city
    if (!cityId && cities.length > 0) {
      cityId = cities[0].id;
      cityNameAr = cities[0].nameAr;
    }

    // ── Stars ──────────────────────────────────────────────────
    const starsRaw = stData.hotel_star ?? meta.star_rate ?? meta.st_star ?? '3';
    const stars    = Math.min(Math.max(parseInt(starsRaw, 10) || 3, 1), 5);

    // ── Price ──────────────────────────────────────────────────
    const priceFrom = parseFloat(stData.min_price ?? stData.price_avg ?? meta.price ?? '0') || 0;

    // ── Coordinates ────────────────────────────────────────────
    const lat = parseFloat(stData.map_lat ?? meta.map_lat ?? '') || null;
    const lng = parseFloat(stData.map_lng ?? meta.map_lng ?? '') || null;

    // ── Address ────────────────────────────────────────────────
    const address = stripHtml(stData.address ?? meta.address ?? post.post_title ?? '');

    // ── Description ────────────────────────────────────────────
    const descAr = stripHtml(post.post_content ?? '') || post.post_title;

    // ── Slug ───────────────────────────────────────────────────
    const rawSlug   = post.post_name ?? slugify(post.post_title);
    const decodedSlug = decodeSlug(rawSlug);
    const finalSlug  = (decodedSlug || slugify(post.post_title)) + `-${wpId}`;

    // ── Featured ───────────────────────────────────────────────
    const isFeatured = stData.is_featured === 'on';

    // ── Thumbnail ──────────────────────────────────────────────
    const thumbId  = parseInt(meta._thumbnail_id, 10) || null;
    const thumbUrl = thumbId ? (attachmentById[thumbId] ?? null) : null;

    // ── Gallery ────────────────────────────────────────────────
    const images = [];
    if (thumbUrl) images.push({ url: thumbUrl, order: 0, altAr: post.post_title, altEn: post.post_title });

    // Gallery: Traveler stores gallery as serialized array of attachment IDs
    // Common meta keys: 'gallery', 'hotel_gallery', '_gallery'
    const gallerySources = [
      meta['gallery'], meta['hotel_gallery'], meta['_gallery'],
      meta['list_img'], meta['banner_img'],
    ].filter(Boolean);
    for (const galMeta of gallerySources) {
      const galStr = String(galMeta);
      const ids    = extractGalleryIds(galStr);
      for (const imgId of ids) {
        const url = attachmentById[imgId] ?? null;
        if (url && url !== thumbUrl) {
          images.push({ url, order: images.length, altAr: post.post_title, altEn: post.post_title });
        }
      }
      if (ids.length > 0) break;
    }

    // ── Amenities (from term_relationships) ────────────────────
    const ttids        = termRelByPost[wpId] ?? [];
    const amenityIds   = [];
    for (const ttid of ttids) {
      const a = amenityByTtid[ttid];
      if (a && a.category === 'HOTEL_AMENITIES') amenityIds.push(a.id);
    }

    const hotel = {
      _wpId:        wpId,
      id:           `hotel_${hotelIdx++}`,
      wpId,
      slug:         finalSlug,
      type:         'LOCAL',
      nameAr:       post.post_title,
      nameEn:       post.post_title, // same until translated
      descriptionAr: descAr || post.post_title,
      descriptionEn: null,
      address:      address || post.post_title,
      mapUrl:       null,
      lat,
      lng,
      stars,
      rating:       parseFloat(stData.rate_review ?? '0') || 4.0,
      reviewCount:  0,
      priceFrom,
      currency:     'USD',
      thumbnailUrl: thumbUrl,
      isFeatured,
      isActive:     true,
      cityId,
      policyAr:     null,
      policyEn:     null,
      images,
      amenityIds,
    };
    hotels.push(hotel);
    hotelById[wpId] = hotel;
    process.stdout.write('.');
  }
  console.log(` ✅ ${hotels.length} hotels built`);
  save('hotels.json', hotels);

  // ── Step 4: Build Rooms from wp_hotel_room ────────────────────
  // In Traveler theme, rooms are in wp_hotel_room with room_parent = hotel post_id
  // The room title/content comes from wp_posts via post_id
  console.log('\n🛏  Building rooms from wp_hotel_room...');

  const rooms    = [];
  let   roomIdx  = 1;
  let   skipped  = 0;

  for (const roomRow of wpHotelRoom) {
    const wpId     = roomRow.post_id;
    const parentId = roomRow.room_parent;
    const status   = roomRow.status;

    // Skip auto-drafts and orphaned rooms
    if (!parentId || parentId === 0) { skipped++; continue; }
    if (status === 'auto-draft' || status === 'trash') { skipped++; continue; }

    const hotel = hotelById[parentId];
    if (!hotel) { skipped++; continue; }

    const meta   = metaByPost[wpId] ?? {};

    // Price from wp_hotel_room.price
    const price = parseFloat(roomRow.price ?? meta.price ?? '0') || 0;

    // Capacity: adult_number is max adult guests
    const capacity = Math.min(
      Math.max(parseInt(roomRow.adult_number ?? '2', 10) || 2, 1),
      20
    );

    // Room name from wp_posts title
    const nameAr = postTitleById[wpId] || `غرفة ${wpId}`;

    // Description from wp_posts content
    const postContent = wpPosts.find(p => p.ID === wpId)?.post_content ?? '';
    const descAr = stripHtml(postContent) || null;

    // Thumbnail
    const thumbId  = parseInt(meta._thumbnail_id, 10) || null;
    const thumbUrl = thumbId ? (attachmentById[thumbId] ?? null) : null;

    // Gallery
    const images = [];
    if (thumbUrl) images.push({ url: thumbUrl, order: 0 });
    const galSources = [meta['gallery'], meta['hotel_gallery'], meta['_gallery']].filter(Boolean);
    for (const galMeta of galSources) {
      const ids = extractGalleryIds(String(galMeta));
      for (const imgId of ids) {
        const url = attachmentById[imgId] ?? null;
        if (url && url !== thumbUrl) images.push({ url, order: images.length });
      }
      if (ids.length > 0) break;
    }

    // Room-type amenities from term_relationships
    const ttids      = termRelByPost[wpId] ?? [];
    const amenityIds = [];
    for (const ttid of ttids) {
      const a = amenityByTtid[ttid];
      if (a && a.category === 'ROOM_FEATURES') amenityIds.push(a.id);
    }

    rooms.push({
      _wpId:        wpId,
      id:           `room_${roomIdx++}`,
      hotelId:      hotel.id,
      nameAr,
      nameEn:       nameAr,
      descriptionAr: descAr,
      descriptionEn: null,
      capacity,
      pricePerNight: price,
      isAvailable:   true,
      images,
      amenityIds,
    });
    process.stdout.write('.');
  }
  console.log(`\n  ✅ ${rooms.length} rooms built (${skipped} skipped — auto-draft/orphaned)`);
  save('rooms.json', rooms);

  // ── Summary ────────────────────────────────────────────────────
  const totalImages = hotels.reduce((s, h) => s + h.images.length, 0)
                    + rooms.reduce((s, r) => s + r.images.length, 0);
  const roomsWithImages   = rooms.filter(r => r.images.length > 0).length;
  const hotelsWithImages  = hotels.filter(h => h.images.length > 0).length;
  const hotelsWithNoPrice = hotels.filter(h => h.priceFrom === 0).length;
  const hotelsWithNoCity  = hotels.filter(h => !h.cityId).length;

  console.log('\n══════════════════════════════════════════════');
  console.log('✅ Transformation complete!');
  console.log(`   🏙  Cities:            ${cities.length}`);
  console.log(`   🛎  Amenities:         ${amenities.length}`);
  console.log(`   🏨  Hotels:            ${hotels.length}`);
  console.log(`   🛏  Rooms:             ${rooms.length}`);
  console.log(`   🖼  Total images:      ${totalImages}`);
  console.log(`   📸 Hotels with images: ${hotelsWithImages}/${hotels.length}`);
  console.log(`   📸 Rooms  with images: ${roomsWithImages}/${rooms.length}`);
  console.log(`   💰 Hotels no price:   ${hotelsWithNoPrice}`);
  console.log(`   🏙  Hotels no city:    ${hotelsWithNoCity}`);
  console.log('\n📌 Next step: node scripts/upload-images.mjs');
  console.log('   (or skip images: npx tsx scripts/seed-from-json.ts)');
}

main().catch(err => {
  console.error('❌ Fatal error:', err.message, err.stack);
  process.exit(1);
});
