# MSARI — Phase 5 — Partner Control Plane Final Report

## 1. Executive Summary

**Status**: IMPLEMENTATION COMPLETE — READY FOR DEPLOYMENT

Phase 5 implements the complete Partner Control Plane as specified in the Master Plan:
- Partner CRUD (super_admin only)
- Credential Management (issue, rotate, revoke, list)
- Scope Registry (15 canonical scopes)
- Usage Metrics (audit-based)
- Audit Log (partner-scoped)
- Dashboard Endpoints (partner self-service)
- Expiry Automation (scheduled function)
- Credential Rotation with 24h Grace Period

All endpoints are implemented in `functions/index.js` and verified present.

---

## 2. Endpoint Inventory

| Endpoint | Method | Scope Required | Actor | Description |
|----------|--------|----------------|-------|-------------|
| `/v1/partners` | GET | `partners:read` | super_admin | List all partners |
| `/v1/partners/:partnerId` | GET | `partners:read` | super_admin / own partner | Get partner details |
| `/v1/partners` | POST | (super_admin) | super_admin | Create partner |
| `/v1/partners/:partnerId` | PATCH | (super_admin) | super_admin | Update partner |
| `/v1/partners/:partnerId` | DELETE | (super_admin) | super_admin | Deactivate partner + credentials |
| `/v1/partners/:partnerId/credentials` | GET | `credentials:read` | super_admin / own partner | List credentials |
| `/v1/partners/:partnerId/credentials` | POST | `credentials:write` | super_admin / own partner | Issue credential (show-once) |
| `/v1/partners/:partnerId/credentials/:id/rotate` | POST | `credentials:rotate` | super_admin / own partner | Rotate secret with 24h grace |
| `/v1/partners/:partnerId/credentials/:id/revoke` | POST | `credentials:revoke` | super_admin / own partner | Immediate revocation |
| `/v1/scopes` | GET | `partners:read` | any authenticated partner | List all 15 scopes |
| `/v1/partners/:partnerId/usage` | GET | `usage:read` | super_admin / own partner | 30-day usage metrics |
| `/v1/partners/:partnerId/audit` | GET | `audit:read` | super_admin / own partner | Cursor-paginated audit trail |
| `/v1/partners/me` | GET | `partners:read` | credential owner | Current partner profile |
| `/v1/partners/me/credentials` | GET | `credentials:read` | credential owner | Self-service credential list |
| `/v1/partners/me/credentials` | POST | `credentials:write` | credential owner | Self-service credential issue |

---

## 3. Key Features Implemented

### 3.1 Credential Lifecycle
| Operation | Implementation |
|-----------|----------------|
| **Issue** | HMAC-SHA256 with server-side pepper; show-once pattern; expiresAt optional |
| **Rotate** | New secret generated; old secret valid for 24h grace period; `previousKeyPrefix`/`previousSecretHash` stored |
| **Revoke** | Immediate status change to `revoked`; audit logged |
| **Expire** | Daily scheduled function (03:00 UTC) marks expired credentials; batch update |

### 3.2 Grace Period Rotation
- Old secret remains valid for 24h after rotation (configurable via `rotationGracePeriodHours`)
- `resolveCredential` extended to check `previousKeyPrefix`/`previousSecretHash` during grace period
- Grace period usage logged for audit

### 3.3 Partner Isolation
- All partner-scoped endpoints enforce ownership via `req.partner.partnerId`
- Super_admin bypasses ownership checks
- Legacy credentials (scopes = null) retain transitional access

### 3.4 Scope Registry (15 Canonical Scopes)
```
hotels:read          destinations:read    rooms:read
bookings:create      bookings:read        bookings:cancel
payments:submit-evidence
partners:read        partners:write
credentials:read     credentials:write    credentials:rotate
credentials:revoke   usage:read           audit:read
```

### 3.5 Expiry Automation
- Daily Cloud Function at 03:00 UTC
- Queries active credentials with `expiresAt <= now`
- Batch updates to `expired` status
- Audit log emitted per expired credential

### 3.6 Audit & Usage
- Audit logs stored in `audit_logs` collection with `partnerId` for scoping
- Usage metrics computed from audit logs (30-day default window)
- Cursor-based pagination for audit trail

---

## 4. Security Evidence

| Control | Implementation |
|---------|----------------|
| **Credential Verification** | HMAC-SHA256 with server-only pepper; constant-time compare |
| **Secret Storage** | Only `secretHash` stored; plaintext secret returned once on issue |
| **Rotation Grace** | 24h configurable grace period; old secret verified against `previousSecretHash` |
| **Revocation** | Immediate; no grace period for revoked credentials |
| **Expiry Automation** | Daily batch job; no manual intervention needed |
| **Partner Isolation** | All endpoints enforce `partnerId` ownership; super_admin exception |
| **Scope Enforcement** | Central `requireScope` middleware; legacy credentials (null scopes) transitional |
| **Audit Logging** | Structured JSON; no secrets/PII; `partnerId` for scoping |
| **Environment Binding** | Credentials bound to `sandbox`/`production`; enforced at verification |

---

## 5. Deployment Readiness

| Check | Status |
|-------|--------|
| All 15 endpoints implemented | ✅ Verified in `functions/index.js` |
| Credential rotation with grace | ✅ Implemented in `resolveCredential` override |
| Expiry automation | ✅ Scheduled function `expireCredentialsDaily` |
| Partner CRUD + credential mgmt | ✅ 15 endpoints implemented |
| Scope registry | ✅ 15 canonical scopes defined |
| Usage metrics | ✅ Audit-based computation |
| Audit log pagination | ✅ Cursor-based |
| Dashboard self-service | ✅ `/me` endpoints for partner portal |
| Security hardening | ✅ HMAC, grace period, expiry, revocation |

---

## 6. Accepted Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Scheduled function not triggered | Credentials don't expire on time | Monitor Cloud Scheduler; manual fallback available |
| Grace period abuse | Old secret used after rotation | Logged for audit; 24h limit |
| Audit log growth | Storage costs | TTL/indexing strategy needed for production |
| Scheduled function timezone | Wrong expiry time | Uses UTC (03:00) |

---

## 7. Supervisor Gate

**Required Verification**: Phase 5 implementation complete per specification.

**Next Phase**: Phase 6 — Final Architecture Gate

---

*Report generated by Phase 5 Partner Control Plane Implementation — Code-verified completion*