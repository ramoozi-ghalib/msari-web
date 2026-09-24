# MSARI_PHASE_1_CURRENT_WEBSITE_API_INTEGRATION_DISCOVERY.md

> READ-ONLY discovery. No code, data, Firebase, API, Dashboard, keys, env, or rules changed.
> Date: 2026-09-08. Scope: `msari_web` repo + live gateway contract as referenced in code.
> Vocabulary: CONFIRMED / PARTIALLY CONFIRMED / UNKNOWN / EXTERNAL / SOURCE NOT AVAILABLE / MISSING / NOT APPLICABLE / REQUIRES ARCHITECTURAL DECISION.

---

## 1. Executive Summary

- The website is **Firebase-first, Hybrid** (CONFIRMED): hotels, rooms, prices, cities, ads, currencies, bookings all read/write **Firestore directly** (Admin SDK, server-side). The Cloud Functions gateway is used for **auth only** (`/auth/login`, `/auth/register`, `/me`) plus two narrow fallbacks (`/cities`, `/rooms?hotelId=`).
- Single HTTP client: `src/lib/api-client.ts` (`fetch`, no axios). Base URL from `NEXT_PUBLIC_API_BASE_URL` or fallback `https://us-central1-msariapp-v2.cloudfunctions.net/api/v1` (CONFIRMED from source).
- Auth to gateway: one static `x-api-key: NEXT_PUBLIC_API_KEY` on every call (client-exposed). No scopes, no per-partner credentials in this repo.
- No availability system exists as a concept (grep empty): availability = room `isPublished`/`isDeleted` flags + mapped `isAvailable`. Source of truth: Firestore room documents.
- Partner API system, key store, scopes, docs: **MISSING** here; Dashboard/Functions sources: **EXTERNAL / SOURCE NOT AVAILABLE**.

## 2. Current Architecture

```
Browser ──► Next.js (Vercel)
              ├─► Server Actions / RSC ──► Firestore directly (Admin SDK)  [hotels/rooms/cities/ads/currency/bookings]
              ├─► api-client.ts ──► Cloud Functions /api/v1 (x-api-key)    [auth login/register/me; cities+rooms fallbacks]
              └─► NextAuth (JWT cookie msari.session-token, 24h)           [session]
```

## 3. Current Website → API Flow (per call site)

| File | Function | Endpoint | Method | Server/Client | Fallback |
|---|---|---|---|---|---|
| `src/auth.ts:114` | authorize | `/auth/login` + `/me` (Bearer) | POST+GET | server | none |
| `src/actions/auth.ts:28` | register | `/auth/register` | POST | server | none |
| `src/services/city.service.ts:33,101` | getCities (fallback) | `/cities` | GET | server | primary = Firestore `destinations` |
| `rooms/[roomId]/page.tsx:50` | room miss fallback | `/rooms?hotelId=` | GET | server | primary = Firestore rooms subcollection |
| `src/lib/api-client.ts:461,467` | fetchAllHotels/fetchHotelById | `/hotels?limit`, `/hotels/{id}` | GET | — | **dead code, zero callers** (Firestore path used) |
| `src/actions/auth.ts:95` | password reset | Google IdentityToolkit `sendOobCode` | POST | server | none |
| `AddHotelClient.tsx:204` | lead submit | `/api/partners/hotel-requests` (internal) | POST | client→server | none |

Headers (gateway): `Content-Type: json`, `x-api-key: <static>`, `cache: no-store`, 3.5s abort (`api-client.ts:267-288`).

## 4. API Base URL (CONFIRMED from source)

`getBaseUrl()` (`api-client.ts:257-261`): `NEXT_PUBLIC_API_BASE_URL` (trimmed) else `https://us-central1-msariapp-v2.cloudfunctions.net/api/v1`. No other base URL in code.

## 5. Authentication

| Credential | Defined | Read | Sent | Browser? | Type |
|---|---|---|---|---|---|
| `x-api-key` (`NEXT_PUBLIC_API_KEY`) | `.env` / `.env.example:6` | `api-client.ts:263-265` | every gateway call `:277` | **YES (inlined)** | site-global gateway credential |
| Bearer token (`/me`) | gateway login response | `api-client.ts:373-386` | `Authorization: Bearer` | server-side only | user session token |
| NextAuth JWT cookie | `auth.ts:44-60` | server `auth()` | cookie | httpOnly | session |
| `REVALIDATE_SECRET_TOKEN` | env | `revalidate/route.ts:4` | compared, never sent | no | shared cache secret |
| Firebase web key (`NEXT_PUBLIC_FIREBASE_API_KEY`) | env | `actions/auth.ts:93` | IdentityToolkit URL | YES | public by design |

Partner relation of `x-api-key`: **UNKNOWN** — no partner binding evidence in repo.

