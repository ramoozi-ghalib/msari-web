# MSARI_PHASE_2A_API_TARGET_ARCHITECTURE_DESIGN.md

> READ-ONLY architecture review + target design. NOTHING modified, created (except this file),
> deleted, deployed, or migrated. No keys issued/rotated. No secrets displayed.
> Evidence grades: PROVEN (code/behavior) / INFERRED (strong indication) / UNKNOWN / DECISION REQUIRED.
> Date: 2026-09-08.

---

## 1. Current API Inventory (actual code, not docs)

Source: `D:\projects\msari\functions\index.js` (987 lines, Express 5 + firebase-functions v4, Node 22,
single export `exports.api` → live `.../api/v1`). No scheduled jobs. Helpers: RFC-7807 errors,
`parseFirebaseDate`, single-doc `getUserRole` (`admins` registry).

| Method + Path | Auth | Reads/Writes | Reusable as Partner API? | Notes |
|---|---|---|---|---|
| POST `/v1/auth/register` | none (public) | W: Auth user + `customers` doc | NO (public signup, not partner-scoped) | PROVEN |
| POST `/v1/auth/login` | none | R: Auth | NO (user login) | PROVEN |
| POST `/v1/auth/refresh` | none | R: token svc | NO | PROVEN |
| GET/PUT `/v1/me` | Bearer ID token | R/W own profile | PARTIAL (needs partner identity model) | PROVEN |
| GET `/v1/hotels/updated-since` | x-api-key | R: hotels delta | YES (sync primitive) | PROVEN |
| GET `/v1/hotels` (+cursor, city filter, sort) | x-api-key | R: bounded, docId cursor | YES (best partner primitive; already cursor-stable) | PROVEN |
| GET `/v1/hotels/:id` | x-api-key | R: single doc | YES | PROVEN |
| GET `/v1/cities` | x-api-key | R: full `destinations` | YES (small N) | PROVEN |
| GET `/v1/rooms?hotelId=` | x-api-key | R: one subcollection | YES | PROVEN |
| POST `/v1/bookings` | Bearer (txn: room+hotel+rates, overlap check) | W: booking + notification | YES with partner attribution added | PROVEN |
| GET/PATCH `/v1/bookings/:id`, POST `/:id/payment` | Bearer + owner/admin | R/W own or admin | YES with scopes | PROVEN |

Key validation: `api_keys` lookup `key==X AND status==active` → 401 otherwise (matches live probes).
`req.affiliate` assigned once, **never consumed** (PROVEN: 1 reference). scope/permission/rateLimit/commission
hits in function source: **0**. Documented 100/min limit: **NOT IMPLEMENTED** (code + behavior).

## 2. Required Business Resources (coverage)

YES (full/partial): Hotels, Details, Rooms, Cities, Users, Auth, Bookings + status + payment receipt.
NO endpoint: Images (embedded URLs only), Prices standalone (embedded), Availability standalone (flags +
txn overlap), Offers/Ads, Currencies/Rates, Bank accounts, CMS/Editorial.
Partner-readiness today: read endpoints YES-technically (no scopes); booking mutation PARTIAL (needs partner
attribution + idempotency review); everything else DESIGN REQUIRED.

## 3. Source of Truth (declared, matches reality)

| Resource | Source of Truth | API Role | Client Access |
|---|---|---|---|
| Hotels/rooms/prices/availability/bookings/users/images | **Firestore (+Storage)** | partial access layer | direct SDK (web/mobile) + gateway subset |
| PostgreSQL replica | **does not exist** (dead design) | none | none |
| CMS/editorial | Firestore CMS collections | none | direct (cached 10s) |

## 4. PostgreSQL Decision — RECOMMENDATION: Retire

1. Exists? NO (no DB, no connection strings, no sync jobs in either repo). 2-6. N/A — dead architecture.
Retire because: split-brain risk, sync-lag vs freshness guarantees, cost of new stateful infra, Firestore
already serves current scale; documented benefits (FTS) achievable later via scoped search service if needed.
Keep the contract doc as historical record, mark replica sections obsolete (doc edit = later approval).

## 5. Partner API Architecture — recommended: Scoped credentials (B), JWT/OAuth later

- Model: `Partner → Credential(server-side, hashed, show-once) → Scopes → endpoint enforcement`
  + status/expiry/rotation/revocation/rate-limit/usage/audit.
- Compare: (A) key-per-partner alone = coarse, no least-privilege → reject long-term. (B) scoped keys =
  least-privilege, auditable, matches existing middleware shape (extend `api_keys` docs + enforce) → **ADOPT**.
  (C) JWT/OAuth = heavier, justified only at large partner counts → defer. (D) Hybrid = B now, C later.
- Test mock already hints the shape: `api_keys: {"valid-key": {key, status, name: "NextJS Sync Worker"}}`
  — i.e., keys identify *consumers/workers*, the exact slot scopes plug into.

## 6. Security Review (evidence-graded)

- CRITICAL: client-exposed global key (`NEXT_PUBLIC_API_KEY` in bundle) = any holder reaches all keyed
  endpoints (PROVEN: shared header, no per-key logic).
