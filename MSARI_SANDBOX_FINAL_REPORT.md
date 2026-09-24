# MSARI Sandbox — FINAL Verified Report (Supersedes Feasibility Report)

## 1–4. Project / Deployment / Env / Dashboard Binding
- Project `msari-sandbox` (293462657354), billing owner-linked; Firestore nam5; rules+indexes deployed.
- Functions `api` + `reserveBookingNumber` + 2 triggers deployed from the pinned tree; `API_ENVIRONMENT=sandbox` confirmed on live `api`.
- Dashboard Control Plane routes by target (production default intact) with in-memory sandbox admin session; analyzer clean; deployed to `msariapp-v2.web.app`.

## 5–7. Key / Scopes / Snapshot
- Sandbox key `lovable-site` (prefix `msari_test_11477880`, sandbox, 7 scopes) issued via the sandbox admin plane; secret handed to owner separately (never in reports/logs).
- Snapshot @ 2026-09-21T19:54:46Z: 57/260/9/1, verified. No operational data copied.
- Old `Msari 2` record (prod project, sandbox env, unauthenticatable): RECOMMEND revoke via prod dashboard AFTER handoff — no auto-action taken.

## 8. Runtime Matrix (final)
| # | Result |
|---|---|
| A sandbox→sandbox catalog | 200/200 (9 rooms) ✅ |
| B sandbox→production | rejected 401 (unknown record; 403 class reserved for existing-record mismatch) ✅ |
| C production unaffected | register 201, preview 200 ✅ |
| D production→sandbox | NOT PROVEN (no prod key exists; must not be minted) — design-verified |
| E sandbox booking E2E | 201, sandbox-only doc, api_partner channel, USD 70=70 ✅ |
| F zero prod writes | 0 hits ✅ |
| G payment evidence | BLOCKED — default bucket absent (Firebase console → Storage → Get started); no prod storage touched |
| H production path | 200s ✅ |
| H4 auth lifecycle (register/login/me/duplicate/refresh) | 201/200/200/400/200 ✅ (after per-env IdentityToolkit fix) |

## 9–11. Isolation / Storage / Lovable
- Firestore isolation proven both directions. Storage isolation pending bucket provisioning (same console click as G).
- Lovable: contract (+auth note) delivered; sandbox key + admin creds handed to owner separately; Lovable-side execution is owner-relayed.

## 12–13. Production Regression / Unresolved
- Backend preview/history 200s; zero prod deploys/writes this mission. Vercel 402 outage is external/pre-existing.
- Unresolved: G (console click), D (structural), §8 dashboard clicks (operator UI), Msari-2 revoke (operator click).

## Supervisor Review (independent, procedural)
- Re-verified: project/config/env/dashboard states, matrix outputs, isolation queries, cleanup confirmations, zero-secret compliance, no-write compliance for prod.
- Challenges: (1) «Does the shared-code pepper/webkey fallback alter prod?» — No: doc-absent path byte-identical; prod never redeployed. (2) «Is B-401 (not 403) acceptable?» — Yes with documented semantics. (3) «Orphaned users from failed registers?» — Observed (non-atomic register wart, pre-existing backend behavior); test identities cleaned; noted for backend owner, no action taken (frozen baseline).
- Corrections: none outstanding.

## Acceptance → Status
Sandbox live ✅ · env proven ✅ · key+scopes ✅ · dashboard ✅ (clicks ⏳) · separation ✅ · snapshot ✅ · isolation (F ✅, G ⏝) · B ✅ · D ⚠️ · prod unchanged ✅ · lifecycle ⏳ · Lovable ready ✅ · clean ✅.

## FINAL STATUS
**`CONDITIONAL PASS`** → `PASS` on: Storage console init + G retest, §8 clicks, Lovable first 200. Nothing further provable from the executor side.

`STOP`
