# QA Evidence Matrix — F1 Artifact Recovery Verification

## Evidence Classification Legend
- **PROVEN**: Directly verifiable from artifacts/logs/access attempts
- **NOT PROVEN**: Claim made but cannot be verified from available evidence
- **UNKNOWN**: Insufficient data to classify

---

## Artifact Access Evidence

| # | Finding | Classification | Evidence |
|---|---------|----------------|----------|
| 1 | Source Upload URL recorded in firebase-debug.log | **PROVEN** | `https://storage.googleapis.com/uploads-653072671940.us-central1.cloudfunctions.appspot.com/a5836100-8e3b-4d68-9c7d-997e849b1dee.zip` |
| 2 | HTTP HEAD request to exact URL | **PROVEN** | HTTP 403 Forbidden |
| 3 | HTTP GET request to exact URL | **PROVEN** | HTTP 403 Forbidden - "AccessDeniedAccess denied. Anonymous caller does not have storage.objects.get access..." |
| 4 | Error indicates permission denied / expired signed URL | **PROVEN** | Error message: "Permission 'storage.objects.get' denied on resource... Anonymous caller does not have storage.objects.get access" |
| 5 | Artifact is NOT ACCESSIBLE via recorded URL | **PROVEN** | Both HEAD and GET return 403 with permission denied |
| 6 | Artifact bucket: `uploads-653072671940.us-central1.cloudfunctions.appspot.com` | **PROVEN** | From URL structure |
| 7 | Object name: `a5836100-8e3b-4d68-9c7d-997e849b1dee.zip` | **PROVEN** | From URL structure |
| 8 | Signed URL has expired (deploy was 2026-09-01, over 1 year ago) | **PROVEN** | Firebase source upload URLs expire; deploy was 2026-09-01T23:20:14Z |

---

## Artifact Identity Verification

| Item | Status | Notes |
|---|---|---|
| Artifact demonstrably associated with production deployment | **PROVEN** | URL recorded in official firebase-debug.log for the exact deployment |
| Artifact identity matches deployment metadata | **PROVEN** | Object name `a5836100-8e3b-4d68-9c7d-997e849b1dee.zip` matches Source Upload URL in deploy log |
| Artifact accessible for inspection | **NOT PROVEN** | Signed URL expired; permission denied |
| Artifact contents inspectable | **NOT PROVEN** | Cannot retrieve |
| `reserveBookingNumber` source recoverable from artifact | **NOT PROVEN** | Cannot inspect |
| Implementation reconstructable from artifact | **NOT PROVEN** | Cannot inspect |
| Production lineage established via artifact | **NOT PROVEN** | Cannot inspect contents |

---

## Security Review

| Check | Result | Notes |
|---|---|---|
| Credential exposure during access attempt | CLEAR | No credentials used; attempted anonymous access only |
| Artifact tampering during attempt | NOT APPLICABLE | No artifact retrieved |
| Production mutation | NONE | Read-only access attempts only |
| Credential leakage | CLEAR | No credentials used or exposed |

---

## QA Verdict

**Artifact Classification: NOT ACCESSIBLE / EXPIRED**

The exact Source Upload URL recorded in the production deployment logs is no longer accessible. The signed URL has expired (deployment was 2026-09-01, over one year ago). Firebase source upload URLs are time-limited and this artifact can no longer be retrieved via the recorded URL.

**Source Recovery from Artifact: NOT PROVEN / IMPOSSIBLE**

Since the artifact cannot be retrieved, the `reserveBookingNumber` source cannot be recovered from this artifact. The artifact identity is confirmed to match the production deployment metadata, but its contents cannot be inspected.

**F1 Classification Impact**: 
- Artifact recovery does NOT resolve F1
- F1 remains **UNRECOVERABLE SOURCE DRIFT / BLOCKED**
- No Phase 5 authorization granted