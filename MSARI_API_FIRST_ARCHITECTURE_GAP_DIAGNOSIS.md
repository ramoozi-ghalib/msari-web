# MSARI_API_FIRST_ARCHITECTURE_GAP_DIAGNOSIS.md

> READ-ONLY diagnosis. Nothing modified, created (except this file), deleted, or deployed.
> No secrets displayed. Inspected: `msari_web` (D:\Dev\projects\msari_web),
> `msari` app repo (D:\projects\msari). Dashboard web source: absent.
> Vocabulary: CONFIRMED / PARTIALLY CONFIRMED / NOT FOUND IN INSPECTED PROJECTS /
> EXTERNAL / SOURCE NOT AVAILABLE / UNKNOWN / MISSING / REQUIRES ARCHITECTURAL DECISION.

---

## 1. Executive Summary

- **The MSARI API EXISTS and is PRODUCTION**: `D:\projects\msari\functions\index.js` (987 lines, Express + firebase-functions v4, `exports.api`), serving the live base `https://us-central1-msariapp-v2.cloudfunctions.net/api/v1` (behavior matches: 401 without/bogus key, verified live).
- **Design intent vs reality**: contract doc (`docs/architecture/api-contract-v1.md`) describes static-x-api-key sync + PostgreSQL website replica + 100/min gateway rate limit. Reality: **no Postgres replica exists in `msari_web`**, **no rate limiting in function code**, RS256/JWKS deferred.
- **Authorization gap is total**: `api_keys/{key}` + `status==active` lookup exists, record attached as `req.affiliate` — then **never read again** (1 use = assignment). scope=0, permission (partner)=0, rateLimit=0, commission=0 hits in function source.
- **Website is Firebase-first, not API-first**: all operational reads bypass the API via Admin SDK; gateway used for auth + 2 fallbacks only.
- **Mobile (Flutter) never touches the API** (0 gateway references; uses FlutterFire directly).
- **Dashboard key-management screen source is absent** from disk; `firestore.rules:58-59` proves `api_keys` collection exists and is admin-gated.

## 2. Target Architecture

Website + Mobile + Lovable/Partners → MSARI API → Authorization → Domain → DAL → Firestore/Storage, with Flutter Dashboard as Control Plane (partners/credentials/permissions/usage/audit). Firestore stays Source of Truth; clients must not touch it directly for API-covered data.

## 3. Inspected Projects

| Project | Path | Contents relevant |
|---|---|---|
| `msari_web` | D:\Dev\projects\msari_web | Next.js site, Admin SDK direct reads, gateway consumer |
| `msari` (Flutter app v1.3.0+5) | D:\projects\msari | `lib/` (269 Dart files, consumer app, no admin module), `functions/` (API source), `docs/architecture/` (contract), `firestore.rules`, `storage.rules`, `firebase.json` (project `msariapp-v2`) |
| Dashboard web source | — | **NOT FOUND IN INSPECTED PROJECTS** (deployed at `msariapp-v2.web.app` from unknown source) |
| D:\Dev\flutter | Flutter SDK install | NOT APPLICABLE |

## 4. Website Current Architecture (per feature, evidence)

| Feature | Current path |
|---|---|
| Hotels/list/detail | Website → Admin SDK → Firestore (`actions/hotels.ts`) |
| Rooms/prices | Same + rooms subcollections; price = min(explicit, rooms) in web code |
| Availability | Flags on same docs (no subsystem) |
| Images | Stored URL strings, no resolver |
| Cities/ads/currency | Firestore direct (`/cities` gateway = fallback only) |
| Auth/session | Gateway `/auth/*` + `/me` + NextAuth JWT |
| Bookings | Server Actions → Firestore (gateway booking endpoints UNUSED by web) |
| Bank accounts/receipts | Firestore + Storage direct |

## 5. Mobile Current Architecture

A: no. B/C/D: **CONFIRMED** (FlutterFire `cloud_firestore` imports; zero gateway references in 269 Dart files). E: no (gateway unused by app). F/G/H: no backend, no partner API, no key management in app. Mobile = direct-Firebase consumer; the `/v1/*` sync endpoints serve website/external sync, not the app.

## 6. API Discovery — FOUND, PRODUCTION

- Project/dir: `msari` / `functions/`; Express 5 + firebase-functions 4, Node 22; entry `index.js`; export `exports.api`; deploy: Cloud Functions `msariapp-v2` (matches live host + live 401 behavior).
- Endpoints: auth register/login/refresh, `/me` GET+PUT (Bearer), sync `hotels/updated-since|list|:id`, `cities`, `rooms` (x-api-key), bookings POST/GET/PATCH/payment (Bearer + owner/admin roles).
- Key validation: `api_keys` lookup `key==X AND status==active`, else 401 (matches live probes).
- Documented-but-absent: 100/min rate limit, Postgres replica + sync engine, HEAD/ETag image sync, RS256/JWKS, admin dashboard modules for API.

## 7. API Data Coverage

| Domain | API exists? | Endpoint | Used by web? | Used by mobile? | SoT |
|---|---|---|---|---|---|
| Hotels/detail/rooms/cities | YES | `/v1/*` | fallback/dead only | NO | Firestore |
| Prices/availability/images | embedded in above | — | direct | direct | Firestore |
| Users/auth | YES | `/auth/*`, `/me` | YES | UNKNOWN (likely Firebase Auth direct) | Firebase Auth + `customers` |
| Bookings | YES | `/v1/bookings*` | NO (Actions) | UNKNOWN | Firestore |
| Bank/currency/offers/editorial | NO endpoint | — | direct | direct | Firestore |
| Partner keys/scopes | NO | — | — | — | **none exists** |

