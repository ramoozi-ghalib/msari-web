# MSARI — API-First Next Resource — Completion Report: Rooms (room-detail fallback)

## 1. Resource المختار
Rooms — specifically the room-detail page fallback branch
(`app/[locale]/hotels/[slug]/rooms/[roomId]/page.tsx`). Full selection rationale in
`MSARI_NEXT_RESOURCE_DECISION.md`. Hotels/Cities phases were NOT reopened.

## 2. Source of Truth
Firestore subcollection `hotels/{hotelId}/rooms` (+ Storage images). Unchanged; no schema,
Rules, Auth, booking, or payment changes.

## 3. Current direct paths (rooms inventory)
- `actions/hotels.ts` fan-out (list probe/full, detail, nearby-batch): KEPT — this is the
  hotels fallback, deleting it would remove resilience. Explicitly out of scope.
- `actions/bookings.ts` transaction + price-verification reads: FORBIDDEN — untouched.
- Room page fallback `apiClient.getRooms` (legacy browser-key client): MIGRATED (this work).
- No rooms list page exists; rooms travel inside hotel payloads (already API-first via Hotels ON).

## 4. API contract
`GET /v1/rooms?hotelId=` (functions/index.js:632) — pre-existing, frozen except one minimal
parity fix: dropped the query-level `.where("isDeleted", "==", false)` (it silently excluded
docs missing the field) in favor of JS filtering `isDeleted !== true`, exactly matching website
semantics. Additive output only (9 previously-invisible published rooms of one hotel now served);
no field removed/renamed, no new params — non-breaking. API commit `419f070`, deployed by owner
(3 functions, 0 errored; `api` version bumped).

## 5. Changes (website)
- `rooms/[roomId]/page.tsx`: legacy `apiClient.getRooms` replaced with migration router
  `findRoomFallback` — `OFF` direct-only; `SHADOW` direct + background compare; `CANARY` 5%
  deterministic time-bucket with diff-gate; `ON` API-primary (`apiFetchRooms`, server-only
  `MSARI_API_KEY`, 8s cap) with explicit direct subcollection fallback. Genuine absence on
  both paths → `notFound()` (no 404-masquerade: adapter throws on 401/403/5xx/timeout).
- Reused proven helpers (`apiFetchRooms`, `toWebsiteRoom`) — zero new mapping logic.
- Commits: `b956e6e` (SHADOW) → `6a65d43` (CANARY) → `9d7b6dd` (ON) → `dd6b29a` (lint-clean).

## 6. Parity results — PASS 100%
`scratch/parity-rooms.js` (read-only, website-identical mapping expressions):
- First run: 259 direct vs 250 API — exactly 9 rooms of ONE hotel missing `isDeleted`,
  zero field diffs. Root-caused to the API query filter (fixed, §4).
- Post-deploy re-run: `259/259, diffs: [], match: true` across 57 hotels
  (IDs, ar/en names, price, capacity, images, features, published flags, ordering).
- Synthetic-adjacent stat: 9 docs missing `isDeleted`, 0 missing `isPublished` globally.

## 7. Shadow results — PASS
- Local SHADOW (production build): valid room 200, invalid room 404 (branch exercised end to
  end: direct miss + API miss → genuine `notFound`).
- The 259/259 parity run is itself a full shadow comparison (direct vs API, zero diffs).
- Note: in production the branch fires only when a room is absent from the (already API-first)
  hotel payload, so shadow/canary serve-logs are expected to be sparse by design.

## 8. Canary results — PASS
- 5% deterministic bucketing (same time-bucket mechanism as hotels/cities), diff-gated to
  direct on any mismatch or error. Prod CANARY: valid room 200, invalid room 404, detail 200.

## 9. Production results — PASS
- CUTOVER prod: 5/5 (`/ar`, `/ar/hotels`, panorama detail, valid room page, `/ar/destinations/aden`);
  invalid room → genuine 404. Final cleanup deploy re-verified 3/3.
- No credential leakage (room HTML scanned); canonical intact
  (`https://msari.net/ar/hotels/panorama-hotel/rooms/<id>`); hotel list/pagination/images/SEO unchanged.
- Booking/payment flows untouched (separate transaction code, never modified).

## 10. Rollback verification — PASS
- Local ON + `MSARI_API_KEY=INVALID_KEY_PROBE`: valid room 200 (direct fallback), invalid
  room 404 (no exception, no masquerade). Production secret never used in tests.
- Instant rollback = `MSARI_API_ROOMS_MODE=off` (or revert); direct path retained as code.

## 11. Security verification — PASS
- Server-only `MSARI_API_KEY` via `getServerApiKey()`; zero `NEXT_PUBLIC_*` in the new path;
  this change also removed the last `apiClient.getRooms` (browser-key) call from a server
  component. No key in HTML or client chunks (room page scanned).

## 12. Performance / read-amplification — PASS
- One bounded `GET /v1/rooms?hotelId=` replaces one legacy call — no fan-out, no N+1
  (the hotels-list probe fan-out is pre-existing fallback code, untouched).
- No caching of live data: rooms here are catalog data; availability/inventory/booking state
  never pass through this path.

## 13. Commit hashes
- API: `419f070` (functions repo `master`, deployed).
- Website: `b956e6e` → `6a65d43` → `9d7b6dd` → `dd6b29a` (`main`, all pushed).

## 14. Vercel/production deployment verification
- Every website commit auto-deployed; final state verified live 3/3 + cutover 5/5 + 404 check.
- API deploy performed by owner (`firebase deploy --only functions`, deletion prompt correctly
  answered N to preserve admin/booking functions from other sources).

## 15. Remaining risks
- None blocking. The hotels Direct rooms fan-out remains (by design — it is the fallback).
- `test_runner.js` remains unrunnable in this environment (pre-existing harness breakage,
  documented in Phase C report) — not a gate for this resource (parity proven live instead).

## Verdict
All gates passed with functional evidence (not build-only). **CLOSE RESOURCE: Rooms.**
