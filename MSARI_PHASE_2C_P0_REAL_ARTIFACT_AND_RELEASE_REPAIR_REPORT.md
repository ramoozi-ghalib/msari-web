# MSARI_PHASE_2C_P0_REAL_ARTIFACT_AND_RELEASE_REPAIR_REPORT.md

> Scope: find real P0 artifact → prove → hash → repair release path → bind pepper → verify.
> No old-ZIP redeploy. No rebuilt-from-memory artifact. No architecture change.
> Decision scale: PROVEN / NOT PROVEN / FAILED / DEFERRED / NOT APPLICABLE.
> Final: GO or NO-GO with exact blockers.

---

## Executive Summary

The real P0 artifact is **`D:\projects\msari\functions`** (git tag `v2c-p0`, commit `a6dc31e`,
local VCS). Contents proven marker-by-marker; hashes identical to the previously tested artifact.
Suites green (31 + 16 + B1 + emulator 6/6 incl. 2/3/10-way contention). Secret handling clean.
**Deployment NOT executed**: live function config is unreadable with available identity (403), so
config preservation (service account, env, trigger) cannot be proven — blind deploy on a revenue
API is refused per STOP conditions. **Final decision: NO-GO for the deploy step only; everything
verifiable here is PROVEN.**

## Current Production State (PROVEN where stated)

- `api`, 1st Gen, Node.js 22, `us-central1`, status ACTIVE (owner-reported; live endpoints respond).
- Current prod code = OLD code (owner-reported ZIP lacks `partnerAuth.js`; consistent with live
  behavior: no scope/partner semantics observed). ZIP file itself NOT PRESENT on this machine —
  correctly never used as a base.

## P0 Artifact Discovery (PROVEN)

- Path: `D:\projects\msari\functions` (index.js 43006B, partnerAuth.js 15670B, package.json,
  package-lock.json + 4 test files). VCS: local git, tag `v2c-p0` contains the atomic-claim code
  (verified `claimIdempotency/completeIdempotency/failIdempotency` in tagged tree).
- Content markers present: HMAC-SHA-256 (3), timingSafeEqual (4), claimIdempotency (3),
  ownerToken (22), requireScope (7), env binding (4), canAccessPartnerBooking (5), partnerId (50),
  payments:submit-evidence (2), hotels:read (2), PENDING/COMPLETED/FAILED states, expiresAt (14),
  Retry-After (2). Note: standalone `payments:read-status` scope string unused — status reads ride
  on `bookings:read` by design (narrower surface, documented).

## Production vs P0 Diff

| Component | Production (old) | P0 Artifact | Expected |
|---|---|---|---|
| partnerAuth.js | absent (owner-reported) | present, hashed | P0 |
| HMAC pepper | absent | env-only + fail-closed | P0 |
| scopes | absent | enforced on 3 sync routes | P0 |
| partner isolation | absent | owner/admin/own-partner | P0 |
| partnerId | absent | additive only | P0 |
| atomic idempotency | absent | single-txn claim | P0 |
| ownerToken | absent | present | P0 |
| booking/payment semantics | current | byte-identical paths | unchanged (PROVEN: legacy 16/16) |

## Artifact Integrity (PROVEN)

`MSARI_PHASE_2C_P0_ARTIFACT_MANIFEST.sha256` — index/partnerAuth/package/package-lock (+ tests)
SHA-256 recorded; tested code == released code (hash-identical). No secrets/pepper/credentials in
artifact (grep PROVEN); no debug backdoors; no mock paths in runtime files; no test-only bypasses
in shipped code (test hooks live only in `test_*` files, never deployed).

## Credential / Pepper Verification (code PROVEN)

Single env source, zero hardcoded, zero logging/responses (B1 suites green both pepper states).
Production pepper existence acknowledged by owner; ** live mount unverifiable from here (403).**

## IAM Verification (NOT PROVEN — access-denied, documented)

Runtime SA must remain `msariapp-v2@appspot.gserviceaccount.com` with ONLY
`secretmanager.secretAccessor` on `CREDENTIAL_PEPPER`. Cannot query IAM (permission denied);
owner must confirm pre-deploy. No roles granted/changed here.

## Secret Binding Plan (prepared, NOT executed)

Owner command (1st-gen, no code change needed):
`gcloud functions deploy api --source D:\projects\msari\functions --runtime nodejs22
--trigger-http --region us-central1 --project msariapp-v2
--set-secrets CREDENTIAL_PEPPER=CREDENTIAL_PEPPER:1`
(spelled without values; exact flags to be confirmed against a prior `functions describe`
by the owner first — required to preserve service account/env/trigger).

## Deployment Source Resolution (PROVEN)

Correct source = `D:\projects\msari\functions` (contains P0, tagged). Never Cloud Shell `~`,
never the old ZIP. Deploy command above pins `--source` explicitly.

## Tests (all green, this round)

P0 mocked 31/31 · legacy 16/16 · B1 both pepper states · emulator 6/6 (2-,3-,10-way atomicity,
replay, cross-partner/endpoint). Concurrency: losers → deterministic 409; replay → original;
no duplicates anywhere.

## Production Smoke (DEFERRED — no deploy performed)

Safe plan ready: no-key 401, bogus 401, public reads 200, legacy-keyed sync 200, user flows
keyless; zero test bookings/payments. To run post-deploy by owner.

## Rollback Plan (PROVEN feasible, not executed)

Previous platform revision retained on deploy (standard); plus local baseline copy
(`releases/p0-20260908/baseline/`). No data/rules/auth reversal needed.

## Security Follow-ups (recorded, untouched)

Hardcoded `FIREBASE_WEB_API_KEY` in legacy source (public web key by design; rotation hygiene
only — does not block this release).

## Remaining Risks

Undeployed = unverified-in-prod; emulator ≠ prod latency profile; legacy full-access path persists
until key migration (transitional, flagged); idempotency docs accumulate (24h expiry, tiny).

## Final Gate — Deploy Step: **NO-GO**

Code, tests, artifact, rollback, and safety proofs are complete and green. The single open item is
operational, not technical: live-config readability + mount + smoke require owner credentials.
**GO the moment the owner runs the prepared command and confirms §16 checks; until then, hold.**

STOP — awaiting Architecture Gate. No further phases started.
