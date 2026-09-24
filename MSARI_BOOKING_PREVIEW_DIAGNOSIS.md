# MSARI — Booking Price Spinner: Diagnostic Report (READ-ONLY, NO FIX APPLIED)

## Symptom (screenshot)
Checkout review step: summary box spins forever on «جارٍ حساب السعر...» while
the review box shows total `$0`. No visible error.

## What the Screenshot Proves
`BookingSummaryBox` spins ⟺ `serverTotal === undefined`
(`BookingSummaryBox.tsx:29`), and the review box shows `$0` ⟺ `loadingPrice`
is already `false` with `pricePreview === null`
(`BookingPage.tsx:284,329`). I.e. **the preview request already finished WITH
FAILURE** — this is not a hanging request, it is a swallowed error:
`previewBookingPrice` failure → `setBookingError(...)` (`BookingPage.tsx:161`)
but `bookingError` is **never rendered on the review step** (only forwarded to
`PaymentStep`). $0 + eternal spinner + invisible error = the exact screenshot.

## Backend: HEALTHY (proven live, production)
`POST /v1/bookings/preview` with the screenshot's real IDs
(hotel `RWss6UEDATA4inC5VA1x` = فندق أوشن عدن, room `367xuvczrmFf6ZiejkQD` =
غرفة فردي, 2026-09-21→23, 1 guest) and a fresh token → **200**
`{nights:2, totalUsd:70, totalInSelectedCurrency:266, currency:"sar",
available:true}`. Math correct (35×2). Room published, IDs consistent across
website Direct/API/backend paths (`hotels/{id}/rooms/{id}` everywhere).
No-auth → 401; expired/bad token → 401 «Invalid or expired ID Token».
(Side note: a single-field collectionGroup probe on `entries.hotel.id` lacks
an index, but the backend's two-filter `(hotel.id, room.id)` query is served —
preview itself is not index-blocked.)

## Frontend: three failure gates, any one reproduces the symptom
1. **Stale Firebase token (prime suspect).** `previewBookingPrice`
   (`src/actions/bookings.ts:297-300`) sends the session's `firebaseToken`;
   Firebase ID tokens expire after **1h** while the NextAuth JWT session lives
   **24h** (`auth.ts:46`), and the website has **zero token-refresh logic**
   (no `auth/refresh`, `refreshToken`, or refetch anywhere in `src/`).
   Any session older than 1h → 401 → failure object → $0 + eternal spinner.
   A user browsing hotels before checkout easily exceeds 1h.
2. **Silent skip.** `if (firebaseToken && roomId)` (`bookings.ts:300`): no token
   OR no `room` URL param → API never called → same silent failure string.
3. **3.5s default timeout.** `previewBooking` uses the client's default
   3.5s budget while the backend runs a collection-group transaction
   (cold starts + scans exceed it) → `TIMEOUT_ERROR` → same silent failure.

## Secondary UX defect (error swallowing)
On preview failure the review step shows no error at all; the user can even
proceed («متابعة الحجز») with a $0/undefined total into guest/payment steps.

## Recommended fix direction (AWAITING APPROVAL — not implemented)
- Refresh (or re-login-gate) the Firebase token before authenticated calls
  (use existing `POST /v1/auth/refresh`), and/or surface a «session expired,
  please re-login» state.
- Render `bookingError` on the review step; block «متابعة الحجز» while
  `pricePreview` is null.
- Raise preview timeout (auth calls already use 15–25s; preview still 3.5s).
- Optionally require `roomId` (redirect back with message when absent).
No backend/schema/rules change needed. No files modified in this diagnosis.
Test accounts created during diagnosis were fully removed (verified
`auth/user-not-found`); no residue.

## Fix Applied (operator-approved 2026-09-20, deployed)
1. **Transparent token recovery** — `refreshToken` now persisted through
   login (`api-client` → `authorize` → JWT → session; `next-auth.d.ts`
   extended); new `POST /v1/auth/refresh` client; `callWithFreshToken` helper
   in `actions/bookings.ts`: on 401 → refresh + single retry (preview AND
   create paths); single retry on read-only preview timeout. Verified live:
   refresh(valid)→200, refresh(invalid)→400. Legacy pre-fix sessions lack a
   stored refreshToken → clear «session expired» message instead.
