# MSARI_PHASE_2C_P0_IMPLEMENTATION_REPORT.md

> P0 implementation executed in `D:\projects\msari\functions` (+ this report in `msari_web`).
> No production deployment. No keys issued/rotated/revoked. No secrets displayed.
> No Firestore/Rules/Auth/booking-semantics changes beyond additive attribution.
> Lovable untouched. Website/mobile/CMS untouched.

---

## 1. Executive Summary

Partner IAM + scoped authorization implemented on the live API shape: HMAC credential model
(prefix lookup, hash-only, fail-closed without pepper), central scope middleware, environment
binding, partner isolation on bookings, additive `partnerId` attribution, idempotency foundation.
**25/25 new P0 tests + 16/16 pre-existing suite tests pass (mocked, local).**
Legacy plaintext keys keep working identically (transitional). **Not deployed — gate decision required.**

## 2. Files Changed

| File | Change |
|---|---|
| `functions/partnerAuth.js` | NEW (~330 lines): credential model, HMAC verify, scope gate, env binding, isolation helper, idempotency store/check, audit hook |
| `functions/index.js` | PATCHED hunks: require+init (§~12), apiKeyMiddleware rewrite (new+legacy resolve), `requireScope` + route wiring (`/v1/hotels→hotels:read`, `/v1/cities→destinations:read`, `/v1/rooms→rooms:read`), booking POST (attribution+idempotency), GET/PATCH booking partner access, payment partner evidence, 3 audit hooks |
| `functions/test_p0_partner_iam.js` | NEW: 25-test mocked suite (port 3100) |

Rollback (no VCS in `D:\projects\msari`): delete the 2 new files; in `index.js` restore the
original `apiKeyMiddleware` body, remove `requireScope` wiring + partner lines (hunks listed above).
Zero data cleanup needed (only additive `partnerId`/`idempotency` docs created at runtime post-deploy).

## 3. Architecture Mapping (Phase 2B → code)

Credential model→`partnerAuth.resolveCredential`; lifecycle→status/expiry fields + revoke semantics;
HMAC→`hmacSecret`+constant-time; scopes→`requireScope`; env→`environment`+`API_ENVIRONMENT`;
isolation→`canAccessPartnerBooking`; attribution→`partnerId` stamp (client value ignored);
idempotency→`idempotency/{partner_hash}` 24h; rate-limit slot→comment marker after authz (no logic,
per spec); audit→`emitAudit` console lines (no PII/secrets).

## 4-9. Partner / Credential / Authorization / Environment / Attribution / Idempotency

- Credentials: `msari_live_<id>.<secret>` / `msari_test_…`; multi-per-partner capable; show-once and
  rotation are Dashboard-side flows (not implemented here — no issuance code added by design).
- Pepper: `CREDENTIAL_PEPPER` env only; absent → new-model deny (500), legacy unaffected. **BLOCKER
  for activation: pepper must be provisioned via Secret Manager before deploy (fail-closed by design).**
- Legacy path byte-identical behavior (tests prove); scoped credentials enforced per route.
- Cross-env: DENY (test 5). Prefix alone grants nothing.
- Booking: owner/admin paths untouched; partner paths additive (read own, cancel own-pending,
  receipt-submit own). Confirm/reject stay admin-only (test 9).
- Idempotency: partner+endpoint scoped, 24h, replay returns original (tests 12/13); secrets/payloads
  never stored (key SHA-256 only).

## 10. Security Tests — 25/25 PASS (plus 16/16 legacy suite)

Valid/invalid/missing/revoked/expired/wrong-env credentials; missing scope 403; cross-partner 403;
own-read 200; admin-op-from-partner 403; users+bank 404 (no endpoints); idempotent replay; cross-partner
key separation; secret-never-logged/returned; no NEXT_PUBLIC in functions; legacy compat ×2; partner
cancel; plain-booking unaffected; client partnerId ignored; collections/pricing intact.

## 11. Data Tests

No duplicate collections (only runtime `idempotency` docs); no PostgreSQL; booking totals/ownership/
payment shapes unchanged; `partnerId` additive-only; existing bookings unaffected.

## 12-13. Functional + Regression Tests

All 16 pre-existing gateway tests pass unchanged (auth, sync, bookings, cancel flows).
User-without-partner flows byte-identical (optional middleware skips when header absent).

## 14. Production Status: NOT DEPLOYED

Implementation verified locally (mocked). **Deployment gate items still open:** pepper provisioning,
code+security review sign-off, production smoke tests. Source repo has no VCS — commit/CI story
REQUIRES APPROVAL before any deploy.

## 15. Rollback Plan

See §2. Reverse hunks in order; delete new files; no data migration to undo (`partnerId`/`idempotency`
docs are forward-compatible additions; old code ignores unknown fields).

## 16. Remaining P1/P2 Work

Full rate limiter, usage metering, collection audit trail, Dashboard issuance UI + Control Plane service,
v2 contract docs, site key server-side move, mobile identity, dead-code cleanup, Postgres-retire note.

## 17. Blockers

B1: `CREDENTIAL_PEPPER` provisioning (Secret Manager) — activation hard-requirement, fail-closed now.
B2: No VCS/CI in `D:\projects\msari` — release process undefined. B3: No staging gateway — tests are
mocked only; production smoke tests still required post-approval.

## 18. Exact Evidence

`partnerAuth.js` (new), `index.js` hunks (require §12; middleware §44-100; wiring §~330; booking POST
attribution/idempotency; GET/PATCH/payment partner branches; 3 audit hooks), `test_p0_partner_iam.js`
(25/25), `test_runner.js` (16/16). Test logs retained in run output above.
