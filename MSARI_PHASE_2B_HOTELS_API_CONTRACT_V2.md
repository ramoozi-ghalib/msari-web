# MSARI_PHASE_2B_HOTELS_API_CONTRACT_V2.md

> CONTRACT DESIGN ONLY. No serving migration, no deployment, no schema/index writes,
> no booking/payment/auth changes. Status: CONTRACT V2 READY FOR ARCHITECTURE APPROVAL.
> Evidence grades: PROVEN (measured) / UNKNOWN / REQUIRES ARCHITECTURAL DECISION.
> Never "PASS" without evidence.

---

## 1. Contract — `GET /v1/hotels` (V2 delta over V1)

Base: existing `/v1/hotels?limit&cursor&filter[city]&sort` (PROVEN live: bounded, cursor-stable,
nextCursor works). V2 ADDS parameters (additive, backward compatible):

| Param | Semantics (binding) | Values | Default |
|---|---|---|---|
| `destination` | exact match on canonical English city name, **case-sensitive** (`destination == X`); resolves the website fuzzy rule per §5 | e.g. `Aden`, `Sanaa` | absent = all published |
| `q` | DEFERRED — no FTS in V1; see §5 | — | — |
| `featured` | `true` → `isSpecial == true` subset (no ordering change); `false/absent` → all | `true` | all |
| `sort` | `recommended` (isSpecial desc, createdAt desc, __name__ asc) \| `price_asc`/`price_desc` (see §4) \| `rating` (constant 4.5 → id order) \| `createdAt` | listed | `recommended` |
| `limit` | 1..100, default 12 (website pageSize) | int | 12 |
| `cursor` | opaque doc-ID cursor, existing mechanics kept | string | start |

Rules: unknown `sort` → 400 (fail loud, never silent reorder). `limit` clamped server-side.
`filter[city]` (UUID form) DEPRECATED, kept working (mapped server-side to canonical name or 400).

## 2. Hotel response contract (V2 additions marked +)

`id, slug(+) , name{name,ar,en}, nameEn, destination, images[], thumbnail<=mainImageUrl,
featured<=isSpecial, rating(4.5 constant, documented), displayPrice(+) , stars, address, overview,
amenities, policies, mapLink, createdAt, updatedAt, isPublished, cityId/city/cityEn passthrough`.
- `slug(+)`: deterministic `generateSlugFromHotel(id, nameEn)` — SAME function website uses
  (PROVEN: web slugs resolve; algorithm shared, not duplicated).
- `displayPrice(+)`: `min(explicit eligible, room-min eligible)` per §4. NEVER a quote.
- `metadata needed by SSR/SEO`: name/ slug/ city/ images/ description all present.

## 3. Lookup contract

- `GET /v1/hotels/:id` — EXISTS, unchanged (PROVEN 200 live).
- `GET /v1/hotels/by-slug/:slug` (+) — REQUIRES persisted `slug` field + backfill = **schema/data
  decision (STOP — D-3B-05)**. Rationale: slug is generated, not stored; scanning all hotels per
  lookup is forbidden (would reintroduce full-scan). Until decided: website keeps slug→ID resolution;
  detail migration stays blocked behind this decision, NOT worked around.

## 4. Rooms

`GET /v1/rooms?hotelId=` stays the room source (PROVEN: 5/5 IDs match website). Per-hotel bounded
(single subcollection). **Rule: no caller may fan-out rooms×N for a list** — list pricing uses §5
displayPrice strategy, never per-hotel room fetches.

## 5. Pricing boundary (binding)

- `displayPrice` (V2 field): minimum eligible price = min(explicit hotel price>0, min
  non-deleted room price>0), else explicit, else 30 — EXACT current website formula (traced
  `actions/hotels.ts`, 4 identical spots). Computed server-side where served.
- FORBIDDEN in generic Hotels GET: availability quote, date/guest pricing, booking totals,
  taxes/fees. Those stay Booking Domain (existing txn untouched).
- Price ORDERING without per-hotel room reads requires a persisted/derived price (denormalized
  field or index-backed sort) → **REQUIRES DECISION** (schema-adjacent). Until then, price sort
  stays website-side; API `sort=price_*` on explicit `price` only (documented semantic delta —
  existing composite `(isPublished,isDeleted,price)` already indexed, PROVEN in indexes file).

## 6. Destination semantics (PROVEN measurements, 57 hotels / 9 cities)

- Website fuzzy 6-branch predicate collapses in practice to ONE branch: `destEn`
  (`destination.lower()==nameEn.lower`), 57/57, **zero multi-branch hotels** (measured).
- Exact-case probe: **57/57 match with NO lowercasing** — canonical rule
  `destination == <city nameEn exact>` reproduces current behavior exactly on live data.
- Server strategy: single-equality `where("destination","==",X)` (+ in-memory published/deleted
  filter, same as website) — NO new composite index (single-field automatic). Combined
  `isPublished==` + `destination==` in one query WOULD need a composite → use single-filter +
  in-memory flag check (payload ≤ city size, proven ≤38 docs).
- `cityId` empty on ALL hotels; `destId/destAr/city/cityEn` branches match ZERO hotels today —
  kept as documented no-ops, not deleted (data may evolve; re-measure before relying).

## 7. Search (q — DECISION REQUIRED, not silently adapted)

- Current website semantics (traced): substring includes over name.ar/en + address, case-insensitive,
  Arabic normalized.
