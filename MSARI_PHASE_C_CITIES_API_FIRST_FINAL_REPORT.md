# MSARI — Phase C — Cities API-First Migration — Final Report

## Baseline
- Hotels API-first CUTOVER closed successfully; hotels mode = ON; `main` = `0941947` at start.
- Firestore/Storage = Source of Truth; no schema/Rules/Auth/booking/payment changes in this phase.
- Constraints respected: no new collection, no PostgreSQL, no browser credentials, hotels path untouched
  (except C7 dead-code dedup of the cities fetcher; zero behavioral change to hotel serving).

## C1 — Current direct path (audit)
- SoT reads: `destinations` collection (isDeleted filter) + full `hotels` scan with JS fuzzy
  hotelCount matching (`destination/cityId/city/cityEn` + published/not-deleted).
- Direct call sites: `HomePage` (`[locale]/page.tsx:54`), `/hotels` page (`hotels/page.tsx:84`),
  `/destinations` page, `getDestinationBySlug` (detail), and hotel-mapping joins
  (`actions/hotels.ts` via `CityService.getActiveCities(100)`).
- Duplicates: `getActiveCities` called directly + inside `getLocalHotels`; mitigated by
  per-request `cache()` + 60s `unstable_cache`. Metadata/page share react-cached
  `getDestinationBySlug` (no double fetch).
- Pre-existing migration scaffolding: SHADOW compare + time-bucket CANARY (same mechanism as
  hotels), ON capped to CANARY.
- Contract gaps identified (verified benign on current data in C2): API does not filter
  `isDeleted` destinations; `name` precedence differs (`nameAr||name` vs `name||nameAr`).

## C2 — City API parity (direct vs GET /v1/cities)
- Tool: `scratch/parity-cities.js` (read-only; secrets in-process only).
- Result: `CITIES-PARITY={"directCount":9,"apiCount":9,"diffs":[],"match":true}`.
- 9/9 cities, IDs, ar/en names, hotelCount, image, and ordering all identical. No missing/duplicates.
- Incidental finding (tooling): repo `.env` uses CRLF; naive `split('\n')` parsing silently yields
  zero keys because JS `.`/`$` do not tolerate trailing `\r`. Parser fixed; no secret leaked.

## C3 — SHADOW
- Mode set to SHADOW default (commit `d8ad588`), prod verified 5/5.
- Local shadow evidence (server stdout via `safeLog`):
  - `{"migration":"shadow-compare","phase":"cities","route":"getActiveCities","match":true,"diffCount":0,"diffs":[],"direct":{"ms":5,"bytes":2665},"api":{"ms":6,"bytes":2665}}`
  - `{"migration":"shadow-compare",...,"match":true,"diffCount":0,...,"direct":{"ms":20,"bytes":2665},"api":{"ms":1424,"bytes":2665}}`
- Acceptance: 9/9 match, hotelCount match, no functional/SEO regression, no credential logging
  (`safeLog` redacts secret keys; only counts/timings/diffs logged).

## C4 — CANARY (5% deterministic, same time-bucket mechanism as hotels)
- Commit `4f4dabc` (default CANARY). Diff-gated serving: API served only on exact-set + zero-diff,
  else direct; any API error → direct. Prod verified 3/3.

## C5 — CUTOVER (ON)
- Commit `61d9947`: API-first list + API-first slug resolution in `getDestinationBySlug`
  (identical fuzzy predicate; direct scan = explicit fallback), logged serve path
  (`cities-serve: api | direct-fallback`, never silent), 8s API cap (same rationale as hotels).
