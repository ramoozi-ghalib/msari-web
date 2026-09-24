# MSARI_PHASE_3A_WEBSITE_API_FIRST_MIGRATION_PLAN.md (AMENDED — architecture-controlled)

> Status: PLAN ONLY. No implementation, migration, deployment, or data changes performed.
> Amends the prior discovery draft per Architecture Review (4 mandatory amendments + gates).
> Vocabulary: CONFIRMED / UNKNOWN / REQUIRES ARCHITECTURAL DECISION / IMPLEMENTATION-READY.
> No "PASS" used as proof. All behavior claims traced to code cited as FILE:LINE.

---

## 1. Executive Summary

- Website today is Firebase-first hybrid; target is API-first with Firestore remaining SoT.
- Four amendments resolved/documented: (1) no permanent Firestore fallback — staged removal gates;
  (2) `hotelCount` semantics investigated → **REQUIRES ARCHITECTURAL DECISION** (API has no count);
  (3) price ownership split into display-min (API computed field) vs date-quote (booking domain);
  (4) booking migration reframed as domain consolidation with frozen identity semantics.
- API parity analysis: `GET /v1/hotels|/rooms|/cities` are NOT drop-in equivalents (city fuzzy-match,
  search, featured, and room-derived price gaps CONFIRMED) — each classified below, none silently adapted.
- Direct-path removal policy, SEO *semantic* parity gates, payment terminology aligned to Phase 2B
  (`submit-evidence`/`read-status`), credential boundary (server-only), rate-limit prerequisite.
- **Phase A is NOT implementation-ready** (hotelCount blocker). **B-0 is IMPLEMENTATION-READY**
  (prep only, 10 gated deliverables).

## 2. Current Architecture (CONFIRMED)

Browser → Next.js (Vercel): Server Actions/RSC → Firestore Admin SDK directly (hotels, rooms,
cities, ads, currency `rates/global`, bookings, `bank_accounts`, receipts). `api-client.ts` →
Functions `/api/v1` for auth (`/auth/*`, `/me`) + `/cities` & `/rooms` fallbacks only. NextAuth JWT
cookie. CMS collections direct (10s cache). No axios; single HTTP client.

## 3. Source of Truth (binding)

Operational data: **Firestore**. Media: **Firebase Storage**. Access layer (target): **MSARI API**.
Editorial: **CMS/website\_\***. No replicas, no PostgreSQL (retired — never built), no duplication.

## 4. Direct Firestore/Storage Inventory (summary; full table in prior discovery rev)

Hotels (`actions/hotels.ts` full scans + rooms fan-out), rooms subcollections, cities+counts
(`city.service.ts`), ads, rates, bookings/bank/receipts (Actions), CMS (cached). Images = stored URL
strings. All server-side.

## 5. Existing API Inventory (from `D:\projects\msari\functions\index.js`)

Auth `/auth/*` + `/me` (Bearer), sync `hotels/updated-since|list|:id`, `cities`, `rooms` (x-api-key),
bookings POST/GET/PATCH/payment (Bearer + owner/admin). No ads/rates/bank/editorial endpoints.
Key validation: `api_keys` (`key`+`status`), record attached but unconsumed (Phase 2C scope).

## 6. API Parity Findings (CONFIRMED gaps — no silent adaptation)

| Behavior | Website | API | Verdict |
|---|---|---|---|
| Published filter | `isPublished==true` + `isDeleted!==true` | same pair | CONFIRMED equivalent |
| City filter | fuzzy includes (city/cityEn/cityId/governorate) | exact `destination==cityId` | **CONFIRMED GAP** (adapter must reproduce fuzzy rules server-side or keep client filter) |
| Text search `q` | name/address includes | none | **CONFIRMED GAP** (needs decision: adapter-side filter vs new param) |
| Featured ordering | `isSpecial` first | no featured concept (`isSpecial` field present, no sort) | **CONFIRMED GAP** |
| Rating ordering | constant 4.5 (no-op) | n/a | CONFIRMED compatible |
| Price ordering | `min(explicit,rooms)` computed | `price` = explicit only | **CONFIRMED GAP** (room-derived price missing) |
| Tie-break | doc-id (website, deterministic) | docId appended (deterministic) | CONFIRMED compatible in shape |
| Pagination | offset slice, pageSize 12 | cursor+limit | compatible mechanics, different handles |
| Arabic fields/IDs/images/metadata | full | full | CONFIRMED |
| Room availability fields | subcollection read | same subcollection read | CONFIRMED |
| Empty/error states | in-memory fallbacks | 404/400 shapes | compatible with adapter mapping |

