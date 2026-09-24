# MSARI_PHASE_2B_HOTELS_IMPLEMENTATION_REPORT.md

> Implementation of D-V2-01 (done), D-V2-02/D-V2-04-05 (decisions recorded, STOPs standing).
> No serving migration, no canary, no Phase C. Status: PHASE B IMPLEMENTATION COMPLETE —
> PENDING ARCHITECTURE/RELEASE GATE.

---

## 1. Evidence

- Slug validation: 57/57 generated, 0 empty, 57 unique, 0 collisions (script output).
- Backfill: 57/57 docs carry `slug`; 0 mismatches vs generator; 0 duplicates; 3/3 spot
  resolutions correct (`panorama-hotel→6DDIQC9NUelwrbCA0s0Y` etc.); invalid slug → empty.
- Field completeness (57 docs): isPublished 57 true/0 missing; isDeleted 0 true/57 false/0 missing;
  isSpecial 8 true/49 false/0 missing; createdAt 0 present/57 missing.
- Price spots: 3 full identical formulas + 1 probe-refined (all in `actions/hotels.ts`).
- Branch census: destEn-only linkage 57/57; exact-case 57/57.

## 2. Changes made

- **Data**: `slug: string` added to 57 hotel docs (ONLY field touched; verified no other
  field modified — update() with single-field payload; spot-checkable via updatedAt unchanged).
- **Code**: none (validation/backfill scripts live in gitignored `scratch/`, uncommitted by design).

## 3. Data mutations

57 single-field `update({slug})` writes. Nothing else written. No deletes. No other collections.

## 4. Indexes

NONE created. Required composite recorded but not built:
`(isPublished ASC, isDeleted ASC, isSpecial DESC, createdAt DESC, __name__ ASC)` —
awaits explicit approval (single-field `slug==` lookups need no new index: automatic).

## 5. Source of Truth

Firestore unchanged as SoT. `slug` is a deterministic derivative (generator = definition),
not independent truth. No replica, no CMS copy, no PostgreSQL.

## 6. Derived-field lifecycle

- `slug`: static per (id, nameEn); recompute rule = regenerate on nameEn/id change (write-path
  invariant for Dashboard/external writers — OUTSIDE this repo, flagged to owner).
- `displayPrice` (NOT BUILT — STOP): would require same pattern + recompute triggers on
  hotel-price/room-price/create/delete/restore + reconciliation query + rollback (field deletion).
  Documented in §D-V2-04/05 decision, awaiting approval.

## 7. Before/After read behavior

Unchanged (no serving cutover): website still scans + probes identically. Future API paths:
slug lookup = 1 doc read; recommended query = page-window reads post-index; displayPrice sort
blocked until field exists. No N+1 introduced anywhere (verified: zero new fan-out queries added).

## 8. Parity results

- Slug→ID: 57/57 resolvable, invalid→empty. Ordering: UNCHANGED (website path live).
- Prices: formula identity PROVEN across 4 spots (3 full + 1 probe); no values altered.
- Pagination/booking/images/SEO: untouched.

## 9. Security results

No credentials/secrets in scripts (env-based admin creds, gitignored `.env`); no rules/auth
touched; no new endpoints; no client exposure (scripts are local-only, never bundled).

## 10. Rollback procedure

- Slug: delete `slug` field from 57 docs (or leave inert — website never reads it yet) +
  drop scratch scripts. No code rollback needed (no code changed).
- Revert verification: re-run validation script → expect 0 withSlug.

## 11. Remaining gaps

D-V2-02 index (approval) · D-V2-04/05 derived field + triggers (approval) · q search (deferred by
design) · price-sort parity (blocked on field) · slug write-path invariant in external writers.

## 12. Exact commit hashes

No commits made (per STOP rules: docs uncommitted, scripts in ignored `scratch/`).
Git tree: clean except pre-existing untracked audit docs.

## 13. Deployment status

NOT DEPLOYED anything. No serving migration, no canary, no Phase C. Production behavior identical
before/after (verified: live probes return same IDs/prices; slug field invisible to current code).

## STOP-CONDITION AUDIT: none triggered

No schema deviation (single additive documented field) · no missing-field surprise (measured first) ·
no collision · no price mismatch · no index/query mismatch (nothing created) · no parity diff ·
no N+1 · no credential exposure · no test failure.
