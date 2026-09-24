# MSARI_API_PARTNER_MANAGEMENT_AUDIT.md

> READ-ONLY AUDIT — P0. No production modified. No keys created/revoked. No secrets displayed.
> Date: 2026-09-08. Scope: `msari_web` repo + live gateway contract as referenced in code.
> External Cloud Functions gateway internals and live Firestore key records were NOT accessible (see §19).

---

## 1. Executive Summary

1. **There is NO real API key system in `msari_web`.** The only issuance code is an orphaned, non-persistent stub (`flights/booking/actions.ts:27-71`, zero importers, TODO-commented storage). Real issuance today is **manual via WhatsApp** (`DevelopersClient.tsx:48-51`).
2. **There is NO scope/permission system.** One global `NEXT_PUBLIC_API_KEY` is attached to every gateway call (`api-client.ts:267-279`); session permissions (`permissions.ts`) never see API-key identity. Answer to §3: **YES — one key reaches all endpoints it can call.**
3. **Validation lives outside this repo** (Cloud Functions gateway). Key→partner→scope mapping: **UNKNOWN** (unauditable here).
4. **The key is client-exposed by design flaw** (`NEXT_PUBLIC_API_KEY`), with no revocation, rotation, expiry enforcement, or per-key audit.
5. **No partner API documentation exists** (no OpenAPI/Swagger/Postman/examples). Only marketing FAQ + WhatsApp flow.
6. **Lovable CANNOT be connected safely on the current system** — verdict: **REQUIRES APPROVAL** (effectively NO until scopes + server-side keys exist).

---

## 2. Current API Architecture

- Web app reads Firestore directly (Admin SDK) for hotels/rooms/cities; calls Cloud Functions gateway (`https://us-central1-msariapp-v2.cloudfunctions.net/api/v1`, `api-client.ts:260`) for auth (`/auth/login`, `/auth/register`, `/me`), `/cities` (fallback), `/rooms?hotelId=` (fallback).
- 6 Next.js API routes only: NextAuth handlers, 2 redirect helpers, public `GET /api/hotels/[slug]` (IP-limited 60/m, no key), auth-gated partner lead intake, secret-gated revalidate. Full inventory in §6.

## 3. API Key Architecture

| Question | Finding (file:line) |
|---|---|
| Issued where? | Nowhere persistent. Stub `flights/booking/actions.ts:51` mints `msari_live_<32hex>` ephemerally; real flow = WhatsApp `DevelopersClient.tsx:48-51` |
| Stored where? | **Nowhere.** No `api_keys` collection/table (grep negative). Source of truth: **does not exist in repo** |
| Fields | Stub shape only (never written): `id, name, keyString, createdAt, expiresAt:'2026-12-31', plan, status:'active', requestsUsage:0` (`:56-65`) |
| key ID / secret / hash | No stored ID; plaintext ephemeral; hashing TODO commented (`:53-54`) |
| partner / owner linkage | None (closest: `hotel_partner_requests.userId`, a lead form, not credentials) |
| active/inactive/status | None enforced |
| expiresAt | Hardcoded stub string, never validated |
| subscription/commission | **Absent from code entirely** (`commission\|subscription\|annual` = 0 app hits). Dashboard-described only (unverified here) |
| permissions/scopes | **None** |
| rate/usage limits per key | None (only infra IP/user limiters) |
| environment | None |
| lastUsed/usageCount | None (`requestsUsage:0` never persisted) |
| Secrets observed | None — `<REDACTED>` N/A |

## 4. Current Authentication

- Gateway: single static `x-api-key: NEXT_PUBLIC_API_KEY` on all calls (`api-client.ts:263-279`), `cache:no-store`, 3.5s timeout.
- Internal routes: session (`hotel-requests`), shared secret (`revalidate`), IP limit (`hotels/[slug]`), Auth.js sessions (24h JWT). **No route validates an API key.**

## 5. Current Authorization — **NO scopes exist**

- `permissions.ts` / `policies.ts` / `action-guard.ts` = session-role RBAC only (CUSTOMER/BOOKING_STAFF/ADMIN), zero API-key references (grep-proven).
- All 5 wired gateway methods share one header → **one key = full gateway access. YES.**
- Commercial fields (commission/annual) exist **neither in code nor in any key record** → cannot authorize anything. Separation status: nothing to separate yet.

## 6. Endpoint Inventory

| Endpoint | Method | R/W | Auth | Operational data |
|---|---|---|---|---|
| `/api/auth/*` (NextAuth) | GET/POST | both | IS auth | users/session only |
| `/api/auth/redirect`, `/api/session-redirect` | GET | read | session | none |
| `/api/hotels/[slug]` | GET | read | none + 60/m IP | hotels/rooms/prices READ |
| `/api/partners/hotel-requests` | POST | write | session + honeypot + zod | `hotel_partner_requests` lead ONLY |
| `/api/revalidate` | POST/GET | cache-write | shared secret (GET leaks secret in URL — finding) | none |
| Gateway `/auth/login|register`, `/me` | POST/GET | key + Bearer | users |
| Gateway `/cities`, `/rooms?hotelId=`, `/hotels?limit`, `/hotels/{id}` | GET | key | hotels/rooms/cities READ (`/hotels*` dead in web client) |

