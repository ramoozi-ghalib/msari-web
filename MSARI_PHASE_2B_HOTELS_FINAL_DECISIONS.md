# MSARI_PHASE_2B_HOTELS_FINAL_DECISIONS.md

> Final architecture decisions (documentation only). No implementation, migration, writes,
> deploys, or canary. Status: PHASE B — FINAL DECISIONS READY FOR ARCHITECTURE APPROVAL.
> Evidence: production Firestore reads 2026-09-11 (57 hotel docs), `firestore.indexes.json`,
> functions source, website call-traces. No PASS without evidence.

---

## D-V2-01 — SLUG: STOP (schema + backfill required)

- Current website semantics: slug is GENERATED (`generateSlugFromHotel(id, nameEn)`, deterministic,
  shared function) and resolved by full scan + in-memory match.
- Measured: `slug` field present on **0/57** hotel docs (PROVEN). No persisted slug exists.
- Proposed API semantics: `GET /v1/hotels/by-slug/:slug` → `where("slug","==",X)` single-doc read
  (no composite index needed — automatic single-field; deterministic; stable).
- SoT: Firestore hotel doc (new `slug` field) + generator function as canonical definition.
- Read amplification: 1 doc read vs full N scan today.
- Index requirement: NONE beyond automatic single-field (PROVEN from indexes file: no slug index
  exists, none needed for single equality).
- Schema/data requirement: ADD `slug: string` to 57 docs (backfill, deterministic generator) +
  uniqueness validation (generator may collide on identical nameEn — validate: all-generated-slugs
  unique check required pre-write) + write-path rule (all future hotel writes must set slug).
- Rollback: remove endpoint usage (website keeps scan path); field itself harmless if unused.
- Parity tests: slug→ID resolution for all 57 live slugs + invalid/missing → 404.
- Production risk: LOW once backfilled (additive field); backfill write safety needs owner runbook.
- **STATUS: STOP — schema addition + 57-doc backfill need explicit architectural approval.
  Detail migration stays blocked behind this decision. No workaround adopted.**

## D-V2-02 — FEATURED/RECOMMENDED: STOP (composite index required)

- Current website semantics: `isFeatured(=isSpecial)` first, then `createdAt` desc, then doc-ID
  asc tie-break (deterministic, PROVEN stable in production probes).
- Proposed API query shape (exact):
  `hotels.where("isPublished","==",true).where("isDeleted","==",false)` — website uses
  `isPublished==true` + in-memory `isDeleted!==true`; API V1 already filters `isPublished` only.
  Ordered: `.orderBy("isSpecial","desc").orderBy("createdAt","desc").orderBy(FieldPath.documentId(),"asc")`
  + cursor (`startAfter` last doc) + `limit(n)`.
- Index requirement: composite `(isPublished ASC, isDeleted ASC, isSpecial DESC, createdAt DESC,
  __name__ ASC)` — **NOT present** (`firestore.indexes.json` has `(isPublished,isDeleted,price|stars|
  createdAt)` only). Creation is a production index build → **STOP, approval required**.
- Can current ordering be preserved exactly? YES logically (same keys incl. id tie-break), PENDING index.
- Read amplification: page-window docs only (no fan-out).
- Rollback: website in-memory path untouched until cutover; revert = keep website code.
- Parity tests: first-3-pages ID equality + repeat stability + cursor walk full coverage.
- **STATUS: STOP — index creation needs explicit approval. Recommended listing stays website-side.**

## D-V2-04/05 — DISPLAY PRICE + PRICE SORT: STOP (option B — persisted field required)

- Current semantics (binding): `displayPrice = min(explicit>0, roomMin>0)` else whichever positive,
  else 30; explicit = `price||priceFrom||minPrice||startingPrice`; rooms = non-deleted
  `price||pricePerNight`. Proven identical in 4 website spots.
- Measured: **ZERO numeric price-ish top-level fields** on hotel docs (prices live as
  strings/objects/rooms) → option (A) "existing field" **REFUTED by data**.
- Options verdict: (A) impossible; (B) new persisted derived `displayPrice` REQUIRED → STOP
  (schema + backfill + write-path maintenance — approval required); (C) bounded per-list room
  fan-out = N+1 by another name → REJECTED (violates no-fan-out rule).
- Price sorting without (B): API `sort=price_*` on explicit `price` only = documented semantic
  deviation — NOT claimed as parity. Existing `(isPublished,isDeleted,price)` composite covers the
  explicit-price variant only.
- Booking quote/date-guest pricing: stays Booking Domain, untouched; display-min NEVER carries
  availability semantics.
- Rollback: n/a (nothing built). **STATUS: STOP.**

## Q SEARCH: REMOVED from active V2 serving contract

- Current: substring includes over name.ar/en + address, case-insensitive, Arabic-normalized.
- Firestore has no FTS; prefix/per-field ranges ≠ equivalent; dual-language cross-field needs
  composites or external index. Search stays website-side; future contract recorded separately.
- STATUS: documented deferral, not a gap to patch silently.

## PAGINATION: keep both layers, no UX change

- API cursor (`limit` + `nextCursor` + docId stability) PROVEN live. Website page numbers map via
  cursor chains (deep pages walk N-1 cursors — documented delta, accepted). Numbered UX unchanged.
- STATUS: compatible with mapping layer; no silent change.

## DESTINATION: APPROVED current destEn equality as Phase-B bridge

- Measured 57/57 single-branch, 57/57 exact-case. Single-equality `destination == nameEn-exact`
  + in-memory published/deleted flags = no new index, no schema. Re-measure gate: any new hotel
  whose linkage needs another branch reopens this decision. STATUS: approved bridge (this phase).

## Source of Truth (binding for all decisions above)

- Operational hotel/room documents + counts + prices: **Firestore** (unchanged).
- Derived values (`slug`, `displayPrice`, counts): computed FROM Firestore, never an
  independent truth; any persisted derivative remains a cache of Firestore state.
- No replica, no PostgreSQL, no CMS copy. All reads in this document target Firestore only.

## Rollback (all decisions)

Nothing built → nothing to roll back. Future serving changes each carry revert-commit + flag-off;
data-affecting decisions (slug backfill, price field, indexes) each require their own pre-approved
rollback runbook before execution.

## Production risk of deciding (not implementing)

Zero — documentation only. Risk registers transfer to implementation gates when each STOP clears.

## Final status

**PHASE B — FINAL DECISIONS READY FOR ARCHITECTURE APPROVAL.**
Stops standing: D-V2-01 (backfill), D-V2-02 (index), D-V2-04/05 (derived field). Q deferred.
No serving, no canary, no Phase C. No production writes performed (reads: 2 measurement runs).
