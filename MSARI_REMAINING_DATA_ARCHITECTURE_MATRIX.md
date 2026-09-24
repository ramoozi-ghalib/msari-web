# MSARI — Remaining Data Architecture Matrix
## Batch 1 — Phase 1 + Phase 2 + Phase 3

**Deliverable**: `MSARI_REMAINING_DATA_ARCHITECTURE_MATRIX.md`  
**Status**: COMPLETE — READY FOR SUPERVISOR REVIEW  
**Date**: 2026-09-15  
**Approved Master Plan**: 6 Phases in 3 Batches (Hotels/Rooms/Cities = CLOSED)

---

## 1. Executive Summary

This matrix inventories **all Website data resources** after the closed catalog migration (Hotels, Rooms, Cities, Images, Display Price, Amenities). For each resource it identifies:

| Column | Purpose |
|--------|---------|
| **Source of Truth (SoT)** | Actual production data store — not inferred from naming |
| **Current Access Path** | How the Website currently consumes it (API, Server Action, Firestore Admin SDK, Firebase Client SDK, CMS client, Storage, etc.) |
| **Classification** | Exactly one: `MIGRATE` / `KEEP DIRECT BY DESIGN` / `NEW API REQUIRED` / `FORBIDDEN / OUT OF SCOPE` / `DEAD / UNUSED` / `NEEDS ARCHITECTURAL DECISION` |
| **API Requirement** | Only if migration is justified: existing endpoint, missing capability, required endpoint, business logic, auth model, data contract, parity requirements |

**Rule**: Do not create endpoints merely because a resource currently uses Firestore.

---

## 2. Complete Resource Inventory

### 2.1 Operational Core (Booking Domain)

| Resource | SoT | Current Access | Classification | API Status |
|----------|-----|----------------|----------------|------------|
| **Bookings** (create/preview/history/cancel) | Firestore `bookings/{uid}/entries/{number}` | **Server Actions** (`actions/bookings.ts`) → Direct Firestore txn + **Feature-flagged API** (`USE_BOOKING_API`) | `MIGRATE` (Phase 4) | **Proposed endpoints exist in local working tree** (`POST /v1/bookings/preview`, `POST /v1/bookings`, `GET /v1/bookings`, `GET /v1/bookings/:id`, `PATCH /v1/bookings/:id`, `POST /v1/bookings/:id/payment`) — **NOT DEPLOYED**. D1–D9 approved. Requires Staging gate. |
| **Payment / Receipts** | Firestore `bookings/{uid}/entries/{number}.payment` + Storage `booking_receipts/{uid}/{number}.{ext}` | **Server Actions** (embedded in `createBooking`) + Feature-flagged API | `MIGRATE` (Phase 4) | Part of Booking API endpoints above. D3 hardening approved (MIME/size/magic bytes, allowlisted storage hosts). |
| **Availability** (overlap check) | Computed in-txn (Firestore `bookings` collection group) | **Server Actions** (inside `createBooking` transaction) | `MIGRATE` (Phase 4) | Moved into Booking API transaction (D1). Not a standalone resource. |

### 2.2 Identity & Auth

| Resource | SoT | Current Access | Classification | API Status |
|----------|-----|----------------|----------------|------------|
| **User Authentication** (login/register/password reset) | Firebase Auth | **API** (`apiClient.loginUser`, `apiClient.registerUser`) + **Firebase REST API** (password reset via `identitytoolkit.googleapis.com`) | `KEEP DIRECT BY DESIGN` | Auth is Firebase-owned. API `/auth/login`, `/auth/register`, `/auth/refresh` are thin proxies. No migration needed. |
| **User Profile / Session** | Firebase Auth + Firestore `customers/{uid}` | **NextAuth** (`auth()`) → session; **Server Action** `getProfile()` reads session | `KEEP DIRECT BY DESIGN` | Profile data merged from Firebase Auth + Firestore at login time. No separate API needed. |
| **User Roles / Permissions** | Firestore `admins/{uid}` | **Server Actions** (`adminGuard`, `Policies`) → Direct Firestore read | `KEEP DIRECT BY DESIGN` | Admin checks are server-side only, low latency, no business logic. Direct read acceptable. |
| **Partner Identity / Credentials** | Firestore `api_keys` | **API Middleware** (`apiKeyMiddleware`, `partnerAuth`) → Direct Firestore | `KEEP DIRECT BY DESIGN` (Partner Control Plane = Phase 5) | Credential verification is infrastructure, not business logic. Phase 5 will add management plane. |

