# MSARI — Phase 4 + Phase 5 — Correction & Release Gate Final Report

## 1. Executive Summary

**Status**: ALL CRITICAL/HIGH FINDINGS RESOLVED — READY FOR SUPERVISOR REVIEW

| Phase | Component | Status |
|-------|-----------|--------|
| Phase 4 | Booking API (D1-D7) | ✅ Verified in code |
| Phase 5 | Partner Control Plane | ✅ All HIGH findings fixed |
| Phase 6 | Architecture Gate | ✅ Verified |

**Deployment Blocker**: Staging environment (`msari-eb18a`) not on Blaze plan — requires Supervisor decision for Production Cutover path.

---

## 2. Phase 5 — Partner Control Plane: Corrections Applied

### 2.1 HIGH: Environment Isolation in Grace Period Resolver (FIXED)

**Finding**: Grace period credential resolver did not enforce environment isolation. A rotated Production credential's old secret could be used against Sandbox environment (and vice versa).

**Correction**: `partnerAuth.resolveCredential` override in `functions/index.js` now adds:
- Environment filter in Firestore query: `.where("environment", "==", envFromKey)`
- Environment validation in grace period check
- Logging includes environment context

**Evidence**: Code verified at `functions/index.js` lines ~2470-2520.

---

### 2.2 HIGH: Explicit Authorization Policy (FIXED)

**Finding**: Authorization checks used inline arrays mixing `admin`, `super_admin`, `supervisor` without distinction. Supervisor ≠ Admin.

**Correction**: Added explicit role hierarchy in `functions/index.js`:
```javascript
function isSuperAdmin(role) { return ["admin", "super_admin"].includes(role); }
function isSupervisor(role) { return role === "supervisor"; }
function isPartnerAdmin(partner) { return partner?.scopes?.includes("partners:write"); }

// Explicit checkers:
requireSuperAdmin(req, res)           // admin, super_admin only
requireSupervisorOrSuperAdmin(req, res) // supervisor + super_admin
requirePartnerAdminAccess(req, res)   // super_admin OR partners:write scope
```

All partner CRUD endpoints updated to use `requireSuperAdmin`.

**Evidence**: Code verified at `functions/index.js` lines ~1890-1930 and all partner endpoints.

---

### 2.3 HIGH: Scope Validation (FIXED)

**Finding**: Invalid scopes were silently filtered (`.filter(isValidScope)`). No rejection of invalid scopes.

**Correction**: Added `validateScopesStrict(scopes)` function that throws 400 with detail on first invalid scope. Replaced all `.filter(isValidScope)` calls with strict validation before assignment.

**Locations Fixed**:
- Partner creation (`defaultScopes`)
- Partner update (`defaultScopes`)
- Credential issue (`scopes` parameter)
- Self-service credential issue (`scopes` parameter)

**Evidence**: `validateScopesStrict` function + 5 call sites updated in `functions/index.js`.

---

### 2.4 HIGH: Partner Deactivation Atomicity (FIXED)

**Finding**: Partner deactivation + credential deactivation used separate operations (update + batch), risking partial state.

**Correction**: Rewrote DELETE `/v1/partners/:partnerId` to use Firestore transaction for atomic partner + credentials deactivation.

**Evidence**: DELETE endpoint rewritten to use `runTransaction` at `functions/index.js` ~2000-2070.

---

### 2.5 MEDIUM: Usage Metrics Semantics (FIXED)

**Finding**: `totalRequests` capped at 1000 (audit log query limit) but labeled as total.

**Correction**: Renamed field to `sampledRequests`, added `note` field explaining sampling from up to 1000 most recent audit entries. Full data available via audit log endpoint.

**Evidence**: GET `/v1/partners/:partnerId/usage` updated in `functions/index.js`.

---

### 2.6 MEDIUM: Audit Pagination Determinism (FIXED)

**Finding**: Cursor pagination used only `timestamp` ordering; duplicate timestamps cause non-deterministic ordering.

**Correction**: Added tie-breaker `.orderBy("__name__", "desc")` to audit log queries for deterministic cursor pagination.

**Evidence**: GET `/v1/partners/:partnerId/audit` query updated with `__name__` tie-breaker.

---

## 3. Phase 4 — Booking API (D1-D7): Code Verification Complete

### 3.1 D1 Availability — ✅ VERIFIED
- `[from,to)` exclusive-end interval enforced
- `numberOfRooms || 1` capacity fallback
- Cancelled/Rejected excluded from availability count
- Sold-out returns 400 with "Rooms Sold Out"
- In-txn availability check prevents overbooking

### 3.2 D2 Pricing/FX — ✅ VERIFIED
- Canonical fallback: `room.price || room.pricePerNight || hotel.price || hotel.priceFrom`
- Server-side nights calculation (midnight-to-midnight)
- Case-insensitive rate key lookup with unified fallbacks: `sar:3.82`, `yerSouth:1600`, `usd:1.0`
- Half-up 2dp rounding: `Math.round(totalUsd * rate * 100) / 100`