## 8. Source of Truth Matrix

DATA SOURCE = Firestore (all domains). ACCESS LAYERS = Admin SDK (web/mobile), gateway (auth + website fallbacks). SOURCE OF TRUTH = Firestore operational docs. The gateway is an access layer for a subset, not the truth.

## 9. Business Logic Distribution

- Price display calc: website (`actions/hotels.ts`) — Website-specific.
- Booking totals/availability txn: BOTH function txn (`index.js`) AND website preview (`bookings.ts`) — **DUPLICATED** (same formula, two codebases; drift risk CONFIRMED by inspection, no divergence proven).
- Availability overlap check: function txn only; website relies on flags — PARTIAL split.
- Commission/partner rules: **MISSING everywhere** (0 hits both repos).
- Auth roles: `admins` registry shared; session RBAC web-only; booking ownership function-only — split by layer, consistent.

## 10. Authentication Architecture

End-user Bearer (gateway) / static x-api-key (sync, env-stored per contract, client-exposed in web) / NextAuth JWT+cookie (web) / revalidate secret (ops). No OAuth, no per-partner identity.

## 11. Authorization Architecture

Booking owner-or-admin + session RBAC (both real). Partner scopes/permissions/rate-per-key/expiry/rotation/audit: **MISSING** (0 hits function source; `req.affiliate` never consumed).

## 12. Flutter Dashboard Relationship

Dashboard screen source absent; `firestore.rules:58-59` gates `api_keys/{keyId}` to superAdmin/pagePermission/admin — issuance UI writes there from the externally-deployed app. Full chain Dashboard→Function→Firestore: **EXTERNAL / SOURCE NOT AVAILABLE** for the first hop; gateway→Firestore CONFIRMED.

## 13. Partner Architecture (capability table)

Partner/Credential/PermissionSet/Scopes/RateLimit/Usage/Audit/Status: **MISSING** (record shape in `api_keys` unverifiable — Firestore reads blocked). Expiry: UNKNOWN. Revocation (via `status` field): PARTIALLY CONFIRMED (mechanism exists in lookup; UI/proof absent).

## 14. Website API-First Gap

Possible without rewrite: gateway already covers hotels/cities/rooms/auth/bookings; website needs migration of reads + booking actions; must NOT touch: CMS/editorial, booking txn semantics, prices logic. Cannot reuse as-is: ads/offers, currency rates, bank accounts, destinations editorial (no endpoints); client-exposed key must become server-side; Postgres-sync design is dead (do not revive without decision).

## 15. Mobile API-First Gap

Mobile uses zero API; migrating it is a larger, separate decision — OUT OF SCOPE for website remediation; record only.

## 16. Security Gaps

Client-exposed global key; no partner isolation; no per-key throttling (doc promises 100/min, code has none); dead wrappers widen surface; `revalidate`-via-GET leaks secret in logs. (No fixes applied.)

## 17. Performance/Coupling Gaps

Duplicate reads/N+1 already remediated in web repo; gateway adds no cache; no central partner throttling possible without key model.

## 18. GAP Register

- GAP-001 (CRITICAL): No partner authorization model — any valid key reaches all keyed endpoints. Evidence: affiliate-unused + 0 scope hits.
- GAP-002 (CRITICAL): Website bypasses API for all operational data (Firebase-first, not API-first).
- GAP-003 (HIGH): Dead Postgres-replica design vs direct-read reality — architectural drift, no sync engine.
- GAP-004 (HIGH): Price/booking logic duplicated across web + functions.
- GAP-005 (HIGH): Documented 100/min gateway limit not implemented.
- GAP-006 (MEDIUM): Mobile outside API entirely.
- GAP-007 (MEDIUM): Missing endpoints (ads, rates, bank, editorial) block full API-first.
- GAP-008 (MEDIUM): Dashboard issuance chain unauditable (source absent).
- GAP-009 (LOW): Client-exposed site key (mitigate when server-side keys exist).
- GAP-010 (LOW): Dead `/hotels*` wrappers + `revalidate`-via-GET.

## 19. Migration Boundary

Move behind API eventually: hotel/room/city reads, booking actions, price display calc (single implementation). Keep: CMS/editorial, internal admin functions, session/auth UX, receipt Storage flow mechanics.

## 20. Architectural Decisions Required

1. Adopt scope model vs coarse key-per-partner. 2. Server-side issuance/storage design. 3. Revive Postgres sync vs direct-read API mode. 4. Mobile inclusion or website-only API-first. 5. Rate-limit values + enforcement point. 6. Lovable credential type. 7. Dead-code removal approval.

## 21. Final Verdict

1. API location: `D:\projects\msari\functions\index.js`. 2. Built inside `msari` repo: YES. 3. PRODUCTION (live behavior matches). 4. Website uses it: PARTIAL (auth + fallbacks). 5. Mobile uses it: NO. 6-7. Covers auth/hotels/cities/rooms/bookings; lacks ads/rates/bank/editorial/keys-admin. 8. Dashboard manages keys via `api_keys` (rules-gated; UI source absent). 9. Gap: authorization model + website bypass + dead sync design. 10. Minimal correction path: scopes → server-side issuance → migrate web reads → dedupe price logic → limits. 11. Do not touch: data, booking semantics, prices, CMS, rules, app. 12. Decisions: §20.

## 22. Evidence / File References

`D:\projects\msari\functions\index.js` (middleware ~lines 50-110, routes, `exports.api` end); `docs/architecture/api-contract-v1.md`; `firestore.rules:58-59`; `firebase.json`; web `api-client.ts:256-290`; live 401 probes (no-key + bogus).
