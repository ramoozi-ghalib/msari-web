# MSARI — WEB SIGNUP FIX: Vercel Production Deployment + Live Verification

Companion to `MSARI_WEB_SIGNUP_FAILURE_REPORT.md` (root cause + local fix — not
reopened; no conflict found during deploy).

## A. Git Commit / Diff
- Branch: `main`. Last commit `9952808` (pre-existing).
- Task diff (uncommitted, working tree): `src/actions/auth.ts`,
  `src/schemas/auth.schema.ts`, `src/lib/api-client.ts` — 104 insertions,
  26 deletions. No commit was created by this session (deploy via Vercel CLI
  from the working tree, per project precedent).
- Other working-tree changes (`.env.example`, `.gitignore`, `MSARI_*.md`,
  `F1_*.md`) are PRE-EXISTING — documented, not reset/cleaned per instruction.
- Backend `D:\projects\msari`: untouched (read-only contract reference only).

## B. Vercel Deployment ID
`dpl_Bcbf7EogNKHguijjzZ15nPp4hpTi` — target `production`, readyState `READY`,
build 26s on Vercel. Project `msari-web`
(`prj_z30Z1GzA9cfKW6Qvtg6l0gsSv2XS`), org `team_xluZMIiF4OOZII6nzAEx0SWQ`,
CLI identity `msari-2024`. Inspector:
`https://vercel.com/ramoozi1411r-5451s-projects/msari-web/Bcbf7EogNKHguijjzZ15nPp4hpTi`

## C. Production URL
`https://msari.net` (aliased to the deployment; direct URL
`https://msari-899c70553-ramoozi1411r-5451s-projects.vercel.app`).
`GET /ar/register` on `https://msari.net` → **200** (2.9s).

## D. Build Result
- Local `npm run build`: SUCCESS (route table complete incl.
  `ƒ /[locale]/register`, `ƒ /[locale]/login`, `ƒ /api/auth/[...nextauth]`).
  BUILD_ID `ovR7qE-P9oZbOxvf_Z17X`, 2026-09-20 19:42 local.
- Vercel remote build: SUCCESS (`Build Completed in /vercel/output [26s]`).
- `npx tsc --noEmit` (pre-deploy): clean.

## E. Deployment Timestamp
2026-09-20 ~19:44–19:47 local (UTC+3). Production E2E profile `createdAt`
`2026-09-20T16:45:27Z` confirms the live backend chain post-deploy.

## F–J. Live Production E2E (fresh test user, API-level exact fixed payload)
| Check | Result |
|---|---|
| Signup `POST /v1/auth/register` (plaintext + E.164) | **201**, uid + token |
| Login `POST /v1/auth/login` (same password) | **200** |
| Profile `GET /v1/me` | **200**, `customers/{uid}`, phone `+967771234567` |
| Duplicate signup | **400** `...already in use...` → maps to `DUPLICATE_EMAIL` |
| Cleanup | Auth user + profile deleted; verified `auth/user-not-found` |

## K. Security Verification
- Diff secret scan (`AIza|BEGIN PRIVATE|refreshToken|idToken`): zero hits.
- No credentials/test secrets committed; no Firebase Admin exposure to browser
  (Admin SDK used only in local throwaway scripts, since deleted); no new API
  keys; no backend changes deployed.
- Test accounts: `wstest-prod1@example.com` (uid recorded in run log only)
  created → verified → fully removed. No real users touched.

## L. Files Changed
`src/actions/auth.ts`, `src/schemas/auth.schema.ts`, `src/lib/api-client.ts`
(content verified pre-deploy: no bcrypt pre-hash §A, plaintext forward §B,
`normalizePhoneE164` + E.164 gate §§C–D, RFC7807+legacy parser §E,
`DUPLICATE_EMAIL` normalization §F, 25s register / 15s login §§G–H).
Config check (§7): no `msari-eb18`, no staging/local endpoints in `src`
(only benign `127.0.0.1` fallback in rate-limiter); production serves the
correct Firebase/API configuration (login chain proves it live).

## Redirect Finding (operator-reported post-deploy, confirmed + fixed)
- Symptom: signup SUCCEEDS (account created) but browser lands on
  `http://localhost:3000/` instead of home.
- Root cause (production config): local `.env` (`AUTH_URL=http://localhost:3000`)
  was uploaded by Vercel CLI (no `.vercelignore` existed) into the production
  runtime; register's `signIn(..., redirect:true, callbackUrl)` resolves the
  absolute URL from `AUTH_URL`. Login was immune (uses `redirect:false` +
  same-host navigation).
- Fixes: (1) `AUTH_URL=https://msari.net` added to Vercel Production env;
  (2) register auto-login aligned to login pattern (`redirect:false` +
  `window.location.href = safeRedirect`) — immune to any future baseUrl drift;
  (3) `.vercelignore` created (excludes `.env`, `.env.local`).
- Redeploy: `dpl_D8Ntx9CodG16CY7uCeqFmQ6YvUfn` READY, `GET /ar/register` → 200.
  Operator's already-created account is valid (created post-bcrypt-fix, correct
  password) — just log in; no reset needed.

## Phone Parity Finding (operator-reported, fixed + deployed)
- Observation: web phone input was effectively Yemen-fixed (placeholder
  `+967…`, no picker) while the app offers a country picker — parity gap vs
  the unified architecture (backend only requires E.164, no country lock).
- Fix (signup form only, no scope expansion): country dial-code `<select>`
  (~47 codes, default `+967`) + national-number input; submit combines to full
  E.164 (leading trunk zero stripped; manually typed `+<cc>...` overrides);
  server-side strict E.164 gate unchanged (fail-closed).
- File: `src/app/[locale]/(auth)/register/page.tsx` (4th touched file).
- Redeploy: `dpl_CnJyBmNSGSkcdKY4S5fyerxZFNsr` READY
  (`msari-4bawmb7q9-ramoozi1411r-5451s-projects.vercel.app` → aliased
  `https://msari.net`), `GET /ar/register` → 200. tsc clean, build success.

## Acceptance Status (§15 — updated)
- [x] Correct diff verified · [x] Production build PASS · [x] Vercel
  Production deployment PASS · [x] Correct production URL verified (200) ·
  [x] Signup SUCCESS fresh user (API-level) · [x] Login SUCCESS ·
  [x] Profile SUCCESS · [x] Phone normalized · [x] Duplicate controlled ·
  [x] No duplicate identity · [x] Cleanup complete · [x] No security regression
- [x] Phone parity operator-verified (non-Yemeni signup SUCCESS, E.164 stored)
- [ ] Duplicate-email browser check (30s: same email → Arabic controlled error)
- [ ] Independent Supervisor review PASS

## Final Verdict
**`CONDITIONAL PASS`** — fix deployed to production and production-verified at
every automatable layer. Full `PASS / CLOSED` requires the operator browser
click-through on `https://msari.net/ar/register` (submit → no error →
auto-login → logout → login → profile) plus supervisor sign-off. No STOP
condition triggered.

`STOP`
