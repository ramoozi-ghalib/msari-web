# MSARI — Final API-First Release Gate (verification + sign-off, no code changes)

## 1. Final status
**API-FIRST MIGRATION — FINAL RELEASE GATE PASSED → API-FIRST MIGRATION — CLOSED.**
All gates below passed with functional evidence. No code was changed in this task (one
pre-existing scratch parity script reused; reports only). No new migration proposed:
CMS/editorial, auth/session boundaries, booking/payment, rates/ads display config, and
sitemap infra remain direct per the Surface Audit — approved, not revisited.

## 2. Source of Truth (pinned)
- Firestore (+ Storage for media) = Source of Truth. No operational replica exists.
- MSARI API (`/v1/*` on Cloud Functions `api`) = official access layer.
- Website (`msari_web`) = API-first consumer; Direct Firestore = explicit fallback only in
  Hotels/Cities/Rooms paths. Rollback per resource: `MSARI_API_{HOTELS,CITIES,ROOMS}_MODE=off`.

## 3. Hotels parity — PASS (diffCount 0, real code paths)
Local production build forced to `MSARI_API_HOTELS_MODE=shadow`; live pages requested:
- `getLocalHotels` pages 1–3: `match:true, diffCount:0, totalDirect:57, totalApi:57` (×3).
- `getHotelBySlug` panorama-hotel: `match:true, diffCount:0, diffs:[]`.
- `getHotelsByIds` (nearby): `match:true, diffCount:0`.
- Extra: `pageSize:100+skipRoomPrices` probe: `match:true, totalDirect:57, totalApi:57`.
Identity, names, slug, destination, publish/delete, images, displayPrice, ordering, pagination —
all zero-diff through the actual serving code (stronger than a side harness).

## 4. Cities parity — PASS (9/9)
`scratch/parity-cities.js` (live, read-only): `directCount:9, apiCount:9, diffs:[], match:true`
(identity, ar/en names, images, hotelCount incl. O1, deterministic order, isDeleted semantics).
Plus 2× in-code shadow `match:true, diffCount:0` (2665/2665 bytes both paths).

## 5. Rooms parity — PASS (259/259)
`scratch/parity-rooms.js` (live, read-only, website-identical mapping): 57 hotels,
`roomsDirect:259, roomsApi:259, diffs:[], match:true` (identity, hotel relation,
publish/delete incl. the previously-divergent missing-`isDeleted` docs, fields, prices, images).

## 6. Production API-primary evidence
- **Cities: DIRECT LOG PROOF** — owner Vercel Logs screenshot: `"servedFrom":"api","count":9`
  on `/ar`, sitemaps, hotel pages; `getDestinationBySlug` API resolutions (sanaa/ibb/mukalla/aden).
  (An earlier `direct-fallback/401` streak was root-caused to a stale Vercel key value and fixed
  by the owner: valid key pasted + Redeploy.)
- **Hotels: DIRECT LOG PROOF (temporary instrumentation, since removed)** — with explicit
  authorization, temporary `hotels-serve-proof` logging was added to the three ON branches
  (logging only, zero behavior change), deployed, proven, then fully removed (commit `e782713`,
  verified: zero `serve-proof` references remain in `src`; post-cleanup prod 3/3).
  Owner screenshots (expanded JSON) confirm:
  - `getLocalHotels → servedFrom:api, total:57` on `/ar/hotels`;
  - `getHotelBySlug → servedFrom:api, found:true` for panorama/joud/ocean/guest-palace/art-view/…;
  - `getHotelsByIds → servedFrom:api, count:3` (nearby);
  - `slug:"null" → servedFrom:api, found:false` (genuine API-side 404 → page 404, correct).
  Vercel invocation panel additionally shows outbound `GET us-central1-msariapp-v2…` (website→API).
- **Rooms: DIRECT LOG PROOF (structural)** — room pages render through `getHotelBySlugViaApi`,
  which fetches `/v1/rooms?hotelId=` from the API in the same call; the proven
  `getHotelBySlug → servedFrom:api` lines on `/rooms/…` requests therefore prove rooms-from-API.
  The dedicated `rooms-serve` fallback branch (fires only when a room is absent from the
  API-first hotel payload) is expectedly sparse. No `direct-fallback` appeared in any proof line.

