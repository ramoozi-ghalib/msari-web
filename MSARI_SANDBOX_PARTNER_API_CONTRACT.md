# MSARI Sandbox Partner API Contract (for Lovable Integration)
**Version:** 2026-09-21, extracted from production backend source (`functions/index.js`, `partnerAuth.js`, project `msariapp-v2`). **No secrets in this document.**

## 0. READ FIRST — Sandbox Serving Rule (blocking)
- Sandbox and Production share ONE physical deployment. They are separated by **credential**, not by URL.
- A sandbox credential (`msari_test_*`, record `environment: "sandbox"`) is **REJECTED on the production deployment** (`403 environment-mismatch`) because it serves `API_ENVIRONMENT=production`.
- **Consequence:** do NOT integrate the sandbox key against the production base URL expecting success — it will 403. Sandbox execution requires an environment serving `API_ENVIRONMENT=sandbox` (emulator), OR an explicit owner decision noted in the verification report. **Escalation recorded — do not work around it.**

## 1. Sandbox Base URL
`https://us-central1-msariapp-v2.cloudfunctions.net/api/v1`
(All paths below are relative to it. Same URL serves production; see §0.)

## 2. Authentication
- Partner calls send header: `x-api-key: msari_test_<keyId>.<secret>` (sandbox) — obtained out-of-band, stored as a **server-side secret / environment variable only. NEVER in frontend code, NEVER in the browser bundle, NEVER in URLs.**
- Credential format: `msari_(live|test)_<keyId>.<secret>`, keyId 4–64 alphanumerics, secret 16–256 chars (`A-Za-z0-9-_`). Secret is HMAC-verified server-side (never stored/transmitted in plaintext by the server).
- **Dual auth on booking endpoints:** user flows ALSO require `Authorization: Bearer <Firebase ID token>` (end-user login). The partner key alone is NOT sufficient there; the Bearer alone (no key) works as a plain user call.
- Failure responses: `401` (missing/unknown/invalid/expired credential) or `403` (environment-mismatch, missing scope). Body is flat RFC7807: `{type, title, status, detail, instance}`.

## 3. Required Scopes (requested at issuance; enforced per route)
`hotels:read`, `destinations:read`, `rooms:read`, `bookings:read`, `bookings:create`, `bookings:cancel`, `payments:submit-evidence`. Missing scope → `403 missing-scope`. Legacy scopeless keys do not exist for new issuance.

## 4. Endpoints
### 4.1 Catalog (key + scope only — no Bearer needed)
| Method | Path | Scope | Query | Success |
|---|---|---|---|---|
| GET | `/hotels` | `hotels:read` | `limit` 1–100 (def 12), `cursor` (doc id), `destination` (exact), `featured=true`, `sort` ∈ recommended\|price_asc\|price_desc\|rating | 200 `{success,count,nextCursor,data[]}` |
| GET | `/hotels/:id` | `hotels:read` | — | 200 hotel object / 404 |
| GET | `/hotels/by-slug/:slug` | `hotels:read` | — | 200 hotel object / 404 |
| GET | `/hotels/updated-since` | `hotels:read` | `since` (ISO, required) | 200 `{success,count,data[{id,updatedAt,isDeleted,changeType}]}` |
| GET | `/cities` | `destinations:read` | — | 200 `{success,count,data[{id,name,nameAr,nameEn,imageUrl,isPopular,hotelCount,updatedAt}]}` |
| GET | `/rooms` | `rooms:read` | `hotelId` (required) | 200 `{success,count,data[]}` |
Unknown sort → 400. Missing `hotelId`/`since` → 400.