## 7. Permission Matrix (current = no permissions; matrix shows exposure)

| Endpoint | Auth today | Permission today | Data class | Partner-safe as-is? |
|---|---|---|---|---|
| Hotels/rooms/cities read (gateway + `/api/hotels/[slug]`) | global key / none | none | READ-ONLY (+prices embedded) | NO (prices inseparable; key global) |
| Images/destinations/currencies/offers | same/none | none | READ-ONLY | NO (same key) |
| Bookings (Server Actions, no API) | session | session roles | SENSITIVE | N/A (no partner path) |
| Payments/bank/customers | session/admin | session roles | SENSITIVE | N/A (no partner path) |
| Revalidate | shared secret | none | infra | NO for partners |

## 8. Existing Partner Keys

Cannot enumerate: no store in repo; Firestore reads blocked by permissions. **No key material retrieved, none displayed.** Test keys mentioned by owner are unverifiable from here (see §9).

## 9. Existing Test Key Results

**NOT TESTED — blocked safely.** Requirements for safe testing: staging gateway URL + test key via secure channel + read-only allowlist (`GET /cities`, `GET /rooms?hotelId=`, `GET /api/hotels/[slug]`) + explicit ban on POST/mutations + secret redaction in logs. Attempting production mutation tests is forbidden by this audit.

## 10. Security Findings

| Check | Verdict |
|---|---|
| Key in frontend (`NEXT_PUBLIC_API_KEY`) | **CONFIRMED** — extractable from bundle (`api-client.ts:264`) |
| Use without server-side protection | **CONFIRMED** — header attached client-side |
| Revocable | **UNKNOWN** (gateway-side, unauditable; no mechanism in repo) |
| Rotation / expiration | **UNKNOWN** server-side; **CONFIRMED** absent client-side |
| Rate limiting per key | **CONFIRMED** absent (IP/user limiters only) |
| Audit log per key | **CONFIRMED** absent |
| Last-used/usage visibility | **CONFIRMED** absent |
| Instant partner disable | **UNKNOWN** (depends on gateway) |
| `revalidate` secret via GET URL | **CONFIRMED** design weakness (query-log exposure) |

## 11. Documentation Findings

**No partner API docs exist.** No OpenAPI/Swagger/Postman/examples/schemas. Only: README (no API section), archived strategy notes (marked DO NOT USE), `.env.example` var names, developers marketing page (WhatsApp CTAs + FAQ, no endpoints).

## 12. Current Dashboard Capabilities

Local admin = external redirect (`admin/page.tsx` → `msariapp-v2.web.app`); in-repo issuance = orphaned stub. Per-capability: Profile PARTIAL (lead form only) · Credentials/Plan/Scopes/Limits/Usage/Audit/List/Revoke/Rotate/Docs **MISSING**.

## 13. Missing Capabilities

Persistent issuance + hashed storage + show-once + scopes + per-key limits + metering + audit + list/search + revoke + rotate + expiry + partner docs + staging.

## 14. Proposed Permission Model (design only, NOT implemented)

`hotels:read, rooms:read, images:read, destinations:read, prices:read, availability:read, currencies:read, offers:read, bookings:create, bookings:read, bookings:cancel, payments:create` — each bound ONLY to existing endpoints (§6); nothing invented.

## 15. Proposed Partner Model (design only)

`Partner → Credential (server-side key, hashed, show-once) → Permission Set → endpoint enforcement`, tiers 1–10 per spec (Full … Custom), commercial plan stored separately from technical scopes. Hard bans: no Firebase Admin / service accounts / Storage admin / internal secrets to partners.

## 16. Lovable Required Access

Full-site parity needs: public content + hotels/rooms/images/prices/currencies/offers reads + auth + booking create/read + user bookings (+ payments if checkout). I.e. near-full scopes incl. price + booking mutation.

## 17. Risks

Global client-side key (active exposure), no revocation proof, no audit, no docs, WhatsApp-manual ops, `revalidate`-via-GET, dead `/hotels*` gateway wrappers, stub code inviting misuse.

## 18. REQUIRES APPROVAL

Scope model adoption; server-side key issuance/storage choice; Lovable key creation; docs site; `revalidate` GET removal; per-key limits/metering; rotation/expiry policy; staging environment.

## 19. UNKNOWN (access-blocked, no guessing)

Gateway key→partner→scope mapping; live key inventory/status; revocation/rotation/expiry enforcement; per-key usage; bot/API traffic split; Cloud Functions code; billing impact.

---

## FINAL QUESTIONS

1. Real API key system? **NO** (stub + manual only).
2. Keys bound to partners? **NO** (no store, no linkage).
3. Scope/permission system? **NO.**
4. Scoped-only partner access? **NO.**
5. Revocable? **UNKNOWN.**
6. Rotatable? **UNKNOWN.**
7. Usage observable? **UNKNOWN** (none in repo).
8. Official partner docs? **NO.**
9. Lovable safe on current system? **NO — REQUIRES APPROVAL** (needs scopes + server-side keys first).
10. What must be built? §13 + §14 + §18 approval items, in that order.
