# MSARI — API-First Remaining Surface Audit (post Hotels/Cities/Rooms closure)

## 1. Executive Summary
Full inventory of every direct data access in `msari_web` (43 `db.collection` sites, all
`firebase-admin` importers, Storage uses, hidden helpers). Result: **no operational resource
remains that is both migratable and worth migrating**. The only operational reads still direct
are either explicit approved fallbacks, forbidden flows (booking/payment), website-only display
config, or resources with no API endpoint (creating one is out of scope per the order).
**Recommendation: declare the resource surface complete and move to the Final Release Gate.**
No new migration is started in this task (audit + decision only; zero code changed).

## 2. Complete Direct Firestore Inventory (by call site, traced to SoT)
| # | Call site | Collection / op | Category |
|---|---|---|---|
| 1 | `actions/hotels.ts:89,608` | `hotels` list reads (Direct fallback) | A (fallback, approved) |
| 2 | `actions/hotels.ts:216,288,469,637-639` | `hotels/{id}/rooms` fan-out (Direct fallback) | A (fallback, approved) |
| 3 | `actions/hotels.ts:462` | `hotels/{id}` single read (nearby Direct) | A (fallback, approved) |
| 4 | `services/city.service.ts:62,98,257,276,409` | `destinations` + `hotels` scans (fallback/admin) | A (fallback, approved) / F |
| 5 | `rooms/[roomId]/page.tsx` (findRoomDirect) | `hotels/{id}/rooms/{roomId}` (explicit fallback) | A (fallback, approved) |
| 6 | `lib/currency.ts:21` | `rates/global` single doc (10-min cache + defaults) | A (display config) |
| 7 | `actions/bookings.ts:304,313,324,333,335` | room/hotel/rates/booking/notification refs (transaction) | D (forbidden) |
| 8 | `actions/bookings.ts:532,541` | hotel/room reads (price preview, booking flow) | D (forbidden) |
| 9 | `actions/bookings.ts:626` | `bookings/{uid}/entries` history | D (forbidden) |
| 10 | `booking/page.tsx:219` | `bank_accounts` (payment flow) | D (forbidden) |
| 11 | `actions/auth.ts`, `auth.ts`, `lib/session` (via apiClient) | login/register (operational auth) | C (forbidden scope) |
| 12 | `lib/user-roles.ts:27` | `admins/{uid}` role resolution (fail-closed) | C (must stay direct) |
| 13 | `account/profile/page.tsx:28,42,57` | `customers`/`admins`/Auth profile enrichment | C (session/internal) |
| 14 | `services/cms/cms.client.ts:19,41,62` | `website_*`, editorial collections (all CMS reads) | B (editorial) |
| 15 | `actions/blog.ts:19,61,66` | `web_blog` list/detail (public blog) | B (editorial) |
| 16 | `actions/amenities.ts` | `amenities` CRUD | F (no website callers — admin-only) |
| 17 | `services/offer.service.ts:25,39` | `ads` banners (homepage slider, 60s cache) | B (marketing) |
| 18 | `actions/cities.ts:65,89,113` + `city.service.ts:312,353,357` | destinations create/update/delete | F (admin writes) |
| 19 | `app/api/partners/hotel-requests/route.ts` | `hotel_partner_requests` add + Storage upload | D/F (intake write, out of scope) |
| 20 | `app/sitemap.ts:55,75,95` | `hotels`, `website_destinations`, `web_blog` | E (build-time infra) |
| 21 | Storage writes (`bookings.ts:258`, partners route) | receipts/intake uploads | D/F (operational writes, out of scope) |
| — | Firebase **client** SDK (`firebase/firestore`, `firebase/storage`) | — | NONE in `src` (Admin SDK server-side only) |
| — | Storage **reads** via SDK | — | NONE (public image URLs only) |

## 3. Operational Resources (candidate set reviewed)
Hotels, Cities/Destinations, Rooms, Rates/Prices, Offers, Ads, Currency, Bank accounts,
Bookings, Payment, Users/Customers/Admins, Partner intake, CMS/blog, Amenities, Sitemap.

## 4. Existing API Coverage (read endpoints, functions/index.js)
`/v1/hotels`, `/v1/hotels/:id`, `/v1/hotels/by-slug/:slug`, `/v1/hotels/updated-since`,
`/v1/cities`, `/v1/rooms?hotelId=`, `/v1/bookings/:id` (clientAuth), `/v1/me` (clientAuth).
**No endpoints exist for: rates, offers/ads, bank accounts, users/roles, CMS, sitemap.**

