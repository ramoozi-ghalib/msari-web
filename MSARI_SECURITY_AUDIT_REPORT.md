# MSARI — SECURITY AUDIT REPORT (READ-ONLY)

**Mode:** AUDIT MODE — READ ONLY. No values printed below (names + verdicts only).
**Target:** `msari-web` @ `20ccf46` + production https://msari.net. Date 2026-09-26/27.

## 1. SECRETS — CURRENT TREE (PROVEN by pattern scan, values never printed)
- Private-key/API-key/token patterns (`BEGIN PRIVATE KEY`, `AKIA`, `ghp_`,
  `xoxb-`, `sk-live`): exactly ONE hit — `docs/deployment/HOSTINGER_ENVIRONMENT.md`
  FIREBASE_PRIVATE_KEY example cell, which is a **truncated placeholder**
  (contains `...`, 222-char line). NOT a live key. PASS (with hygiene note).
- `AIza` string: ONE file — `MSARI_WEB_SIGNUP_DEPLOY_REPORT.md:49`, which is the
  text of a secret-scan regex that reported **zero hits**. Benign. PASS.
- `CREDENTIAL_PEPPER` occurrences: code reads only (never a value); pepper lives
  in Secret Manager per deploy metadata. PASS.
- `.env*` files: absent from repo (gitignored; `.env.example` values empty).
  No `.pem/.key/credentials.json/service-account*` files ever added in history
  (verified via `git log --diff-filter=A`). PASS.
- Client bundles: no `msari_live` secret strings in current chunks per prior
  release-gate evidence (HISTORICAL); `server-only` import now build-enforces
  key containment (code-PROVEN). Re-verify on next bundle audit.

## 2. SECRETS — HISTORY (PROVEN)
- REAL 64-hex `AUTH_SECRET`+`NEXTAUTH_SECRET` were committed in
  `docs/deployment/HOSTINGER_ENVIRONMENT.md` (pre-`9772812`, ~7 weeks public).
  Status: **ROTATED by owner 2026-09-25** (fresh value deployed, site verified
  working post-rotation). Residual: history immutable → LOW (dead value).
  `pepper=` lines in Step-2 history: placeholders only (no 32+ hex run). PASS.
- `.credential_pepper` (64-byte file) found in functions repo root 2026-09-25:
  NOT read by any code, now gitignored (`.credential*`), never committed. CLOSED.

## 3. DEPENDENCIES (`npm audit`, 2026-09-27 — PROVEN)
- **10 vulnerabilities: 1 low + 9 moderate, 0 high, 0 critical.**
  Notable chain: `retry-request/teeny-request` via `@google-cloud/storage`
  (transitive, server-side only). No action required before release; track on
  next maintenance window. PASS (no `audit fix` run per mission rules).
- Outdated majors exist (`@hookform/resolvers` 3→5, eslint 9→10, etc.) — no
  upgrade attempted (mission rule). INFORMATIONAL.

## 4. HEADERS (live — PROVEN, see audit report §PHASE 12)
Enforced: HSTS/frame/nosniff/referrer/permissions. **MEDIUM**: full CSP from
`next.config.ts` not present in served responses (only `upgrade-insecure-requests`).
Compensating: DOMPurify allowlist sanitizer live (`sanitize.ts`), `unsafe-eval`
removed from code policy, `unsafe-inline` retained in code policy (noted).

## 5. AUTHN/Z + ABUSE CONTROLS (PROVEN live + code)
- Wrong credentials → `302 CredentialsSignin`, no cookie. Anonymous/bad-token
  `/me` → 401. `/api/revalidate` no-secret → 401, GET → 405. Open-redirect
  probes (external, protocol-relative, `javascript:`) → safe fallback/403.
- Cookies: httpOnly + SameSite=lax + Secure-in-prod (code). Passwords:
  plaintext-over-TLS by documented design; hashing server-side (scrypt).
- Rate limiting: Upstash sliding window on mutations + admin guards
  (`action-guard.ts`, partner paths) — code-PROVEN; live brute-force test NOT
  run (would be abusive). NOT PROVEN live — accepted.
- XSS: `dangerouslySetInnerHTML` paths sanitized via DOMPurify; CMS content
  allowlisted. CSRF: SameSite=lax + Auth.js CSRF-token flow (live 302 behavior
  confirms token enforcement). SSRF: no user-controlled fetch URLs found.

## 6. VERDICT — SECURITY
No CRITICAL. One MEDIUM (CSP enforcement gap, compensated). Secrets posture:
no live exposure in HEAD or history-after-rotation. **SECURITY: PASS with the
CSP note carried as a fix-cycle item.**