2. **Error visibility + gating** — review step renders `bookingError` banner
   (with re-login hint for session errors); «متابعة الحجز» disabled while
   loading or priceless (button states: calculating / continue / blocked).
3. **Preview timeout 3.5s → 25s** (matches register; preview is read-only).
Files: `lib/api-client.ts`, `auth.ts`, `types/next-auth.d.ts`,
`actions/bookings.ts`, `app/[locale]/booking/BookingPage.tsx`. tsc clean,
build success, deployed `dpl_8vSz2MfK7KM2MnoGkC38SfZBP5EB` → `https://msari.net`
(register 200). No backend/schema/rules change. Diagnosis test accounts removed.

## Root Cause — CONFIRMED by Production Log (10:12 attempt)
Vercel log `[booking-preview-failed]`:
`{"code":"unauthorized","message":"Invalid or inactive API Key",hotelId:
"RWss6UEDATA4inC5VA1x",roomIdPresent:true,hasRefresh:true}` (×6).
**Not the Bearer token — the static `x-api-key`.** The website attached the
(site) static key to every call; backend `optionalPartnerCredential`
(`partnerAuth.js:207-222`) treats a PRESENT-but-dead key as fatal → 401,
while an ABSENT key is a clean skip (proven: all direct 200 probes sent no
`x-api-key`). The production key record is inactive/gone server-side, so
every user-authenticated call carrying it died — preview visibly, and the
same dead key also explains the `/v1/cities → HTTP 401` sync fallbacks in
Vercel logs. Bearer session was fine (`hasRefresh:true`).

## Fix Applied (same session, deployed)
- `lib/api-client.ts` `request()`: **omit `x-api-key` whenever an explicit
  `Authorization: Bearer` is present.** Static key now flows only to
  server-to-server sync routes (hotels/cities/rooms — never Bearer).
  Affects 7 user-flow call sites (me/preview/create/history/cancel/payment/
  detail), all backend-optional-safe.
- Permanent `[booking-preview-failed]` tripwire kept (no tokens/PII).
- Deployed `dpl_F2nXYD6kqW9irNvtYzThmKBW6GYH` → `https://msari.net`
  (register 200). tsc clean. No backend/schema/rules change.
- ESCALATED (backend/data owner, not fixed here): the site static key record
  itself is dead — sync routes (cities/hotels/rooms API path) still 401 and
  survive only via Direct-Firestore fallbacks. Reactivating/rotating it is a
  backend-data decision.

## Follow-up Finding — Currency-Unit Mismatch (reported post-fix, diagnosed, NO FIX)
- Symptom: checkout shows `$399` for 3 nights; true price `$105` (room page
  correct: 35×3).
- Mechanism (fully determined, no further probing needed): backend preview
  returns BOTH `totalUsd:105` and `totalInSelectedCurrency:399` with
  `currency:"sar"` (website sends no `currency`, backend defaults to `sar`).
  The action maps `finalTotal = totalInSelectedCurrency` (399 SAR), but the
  UI formatter `formatPrice(usdAmount)` contractually takes a **USD** amount
  (`hooks/use-currency.ts:22`) → renders `399` as `$399`. Wrong unit +
  wrong symbol. `serverCurrency` prop is plumbed but never used in formatting.
- Payment impact: `expectedTotalUsd={pricePreview?.finalTotal}` feeds 399
  (SAR!) under a USD name — currently the prop is declared/destructured but
  never consumed in `PaymentStep.tsx`, so no live harm; the label lies.
- Proposed minimal fix (AWAITING APPROVAL): map
  `finalTotal = totalUsd` (USD SoT) and let `formatPrice` convert/display per
  user currency (default `$105`; SAR cookie → ≈401 ر.س); `expectedTotalUsd`
  becomes truly USD. No backend change. Room-page figure already matches.

