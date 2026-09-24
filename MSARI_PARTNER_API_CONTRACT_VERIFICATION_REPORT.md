# MSARI Partner API Contract — Independent Verification Report

## Mission
Extract + independently verify the REAL partner API contract for Lovable sandbox integration. Read-only; no code/data/prod changes; no new keys; no production credentials used.

## Team
- Owner: Partner API Contract Lead (extraction, evidence, docs)
- Specialists: API/Backend, Website Integration, Security, QA (tracks executed inline)
- Supervisor: independent reviewer role below (procedural independence disclosed)

## Source of Truth
| Area | SoT | Reference |
|---|---|---|
| Contract | Backend implementation | `D:\projects\msari\functions\index.js` (2076 lines), `partnerAuth.js` |
| Credential model | `partnerAuth.js` (HMAC, scopes, env binding) + live `api_keys` record metadata (no secrets read) | |
| Catalog/booking semantics | Route handlers + D1/D2/D4/D6 code | |
| Website consumption | `msari_web/src/lib/api-client.ts` (auth, cities, rooms, hotels, preview/create/history/detail/cancel/receipt) | |
| Serving reality | `.firebaserc` (single project `msariapp-v2`), no functions env config, live probes | |

## Evidence
- Route inventory: 27 `app.*` registrations enumerated verbatim (6 catalog, 6 booking, 6 admin-partners, 3 auth, 2 me, misc).
- Auth model read: `CREDENTIAL_RE`, HMAC-SHA256 + timing-safe compare, scope gate, env binding (`recordEnv === API_ENVIRONMENT`, default `production`).
- Live `api_keys` metadata: exactly 1 record — sandbox, active, full 7 scopes (no secret material accessed).
- No `API_ENVIRONMENT` set anywhere (code/config/env) → production serving proven by default.

## Endpoint Matrix
Per contract doc §4 (methods/paths/auth/scopes/query/body/responses/errors verified against handler code line-by-line; admin `/v1/partners*` correctly EXCLUDED from handoff).

## Authentication Matrix
| Case | Expected | Actual (live) | Result |
|---|---|---|---|
| No credential, catalog | 401 | 401 | ✅ |
| No Bearer, preview | 401 unauthenticated (RFC7807 shape captured) | 401 | ✅ |
| Malformed `x-api-key` | 401 | 401 | ✅ |
| Unknown `msari_test_*` key | 401 (format parsed, lookup miss) | 401 | ✅ |
| Valid sandbox credential | 200 (scope-dependent) | NOT PROVEN — secret unavailable; creation forbidden | ⚠️ |
| Scope gating / env binding | code paths read, 7 scopes mapped | code-proven | ✅ (code) |

## Schema Matrix
Hotel/room/preview/booking/status/currency shapes transcribed verbatim from handlers (see contract §§4–5). No mock fields. OpenAPI-style strictness not claimed beyond code.

## Runtime Matrix
Unauthenticated matrix green (above). Authenticated sandbox flows: NOT PROVEN (no key available; none created per scope lock). Shared-logic confidence: identical handlers serve production (prior production E2E 14/14 on same code paths — cited as code-path evidence, NOT sandbox proof).

## Security Review
- Isolation: sandbox credentials are REJECTED on production serving (403 by design) — verified by code + config; this is the escalation below, not a bypass.
- Zero production credentials used (probes: none or syntactically-fake keys only).
- Zero secrets in repos touched, in docs delivered, in logs/terminals (fake values only).
- Git status clean-by-inaction: no writes to either repo this mission (pre-existing dirt untouched).
- Handoff hygiene: key handling rules (§9 of contract), admin endpoints excluded, no Firebase/Vercel secrets included.

## Lovable Handoff
`MSARI_SANDBOX_PARTNER_API_CONTRACT.md` delivered (11 sections). Contains zero secrets. Lovable uses its existing sandbox key as server-side env var only.

## Unproven Items
1. Authenticated sandbox calls (needs keyholder execution).
2. Sandbox serving endpoint usability (see escalation — the blocker).
3. Visual/UX integration on Lovable side (out of scope).

## ESCALATION (blocking)
**Sandbox credentials cannot execute against the production base URL** (403 environment-mismatch by design; single project; no sandbox serving configured). Lovable integration with its sandbox key is therefore BLOCKED until owner decides: (A) stand up `API_ENVIRONMENT=sandbox` serving (emulator/staged deployment), (B) issue a production-scoped key when ready, or (C) direct otherwise. Do NOT work around (no fake success, no prod-key misuse).

## Supervisor Review
- Re-verified: route inventory against source, auth regex/scopes/env lines, record metadata claim, live 401s (re-executed), zero-secret compliance of both docs, no-write compliance (git status).
- Challenges: (1) «Is the base URL really shared?» — Yes: one project, one `api` function, no env overrides found. (2) «Could legacy scopeless records bypass?» — None exist (1 record, scoped). (3) «Are admin endpoints accidentally usable?» — `adminOnly` Bearer gate confirmed; excluded. (4) «Did extraction invent anything?» — Every endpoint/field traced to handler lines; absent endpoints (offers) marked NOT AVAILABLE by omission.
- Structural disclosure: same-agent execution; independence via re-execution + challenges; owner countersignature completes human sign-off.

## Final Status
**`CONDITIONAL PASS`** — contract extracted with evidence, isolation proven, security clean; full `PASS` (sandbox-executable) awaits the escalation decision + keyholder runtime proof. No FAIL/STOP beyond the recorded escalation.

`STOP`
