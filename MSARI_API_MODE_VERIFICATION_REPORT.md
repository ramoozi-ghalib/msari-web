# MSARI — API Mode Configuration Verification Report

**Mission:** verify purpose/defaults/runtime impact of API routing config. No
production settings, data, auth, booking, or payment behavior changed.
**Date:** 2026-09-27. **Repo:** `msari-web` @ `7487b1e`.

## 1. VARIABLE INVENTORY (code-PROVEN, file:line)
| Variable | Purpose | Accepted | Default | Used in |
|---|---|---|---|---|
| `MSARI_API_HOTELS_MODE` | hotels list/detail/nearby routing | off/shadow/canary/on | **ON** (unset) — but explicit `=on` is DOWNGRADED to CANARY 5% (`actions/hotels.ts:31-41`) | actions/hotels.ts |
| `MSARI_API_CITIES_MODE` | cities/destinations routing | off/shadow/canary/on | **ON** (unset) (`city.service.ts:129-137`) | city.service.ts |
| `MSARI_API_ROOMS_MODE` | room-detail fallback routing | off/shadow/canary/on | **ON** (unset) (room page `getRoomsApiMode`) | rooms/[roomId]/page.tsx |
| `MSARI_API_MODE` | global fallback for all phases | off/shadow/canary/on | OFF (`flags.ts:25-27`) | flags.ts |
| `MSARI_API_CANARY_RATIO` | canary fraction | 0..1 float | 0.05 (`flags.ts:36-38`) | flags.ts |
| `MSARI_API_KEY` | server-to-server credential (`x-api-key`) | opaque string | NONE — `getServerApiKey()` THROWS when absent (`msari-api.ts:22-32`) | api-migration only (server) |
| `MSARI_API_BASE_URL` | API base override | URL | `https://us-central1-msariapp-v2.cloudfunctions.net/api/v1` (`msari-api.ts:34-37`) | server only |
| `NEXT_PUBLIC_API_BASE_URL` | base URL fallback read | URL | same cloud URL | `api-client.ts` getBaseUrl (server-only module — see §4) |
| `NEXT_PUBLIC_API_KEY` | LEGACY browser key (old auth/booking flows) | opaque | empty | `api-client.ts:360` only; never read by api-migration (explicit prohibition, `msari-api.ts:6`) |
| `USE_BOOKING_API` | booking create/preview/history path select | anything ≠`'false'` = ON | **ON** (`bookings.ts:36`) | actions/bookings.ts (no direct fallback remains — OFF disables booking) |

Mode semantics: OFF=direct only; SHADOW=serve direct+background compare;
CANARY=5% API diff-gated; ON=API primary, explicit direct fallback on
transport/auth error, genuine 404 only on true absence.

## 2. PRODUCTION REQUEST PATHS (code-PROVEN)
- List/detail/nearby/rooms/cities: ON ⇒ Cloud API first ⇒ direct Firestore
  fallback on error. Booking (flag ON): Cloud API only, fail-closed.
- `MSARI_API_KEY`: REQUIRED for the API leg (throw ⇒ fallback), OPTIONAL for
  serving (fallback covers). `USE_BOOKING_API=false` kills booking (no fallback).

## 3. PRODUCTION-OBSERVED ROUTING (measured, UTC 2026-09-26/27)
- Cloud Functions `api` log, 60-min window: **185 executions, 185×401, 0×200**.
- Isolated single-page probe (detail, MARK 23:22:56, 7.6s render): exactly
  **3×401** inside the render window (23:22:58/59, 23:23:00).
- Background rate 2–5/min matches real-user page traffic.
- **Conclusion: production serves via DIRECT-FIRESTORE fallback; every
  server-to-server API call fails auth (401).** Either `MSARI_API_KEY` is
  missing on Hostinger or its value is rejected. Which of the two is UNKNOWN
  from outside (needs panel read) — recorded, not guessed.
- Consequence chain (all consistent): TTFB floor ≈ direct Firestore scans
  (raw list read ≈2.2s measured); API-path caches (300s layers) never engage;
  `servedFrom:api` Vercel-era proof does NOT reflect current Hostinger routing.

## 4. CLIENT-BUNDLE HYGIENE (PROVEN, two evidences)
- Shipped `.next/static/chunks`: **zero** matches for `msari_live_|x-api-key`.
- `api-client.ts` carries `import 'server-only'` — any client-component import
  fails the build; build passes ⇒ no client graph contains it. All 30
  api-client/firebase-admin/api-migration importers are server modules.
- `NEXT_PUBLIC_API_BASE_URL` is read only inside the server-only module ⇒
  effectively server-only despite the prefix. `NEXT_PUBLIC_API_KEY` value (if
  set) could theoretically ship via legacy flows — classified legacy, unused
  by migration paths; recommend unsetting it (non-blocking).

## 5. DISCREPANCIES & RISKS
- D1: Intended API-first (ON default) vs observed 100% direct fallback.
  Cause: API auth failure (401), not mode config. Impact: slower pages, caches
  idle, API capacity unused. Fix = owner verifies/repairs `MSARI_API_KEY` in
  hPanel (no code change needed).
- D2: Setting `MSARI_API_HOTELS_MODE=on` explicitly DOWNGREADES to CANARY
  (hotels.ts:35) — surprising semantics; document before anyone "enables" it.
  (Cities/rooms pass the value through unchanged.)
- D3: `USE_BOOKING_API=false` documented in old reports as "safe fallback" —
  FALSE: code has no direct path; OFF = booking dead. Doc corrected in prior
  session; restated here.
- No undocumented booking/payment paths found. No credential exposure found.
- STOP conditions: none triggered.

## 6. UNKNOWNS (kept open)
- Key missing vs key wrong (panel read required).
- Whether background 401s include non-website callers (dashboard pollers?).
- Live rate-limit threshold; live logout re-check post-changes (prior PROVEN).

## 8. INDEPENDENT REVIEW (separate agent, read-only, 2026-09-27)
All 7 claims CONFIRMED with own evidence (causation qualified: log shape has
no URL/caller attribution — clustering is strong but formally correlative).
Two ADDITIONAL findings by reviewer (accepted, queued for next fix cycle):
- R-A: stale comments `hotels.ts:387,736` say "Default SHADOW", code returns
  ON — comment drift, cosmetic.
- R-B: `.env.example` ships `USE_BOOKING_API=false` (kills booking if copied
  verbatim) + flag-off error code `AUTH_REQUIRED` is misleading. Recommend:
  example → `true` with warning comment.
Reviewer unresolved list matches §6 plus R-A/R-B.
## 9. NEXT STEPS
1. Owner: read `MSARI_API_KEY` presence in hPanel (do NOT paste it anywhere);
   if absent, provision website server key; if present, rotate-and-replace.
2. After key repair: re-probe TTFB + confirm `api` log shows 200s to
   `/v1/hotels|/v1/cities|/v1/rooms` during page loads (same correlation method).
3. Optional: unset legacy `NEXT_PUBLIC_API_KEY`; fix D2 semantics comment or
   behavior (owner decision); add SPF Google include (prior thread).
4. Re-gate F-02 numerically after step 2.