## 7. hotelCount Decision — REQUIRES ARCHITECTURAL DECISION (Phase A BLOCKED)

- Current semantic (traced): count of docs where destination-match (same fuzzy city rules) AND
  `isPublished!==false` AND `isDeleted!==true` (`city.service.ts` count block) — i.e. meaning (a)
  published-per-city, NOT post-filter visible count. Deterministic given snapshot.
- API: **zero `hotelCount`** (`GET /v1/cities` returns id/names/imageUrl/isPopular/updatedAt only).
- Options: (i) new `hotelCount` field/endpoint — needs contract decision, FORBIDDEN to invent here;
  (ii) website counts from `/v1/hotels` full list — reintroduces amplification, rejected as primary;
  (iii) drop counts — behavior change, rejected. **No client-side counting shortcut adopted.**
- Phase A stays non-ready until decided.

## 8. Pricing Ownership Decision

- **A. Display min** (`min(explicit, room-min)` for cards/lists): single authoritative implementation
  moves to API-owned computation (consumed value, not locally re-derived). Website keeps presentation
  formatting only (currency display).
- **B. Date/guest quote** (check-in/out, guests, inventory, availability, locked rates, taxes/fees):
  booking-domain owned (existing gateway txn + `rates/global` lock). NEVER embedded in generic
  `GET /hotels` representations.
- SoT: hotel/room docs (A inputs) + rates + availability records (B inputs). Currency handling:
  display formatting website-side; conversion/locking domain-side.
- If B cannot be represented without a new quote contract → STOP + decision (do not invent endpoint).

## 9. Booking-Domain Ownership Model (frozen semantics)

Website: UI validation, request mapping, presentation, error handling. API/domain owns: totals,
availability/overlap, ownership, attribution, cancellation auth, idempotency (Phase 2C), state
transitions, receipt authorization, txn invariants. Frozen: Partner/Credential/Actor/Booker/
Customer-Owner(`customerId`)/Traveler/`partnerId`(additive). After Phase F, `msari_web` must contain
NO independent totals/overlap/ownership/cancellation/state logic (acceptance grep-gate).

## 10. Credential Boundary

Browser holds zero credentials. Target: Browser → Next.js Server → server-only scoped
environment-bound credential → API. `NEXT_PUBLIC_API_KEY` browser dependency removed during B-0
prep (no partner semantics attached to it). Credential model per Phase 2B (hash-only, scopes,
rotation, audit) — referenced, not re-decided.

## 11. Rate-Limit Prerequisite

Identity boundary (credential → partner), per-credential buckets, burst+sustained, endpoint weights,
429 + Retry-After, abuse floor. Prerequisite for any production partner exposure; must not block
Cities migration drills if server-side credential + existing IP limits suffice (documented risk call
per phase). Full limiter = separate track (not built here).

## 12. CMS Boundary

Operational (hotels/rooms/prices/availability/bookings/users/payments) → API-owned, CMS read-only.
Editorial (`website_*`) → CMS-owned/direct/cached. Hybrid destinations: copy CMS, counts/data API.
No operational replica, ever.

## 13. Revised B-0 (preparation ONLY — IMPLEMENTATION-READY)

Deliverables: (1) server-only credential plumbing (no browser refs), (2) flag mechanism
OFF→SHADOW→CANARY→ON (+VERIFICATION→REMOVE), (3) shadow-compare harness (API vs direct diff logs),
(4) parity/diff reporting, (5) latency/read instrumentation, (6) rollback mechanism (revert + flag-off),
(7) direct-path lifecycle with removal gates, (8) cities contract/parity test suite, (9) hotelCount
decision record (§7), (10) redacted production-safe logging. B-0 changes NO user-visible behavior.
Exit: all 10 demonstrated + architecture sign-off. No Cities migration inside B-0.

