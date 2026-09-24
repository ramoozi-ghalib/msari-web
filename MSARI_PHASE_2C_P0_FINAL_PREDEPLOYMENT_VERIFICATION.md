# MSARI_PHASE_2C_P0_FINAL_PREDEPLOYMENT_VERIFICATION.md

> Verification gate only. No P1. No migration. No deployment. No keys issued/rotated.
> Statuses: PROVEN / NOT PROVEN / FAILED / UNKNOWN (no bare PASS).

---

## 1. Executive Status

- B1 pepper handling: **PROVEN** (code + behavioral, both pepper states).
- B4 idempotency: **PROVEN** for sequential replay; **known limitation-DOCUMENTED** for true concurrency
  (check-outside-txn window exists structurally; redesign deferred per scope rules).
- B5 identity semantics: **PROVEN** (code + 1 test per sub-point).
- Release/rollback: artifact exists (`D:\projects\msari\releases\p0-20260908`, hashed manifest);
  baseline reconstructed by exact inverse hunks (verified markers + syntax).
- Suites: P0 **26/26**, legacy **16/16**, B1 **4/4 effective** (2 runs).
- STOP items triggered: **none** (no plaintext secrets, no leakage, no cross-partner access,
  no ownership change, no admin escalation, no txn redesign, no rules change).

## 2. B1 Evidence

- Code: pepper read ONLY via `getPepper()` → `process.env.CREDENTIAL_PEPPER` (3 refs, all reads);
  hardcoded-pepper grep = 0; pepper-in-logs grep = 0; only env vars in functions:
  `CREDENTIAL_PEPPER, API_ENVIRONMENT`.
- Behavior (fake non-prod pepper + unset runs): unset → new-model 500 fail-closed + legacy 200
  unchanged (PROVEN); fake pepper binds verification (PROVEN); secret never in body/logs (PROVEN).
- Production provisioning: **NOT DONE** (correctly — doing so is a deployment action). Blocker B1
  stands as activation gate, fail-closed by design.

## 3. B4 Evidence

- Record shape (code): `idempotency/{partnerId_sha256(endpoint:key)}` =
  `{partnerId, endpoint, status, response, createdAt, expiresAt: now+24h}`.
- Scope: partner+endpoint (different partner same key → different doc — test 13 PROVEN).
- Secrets: key stored as SHA-256 only; response snapshot contains booking fields (TTL 24h,
  partner-scoped lookup) — no credential secrets, no raw request bodies.
- TTL: 24h enforced on read (expired → miss); Date-object expiry bug found and fixed during
  verification (expiresAt now accepts Timestamp or Date).
- Replay: same key replays original 201 + bookingNumber, zero new writes (test 12b PROVEN).
- Payment evidence: idempotency NOT applied (multipart/file flow unsuitable — documented, unchanged).
- Concurrency: probe (2× simultaneous same key) returned single execution under mocked instant IO
  (26/26), but code inspection proves a check-outside-transaction window under real Firestore latency.
  Redesign (transactional claim + conflict path) exceeds small/safe fix scope → **REPORT ONLY**,
  documented limitation, P1 candidate. No silent PASS claimed.

## 4. B5 Evidence (code-verified, each with test)

Partner=org identity (`partnerId`); Credential=key record; Actor=`req.partner`; Booker=submitter
(user or partner-on-behalf); Customer/Owner=`customerId` unchanged (txn set line untouched);
Traveler=`otherGuest` fields unchanged.
1-5. customerId meaning kept; partnerId additive (`...(cond?{partnerId}:{})`); no replacement;
   client partnerId ignored (test PROVEN); source = resolved credential only.
6-7. A-cannot-act-as-B (test 13/13b/7 PROVEN); access = owner/admin/own-partner only.
8-9. Owner flows byte-identical (legacy suite 16/16); confirm/reject still admin-only (test 9 PROVEN).
10-13. Totals/availability/payment/txn code paths untouched (diff-reviewed); existing docs gain at most
   one additive field post-deploy.
Mapping table complete; nothing UNKNOWN.

## 5. Release/Rollback Evidence

- Changed files: `functions/index.js` (12 documented hunks), `partnerAuth.js` (new),
  `test_p0_partner_iam.js` + `test_b1_pepper.js` (new). Nothing else in repo touched.
- Baseline: `releases/p0-20260908/baseline/index.js` (inverse-hunk reconstruction; verified 986
  lines, original middleware present, zero P0 markers, syntax OK) + `current/` snapshot + hashed
  MANIFEST. Rollback = file copy + delete new files; no data deletion; no rules/auth to revert.
- Honesty note: no VCS exists in `D:\projects\msari`; baseline is reconstruction-verified, not
  hash-anchored to a prior commit. Deployment of any kind: NONE performed.

## 6. Regression Results

P0 suite 26/26 PROVEN (incl. race probe + legacy compat). Legacy suite 16/16 PROVEN. B1 suite
4/4 effective across both pepper states. No test file beyond B1/B4/B5 scope added.

## 7. Data Safety

No PostgreSQL; no duplicate operational collections (only runtime `idempotency` docs);
`partnerId` additive; idempotency additive; no destructive migration; no Rules/Auth changes;
no unintended booking mutation (all mutation tests assert exact state). No cleanup performed.

## 8. Proven / Not Proven / Failed / Unknown

- PROVEN: B1 handling, sequential idempotency, cross-partner/key separation, identity semantics,
  ownership/admin preservation, legacy compat, no-leak properties, rollback artifact existence.
- NOT PROVEN (by design): production behavior (not deployed), real-pepper provisioning.
- FAILED: none. UNKNOWN: live Firestore record shapes (reads blocked), real-traffic concurrency rate.

## 9. Remaining Deployment Blockers

B1 pepper provisioning (Secret Manager) · B2 no VCS/CI · B3 no staging (mocked tests only) ·
concurrent-idempotency redesign deferred (documented, P1).

## 10. Final Recommendation

**HOLD FOR ARCHITECTURE GATE — DO NOT DEPLOY** until B1–B3 close. Code is verified to the
maximum extent possible without staging/production; the remaining items are environmental,
not code defects (except the documented idempotency window, already scoped to P1).