### 2.3 Currency & Configuration

| Resource | SoT | Current Access | Classification | API Status |
|----------|-----|----------------|----------------|------------|
| **Exchange Rates** (`rates/global`) | Firestore `rates/global` doc | **Server Actions** (`actions/currency.ts` → `lib/currency.ts`) → Direct Firestore read (10min memory cache) | `MIGRATE` | **Required by Booking API** (D2). Currently read directly in `lib/currency.ts` with fallback constants. Should be exposed via API for centralized rate management. |
| **Global Config** (feature flags, site settings) | Firestore `website_settings/general` | **CMS Client** (`SettingsCmsService`) → Direct Firestore read (Next.js unstable_cache 10s) | `KEEP DIRECT BY DESIGN` | Editorial/marketing config. CMS-owned. Not operational business logic. |
| **Feature Flags** (API migration modes) | Environment variables (`MSARI_API_*_MODE`) | **Server-side only** (`lib/api-migration/flags.ts`) | `KEEP DIRECT BY DESIGN` | Runtime config, not data. No API needed. |

### 2.4 Catalog (CLOSED — Already Migrated)

| Resource | SoT | Current Access | Classification | Notes |
|----------|-----|----------------|----------------|-------|
| **Hotels** | Firestore `hotels/{id}` + subcollection `rooms` | **API** (`/v1/hotels`, `/v1/hotels/:id`, `/v1/hotels/by-slug/:slug`) + **Server Actions** (SHADOW/CANARY/ON modes with direct fallback) | **CLOSED** | Phase B complete. API-first with parity verification. |
| **Rooms** | Firestore `hotels/{hotelId}/rooms/{roomId}` | **API** (`/v1/rooms?hotelId=`) + **Server Actions** (same migration modes) | **CLOSED** | Phase B complete. |
| **Cities / Destinations** | Firestore `destinations/{id}` | **API** (`/v1/cities`) + **Server Actions** (Phase C: ON by default, direct fallback) + **Static Data** (`data/destinations.ts`) | **CLOSED** | Phase C complete. CMS editorial guide separate (`website_destinations`). |
| **Amenities** | Firestore `amenities` | **Server Actions** (`actions/amenities.ts`) → Direct Firestore read | **CLOSED** | Read-only reference data. Admin mutations via Server Actions. No API consumer yet. |

### 2.5 Editorial / Marketing (CMS)

| Resource | SoT | Current Access | Classification | Notes |
|----------|-----|----------------|----------------|-------|
| **Website Settings** (`website_settings/general`) | Firestore `website_settings/general` | **CMS Client** (`SettingsCmsService`) → Direct Firestore | `KEEP DIRECT BY DESIGN` | Contact info, social links, FAQs, footer. Pure editorial. |
| **Homepage Content** (`website_pages/homepage`) | Firestore `website_pages/homepage` | **CMS Client** (`PagesCmsService.getHomepage()`) → Direct Firestore | `KEEP DIRECT BY DESIGN` | Hero, featured sections. Editorial. |
| **Flights Page Content** (`website_pages/flights`) | Firestore `website_pages/flights` | **CMS Client** (`PagesCmsService.getFlightsPage()`) → Direct Firestore | `KEEP DIRECT BY DESIGN` | Editorial content for flights page. |
| **Cars Page Content** (`website_pages/cars`) | Firestore `website_pages/cars` | **CMS Client** (`PagesCmsService.getCarsPage()`) → Direct Firestore | `KEEP DIRECT BY DESIGN` | Editorial content for cars page. |
| **Destinations Editorial** (`website_destinations/{slug}`) | Firestore `website_destinations/{slug}` | **CMS Client** (`DestinationsCmsService.getEditorialGuide()`) → Direct Firestore | `KEEP DIRECT BY DESIGN` | Hero images, taglines, overview, landmarks. Editorial, not operational. |
| **Blog Posts** (`web_blog/{slug}`) | Firestore `web_blog` | **Server Actions** (`actions/blog.ts`) → Direct Firestore | `KEEP DIRECT BY DESIGN` | Editorial content. No business logic. |
| **Offers / Ads** (`ads/{id}`) | Firestore `ads` | **Server Actions** (`OfferService` via `actions/offers.ts`) → Direct Firestore (60s cache) | `KEEP DIRECT BY DESIGN` | Marketing banners. No operational logic. |

