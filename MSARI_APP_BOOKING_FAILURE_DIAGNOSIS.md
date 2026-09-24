# MSARI — App Booking Failure («فشل إرسال طلب الحجز»): Comprehensive Diagnosis
## Method: READ-ONLY. Zero code/data/config changes in this diagnosis.

## 1. Change Inventory (tonight 2026-09-20 → 21)
| # | Change | Target | Deploy state |
|---|---|---|---|
| 1 | Signup fix (bcrypt/phone/parser/timeouts) + redirect + phone picker | `msari_web` (3+2 files) | Vercel, verified live |
| 2 | Preview: token-refresh retry, timeout 25s, error banner, proceed gate | `msari_web` (5 files) | Vercel, verified live |
| 3 | Currency display (totalUsd SoT), history retry, BookingTotal | `msari_web` | Vercel, verified live |
| 4 | `currencyRate()` + 2 call sites; origin stamping (platform/source/channel) | `msari/functions/index.js` (31+/2-, 4 hunks ONLY) | functions:api, verified live E2E |
| 5 | Dashboard: USD-SoT display, localized names, delete policy | `msari_dashboard` (5 files) | Hosting, verified live |
| 6 | Data merges: pricing fix ×2 docs, channel backfill ×1 doc | Firestore 2 docs | Verified by re-read |
| 7 | Test accounts (several) | Auth + customers | ALL deleted, verified `user-not-found` |

## 2. Fault Tree (evidence per branch)
- **B1 — my currency math broke sends.** RULED OUT. Pure function, same results
  for all previously-correct codes; live preview(USD) 200 with 70=70;
  math cannot emit 401.
- **B2 — channel/platform fields broke sends/reads.** RULED OUT. Additive
  top-level fields; created booking read back fully; no validation on them.
- **B3 — bad deploy revision.** RULED OUT. Post-deploy: register 201,
  preview 200 (×several), create 201, cancel 200 — revision healthy.
- **B4 — Firestore Rules change.** RULED OUT. `firestore.rules` untouched
  (old commit, clean tree); direct writes unaffected by Functions code anyway.
- **B5 — data merges broke the app.** RULED OUT. Two merge-updates on
  historical docs; send path (new docs) untouched.
- **B6 — website/dashboard changes affect the mobile app.** RULED OUT.
  Separate clients; no shared runtime.
- **B7 — dead static `x-api-key` sent by the app.** OPEN. Reproduced exactly
  from here: fresh Bearer + dead key → 401 «Invalid or inactive API Key»
  (untouched `optionalPartnerCredential` deny path). Production key proven
  dead earlier (website preview). Needs: app request inspection.
- **B8 — expired app session (Bearer >1h, no refresh).** OPEN. Firebase ID
  tokens die after 1h; website had the identical disease tonight. Matches
  «worked until recently». Decided by a 1-minute operator test (see §4).
- **B9 — app-client bug (e.g. strict parsing of new `channel` object).**
  OPEN but unprovable without app source. The send-error string exists in
  NONE of the accessible repos (dashboard/web/functions) — it is external.

## 3. Live Signals
- Backend 401 bursts 22:35–22:49 UTC (01:35–01:49 local), fast (47–277ms),
  in pairs — middleware rejections consistent with repeated booking attempts
  (preview+create) from a client with dead credentials, overlapping the
  operator's test window. No 500s, no transaction errors.
- Latest non-test booking in data: 2026-09-18 (E2E). No app-originated
  bookings since — neither confirms nor refutes recent app health.
- Mobile app source: NOT present locally (`D:\projects`, `D:\Dev\projects`
  contain no consumer-app project; external/Lovable build assumed).