## 14. Revised Phases A–G (each: preconditions, SoT, contract, parity tests, amplification
measurement, SSR/SEO tests, observability, canary, rollback, removal gate, exit criteria)

- **A Cities** — BLOCKED on §7 decision. Otherwise: `/v1/cities` + counts resolution; fallback direct
  during canary only.
- **B Listing** — blocked until §6 gaps closed (fuzzy city, search, featured, room-price) via approved
  adapter/contract; cursor-vs-slice bridged by page-window equivalence tests.
- **C Detail** — `/v1/hotels/:id` + gallery/rooms/metadata parity (closest to ready after A).
- **D Rooms** — `/v1/rooms?hotelId=` shape parity (room IDs, availability flags, images).
- **E Pricing** — blocked until §8 ownership implemented; display-min single implementation.
- **F Booking** — domain consolidation per §9 + frozen identities; last by risk.
- **G Payment evidence/status** — Phase 2B terminology (`submit-evidence`/`read-status`); no rail changes;
  bank accounts remain internal (DENY stands).

## 15. Zero-Downtime/Canary Model

OFF → SHADOW (dual-run, diff-log, serve direct) → CANARY (small traffic, same diff gates) → ON →
VERIFICATION WINDOW → REMOVE DIRECT PATH (explicit gate per phase; removal is a release action with
its own rollback). Rollback = previous deployment / flag-off. Temporary fallback ≠ permanent
architecture — any surviving direct path after its gate is a defect.

## 16. Rollback Model

Per phase: revert commit + flag state + artifact hashes + data-untouched attestation (no migration
ever runs, so nothing to un-migrate). Booking-affecting phases additionally require txn-semantics
re-verification post-rollback.

## 17. Direct-Path Removal Policy

Each phase declares its removal gate up front (parity + window + sign-off). Removal executes as its
own commit/deploy. Post-removal monitor: error-rate + parity-canary for 7 days.

## 18. Read Amplification Methodology

Measure per endpoint: requests, Firestore doc reads, fan-out count, payload bytes, latency — on
emulator/dry-run + shadow traffic. Rules: API must not introduce N+1 (verify `/v1/hotels` stays a
single bounded query); `select()` counts as payload-only; reads→dollars NEVER converted without
billing evidence (measured / modeled / unknown labeled).

## 19. SEO Semantic Parity Gates (not byte-identity)

Per migrated route verify: status, canonical, title, H1, key metadata, structured data, content
presence, visible IDs/order, SSR presence, crawlability, sitemap, internal links, pagination
discoverability, no soft-404, no client-only critical content. URL structure + SEO intent frozen.

## 20. Risk Register (top)

Adapter drift (shadow-compare mitigates) · gateway latency regression (budgeted, measured) ·
scope gaps on cutover (fail-closed review) · SEO render drift (semantic gates) · price divergence
(single-implementation + differential tests) · premature direct-path removal (gated releases).

## 21. Acceptance Criteria (per phase + global)

Global: plan items above + zero unapproved data/auth/booking/payment/SEO changes + explicit
blockers list + B-0 gates green. No "PASS" without evidence; unknowns labeled UNKNOWN.

## 22. Implementation Order

B-0 prep → (hotelCount decision) → A → B/C/D (parity-gated) → E (ownership live) → F (domain,
last) → G (evidence/status). P0 pre-migration: credential server-side move + rate policy + scope
model live (separate approved tracks).

## 23. Explicit Blockers / Decisions

D-3A-01 hotelCount representation (options §7, decision required). D-3A-02 city/search/featured/
room-price parity vehicle (adapter vs contract; fuzzy rules must live somewhere authoritative).
D-3A-03 quote contract for B-pricing (if needed). D-3A-04 bank/ads/rates endpoints (deferred by
design; blocks only their phases). D-3A-05 rate-policy activation timing. D-3A-06 mobile scope
(out; website-only migration).
