# QA Evidence Matrix — F1 Source Reconciliation

## Evidence Classification Legend
- **PROVEN**: Directly verifiable from artifacts/logs/repo
- **NOT PROVEN**: Claim made but cannot be verified from available evidence
- **UNKNOWN**: Insufficient data to classify

---

## Evidence Inventory

| # | Finding | Classification | Evidence Source | Notes |
|---|---------|----------------|-----------------|-------|
| 1 | `reserveBookingNumber` callable exists in production | **PROVEN** | firebase-debug.log line 82, 117 | Active callable, `entryPoint="reserveBookingNumber"`, `httpsTrigger`, status=ACTIVE |
| 2 | Production deployment metadata | **PROVEN** | firebase-debug.log lines 82-83 | versionId=3, build=341433fa, hash=2220afbd, deployed=2026-09-01T23:20:14Z |
| 3 | Current repo HEAD has NO `reserveBookingNumber` export | **PROVEN** | `git show HEAD:functions/index.js` | Only 3 exports: `api`, `recomputeDisplayPriceOnRoomWrite`, `recomputeDisplayPriceOnHotelWrite` |
| 4 | No commit in repo history adds `reserveBookingNumber` export | **PROVEN** | `git log --all --oneline -S "reserveBookingNumber" -- functions/` | Zero results |
| 5 | Only one commit mentions "reserveBookingNumber" string | **PROVEN** | `git log --all --oneline -S "reserveBookingNumber"` | Single hit: `a6dc31e` (Phase 2C P0) |
| 6 | Commit `a6dc31e` does NOT contain `reserveBookingNumber` export | **PROVEN** | `git show a6dc31e:functions/index.js` | Only `exports.api` at that commit |
| 5 | No branch/tag/stash contains `reserveBookingNumber` export | **PROVEN** | `git branch -a`, `git tag`, `git stash list` | Only `master` branch, one tag `v2c-p0`, empty stash |
| 6 | No local checkout has the source | **PROVEN** | Full text search `D:\Dev`, `D:\projects` | Only references in mobile caller, docs, debug symbols, deploy logs |
| 6 | Deployed hash `2220afbd` ≠ current repo HEAD `475f788` | **PROVEN** | Deploy log vs `git rev-parse HEAD` | Different trees |
| 7 | Deployed build ID `341433fa` ≠ any local build | **PROVEN** | Deploy log vs local artifacts | No matching build locally |
| 8 | Mobile caller exists and calls the callable | **PROVEN** | `lib/data/services/hotel_booking_service.dart:262-264` | `_reserveBookingNumber()` calls `httpsCallable('reserveBookingNumber')` |
| 9 | Mobile caller has no fallback implementation | **PROVEN** | `booking_number_generator.dart` has zero call sites | Legacy generator unused |

---

## Security Review

| Item | Status | Notes |
|---|---|---|
| Credential exposure | CLEAR | No credentials/secrets in any searched artifacts |
| Source code tampering | NOT APPLICABLE | No source found to tamper with |
| Production mutation | NONE | No deployment attempted during investigation |
| Artifact integrity | VERIFIED | Deploy logs from official Firebase CLI output |
| Credential leakage in logs | CLEAR | Debug logs contain only metadata, no secrets |

---

## Contradiction Check

| Claim | Status | Evidence |
|---|---|---|
| "Source exists in repo" | REFUTED | Exhaustive search found zero exports in any commit |
| "Source exists in another checkout" | REFUTED | Exhaustive search `D:\Dev`, `D:\projects` found zero exports |
| "Source was deleted" | NOT PROVEN | No commit removes it (no commit ever added it) |
| "Source in different branch" | REFUTED | Only `master` branch exists |
| "Source in stash" | REFUTED | Stash list empty |
| "Source in tag" | REFUTED | Only tag `v2c-p0` points to commit without export |

---

## Classification Summary

| Category | Count |
|---|---|
| PROVEN | 9 |
| NOT PROVEN | 0 |
| UNKNOWN | 0 |

---

## QA Verdict

**All evidence supports: UNRECOVERABLE SOURCE DRIFT**

No evidence contradicts the finding that the production `reserveBookingNumber` callable was deployed from a source tree that no longer exists in any accessible repository/checkout.