- Firestore has no full-text search. Prefix-range on a single name field needs no new index but
  covers only prefix queries in one language/field — NOT equivalent. Dual-field/cross-field search
  needs composites or an external index.
- **No q param in V2 until decided.** Options for the gate: (a) prefix search on nameEn+name
  (documented subset), (b) dedicated search service, (c) website-side filtering (keeps reads).
  Recommendation: (c) short-term + (b) long-term. Search stays website-side in all migrated phases.

## 8. Featured + sorting (binding)

- `featured` = `isSpecial == true` (single-field equality, no new index).
- Supported sorts: `recommended` (isSpecial desc, createdAt desc, __name__ asc — deterministic,
  matches website incl. id tie-break), `price_*` (explicit-price only until §5 decision),
  `rating` (constant → id order, documents current no-op), `createdAt`.
- Featured-first + cursor pagination in ONE query needs composite `(isSpecial, createdAt, __name__)`
  + published filter variant → **REQUIRES DECISION** (index creation). Until then: API serves
  featured-filter + recommended ordering computed over the bounded page window is FORBIDDEN as a
  silent substitute — featured LISTING stays website-side or unpaginated-bounded.

## 9. Pagination semantics (binding)

- API cursor (`limit` + `nextCursor` + docId stability) PROVEN working live.
- Website offset pages (`?page=N`, 12/page) map to cursor chains, NOT page numbers: deep links to
  page N require walking N-1 cursors (documented behavior delta vs offset). Page-number UX stays
  website-side until a page-aware contract is approved. No silent UX change: numbered buttons keep
  working via website mapping layer during migration.

## 10. Firestore strategy per capability (no index/schema writes made)

| Capability | Collection/filters/ordering | Query shape | New index? | Reads | Schema? |
|---|---|---|---|---|---|
| destination filter | `hotels where destination==X` (+mem flags) | single equality | NO (automatic) | matched docs only | NO |
| featured filter | `hotels where isSpecial==true` | single equality | NO | matched only | NO |
| price sort | existing `(isPublished,isDeleted,price)` composite | orderBy price | NO (exists) | page window | NO |
| createdAt sort | existing `(…,createdAt desc)` composite | orderBy | NO (exists) | page window | NO |
| featured+createdAt+cursor combined | — | — | **YES needed** | — | DECISION |
| destination+published combined | — | — | **YES needed** | — | DECISION (avoided via mem-filter) |
| q search | — | — | n/a | — | DECISION |
| slug lookup | `hotels where slug==X` | single equality | NO (automatic IF field exists) | 1 doc | **DECISION (backfill)** |
| displayPrice sort | — | — | needs persisted field | — | DECISION |

## 11. Source of Truth matrix (condensed)

| Field | SoT | Website owner today | API owner (V2) |
|---|---|---|---|
| identity/names/images/address/overview/amenities/policies/stars | Firestore hotel doc | direct read | API read (+`slug` after D-3B-05) |
| `featured`/`isSpecial`, published flags | Firestore | direct | API filter |
| `displayPrice` | derived (hotel+rooms docs) | website formula ×4 | API (single impl after §5 live) |
| rating | constant 4.5 (both) | website | API passthrough |
| availability/quote/totals | rooms + txn | booking domain | booking domain ONLY |
| counts | derived | website | O1 `/v1/cities` (shipped) |

## 12. Security boundary (unchanged from P0/Phase 2B)

Browser = zero credentials; x-api-key server-side only; scopes enforced on keyed routes
(`hotels:read`, `rooms:read`, `destinations:read`); no scope expansion here; P0 untouched.

## 13. SEO compatibility (no serving change in this task)

Slug preserved via shared generator; hotel identity = doc ID both sides; canonical mapping
unchanged; title/H1 inputs (name/city/images/description) all in contract; pagination discovery
kept website-side (§9); sitemap sources unchanged.

## 14. Parity test matrix (harness `scratch/parity-hotels.ts`, live)

| Case | Direct | API V2 expected | Status |
|---|---|---|---|
| destination Aden/Sanaa/Hodeidah/Mukalla/Ibb | fuzzy counts 38/7/6/1/1 | exact-canonical equality, same sets | PROVEN (branch census 57/57, exact-case 57/57) |
| q Arabic / English / no-result | includes-match | **no endpoint** | CONTRACT GAP (decision §7) |
| featured true/false | isSpecial filter | `featured` param (to build) | CONTRACT GAP (decision) |
| sort default/price/rating/createdAt | in-memory + id tiebreak | recommended+cursor (price: explicit-only delta) | PARTIAL (price: CONTRACT GAP) |
| pagination first/next/no-overlap/repeat | offset slices, proven stable | cursor chains | MECHANICS PROVEN, mapping DECISION (§9) |
| lookup by ID / slug / invalid / missing | slug scan (website) | ID PROVEN 200; slug DECISION (D-3B-05) | PARTIAL |
| pricing explicit-only / room-derived / room-cheaper / none | 4 formula branches | displayPrice field (to build per §5) | CONTRACT GAP (decision) |

## 15. Open architectural decisions (blocking serving migration)

D-V2-01 slug persistence+backfill · D-V2-02 featured/sort composite indexes · D-V2-03 q search
vehicle · D-V2-04 displayPrice computation placement · D-V2-05 price-sort semantics · D-V2-06
cursor-vs-page UX mapping · D-V2-07 destination+published composite (avoided for now).

**STATUS: CONTRACT V2 READY FOR ARCHITECTURE APPROVAL. No serving migration, no Phase C,
no deployment, no schema/index writes performed.**
