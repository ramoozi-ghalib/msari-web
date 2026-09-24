# MSARI — Phase 4 — Booking API-First — Production Runtime Verification Report

## 1. Executive Summary

**Status: FAIL — PRODUCTION DEPLOYMENT INCOMPLETE**

| Criterion | Status |
|-----------|--------|
| Phase 4 endpoints deployed | ❌ INCOMPLETE |
| Auth middleware functioning | ❌ BROKEN (invalid token → 400 not 401) |
| Runtime verification possible | ❌ BLOCKED |

**Verdict**: Phase 4 CANNOT PASS Production Runtime Verification. Critical endpoints missing, auth middleware broken.

---

## 2. Production Deployment Audit (Runtime Probes)

### 2.1 Endpoint Availability Matrix

| Endpoint | HTTP Method | Expected | Actual | Status |
|----------|-------------|----------|--------|--------|
| `/v1/bookings/preview` | POST | 401 (auth required) | 400 Bad Request | ❌ MISSING/BROKEN |
| `/v1/bookings` | POST | 401 (auth required) | 401 ✓ (no auth) / 400 (invalid token) | ⚠️ PARTIAL |
| `/v1/bookings` | GET | 401 (auth required) | 404 Not Found | ❌ MISSING |
| `/v1/bookings/:id` | GET | 401 (auth required) | 401 ✓ | ✅ DEPLOYED |
| `/v1/bookings/:id` | PATCH | 401 (auth required) | 400 Bad Request | ⚠️ BROKEN AUTH |
| `/v1/bookings/:id/payment` | POST | 401 (auth required) | 400 Bad Request | ⚠️ BROKEN AUTH |
| `/v1/bookings/:id` | PATCH | 401 (auth required) | 400 (invalid token) | ⚠️ BROKEN AUTH |

### 2.2 Critical Missing Endpoints

| Endpoint | D1-D7 Requirement | Impact |
|----------|-------------------|--------|
| `GET /v1/bookings` | D7 History (owner-scoped, cursor pagination) | Website cannot fetch booking history via API |
| `POST /v1/bookings/preview` | D1 Availability + D2 Pricing | Website cannot preview pricing/availability |
| User-scoped Idempotency | D6 (all mutations) | No protection against duplicate user requests |

### 2.3 Auth Middleware Defect

| Test | Expected | Actual | Severity |
|------|----------|--------|----------|
| No auth header | 401 JSON | 401 JSON | ✅ OK |
| Invalid Bearer token | 401 JSON | 400 HTML | **CRITICAL** |
| Valid token (untested) | 200/4xx | Unknown | UNKNOWN |

**Root Cause**: Auth middleware returns HTML "Bad Request" (400) instead of RFC 7807 JSON 401 for invalid tokens. This breaks client error handling and security auditing.

---

## 3. D1-D7 Runtime Verification — NOT EXECUTABLE

| Decision | Requirement | Testable? | Reason |
|----------|-------------|-----------|--------|
| **D1** | Availability `[from,to)` exclusive-end, capacity, sold-out 400 | ❌ NO | Preview endpoint missing; Create requires auth token |
| **D2** | Canonical pricing fallback, server-side nights, 2dp FX | ❌ NO | Preview missing; rates/global not exposed |
| **D3** | Receipt MIME/size/magic + allowlisted hosts | ❌ NO | Payment endpoint auth broken |
| **D4** | State machine transitions + actor permissions | ❌ NO | PATCH auth broken; no test token |
| **D5** | Auth required, ownership isolation | ❌ NO | Auth middleware broken |
| **D6** | User-scoped idempotency (userId+endpoint+key) | ❌ NO | Not deployed |
| **D7** | Owner-scoped history + cursor pagination | ❌ NO | GET /v1/bookings missing |

---

## 4. Website API-First Path — NOT VERIFIABLE

| Website Action | API-First Path | Testable? |
|----------------|----------------|-----------|
| `createBooking` | `POST /v1/bookings` | ⚠️ Auth broken |
| `previewBookingPrice` | `POST /v1/bookings/preview` | ❌ Endpoint missing |
| `getMyBookings` | `GET /v1/bookings` | ❌ Endpoint missing |

---

## 5. Findings Summary