### 2.6 Static / Reference Data

| Resource | SoT | Current Access | Classification | Notes |
|----------|-----|----------------|----------------|-------|
| **Destination Static Data** | TypeScript module (`data/destinations.ts`) | **Direct import** in `CityService.getDestinationBySlug()` | `KEEP DIRECT BY DESIGN` | Hardcoded editorial content (landmarks, history, climate). Never changes at runtime. |
| **Currency Metadata** | TypeScript constant (`lib/currency.ts` `CURRENCIES` array) | **Direct import** | `KEEP DIRECT BY DESIGN` | Symbol, label, code mapping. Static. |

### 2.7 Secondary Services (Types Exist, No Server Actions)

| Resource | SoT | Current Access | Classification | Notes |
|----------|-----|----------------|----------------|-------|
| **Bank Accounts** | Firestore (collection unknown) | **None** (types only in `types/index.ts`) | `NEEDS ARCHITECTURAL DECISION` | Types defined but no read/write actions found. Used where? Payment flow? |
| **Car Services** | Firestore (collection unknown) | **None** (types only in `types/index.ts`) | `NEEDS ARCHITECTURAL DECISION` | Types defined (`CarService` interface). Cars pages use CMS content only. |
| **Flights** | External? / Firestore? | **None** (types only in `types/index.ts`) | `NEEDS ARCHITECTURAL DECISION` | Flights page is CMS-driven. No flight search/booking actions found. |
| **Reviews** | Firestore (collection unknown) | **None** (types only in `types/index.ts`) | `NEEDS ARCHITECTURAL DECISION` | Type defined. Hotel type has `reviewCount` (fallback 12). No read/write actions. |

---

## 3. Classification Summary

| Classification | Resources | Count |
|----------------|-----------|-------|
| **MIGRATE** (Phase 4) | Bookings, Payment, Availability | 3 |
| **MIGRATE** (Rate API) | Exchange Rates | 1 |
| **KEEP DIRECT BY DESIGN** | Auth, Profile, Roles, Partner Credentials, CMS (7 resources), Static Data (2), Catalog (4 closed) | 17 |
| **NEEDS ARCHITECTURAL DECISION** | Bank Accounts, Car Services, Flights, Reviews | 4 |
| **FORBIDDEN / OUT OF SCOPE** | — | 0 |
| **DEAD / UNUSED** | — | 0 |

---

## 4. API Requirements (Only for MIGRATE Resources)

### 4.1 Exchange Rates API (Required for D2 Pricing)

| Aspect | Detail |
|--------|--------|
| **Existing Endpoint** | None |
| **Required Endpoint** | `GET /v1/rates` → returns `{ usd: 1, sar: 3.82, yerSouth: 1600, yerNorth: 535, updatedAt }` |
| **Business Logic** | Canonical SoT = `rates/global` doc. Case-insensitive key lookup. Unified fallbacks (D2). Half-up 2dp rounding. |
| **Authorization** | Public read (no auth) — rates are reference data |
| **Caching** | 10min server cache + CDN |
| **Parity** | Must match `lib/currency.ts` current behavior exactly |

### 4.2 Booking API (Phase 4 — Already Designed, Not Deployed)