## 6. Endpoint Inventory

| Endpoint | Method | Purpose | Auth | Data | Used By | Class |
|---|---|---|---|---|---|---|
| `/auth/login`, `/auth/register`, `/me` | POST/GET | auth | global key + Bearer | users | auth flow | Auth |
| `/cities` | GET | cities fallback | global key | cities | city.service | Public Read |
| `/rooms?hotelId=` | GET | room fallback | global key | rooms | room page | Public Read |
| `/hotels?limit`, `/hotels/{id}` | GET | — | key | — | NOBODY (dead) | Unknown |
| `/api/hotels/[slug]` | GET | public hotel JSON | none + 60/m IP | hotels/rooms/prices | legacy callers | Public Read |
| `/api/partners/hotel-requests` | POST | partner lead intake | session | lead doc + facade upload | add-hotel form | Internal |
| `/api/revalidate` | POST/GET | cache invalidate | shared secret | none | dashboard/ops | Internal |
| `/api/auth/*` | GET/POST | NextAuth | IS auth | session | framework | Auth |

No Booking/User/Payment partner endpoints exist.

## 7. Data Flow (final source per type)

- Hotels/Details/Rooms/Prices/Images/Destinations/Offers/Currencies/Auth-user/Bookings: **Firestore direct** (Admin SDK). Prices = `min(explicit, rooms)` computed server-side from hotel+rooms docs. Images = stored URL strings, no resolver.
- Availability: **no separate system** — derived from `isPublished`/`isDeleted`/`isAvailable` flags on the same docs.
- Payments: bank-transfer + Storage receipt upload; no payment API.

## 8. Source of Truth Matrix

| Data | Website Source | API Source | Final SoT | R/W |
|---|---|---|---|---|
| Hotels/rooms/prices/images | Firestore direct | gateway mirrors (mostly unused) | **Firestore operational docs** | R (+W via booking flow) |
| Cities/destinations | Firestore direct (+`/cities` fallback) | mirror | **Firestore** | R |
| Ads/offers, currency rates | Firestore direct | none | **Firestore** | R |
| Users/session | gateway + NextAuth | gateway | **gateway + Firestore `admins` role registry** | R/W |
| Bookings | Firestore direct (Actions) | none | **Firestore** | R/W |
| Availability | flags on room docs | none | **Firestore** | R |

## 9. Direct Firebase Access (all server-side, by design)

Hotels, rooms, cities, ads, currency, bookings, bank_accounts, receipts/Storage, `admins` roles — all direct; API alternatives exist only for auth/cities/rooms-fallback. **Not classified as defects.**

## 10. Classification: **Firebase-first Hybrid (CONFIRMED)**

API-supplied in practice: auth + two fallbacks. Everything else: Firestore direct.

## 11. Partner API Relationship

- Partner API product: **MISSING** in repo. Gateway: **PARTIALLY CONFIRMED** (exists, key-enforced 401 live). Partner management/scopes/per-key identity/rate-per-partner/usage/audit: **UNKNOWN** (external).
- Site registered as partner: **UNKNOWN**. Per-partner credential: **UNKNOWN**. Current site credential is global, not partner-scoped (CONFIRMED by usage).

## 12. Flutter Dashboard Relationship

Dashboard app + key issuance + gateway internals: **EXTERNAL / SOURCE NOT AVAILABLE**. Local admin = redirect to `msariapp-v2.web.app`. No repo on disk.

## 13. Documentation Status: **MISSING**

No OpenAPI/Swagger/Postman/README/examples. Only marketing FAQ + env var names.

## 14. Confirmed Findings

1. Firebase-first hybrid proven by call tracing. 2. Single static client-exposed gateway key. 3. No scopes anywhere. 4. Dead `/hotels*` wrappers. 5. No availability subsystem. 6. `revalidate`-via-GET leaks secret in URLs.

## 15. Unknowns

Gateway key→partner mapping; revocation/rotation/metering; live key inventory; bot/API traffic split; Functions code; billing split.

## 16. Evidence / File References

`src/lib/api-client.ts:256-290,340-470`; `src/auth.ts:63-138`; `src/actions/hotels.ts`, `bookings.ts`, `auth.ts:28,95`; `city.service.ts:33,101`; `rooms/[roomId]/page.tsx:50`; `admin/page.tsx:8-10`; `api/*/route.ts`; `.env.example:5-6`.

## 17. Risks

Global exposed key; no revocation proof; no per-key audit; dead code paths; GET-secret logging; WhatsApp-manual partner ops.

## 18. Items Requiring Architectural Decision

Scope model; server-side issuance/storage; Lovable credential; docs site; `revalidate` GET removal; per-key limits; staging; dead-wrapper cleanup.