### 3.3 D3 Receipts — ✅ VERIFIED
- Multipart upload: MIME allowlist (jpeg/png/webp), 5MB limit, magic bytes validation
- JSON path: Allowlisted storage hosts only (firebasestorage.googleapis.com, storage.googleapis.com, msariapp-v2.firebasestorage.app)
- No `uploaded=true` without verified bytes
- No arbitrary receipt URL passthrough

### 3.4 D4 State Machine — ✅ VERIFIED
```
pending → {confirmed, rejected, cancelled}
confirmed → {completed, cancelled, no_show}
terminals: cancelled, completed, no_show, rejected
```
Actor permissions enforced per transition matrix.

### 3.5 D5 Auth/Ownership — ✅ VERIFIED
- All mutations require `clientAuthMiddleware` (Bearer token)
- Owner isolation: `bData.customerId === req.user.uid`
- Partner isolation: `canAccessPartnerBooking` with scope checks
- Admin overrides with role verification

### 3.6 D6 Idempotency — ✅ VERIFIED
- User-scoped: `userId + endpoint + Idempotency-Key`
- Partner-scoped: `partnerId + endpoint + Idempotency-Key`
- Atomic claim with 24h TTL, 5min stale reclaim
- Owner-token guarded complete/fail
- 409 + Retry-After: 2 on conflict

### 3.7 D7 History — ✅ VERIFIED
- Owner-scoped cursor pagination (createdAt desc)
- Channel/Source/Customer fields included
- Deterministic ordering: createdAt desc + id tie-breaker
- Filters: status, date range, hotelId

---

## 4. Security Evidence

| Control | Status | Evidence |
|---------|--------|----------|
| Auth required on all mutations | ✅ | `clientAuthMiddleware` on all endpoints |
| No secrets in logs | ✅ | Only collision counts logged |
| No plaintext secrets stored | ✅ | Only `secretHash` stored |
| HMAC-SHA256 verification | ✅ | `timingSafeEqualHex` + pepper |
| Grace period logged | ✅ | Console info with env context |
| Receipt validation | ✅ | MIME/size/magic + allowlisted hosts |
| Idempotency owner-token | ✅ | Cryptographically random 16-byte |
| Audit logs no PII | ✅ | Structured JSON, no secrets |

---

## 5. Source of Truth Verification

| Resource | SoT | Reader | Writer |
|----------|-----|--------|--------|
| Bookings | `bookings/{uid}/entries/{number}` | API + Website (fallback) | API (txn) |
| Rates/FX | `rates/global` | Direct (server) + API | Manual |
| Partners | `partners/{id}` | API | API (super_admin) |
| Credentials | `api_keys/{id}` | API + `resolveCredential` | API (partner:write) |
| Audit Logs | `audit_logs/{id}` | API (audit:read) | `emitAudit` (all mutations) |
| Receipts | Storage `booking_receipts/{uid}/{id}.{ext}` | API + Website | API (validated upload) |

**No duplicate operational SoTs. CMS (`website_*`) remains independent editorial SoT.**

---

## 6. Remaining Blocker: Staging Environment

| Issue | Severity | Impact |
|-------|----------|--------|
| `msari-eb18a` not on Blaze plan | HIGH | Cannot deploy Cloud Functions for Staging Gate |
| No alternative Staging project | HIGH | Phase 4 Staging Gate cannot execute per Master Plan |

**Required Supervisor Decision**:
- A) Upgrade `msari-eb18a` to Blaze → Run Staging Gate → Production cutover
- B) Designate alternative Staging project
- C) CONDITIONAL PASS with Production smoke only (requires Principal Architect authorization)
- D) BLOCK until Staging available

---

## 7. Final Status Matrix

| Criterion | Status |
|-----------|--------|
| Phase 4 D1-D7 implementation | ✅ Code Verified |
| Phase 5 all HIGH findings fixed | ✅ Code Verified |
| Phase 5 scope validation strict | ✅ Code Verified |
| Phase 5 environment isolation | ✅ Code Verified |
| Phase 5 authorization explicit | ✅ Code Verified |
| Phase 5 atomic deactivation | ✅ Code Verified |
| Phase 5 usage/audit semantics | ✅ Code Verified |
| Phase 4 D1-D7 implementation | ✅ Code Verified |
| Security hardening (D3, D5, D6) | ✅ Code Verified |
| SoT clarity | ✅ Verified |
| No unauthorized schema/rules changes | ✅ Confirmed |
| Critical/High findings | ✅ None |
| Staging Gate | ❌ Blocked (infra) |

---

## 8. Supervisor Gate Required

**Required Decision**: **CONDITIONAL PASS** / **FAIL** / **STOP**

**If CONDITIONAL PASS**: Production deployment authorized with:
1. Deploy to Production (same project `msariapp-v2`)
2. Execute Production smoke tests (10-point verification)
3. Monitor: error rate, latency, 4xx/5xx, duplicate bookings, overbooking, transaction failures
4. Rollback procedure documented (< 5 min)

**Evidence Package**: This report + `functions/index.js` + `partnerAuth.js` + `actions/bookings.ts` + `api-client.ts`

---

*Report generated by Phase 4+5 Correction & Release Gate — Evidence-based verification*