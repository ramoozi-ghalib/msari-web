# MSARI Sandbox Serving — Feasibility & Design Report
**Mission constraint reminder:** real sandbox for Lovable's `msari_test_*` key, isolated credentials/data/bookings, no production-behavior change, no new prod keys, no secrets exposed. **Zero writes made in this mission** (tree contains only prior approved hunks — verified above).

## 1. Proven Facts (not assumptions)
- ONE Firebase project (`msariapp-v2`); one serving function (`api`); `API_ENVIRONMENT` unset everywhere → production. SDK v1 `RuntimeOptions` has NO `env` field → per-function env vars are NOT settable in code (only via `gcloud --set-env-vars`/console).
- Sandbox credential (`msari_test_*`, record `sandbox`) is therefore rejected on the only serving deployment (`403 environment-mismatch`, code path read verbatim). No override, bypass, or alternate route exists in code.
- The sandbox secret itself is unrecoverable server-side (HMAC only) and was never handled this mission.

## 2. Options Analysis
| Option | Isolation | Prod-behavior impact | Verdict |
|---|---|---|---|
| A. 2nd function `apiSandbox`, same project, env via gcloud/manual | Credentials: ✅ separate env. **Data: ❌ SHARED Firestore** — Lovable test bookings would enter production `bookings`, shift availability (`activeOverlaps`), fire admin notifications, appear in dashboards | Deploy-only (additive) | **REJECTED as-is** — violates mission isolation rule |
| B. Separate Firebase project (`msari-sandbox`) | ✅ Full (own Firestore/Auth/config) | Zero (untouched prod) | **RECOMMENDED** — needs owner provisioning + catalog seeding decision |
| C. Emulator (`API_ENVIRONMENT=sandbox`) | ✅ (local data) | Zero | Rejected for Lovable (localhost unreachable from hosted site); dev-only utility |
| D. Serve sandbox on production `api` | ❌ binding bypass | Changes security semantics | **FORBIDDEN** (STOP rule) |
| E. Same-project fn + partitioned collections | ✅ if done right | Requires booking-pipeline code changes | STOP-grade (booking architecture) — not pursued |

Partition note: any in-code data routing (DB id, collection prefix, test-flags with availability exclusion) = booking/payment architecture change → STOP per mission. Not designed further here.

## 3. What Is Proven vs Blocked
- PROVEN: env-binding mechanism (code+config), unauthenticated matrix (401s), contract accuracy, zero-write compliance, SDK constraints.
- BLOCKED on owner: (1) architecture choice (recommendation: B); (2) project provisioning + catalog seeding policy (copy vs fixtures — owner data decision); (3) sandbox secret for positive verification (owner provides blind, or runs the 200-test; never transmitted in clear beyond TLS call).

## 4. Recommended Path (B) — Concrete Steps for Owner Approval
1. Owner creates Firebase project `msari-sandbox` (console; billing/blaze as needed).
2. Deploy SAME `functions` codebase pinned to a recorded commit (no divergence) + Firestore rules/indexes copies.
3. Set `API_ENVIRONMENT=sandbox` on its `api` (console/gcloud — one variable).
4. Seed catalog: EITHER point-in-time copy of `hotels`/`rooms`/`destinations`/`rates` (production-data copy — owner authorizes explicitly) OR synthetic fixtures (owner accepts non-identical catalog).
5. Create sandbox credential(s) in the NEW project (never reuse prod material).
6. Verification (blind-secret): sandbox→sandbox 200s, sandbox→production 403, production→production unaffected, no prod writes observed.

## 5. STOP Conditions Respected
No production contract/binding/credential/data/booking changes made or proposed unilaterally. No secrets handled. No writes.

`END — AWAITING OWNER DECISIONS (1) architecture B vs alternative, (2) provisioning+seeding, (3) secret handling for verification.`