| ID | Severity | Component | Finding |
|----|----------|-----------|---------|
| **PRD-001** | **CRITICAL** | Deployment | `GET /v1/bookings` (history) NOT DEPLOYED |
| **PRD-002** | **CRITICAL** | Deployment | `POST /v1/bookings/preview` NOT DEPLOYED |
| **PRD-003** | **CRITICAL** | Deployment | User-scoped idempotency NOT DEPLOYED |
| **PRD-004** | **CRITICAL** | Auth | Invalid Bearer token → 400 HTML instead of 401 JSON |
| **PRD-005** | **HIGH** | Auth | PATCH/Payment endpoints return 400 with invalid token (should be 401) |
| **PRD-006** | **HIGH** | Deployment | Phase 4 local implementation (+694 lines) NOT DEPLOYED |
| **PRD-007** | **MEDIUM** | Staging | No Staging environment available (msari-eb18a not on Blaze) |

---

## 6. Evidence Package

### 6.1 Probe Logs (Production)

```bash
# GET /v1/bookings - MISSING
curl GET /v1/bookings
→ 404 "Cannot GET /v1/bookings"

# POST /v1/bookings/preview - MISSING/BROKEN
curl POST /v1/bookings/preview -d {...}
→ 400 "Bad Request" (HTML)

# POST /v1/bookings - AUTH BROKEN
curl POST /v1/bookings -H "Authorization: Bearer invalid" -d {...}
→ 400 "Bad Request" (HTML, should be 401 JSON)

# GET /v1/bookings/:id - DEPLOYED
curl GET /v1/bookings/test-id
→ 401 {"type":".../unauthenticated","status":401,...} ✓

# PATCH /v1/bookings/:id - AUTH BROKEN
curl PATCH /v1/bookings/test-id -H "Authorization: Bearer invalid" -d {...}
→ 400 "Bad Request" (HTML, should be 401)

# POST /v1/bookings/:id/payment - AUTH BROKEN
curl POST /v1/bookings/test-id/payment -H "Authorization: Bearer invalid" -d {...}
→ 400 "Bad Request" (HTML, should be 401)
```

### 6.2 Deployed Function Version
```bash
firebase functions:list --project msariapp-v2
→ api v1 (nodejs22, us-central1, 256MB)
```
Local working tree has +694 lines over deployed version (Phase 4 implementation).

---

## 7. Supervisor Gate Decision

### Required: FAIL

**Rationale**:
1. **Critical endpoints missing** — Phase 4 incomplete in production
2. **Auth middleware broken** — Security regression (invalid token → 400)
3. **No Staging environment** — Cannot verify fixes before Production
4. **Zero D1-D7 runtime evidence** — Zero tests executable

### Required Actions Before Re-assessment

| Action | Owner | Acceptance |
|--------|-------|------------|
| Deploy Phase 4 implementation to Production | Booking-API-Engineer | All 6 endpoints return 401 with valid RFC 7807 JSON |
| Fix auth middleware invalid-token handling | Booking-API-Engineer | Invalid token → 401 JSON (RFC 7807) |
| Provision Staging (Blaze plan or alt project) | Runtime-Deployment-Evidence-Engineer | Staging deploy successful |
| Execute full D1-D7 runtime matrix | Runtime-Deployment-Evidence-Engineer | All 17 test cases PASS with evidence |

---

## 8. Final Status

```
PHASE 4 = FAIL

Reason: Production deployment incomplete (missing 2 critical endpoints, user idempotency),
        auth middleware security regression,
        zero D1-D7 runtime evidence collectible.

No Phase 4 Production Cutover authorized.
```

---

## 9. Required Next Steps

1. **Booking-API-Engineer**: Deploy local `functions/index.js` (with Phase 4) to Production
2. **Booking-API-Engineer**: Fix `clientAuthMiddleware` to return 401 JSON for invalid tokens
3. **Runtime-Deployment-Evidence-Engineer**: Provision Staging (upgrade msari-eb18a or create new)
4. **Supervisor**: Re-verify after deployment + auth fix
5. **Runtime-Deployment-Evidence-Engineer**: Execute full 17-test D1-D7 matrix with valid Firebase ID tokens

---

*Report generated by Phase 4 Runtime Verification — Evidence-based assessment*