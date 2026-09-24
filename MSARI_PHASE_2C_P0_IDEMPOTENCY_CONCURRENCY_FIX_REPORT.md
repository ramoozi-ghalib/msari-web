# MSARI_PHASE_2C_P0_IDEMPOTENCY_CONCURRENCY_FIX_REPORT.md

> Narrow P0 closure task: atomic idempotency claim only. No IAM redesign, no P1, no deploy,
> no keys, no Lovable/Website/Mobile/CMS. Scope additions: none.

---

## 1. Executive Status

Race **CLOSED and PROVEN at three levels**: code review (single-txn claim), mocked suite (31/31),
and **real Firestore emulator (4/4, incl. 10-way concurrent → exactly one owner)**.
No STOP condition triggered. No deployment performed.

## 2. Root Cause

`checkIdempotency` (read) ran outside any transaction; `storeIdempotency` wrote after the booking
txn. Two concurrent same-key requests could both observe absence across Firestore latency, then each
create a booking. Evidence: code path (`partnerAuth.js` pre-fix) + structural analysis.

## 3. Exact Code Change (`functions/partnerAuth.js`, `functions/index.js`)

- New: `claimIdempotency()` — ONE Firestore transaction: read claim doc → absent/expired/failed/
  stale-pending → write fresh PENDING (ownerToken) = OWNER; fresh pending (other owner) → CONFLICT;
  valid completed (or legacy shape) → REPLAY. Removed: `checkIdempotency`/`storeIdempotency`.
- New: `completeIdempotency()` / `failIdempotency()` — ownerToken-guarded transitions; crash-safe
  (stale PENDING 5min / FAILED reclaimable; never blocks retries).
- `index.js` booking POST: claim → replay/conflict(409+Retry-After)/proceed → txn (unchanged) →
  complete+audit; catch → fail-mark. No other route logic touched.

## 4. Atomic Claim Mechanism

Firestore serializes conflicting writes to the same claim doc inside `runTransaction`: losers retry,
re-read, and observe the winner's PENDING. Exactly one OWNER per (partner, endpoint, key).

## 5. Concurrent Execution Semantics

Winner executes once; loser receives deterministic `409 Conflict` + `Retry-After: 2` (no booking,
no side effects) and its retry receives the original result. Verified live on emulator.

## 6. Failure/Retry Semantics

Owner crash → PENDING expires (5min) or explicit FAILED mark → next retry reclaims and executes
exactly once. No indefinite blocking; no second execution while fresh. Owner-guarded transitions
prevent clobbering a reclaimed claim.

## 7. Replay Semantics

Completed (or legacy-shape) record → original `{status, response}`, zero writes, zero txn.
Deterministic across repeats (test 12b + emulator E2).

## 8. TTL

24h from claim creation, enforced on read; `Date` + Timestamp compatible (regression-tested).
Expired = miss (test C5). PENDING freshness window 5min (reclaim), documented.

## 9. Cross-Partner / Cross-Endpoint Isolation

Doc ID = `partnerId_sha256(endpoint:key)` — partner B and other endpoints get independent claims
(emulator E3/E4 + mocked tests 13/C-series PROVEN). Secrets never stored (key hashed).

## 10. Booking Semantic Preservation

Diff-reviewed: txn body, totals, availability check, ownership (`customerId`), state machine,
payment flow all byte-identical except additive `partnerId` and audit lines. Legacy suite 16/16
unchanged. `customerId` meaning frozen; client `partnerId` ignored (test PROVEN).

## 11. Security

No credential/secret in claim docs (hashed key only); no secret logging (tests 14/15 re-ran green);
ownerToken random per attempt; complete/fail guarded by token match; uniform 401/409 shapes.

## 12. Data Safety

No migration/cleanup/collections (only runtime `idempotency` docs); no Rules/Auth changes;
existing bookings untouched (verified counts in tests).

## 13. Test Matrix

| Suite | Result |
|---|---|
| P0 mocked (`test_p0_partner_iam.js`) | **31/31 PROVEN** (25 prior + C1/C3/C4/C5/C6 + rewritten B4) |
| Legacy (`test_runner.js`) | **16/16 PROVEN** (post-change re-run) |
| B1 pepper (`test_b1_pepper.js`) | **4/4 effective** (both pepper states) |
| Emulator contention (`test_emulator_contention.js`) | **4/4 PROVEN** (E1 10-way atomicity, E2 replay, E3/E4 isolation) |

## 14. Test Results

All green. The pre-fix race is now un-reproducible by construction (single txn) with emulator proof.

## 15. Release Artifact

`D:\projects\msari\releases\p0-20260908\`: `current/` refreshed (new hashes in MANIFEST),
`baseline/` unchanged (fix is additive to P0 state; full rollback still = baseline copy + delete
`partnerAuth.js`/tests). Rollback needs no data deletion, no rules/auth changes.

## 16. Rollback

Copy `baseline/index.js` over `functions/index.js`; delete `partnerAuth.js`,
`test_p0_partner_iam.js`, `test_b1_pepper.js`, `test_emulator_contention.js`. Verified reversible
(baseline syntax-checked, 986 lines, zero P0 markers).

## 17. Proven / Not Proven / Failed / Unknown

- PROVEN: atomic claim, replay, reclaim paths, TTL, isolation, semantics, no-leak, suites.
- NOT PROVEN: production-traffic behavior (not deployed — by rule).
- FAILED: none. UNKNOWN: live Firestore record shapes (reads blocked, unchanged).

## 18. Remaining Blockers (unchanged from P0 gate)

Pepper provisioning · VCS/CI absence · staging absence. Plus: emulator dir cleaned up;
re-running contention proof needs `firebase emulators:start` again (~minutes).

## 19. Final Recommendation

Idempotency concurrency item: **CLOSED with evidence**. No further code action in this task.
STOP — awaiting Architecture Gate. No deployment performed.
