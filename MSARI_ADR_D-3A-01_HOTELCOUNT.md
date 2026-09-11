# ADR D-3A-01 — hotelCount semantics & minimal-read preservation

> Status: PROPOSED (decision pending, separate session). No implementation. No endpoint/field
> created. No behavior changed. Evidence grades: CONFIRMED / UNKNOWN / REQUIRES DECISION.

## 1. Current semantics (CONFIRMED from code)

`city.service.ts:40-58` (and twin `:108-121`): for each city, count docs from a FULL `hotels`
scan where fuzzy-match(destination, cityId, city, cityEn, governorate — case-insensitive
`includes`, Arabic-normalized) AND `isPublished !== false` AND `isDeleted !== true`.
Meaning = (a) published-per-city. Displayed in 3 spots (detail badges ×2, index cards, home bento).
Destination page variant (`:244`): `rawHotels.length` after the same city filter — same family.

## 2. Proven index/query facts (not assumptions)

- `firestore.indexes.json`: composites on `hotels(isPublished,isDeleted,price|stars|createdAt)`;
  NO composite on `destination`; NO count pre-aggregates anywhere.
- Single-field automatic indexes DO cover `destination == X` equality (Firestore default).
- Firestore `count()` aggregation bills 1 doc-read per ≤1000 matching index entries (platform pricing).
- `GET /v1/cities` returns 9 cities, zero count fields (live response PROVEN).
- Therefore: "one read per city" is achievable ONLY as `count()` per city (≈9 reads total today),
  and ONLY with exact-equality predicates — the current fuzzy-`includes` semantics CANNOT be
  expressed in a single `count()` per city. Any claim otherwise is unproven.

## 3. Options (no decision taken)

| # | Option | Reads (proven basis) | Semantic fidelity | Verdict |
|---|---|---|---|---|
| O1 | API adds server-computed `hotelCount` (full hotels scan + in-memory fuzzy match, current logic moved) | N reads/call (≈57) server-side, same as website today — moved, not reduced | EXACT | viable, needs contract decision |
| O2 | Per-city `count()` aggregation | ≈9 reads/call | APPROXIMATE (exact-match only; fuzzy cities diverge) | semantic loss — REQUIRES DECISION |
| O3 | Denormalized count field + triggers | ~0 reads | EXACT if triggers correct | new infra — REQUIRES DECISION, out of scope |
| O4 | Client counts from `/v1/hotels` full list | N reads/call on website | EXACT | reintroduces amplification — REJECTED as primary |
| O5 | Drop counts from UI | 0 | behavior change | REJECTED (user-visible in 3 spots) |

## 4. Recommendation (non-binding)

O1 (server-computed count, exact logic moved to API, no new index: single-field + in-memory
match over one bounded scan) preserves semantics with zero client amplification beyond today's
server cost, centralized for all consumers. O2 acceptable ONLY if business accepts exact-match
counts (documented divergence). Decision explicitly deferred to the D-3A-01 session.

## 5. Decision record (D-3A-01 DECIDED — O1 APPROVED as Phase-A bridge)

**DECISION (approved): O1 — server-computed count with the exact current fuzzy logic,
implemented in `GET /v1/cities` response as `hotelCount`.**
- O1 centralizes computation but does NOT inherently reduce reads (stated explicitly:
  1 destinations scan + 1 hotels scan per call — same as website today, moved server-side).
- O2 REJECTED: exact-match counting cannot reproduce fuzzy multi-field semantics
  (case-trap PROVEN: server lowercase literals returned 0 where matches exist).
- O3/O6 DEFERRED: require writes/backfill/triggers/infra — separate gates, not built.

## 6. Rollback

Revert the `/v1/cities` hunk (functions) + website adapter flag OFF (default).
No data touched, so nothing to un-migrate. Pre-change behavior = serving direct.