## 5. Resource × API Matrix (decision)
| Resource | Direct call sites | Existing API | Coverage | Migratable | Decision |
|---|---|---|---|---|---|
| Hotels | fallback reads (§2 #1–3) | ✅ full | 100% | — (done) | CLOSED |
| Cities/Destinations | fallback scans (§2 #4) | ✅ `/v1/cities` | 100% | — (done) | CLOSED |
| Rooms | explicit fallback (§2 #5) | ✅ `/v1/rooms` | 100% | — (done) | CLOSED |
| Rates/Prices display | `rates/global` 1 doc | ❌ none | 0% | NO (new API needed; single cached config doc, display-only) | KEEP DIRECT |
| Offers/Ads | `ads` banners | ❌ none | 0% | NO (marketing, website-only consumer) | KEEP DIRECT |
| Currency hook | via rates | ❌ none | 0% | NO (same as rates) | KEEP DIRECT |
| Bank accounts | booking page | ❌ none | 0% | FORBIDDEN (payment flow) | FORBIDDEN |
| Booking tx + preview + history | bookings.ts | ⚠️ `/v1/bookings/:id` is partner/clientAuth, not website-session | unsuitable | FORBIDDEN | FORBIDDEN |
| Users/roles/profile/session | admins/customers/Auth | ❌ none suitable (must not traverse public API) | — | NO (security architecture) | KEEP DIRECT |
| Partner intake (write) | hotel_partner_requests + Storage | — (write path) | — | Out of scope (no read migration applies) | FORBIDDEN / OOS |
| CMS/blog/homepage/settings/editorial | website_*, web_blog | ❌ none (by rule) | — | NO (rule: never convert editorial to public API) | KEEP DIRECT |
| Amenities actions | amenities | ❌ none | — | No website callers | DEAD / admin-only |
| Sitemap | hotels/destinations/blog | — | — | NO (rule: not an operational resource) | N/A (infra) |
| `getAllCities` | destinations | ✅ but unused | — | No callers | DEAD (kept, harmless) |

## 6. Hotels/Cities/Rooms verification (Phase 5)
- Defaults in code: hotels `ON` (hotels.ts:37), cities `ON` (city.service.ts), rooms `ON`
  (rooms page router). No public primary path reads Firestore before attempting the API;
  every direct read in these paths is an explicit, logged fallback (kept as code).
- Live sanity (read-only, this audit): `/ar` 200, valid room page 200, `/ar/destinations/aden` 200.
- Prior prod evidence stands: cities `servedFrom: api` in Vercel logs; rooms parity 259/259;
  hotels P1 fingerprint stable.

## 7. Remaining Resources Classification — outcome
- **MIGRATE: none.** Every migratable operational resource with a suitable endpoint is closed.
- **KEEP DIRECT (decisions, architectural):**
  1. `rates/global` — single-document website-only display config, 10-min in-memory cache,
     hardcoded safe defaults; routing it through a public API adds failure modes for zero
     ownership benefit. NOT recorded as BLOCKED: no partner/API consumer needs it, and the
     order forbids auto-creating a Rates API.
  2. `ads` banners + currency conversion display — website-only marketing/presentation layer.
  3. `admins/{uid}` role resolution + profile/session enrichment — must stay server-direct
     (fail-closed security boundary; public-API traversal would be an architecture regression).
  4. All CMS/editorial/blog/homepage/settings reads — editorial SoT, explicitly excluded by rule.
- **BLOCKED — NEW API REQUIRED: none recorded.** (Rates/ads would need one, but they are
  classified KEEP DIRECT above with justification — no architectural decision is being requested.)
- **FORBIDDEN / OUT OF SCOPE:** booking transaction, price preview, booking history, bank
  accounts/payment, auth flows, Rules/schema/index changes, operational writes, partner intake.
- **NOT APPLICABLE / DEAD:** sitemap (infra), amenities actions (no callers), `getAllCities`
  (no callers). Left untouched.

## 8. Security observations
- Migration paths use server-only `MSARI_API_KEY` exclusively (verified in hardening phase);
  `NEXT_PUBLIC_API_KEY` survives ONLY in legacy `api-client.ts` serving auth/booking operational
  flows (out of scope by rule). No key in HTML/client chunks (scanned in prior gates).
- No 401/403/5xx→404 conversion anywhere in migrated routers (throw-to-fallback semantics
  proven by invalid-key tests: 200-via-fallback / genuine-404).
- No plaintext credentials stored; pepper stays in Secret Manager.

## 9. Read-amplification observations
- No N+1 introduced by any migration: hotels ViaApi = 1 bounded list call; rooms = 1 bounded
  `?hotelId=` call; cities = 1 list call (60s cache).
- Pre-existing Direct-fallback fan-out (list probe rooms per hotel) is unchanged fallback code,
  already cost-reviewed; it does not execute on the API primary path.

## 10. Final recommendation
**API-FIRST MIGRATION — RESOURCE SURFACE COMPLETE.** All operational resources required by the
website that have a suitable API are API-first with explicit fallbacks. Nothing remaining
justifies a new migration phase; per the Final Rule, do not manufacture one.

## 11. Exact next phase
**FINAL API-FIRST RELEASE GATE** — consolidated verification (no code changes): confirm flags
(HOTELS/CITIES/ROOMS = ON), re-run the three parity scripts, live spot-checks, log confirmation
of API-primary serving, rollback drills documentation, and a single release sign-off. Awaiting
the gate order.