- Error semantics: `fetchActiveCitiesViaApi` throws on !ok/timeout (no 404-masquerade possible
  on list path — the exact bug class that broke hotels cutover #1).
- Local: ON 4/4; fallback test (ON + invalid key) 2/2 → 200 via direct (bounded ~11s).
- Prod after deploy: 5/5 (`/ar`, `/ar/hotels`, `?page=2`, `?page=3`, `/ar/destinations/aden`).

## C6 — Production verification
- `FINAL-PROD=5/5` (also after C7). Warm latencies: home ~2.3s, aden detail ~5.3s (cold ~12.7s).
- No credential leakage in HTML (`msari_live|MSARI_API_KEY|x-api-key` absent on `/ar` and
  `/ar/destinations/aden`).
- SEO intact: canonicals `https://msari.net/ar`, `https://msari.net/ar/destinations/aden`.
- Hotels P1 fingerprint unchanged; pagination unaffected; images unaffected.
- Fallback regression: proven locally (invalid-key → 200 direct). Rollback = `MSARI_API_CITIES_MODE=off`.

## C7 — Remove old primary direct path
- Commit `a11783e`: `fetchActiveCitiesDirect` retained strictly as explicit fallback/rollback;
  deleted the duplicate `/cities` fetcher in `actions/hotels.ts` (`fetchApiCitiesForMapping`,
  `getApiCitiesCached`, unused `mapApiCityToCity` import); hotel ViaApi mapping now uses
  `CityService.getActiveCities(100)` (API-first, same dedup via react cache + 60s cache).
- `getAllCities` (admin, no app callers) intentionally untouched — out of scope.
- Shared Firestore utilities untouched; hotels serving path behaviorally unchanged.

## Commits (website `main`)
- `d8ad588` C3 SHADOW → `4f4dabc` C4 CANARY → `61d9947` C5 CUTOVER → `a11783e` C7 cleanup.
- API repo (`D:/projects/msari`): no changes (contract already proven).

## Release gates
- [x] tsc --noEmit PASS (all builds)
- [x] ESLint PASS (0 errors; 6 pre-existing unused-import warnings in hotels.ts)
- [x] npm run build PASS (all phases)
- [x] parity 100% (9/9, hotelCount, order)
- [x] Shadow PASS (2× match:true, diffCount:0)
- [x] Canary PASS (prod 3/3)
- [x] Cutover ON (prod 5/5)
- [x] Production 200 (final 5/5 incl. page=2/3 + aden)
- [x] fallback regression PASS (invalid-key → 200)
- [x] no credential leakage (HTML + logs)
- [x] no SEO regression (canonicals)
- [x] no image regression
- [x] no booking/payment regression (untouched)
- [x] no Firestore Rules / Auth changes
- [x] no operational data mutation
- [x] no PostgreSQL / no duplicate collection
- [x] no permanent direct primary city path (direct = explicit logged fallback only)

## Final status
- Cities = API-first in production (`GET /v1/cities` primary; O1 hotelCount).
- Firestore/Storage = Source of Truth. API = official access layer. Fallback = resilience only.

## Remaining risks / follow-ups
1. Cold-start latency: `/ar/destinations/aden` ~12.7s cold (warm ~5.3s). If Vercel plan timeout is
   10s, a fully-cold detail hit could 504; mitigate with warmer or shorter API cap (currently 8s,
   symmetric with hotels). No action taken — same exposure class as hotels (accepted).
2. Owner to confirm `MSARI_API_KEY` present in Vercel Production env (same var hotels uses);
   if missing, the site correctly serves via logged direct fallback, but API-first would not be
   effective until the var is set (no redeploy of code needed — env-only fix).
3. `hotelCount` staleness ≤60s via `unstable_cache` (pre-existing B6 classification, unchanged).
4. `getAllCities` remains direct-only (admin path, no app callers) — migrate only if admin needs it.

---

## Phase C Final Hardening (post-cutover review closure)
- Website commit `b7da92d`; API commit `6f8ecd1` (pending owner deploy — see §5).

### 1. Security hardening — DONE (website, live)
- `fetchActiveCitiesViaApi` now uses `getServerApiKey()` / `getServerApiBaseUrl()` exclusively:
  `process.env.MSARI_API_KEY` only. The `NEXT_PUBLIC_API_KEY` / `NEXT_PUBLIC_API_BASE_URL`
  fallbacks are removed; an unset server key throws → explicit logged direct fallback
  (never a browser-exposed credential).
- Empty-collection branch no longer uses the legacy browser-key `apiClient`; it retries via the
  server-key API fetcher, else `[]`.
- Verified: `NEXT_PUBLIC_*` occurs in migration paths only in prohibitive comments;
  `api-client.ts` retains `NEXT_PUBLIC_API_KEY` solely for legacy operational paths
  (auth/booking/rooms — explicitly out of scope, untouched).
- Verified: no `msari_live*` secret in client `static/chunks`; no `NEXT_PUBLIC_API_KEY`
  reference in server home bundle; no secret in HTML (`/ar`, `/ar/destinations/aden`);
  `safeLog` redacts secret-bearing keys.

### 2. Contract alignment — website LIVE, API committed (deploy pending owner)
- API (`functions/index.js`, commit `6f8ecd1`): skip `isDeleted === true` destination docs
  (missing field = active, mirroring direct); additive `name` field with direct precedence
  (`name || nameAr`); `nameAr`/`nameEn`/`imageUrl`/`hotelCount`(O1)/ordering untouched —
  non-breaking (existing `nameAr` assertion in `test_runner.js` unaffected).
- Website adapter prefers `c.name ?? c.nameAr` (forward-compatible: works against both the
  current and the aligned API payloads; live parity re-proven 9/9 below).
- No data migration, no Rules/Auth/schema changes.

### 3. Parity regression — PASS
- Live `scratch/parity-cities.js` after hardening: `9/9, diffs: [], match: true`
  (IDs, ar/en names, images, hotelCount, deterministic order).
- Synthetic contract test `scratch/synthetic-cities-contract.js`: 8/8 PASS —
  proves `isDeleted=true` exclusion, missing-flag = active, `name` precedence,
  `nameAr` preservation, O1 published-only counting, legacy-payload compatibility.
  Read-only; zero production writes.
- Note: `test_runner.js` cannot execute in this environment (pre-existing harness failure at
  firestore-trigger load, reproduced on the unmodified tree); API change verified via
  `node --check`, synthetic logic test, and live parity instead.

### 4. API-first path verification — PASS (local, production build)
- `getActiveCities()` → API primary → logged direct fallback; `getDestinationBySlug()` →
  API city resolution primary → direct scan fallback. No public primary path reads Firestore
  before attempting the API. Fallback retained everywhere.
- Local ON: `/ar`, `/ar/hotels`, `/ar/destinations`, `/ar/destinations/aden` = 4/4 × 200.

### 5. Fallback regression — PASS (local, production build)
- ON + `MSARI_API_KEY=INVALID_KEY_PROBE` → `/ar` 200, `/ar/destinations/aden` 200 via direct
  (no 404 masquerade, no user-facing exception). Production secret never used in tests.
- ⏳ API DEPLOY — DONE by owner: `firebase deploy --only functions` succeeded
  (3 functions deployed, 0 errored; `api` → versionId 8; triggers intact).
  Post-deploy live parity: 9/9 match; production 5/5 (`/ar`, `/ar/hotels`, `?page=2`,
  `?page=3`, `/ar/destinations/aden`). Earlier IAM blocker (`ActAs`) was resolved via
  owner-account `firebase login`; the transient analyzer timeout was resolved with
  `GCLOUD_PROJECT=msariapp-v2`.

### 6. Production verification (website hardening) — PASS
- `HARD-PROD=5/5` (`/ar`, `/ar/hotels`, `?page=2`, `?page=3`, `/ar/destinations/aden`).
- No credential leakage; canonicals intact; aden lists its hotels (panorama present).
- servedFrom log confirmation (`cities-serve: api` as primary) requires Vercel log access —
  owner filter: `cities-serve`. Code paths proven locally; failure mode proven to log
  `direct-fallback` explicitly (never silent).
- ✅ CONFIRMED by owner (Vercel Logs screenshot): entries from 08:59:54 onward show
  `"servedFrom":"api","count":9` on `/ar`, sitemaps, hotel pages; `getDestinationBySlug`
  resolutions served from API for sanaa/ibb/mukalla/aden. Root cause of the earlier
  `direct-fallback/401` streak was a stale `MSARI_API_KEY` value in Vercel env — fixed by
  pasting the valid server key + Redeploy. API-first is now effective in production.
- Incidental 404 (`/ar/hotels/joud-tourist-hotel/rooms/...`, bot-style): hotel detail verified
  200; unknown-room → 404 is correct behavior, unrelated to cities migration.

### 7. Quality gates (hardening)
- [x] `tsc --noEmit` PASS · [x] `npm run build` PASS · [x] ESLint 0 errors (6 pre-existing warnings)
- [x] commit `b7da92d` + push `main` + Vercel deploy verified (5/5)
- ⏳ API `6f8ecd1` committed, deploy pending owner (IAM blocker above — environmental, not code)

## Final status
- CITIES API-FIRST = CLOSED (website mode ON + API v8 aligned contract, live parity 9/9,
  production 5/5 post-deploy). Direct = logged fallback only.