### 4.2 Booking (Bearer ALWAYS + optional partner key; partner scoping applies when key present)
| Method | Path | Scope (if key) | Body / Query | Success |
|---|---|---|---|---|
| POST | `/bookings/preview` | none extra | `{hotelId*,roomId*,fromDate*,toDate*,guestsCount*,selectedCurrencyCode?}` | 200 preview (no write) |
| POST | `/bookings` | `bookings:create` | same + `nightsCount*,bookingOwnerName*,bookingOwnerPhone*,paymentMethod*,selectedCurrencyCode*` + guest/payment optionals; header `Idempotency-Key` (see §8) | 201 booking |
| GET | `/bookings` | `bookings:read` | `limit` 1–100, `cursor` (base64), `status`, `hotelId`, `fromDate`, `toDate` | 200 list (partner sees only own `partnerId` bookings) |
| GET | `/bookings/:id` | `bookings:read` | — | 200 booking / 404 |
| PATCH | `/bookings/:id` | `bookings:cancel` | `{status:"cancelled"}` (owner: pending→cancelled only; confirm/reject = admin-only) | 200 |
| POST | `/bookings/:id/payment` | `payments:submit-evidence` | multipart receipt file (jpeg/png/webp ≤5MB, magic-byte checked) OR JSON `{receiptUrl}` (allowlisted host) | 200 `{success,receiptUrl}` |

Partner endpoints (`/v1/partners*`) are **admin-only — NOT part of this contract** and unusable with a partner key (403).

## 5. Data Semantics (exact fields)
- **Hotel:** `id, slug|null, destination, name:{ar,en}, address:{ar,en}, overview:{ar,en}, mainImageUrl, images[], amenities[], policies[], stars, price` (display only), `displayPrice|null, featured, isSpecial, isPublished, mapLink, lat, lng, location, coordinates, createdAt, updatedAt, isDeleted`. Note: `price/displayPrice` are DISPLAY values — quotes come only from preview/booking.
- **Room:** `id, hotelId, name:{ar,en}, description:{ar,en}, mainImageUrl, images[], features[], numberOfPersons, numberOfBeds, numberOfBathrooms, numberOfRooms, price` (USD), `isPublished, updatedAt, isDeleted`.
- **Preview response:** `available, hotelId, roomId, nights, totalUsd, totalInSelectedCurrency, currency, displayPrice, pricePerNightUsd, soldOut, activeOverlaps, totalRooms`.
- **Booking object:** `id, bookingNumber (BK-MSXXXXXX-XXXX), status, customerId, hotel{id,name,location,imageUrl}, room{id,name,priceUsd}, stay{fromDate,toDate,nightsCount,guestsCount}, pricing{totalUsd,selectedCurrencyCode,totalInSelectedCurrency}, payment{method,senderNumber,senderName,transferAmount,transferCurrencyCode,transferToNumber,receiptUrl}, createdAt, updatedAt`.
- **Status values:** `pending, confirmed, rejected, cancelled, completed, no_show`. Owner may cancel `pending` only.
- **Currency:** rates keys are lowercase (`sar`, `yerSouth`, `yerNorth`); `USD` rate is implicitly `1.0` (case-insensitive lookup). `totalUsd` is authoritative; converted totals follow the requested code.

## 6. Booking Flow
`preview (price + availability, no write)` → `create with Idempotency-Key` → `pending` → admin `confirmed`/`rejected` (or owner/partner `cancelled` from `pending`) → optional payment evidence. Server computes nights (`[from,to)`), price, availability (sold-out when active overlaps ≥ room count).

**User identity on sandbox:** `POST /v1/auth/register`, `/v1/auth/login`, `/v1/auth/refresh` are FUNCTIONAL on the sandbox serving (per-environment Auth backend, verified live). Test users may be created via API (then cleaned) or via Firebase client SDK; Bearer tokens from either work on all user endpoints.

## 7. Idempotency
`Idempotency-Key` header on `POST /v1/bookings` (partner-scoped, 24h). Same key+endpoint replays the ORIGINAL response (no duplicate). Concurrent same-key → `409` + `Retry-After: 2`. Always send a unique key per booking attempt (UUID).

## 8. Error Format
Flat RFC7807 + HTTP status: `401` unauthorized/unauthenticated, `403` forbidden (scope/environment/state), `404` not-found, `409` idempotency conflict, `400` invalid-argument/unavailable/receipt-*, `500` internal. Machine code: last segment of `type` (e.g. `registration-failed`).

## 9. Environment Rules
1. Sandbox key (`msari_test_*`) ↔ sandbox-serving environment ONLY (§0).
2. Key as server-side secret/env var; never frontend, bundle, URL, log, or repo.
3. Never invent endpoints/fields — only §4 exists.
4. Pricing/availability/booking numbers are server-computed; echo them, don't compute locally.
