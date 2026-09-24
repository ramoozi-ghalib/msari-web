# MSARI — Next Resource Decision (post Cities/Hotels closure)

## Chosen resource: Rooms — room-detail fallback path

### Why this resource
1. Direct Firestore read exists in a public serving path (room detail page fallback).
2. API endpoint exists and is production-proven: `GET /v1/rooms?hotelId=` (already serves
   hotel-detail + nearby rooms in Hotels ON mode; adapter `apiFetchRooms` has hardened
   error semantics: throws on 401/403/5xx/timeout, `[]` only on 404).
3. Smallest safe surface: exactly one call site; no transaction, no payment, no availability
   semantics involved (read-only catalog data: names, images, features, static price).
4. Bonus: removes the last `apiClient.getRooms` usage — a legacy browser-key (`NEXT_PUBLIC_API_KEY`)
   call inside a server component — aligning with the security-hardening rule.
5. No new API design needed; no schema/index/Rules/Auth changes.

### Source of Truth
- Firestore subcollection `hotels/{hotelId}/rooms` (+ Storage for images). Unchanged.

### Current semantics (direct path)
- Website direct (hotels.ts + room page): rooms where `isPublished === true && isDeleted !== true`
  (docs missing `isPublished` are excluded; docs missing `isDeleted` are included).
- Mapping: `toWebsiteRoom` (hotels-api.ts, shared by both paths) — name `{ar,en}`,
  description, images, `mapAmenitiesToDTO(features)`, capacity fields, `price`,
  `isPublished !== false`, `isDeleted || false`.

### API contract (existing, frozen unless parity forces a minimal fix)
- `GET /v1/rooms?hotelId=` → `{ success, count, data[] }` with `id, hotelId, name, description,`
  `mainImageUrl, images, features, numberOfPersons/Beds/Bathrooms/Rooms, price, isPublished,`
  `updatedAt, isDeleted`.
- ⚠️ KNOWN DIVERGENCE (to quantify in Phase 2): API applies `.where("isDeleted", "==", false)`
  at query level, which **drops docs missing the field**; the website keeps them (if published).
  If such docs exist in production, the minimal fix is to drop the query filter and filter in
  JS exactly like the website (additive output change, non-breaking for the website adapter;
  partner impact to assess — likely none, more data is strictly more correct).

### All direct Firestore call sites (rooms)
| # | File:line | Context | Migration? |
|---|---|---|---|
| 1 | `actions/hotels.ts:216,288` | `getLocalHotelsDirect` per-hotel rooms fan-out (probe + full) | NO — this IS the hotels fallback; keep |
| 2 | `actions/hotels.ts:469` | `getHotelBySlugDirect` rooms | NO — hotels fallback; keep |
| 3 | `actions/hotels.ts:637-639` | `getHotelsByIdsDirect` rooms batch | NO — hotels fallback; keep |
| 4 | `app/[locale]/hotels/[slug]/rooms/[roomId]/page.tsx:50` | `apiClient.getRooms(hotel.id)` legacy fallback | YES — replace with server-key `apiFetchRooms` + explicit direct fallback |
| 5 | `actions/bookings.ts:304,541` | booking transaction + price verification reads | FORBIDDEN — booking flow; never touch |

### API endpoint counterpart
- `GET /v1/rooms?hotelId={id}` (functions/index.js:632). Scopes: existing website key already
  carries the needed scope (rooms are served through it in Hotels ON mode today).

### Migration surface (Phase 3)
- One file: `app/[locale]/hotels/[slug]/rooms/[roomId]/page.tsx` fallback branch.
- Pattern: `OFF` → direct Firestore subcollection read only; `ON` (default after gates) →
  `apiFetchRooms(hotel.id)` primary (server-only `MSARI_API_KEY`, 8s cap already in adapter),
  explicit direct subcollection read on any API failure; genuine absence on both → `notFound()`.
- `generateMetadata` already derives the room from `getHotelBySlug` (API-first); unchanged.

### Parity requirements (Phase 2)
- Per-room: IDs, ar/en names, description, images, features, capacity fields, price,
  `isPublished` flag, ordering, `null`/missing-field semantics.
- The critical metric: count of production rooms missing `isDeleted` (decides whether the
  API query-filter fix is needed before cutover).
- Error semantics: API 401/403/5xx/timeout → fallback (never 404-masquerade); only
  room-not-found-on-both-paths → `notFound()`.

### Risks
- LOW: single fallback branch, page already API-first via hotel payload in the common case.
- Read amplification: none (one bounded `?hotelId=` call replaces one legacy call; no fan-out —
  the hotels-list N+1 concern does not apply here).
- No live data (availability/inventory/booking/payment) passes through this path.

### Rejected alternatives
- **Rates/currency** (`lib/currency.ts` → `rates/global`): no API endpoint exists; would require
  new API design → rejected per order (also pricing-adjacent: extra caution).
- **Offers/ads** (`offer.service.ts` → `ads`): no API endpoint; marketing content, low migration value.
- **Bank accounts** (booking page): payment flow → forbidden.
- **Sitemap/blog/CMS/amenities/admin**: editorial/admin reads, no API endpoints, negligible
  API-first value; out of scope.
- **Booking transaction reads**: explicitly forbidden.

### Decision
Proceed with **Rooms (room-detail fallback)** through Phases 2–5 in one cycle. STOP only on:
real parity mismatch, required breaking contract change, or production regression.