## Follow-up Finding 2 — My-Bookings $399 (diagnosed, NO FIX)
- Symptom: `حجوزاتي` shows `إجمالي الحجز: $399` for BK-MSAD38E6-1598 (true: $105).
- Chain: list maps `totalPrice = pricing.totalInSelectedCurrency` +
  `currency = selectedCurrencyCode||USD` (`actions/bookings.ts:476-477`);
  page prints `$…` on the USD branch. Display is faithful — **the stored
  snapshot is corrupt**.
- Backend root (`functions/index.js:1103`): `ratesData[selectedCurrencyCode]
  || ratesData.sar`. Live `rates/global` keys are ONLY `sar,yerSouth,yerNorth`
  (no USD key in any case). Cross-snapshot proof: lowercase `usd`/`sar`/
  `yerSouth` bookings are correct pairs (28=28, 60→228, 30→46830); recent
  UPPERCASE `USD` bookings are corrupt (105→399, incl. older cancelled
  `BK-MS277313`). The app «works» only because it sends lowercase local
  currencies whose keys exist — the same API would corrupt an app-sent USD
  booking today. True unification needs backend: restored USD rate (1.0),
  case-insensitive lookup, correct fallback — ESCALATED.
  Same line exists in preview (`:803`) — preview display was fixed
  website-side by preferring `totalUsd`.
- Proposed website-only mitigation (AWAITING APPROVAL): map list
  `totalPrice` from `pricing.totalUsd` (trustworthy for all website bookings;
  consistent with checkout + room page). No backend change.
- ESCALATED to backend/data owner (out of website scope, STOP-grade):
  (1) normalize currency case + explicit USD=1.0 in create AND preview;
  (2) correct the stored snapshot of BK-MSAD38E6-1598;
  (3) `transferAmount` (user-typed) is snapshotted without verification
  against the expected total — financial-integrity review;
  (4) FYI: no collection-group index on `entries.bookingNumber`
  (only affects ad-hoc probes, not backend reads).

## Follow-up Finding 3 — Booking «Disappeared» from حجوزاتي (diagnosed, NO FIX)
- Data verified INTACT live: entry for this hotel+room present, status
  `pending` (7 entries scanned; no writes performed). Nothing deleted.
- Page renders empty ⟺ `getMyBookings` non-success → `bookings = []`.
  No mapper exception in Vercel logs (would have logged
  `API getMyBookings Error`) → not a rendering crash.
- Cause by elimination: `getMyBookings` is the only booking read path WITHOUT
  the refresh retry (preview/create have it), still on the default 3.5s
  timeout, and it fails SILENTLY. Operator session is several hours old
  (Firebase ID token dies after 1h) → 401 → empty list masquerading as
  «no bookings».
- Proposed fix (AWAITING APPROVAL, same approved pattern): wrap the history
  call with `callWithFreshToken` (401→refresh+retry once), raise timeout to
  15s, add failure tripwire log. Website-only.

## Follow-up Finding 4 — Operator Booking Missing from حجوزاتي (resolved)
- The entry `BK-MSAD38E6-159B` NO LONGER EXISTS under any of the 55 `bookings`
  parents (full scan). Earlier collectionGroup sightings were stale index
  ghosts (7→8→9→gone). Conclusion: the document was hard-DELETED via
  dashboard/console (`deleteBooking` batch-delete exists in
  `bookings_service.dart:258`). No session script performed any booking
  deletion (all test bookings were cancelled, never deleted; test Auth
  users/profiles removed per protocol).
- `BK-MS277313-D984` pricing corrected live (105=105).
- Deployed this cycle: functions:api (USD rate + channel stamping, verified
  E2E) → website `dpl_3MsriVrtHakVvBtfd5ifcrVTWqnW` (platform send) →
  dashboard hosting `msariapp-v2.web.app` (USD-SoT display + localized names).
- GOVERNANCE RECOMMENDATION (owner decision): hard-delete of operational
  (financial) bookings from the dashboard should be restricted/removed in
  favor of cancel-only. Awaiting direction; not implemented.
- NOTE: deleted booking cannot be resurrected from nothing — a fresh booking
  will now carry correct pricing + website channel automatically.

`END — ALL APPROVED FIXES DEPLOYED AND VERIFIED; DELETION SOURCE + DELETE-POLICY PENDING OWNER`
