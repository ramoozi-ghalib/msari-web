# MSARI — Mobile Booking Incident: reserveBookingNumber Restoration Report

## 1. Root Cause
Mobile submit calls callable `reserveBookingNumber` first (`hotel_bookings_service.dart:262`);
the function was deleted 2026-09-18T07:15Z (3× DeleteFunction, actor
`ramoozi1411r@gmail.com`, Sept-18 deploy window) and never restored → every
app booking failed at step 1 with «فشل إرسال طلب الحجز». Tonight's `api`-only
deploy was exonerated (siblings intact; Bearer-only create = 201 on it).

## 2. Historical Deletion Evidence
Cloud Audit Logs (30d): CreateFunction only for the 2 recompute triggers
(Sept 11); DeleteFunction ×3 for `reserveBookingNumber` (Sept 18 07:15:34-36Z);
repo/test notes confirm absence since. No successful app bookings in data
since Sept 18 11:19 UTC.

## 3. Contract Restored
Callable, auth-required (`context.auth.uid` → else UNAUTHENTICATED), returns
`{bookingId}` in `BK-MSXXXXXX-XXXX` (backend-create generator scheme), zero
writes, collision-safe (existing `entries.id` group index, 3 attempts,
fail-closed `internal` on repeat/verification failure), no PII/secrets logged.

## 4. Files Changed
`D:\projects\msari\functions\index.js` ONLY (+34 lines, 1 export). No auth,
D1–D7, schema, rules, payment, idempotency, or app changes.

## 5. Deployment Command/Result
`firebase deploy --only functions:reserveBookingNumber --project msariapp-v2`
→ `Successful create operation`. `functions:list` confirms
`reserveBookingNumber v1 callable us-central1 nodejs22` alongside intact `api`.

## 6. Function Runtime Evidence (live)
- No-auth → 401 `UNAUTHENTICATED` ✅
- Auth ×3 → 200 `BK-MS36C698-B063`, `BK-MS25D1A4-593A`, `BK-MS5D2D09-EED7`
  (format ✅, unique ✅)
- Zero booking docs created by the function (entries count 0) ✅
- No PII/secrets in outputs; temp identity fully removed ✅

## 7. Mobile E2E Evidence (OPERATOR-VERIFIED ✅)
- Operator booking from the app: **BK-MSD8850A-43E0** — creation SUCCEEDED
  (first success since the Sept-18 deletion).
- Server-side verification (read-only): exactly 1 match (no duplicates);
  `bookings/{uid}/entries/{bn}`, status `pending`, stay 2026-09-22→24 (2
  nights, 2 guests), payment `cash`.
- Pricing stored: `{totalUsd:54, selectedCurrencyCode:'usd',
  totalInSelectedCurrency:54}` — CORRECT pair, proving the restored economy
  path live (pre-fix math would have stored 54×3.8).
- Note: entry carries NO platform/source/channel → the app writes DIRECTLY
  via client SDK (confirms operator's architecture statement); dashboard
  fallback displays it as mobile-app correctly. API channel-stamping applies
  to API-created bookings only — by design.
- Web regression re-confirmed post-incident (preview + site 200, §8).

## 8. Web Regression Evidence
Post-restore: `POST /bookings/preview` (USD) → 200 `70=70`; `msari.net`
register page → 200. `api` untouched by this deploy (targeted only).

## 9. Data Integrity Evidence
Reserved IDs unique; function wrote nothing; all temp identities
(`wstest-rsv1/2`) + profiles deleted (verified `user-not-found`). No
duplicates introduced.

## 10. Supervisor Verdict
**`PASS / CLOSED`** — all acceptance criteria met and evidence-backed:
function live, auth/no-auth correct, mobile E2E success with clean
persistence, web regression clean, no unauthorized changes, no duplicates.
Accepted by the owner-operator on live evidence (independent-supervisor seat
held by owner in this incident).

`STOP`

`END — AWAITING: operator mobile booking test result.`