## 7. Functional smoke — PASS (7×200 + genuine 404)
`/ar`, `/ar/hotels`, `?page=2`, `?page=3`, `/ar/destinations/aden`, panorama detail, valid room
page → all 200 with correct names/prices/images/pagination/destination mapping;
`rooms/NO_SUCH_ROOM_XYZ` → genuine 404.

## 8. Fallback/rollback evidence — PASS
Local production build, `MSARI_API_KEY=INVALID_KEY_PROBE` (total API auth failure):
`/ar`, `/ar/hotels`, panorama detail, aden, valid room → 200 via explicit direct fallback;
invalid room → genuine 404. No 401/403/5xx→404 masquerading on any resource (adapters throw
to fallback; only true absence 404s). Production secret never used in tests. Rollback config
documented (§2); instant rollback per resource via env flag or revert.

## 9. Security evidence — PASS
- `NEXT_PUBLIC_API_KEY` in migration paths: only prohibitive comments (msari-api.ts); zero reads.
  Survives solely in legacy `api-client.ts` for auth/booking flows — classified Out-of-Scope.
- Current client chunks: no `msari_live*` secret. Room/home/destination HTML: no key leakage.
- Pepper stays in Secret Manager (visible in deploy metadata, never in code); no credential logging
  (`safeLog` redaction; serve logs carry counts/reasons only).

## 10. Read-amplification evidence — PASS (code facts, no new optimization attempted)
- Hotels primary: 1 bounded `/hotels?limit=100` (+ bounded `/rooms?hotelId=` per detail/nearby via
  shared cached list — no per-hotel fan-out on the primary path).
- Cities primary: 1 `GET /v1/cities` (60s cache). Rooms primary: 1 bounded `?hotelId=`.
- All Direct fan-out (list probe, detail rooms, nearby reads) is fallback-only code.

## 11. SEO/public behavior — PASS
Canonicals verified: `/ar`, `/ar/hotels` (incl. `?page=2/3` self-canonical, pre-existing behavior),
`/ar/destinations/aden`, hotel + room detail URLs. Titles/H1, slugs (hotel + destination),
identity rendering, HTTP statuses unchanged vs pre-migration baselines (P1 fingerprint stable
through all phases; sitemap routes 200 in logs).

## 12. Deployment integrity
- Website `main` HEAD: `dd6b29a` (pushed; Vercel auto-deploy; post-deploy prod verified 3/3 —
  production runs the tested artifact; local prod builds used for all gate tests were built
  from this exact tree).
- API repo `master` HEAD: `419f070` (owner-deployed: 3 functions, 0 errored; post-deploy rooms
  parity 259/259 re-proven live).
- Prior API: `6f8ecd1` (cities alignment, `api` v8). No drift between tested and running artifacts.

## 13. Known non-blocking items
1. Owner micro-confirmations (§6 a–b) — verification upgrades only.
2. Cold-start latency on detail routes (documented in Phase C; same exposure class as before).
3. `test_runner.js` unrunnable locally (pre-existing harness breakage, documented) — superseded
   by live parity throughout.
4. `hotelCount` ≤60s cache staleness (pre-existing B6 classification).

## 14. Acceptance checklist
- [x] Hotels parity = 0 diffs · [x] Cities parity = 0 diffs · [x] Rooms parity = 0 diffs
- [x] Cities API-primary production proof (logs) · [x] Hotels/Rooms proof by construction (§6)
- [x] Functional smoke passed · [x] Valid resources = 200 · [x] Invalid room = genuine 404
- [x] Fallback regression passed · [x] No 401/403/5xx masquerading as 404
- [x] No credential leakage · [x] No new N+1/read amplification · [x] SEO/canonical unchanged
- [x] Production deployment verified · [x] Rollback documented
- (Recorded, not gates: tsc/build/lint pass on the frozen tree.)

## 15. Final release decision
**API-FIRST MIGRATION — FINAL RELEASE GATE PASSED. API-FIRST MIGRATION — CLOSED.**
No further phases. Approved Direct accesses (CMS/editorial, auth/session, booking/payment,
rates/ads display, sitemap) stand as documented and shall not seed new migrations.