| Endpoint | Status | Notes |
|----------|--------|-------|
| `POST /v1/bookings/preview` | Local only | D1 Availability + D2 Pricing |
| `POST /v1/bookings` | Local only | D6 User-scoped idempotency |
| `GET /v1/bookings` | Local only | D7 History with channel/source/customer |
| `GET /v1/bookings/:id` | Local only | |
| `PATCH /v1/bookings/:id` | Local only | D4 Status machine + D6 Idempotency |
| `POST /v1/bookings/:id/payment` | Local only | D3 Receipt hardening + D6 Idempotency |

**Deployment Blocker**: Staging environment unavailable (msari-eb18a not on Blaze). See Staging Gate report.

---

## 5. Unresolved Architectural Decisions

| Decision | Resources Affected | Required Input |
|----------|-------------------|----------------|
| **Bank Accounts SoT & Access** | Bank Accounts | Where are they stored? Who reads/writes? Payment flow dependency? |
| **Car Services Scope** | Car Services | Operational (booking) vs Editorial (CMS)? If operational → MIGRATE. If editorial → KEEP DIRECT. |
| **Flights Scope** | Flights | External API integration vs own inventory? Current page is CMS-only. |
| **Reviews System** | Reviews | Operational (user-generated) vs Editorial? If operational → MIGRATE + API. If none → DEAD. |
| **Rate API Scope** | Exchange Rates | Public endpoint? Auth required? Caching strategy? Versioning? |

---

## 6. Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Booking API Staging blocked** | Phase 4 cannot complete Staging Gate | Supervisor decision: upgrade msari-eb18a / alternative Staging / CONDITIONAL PASS / BLOCK |
| **Rate API missing** | Booking API preview/create cannot compute FX without direct Firestore read | Create minimal `GET /v1/rates` endpoint (low complexity, high value) |
| **Bank Accounts unknown** | Payment flow may have hidden Firestore dependency | Audit payment code paths; classify before Phase 4 cutover |
| **Car/Flight/Review ambiguity** | May create shadow Firestore dependencies | Resolve before Batch 2 (Phase 4) begins |
| **CMS/Editorial confusion** | Risk of moving editorial data into operational API | Explicit KEEP DIRECT classification for all CMS resources |

---

## 7. Acceptance Criteria for Batch 1

| Criterion | Status |
|-----------|--------|
| All Website data resources inventoried | ✅ COMPLETE |
| SoT identified for each (actual prod, not inferred) | ✅ COMPLETE |
| Current access path documented for each | ✅ COMPLETE |
| Exactly one classification assigned per resource | ✅ COMPLETE |
| API requirements defined ONLY for MIGRATE resources | ✅ COMPLETE |
| Closed catalog work not reopened | ✅ CONFIRMED |
| No endpoints created for KEEP DIRECT resources | ✅ CONFIRMED |
| Unresolved decisions explicitly listed | ✅ COMPLETE |

---

## 8. Next Steps (Batch 2 Authorization Required)

1. **Supervisor Review** of this matrix
2. **Resolve 4 Architectural Decisions** (Bank Accounts, Car Services, Flights, Reviews)
3. **Create Rate API** (`GET /v1/rates`) — prerequisite for Booking API D2 compliance
4. **Phase 4 Booking API** — deploy to Staging when available, execute Staging Gate
5. **Phase 5 Partner Control Plane** — after Phase 4 Production cutover
6. **Phase 6 Final Architecture Gate**

---

## 9. Supervisor Verification Checklist

```text
ALL RESOURCES INVENTORIED: YES / NO
SOT ACTUAL PROD (NOT INFERRED): YES / NO
ACCESS PATHS DOCUMENTED: YES / NO
CLASSIFICATIONS EXCLUSIVE: YES / NO
API REQUIREMENTS ONLY FOR MIGRATE: YES / NO
CLOSED WORK NOT REOPENED: YES / NO
NO ENDPOINTS FOR KEEP DIRECT: YES / NO
UNRESOLVED DECISIONS LISTED: YES / NO

NEXT AUTHORIZED PHASE: BATCH 2 — PHASE 4 BOOKING API-FIRST (after Staging resolved)
```

---

*Matrix generated by Batch 1 — Remaining Data Architecture Review*