- HIGH: no partner isolation; no throttling (doc claim unimplemented); booking endpoints rely on Bearer
  only (fine for users, absent for partners).
- MEDIUM: `revalidate`-via-GET leaks secret in logs (web repo); dead `/hotels*` wrappers widen surface;
  receipt URLs public-by-design (acceptable, note).
- LOW: Firebase web keys in source (public by design, still rotate hygiene).
- Ownership/admin checks on bookings: present and correct (PROVEN).

## 7. Business Logic Ownership (current → target owner)

- Price display `min(explicit, rooms)`: web only → **API-owned** (single implementation).
- Booking totals/overlap/rates txn: functions (+ duplicated preview in web) → **API-owned**, web preview
  becomes read-only quote call.
- Availability: flags + txn → API-owned. Filters/sorts presentation: clients. Commission/partner rules:
  missing → API-owned when designed. Cancellation/status machine: functions (keep).

## 8. Website Migration Boundary

- MUST MIGRATE: hotel/room/city reads, price calc, booking actions → gateway.
- SHOULD MIGRATE: currency/bank/ads reads (need new endpoints first).
- KEEP DIRECT: CMS/editorial (cached), session UX, receipt upload mechanics, internal admin reads.
- DO NOT TOUCH: booking txn semantics, rules, app, payments.

## 9. CMS Boundary

CMS stays independent, editorial-only, read-only toward operational data (CONFIRMED current).
Destinations-editorial/CMS pages need no API. Operational reads inside CMS (if any) stay read-only.

## 10. Rate Limiting (reality)

NOT IMPLEMENTED anywhere (function source 0 hits; Firebase infra provides none; Upstash is web-side
only for login/booking/public-hotel-route). Target home: gateway middleware, per-credential buckets,
values DECISION REQUIRED (doc's 100/min is a starting proposal, unapproved).

## 11. Client-Exposed Key

Used by all gateway calls incl. browser; global (not Website-identity, not Partner-identity — no binding
exists); severity HIGH while it gates bookings-adjacent reads; target: server-side credential for web
SSR + scoped partner keys; do not change now.

## 12. Target Architecture

Clients (Web SSR / Mobile / Lovable+Partners) → MSARI API → Authentication (key + Bearer) →
Partner Authorization (scopes) → Rate Limiting → Domain/Business Logic → DAL → Firestore/Storage.
Dashboard = Control Plane (partners/credentials/permissions/usage/audit) — CONFIRMED as intended role
(rules-gated `api_keys`); code proof of its UI pending source access.
CMS parallel, editorial-only. Mobile migrates separately (DECISION REQUIRED).

## 13. Lovable (future partner, nothing issued)

Needs after approval: Partner record → scoped credential → base URL → docs → sandbox/prod policy.
No Lovable-specific architecture. No credentials requested or created.

## 14. API Contract (documented vs implemented vs target)

Kept: endpoint shapes, RFC-7807 errors, cursor pagination, booking state machine, SoT declarations.
Obsolete: Postgres replica + sync engine + image HEAD/ETag sync + FTS-on-Postgres + 100/min claim
(mark obsolete on approval; do not edit doc now).

## 15. GAP Register (summary; full detail in §1-14)

- GAP-001 CRITICAL: partner authorization absent → scoped-credential design (§5).
- GAP-002 CRITICAL: website Firebase-first → migrate reads (§8).
- GAP-003 HIGH: dead Postgres design → retire (§4).
- GAP-004 HIGH: duplicated price/booking logic → API-owned (§7).
- GAP-005 HIGH: rate limit documented-not-implemented → gateway buckets (§10).
- GAP-006 MEDIUM: mobile outside API → separate decision.
- GAP-007 MEDIUM: missing resource endpoints (ads/rates/bank/editorial) → design-or-defer.
- GAP-008 MEDIUM: dashboard chain unauditable → source access required.
- GAP-009 LOW: exposed site key → server-side credential.
- GAP-010 LOW: dead code + GET-secret → cleanup approvals.

## 16. Architectural Decisions Required

D1 scope model (recommend B). D2 issuance/storage design. D3 Postgres retire (recommend yes). D4 mobile
scope. D5 rate-limit home/values. D6 Lovable credential type. D7 dead-code cleanup. D8 dashboard source access.

## 17. Target API Resource Map (only real resources)

`/v1/auth/*`, `/v1/hotels/*`, `/v1/rooms/*`, `/v1/cities/*` (exist); `/v1/bookings/*`, `/v1/payments/*`
(exist, partner-attribution DESIGN REQUIRED); `/v1/destinations|offers|ads|currencies|users|bank-accounts`
(DESIGN REQUIRED — real Firestore sources exist, endpoints don't).

## 18. QA / Acceptance Criteria (Phase 2A completeness)

Inventory ☑ · doc-vs-code ☑ · SoT ☑ · partner model ☑ · credential lifecycle ☑ · rate-limit reality ☑ ·
logic ownership ☑ · migration boundary ☑ · CMS boundary ☑ · Postgres decision ☑ · security gaps ☑ ·
gap register ☑ · decisions ☑ · target arch ☑ · Lovable boundary ☑ · zero production changes ☑.

*No code written, modified, or deployed. No keys created/rotated. No Firebase changes.*