## 4. Decision Brief
- A backend rollback is available on demand (revert 4 hunks + redeploy,
  minutes) BUT evidence shows it would NOT restore app bookings: the 401s
  come from auth paths (#4-hunk diff touches none) and the key was already
  dead before the deploy.
- Recommended next step (2 minutes, operator-side, decisive): **log OUT and
  back IN on the mobile app, then retry the booking.**
  - Success → B8 confirmed (stale session); no rollback, no fix needed
    (consider app-side refresh with vendor later).
  - Still 401/fails → inspect what the app sends (source/config or proxy
    capture) → B7 vs B9; I proceed on results.
- Commitment: no backend/data/config change without explicit per-change
  owner approval from here on. Rollback stays on standby at owner's word.

## 5. SMOKING GUN — `api_keys` Inventory (live read, metadata only)
- Collection holds EXACTLY ONE record: `Msari 2` (partnerId `MSARI 2`),
  status=active, **env=sandbox**, new-model, full scopes,
  updated 2026-09-19T23:52Z.
- **NO legacy site-key record exists** (zero docs with a `key` field). The
  Step-2 E2E «transitional full-access» key (working 2026-09-18) is GONE —
  deleted on/before the Sept-19 credential operation. This session never
  wrote `api_keys` (dashboard work was UI-only; no live Partner E2E run).
- Consequences: (a) EVERY request carrying the old site key → 401
  «Invalid or inactive API Key» via the silent deny path (matches the
  observed bursts AND the total absence of «Token verification error»
  lines — Bearers verify fine); (b) even the surviving credential is
  **sandbox** → unusable in production (`API_ENVIRONMENT=production`):
  there is currently NO valid production credential at all;
  (c) website sync routes still 401 (masked by Direct fallbacks);
  (d) any mobile-app copy of the old key has been dead since ~Sept 19 —
  BEFORE tonight's backend deploy. My deploy is exonerated by timeline too.
- **B7 CONFIRMED** (modulo which exact key string the app sends — any old
  value now misses). B8 ruled out by the fresh-login failure. B9 moot.

## 6. Remedy (OWNER DECISION REQUIRED — secrets + production data)
1. Issue a NEW **production** credential (Partner Control Plane UI or Admin
   SDK): partnerId `msari-site`/`msari-app`, env `production`, scopes
   hotels:read, destinations:read, rooms:read, bookings:read,
   bookings:create, bookings:cancel, payments:submit-evidence.
2. Configure it where each client expects the static key: mobile-app config
   (rebuild if baked in) + Vercel `NEXT_PUBLIC_API_KEY`/`MSARI_API_KEY` +
   website redeploy (also heals sync routes).
3. Verify: app booking 201 end-to-end; website `/v1/cities` 200 (no fallback).
I will NOT mint production credentials or touch app config unilaterally.

## 7. TRUE ROOT CAUSE — Missing `reserveBookingNumber` Callable (PROVEN)
- App submit flow (`hotel_bookings_service.dart:262-276`) FIRST calls callable
  `reserveBookingNumber`; ANY error → throws → dialog «فشل إرسال طلب الحجز».
- The function EXISTS NOWHERE: no export in `functions/index.js` (only
  `api` + 2 firestore triggers), absent from repo history (`test_historical`
  docs), and `functions:list` on msariapp-v2 shows only those three.
  `test_deployment.js` is an un-executed deployment PLAN for it.
- Therefore EVERY app booking fails at step 1 — structurally, independent of
  tonight's deploy, the key, or sessions. «Worked until recently» reflects an
  older app build/flow (client-side numbers) or older backend state, NOT my
  change: my deploy touched ONLY `functions:api` (others listed intact), and
  a rollback would leave the function equally missing (rollback USELESS here).
- The 401 bursts are a SEPARATE phenomenon (dead-credential polling from
  another client — website legacy session or similar), not the app's
  send-failure (the app never reaches the API at all).
- REMEDY (owner decision): **(A, recommended)** implement + deploy additive
  `reserveBookingNumber` callable (auth-required, returns `BK-MSxxxx-xxxx`,
  no writes — matches the contract in `test_supervisor.js`); app works
  unchanged. (B) change the app to client-side numbers (app release cycle).
  (C) rollback backend — explicitly NOT recommended (fixes nothing).

## 8. CORRECTION After Deep Audit (answers operator's 3 questions)
- **Q1 — why did it disappear?** It EXISTED and was **deleted
  2026-09-18T07:15:34-36Z** (3× `DeleteFunction` on `reserveBookingNumber`,
  actor `ramoozi1411r@gmail.com`) — inside the Sept-18 D6-fix deploy window,
  almost certainly via the «delete functions not in local codebase» prune
  prompt of a full functions deploy. My earlier «never existed» (based on a
  repo-history note) was WRONG — corrected here. My tonight deploy was
  targeted `functions:api` only (siblings listed intact) and deleted nothing.
- **Q2 — worked until today?** Consistent: deletion Sept 18; zero
  non-test bookings in data since Sept 18 11:19 UTC. Tonight was likely the
  first app-booking attempt since — correlation with my deploy is
  observational timing, not causation (proven: Bearer-only create = 201 on
  the current revision; my 4-hunk diff cannot emit 401s).
- **Q3 — verified root cause:** app submit REQUIRES the callable
  (`hotel_bookings_service.dart:262`, in-app since the old a6dc31e commit);
  missing callable → every attempt fails at step 1 with exactly
  «فشل إرسال طلب الحجز». Restore = (re)implement the export per the
  documented no-write identifier contract + deploy. Backend change —
  explicit owner approval required (not proceeding unilaterally).

`END — AWAITING OWNER: approve (re)implement+deploy reserveBookingNumber, or direct otherwise. No rollback rationale remains (nothing of mine to blame), but rollback stays available on demand.`
