# MSARI Hardening — Independent Supervisor Re-validation
**Role:** independent re-verifier (no code changes made; all prior outputs re-executed, not trusted).
**Scope:** HIGH-1, HIGH-2, MEDIUM-1, MEDIUM-2 only.

## Verified
- **HIGH-1:** fail-open `PassthroughLimiter` GONE repo-wide (zero refs); `MemorySlidingWindowLimiter` active with per-key isolation; Upstash path present and preferred when configured; degraded per-instance behavior documented in code + boot warning. Actual enforced windows (code truth, correcting mission text): login 5/15m + 20/h, admin 200/h, booking 10/h, public API 60/m. Enforcement logic re-proven (60 allow → deny, isolation). Live 429 contract intact in code.
- **HIGH-2:** `flights/booking/actions.ts` absent from tree; zero `createApiKey`/`ApiKeyCreateState` refs repo-wide; latest `.next` build contains no actions chunk and no `createApiKey` string in the route bundle; flights/booking page never imported it. No production endpoint depends on it.
- **MEDIUM-1 (session-redirect):** live 3/3 — internal 307 correct, absolute-external → `/`, malformed → `/`.
- **MEDIUM-2:** live GET → 405 (no secret read); POST wrong-secret → 401 (re-executed); env `REVALIDATE_SECRET_TOKEN` present in Production; valid-secret matrix accepted from remediation evidence (401/400/200).
- **Regression:** login/register pages 200; booking preview 200 + history 200 (fresh temp identity, cleaned, `user-not-found` verified).

## Not Proven
- **DISTRIBUTED ENFORCEMENT: NOT PROVEN** (Upstash absent from production env — re-checked). Per-isolate degraded mode is the enforced reality.
- Visual/responsive sign-off (outside this mission; unchanged code paths).

## Remaining Risks
1. **NEW FINDING MED-2026-01 (blocks PASS):** sibling route `GET /api/auth/redirect?fallback=` has the IDENTICAL unsanitized open redirect — proven live (`?fallback=https://evil.example/phish` → 307 to evil). The remediation covered only `session-redirect`. Zero in-repo callers (external consumers possible). No code change made (supervisor mission forbids); filed for a focused fix task.
2. Degraded limiter distribution (standing caveat; Upstash owner action).

## Scope Integrity
Supervisor made zero repo modifications (read-only probes; temp scripts in system temp dir, all removed). Remediation diff reviewed: 4 website files + 1 env var — matches claims, no scope creep, no auth/schema/rules/payment changes.

## Security Review
No secrets committed/printed (verified warn-log shapes log prefix + key-slice only); test identities created/removed with verification; secret values handled without output. No new exposures introduced by remediation.

## Regression Review
All re-executed green (table above). Dashboard POST revalidate improved (was 500 pre-env-fix). No behavioral regressions detected.

## FINAL STATUS
**`CONDITIONAL PASS`** — remediation evidence independently confirmed; cannot advance to `PASS` due to: (a) Upstash absent → distributed protection NOT PROVEN, (b) NEW MED-2026-01 open redirect on `/api/auth/redirect`. Both are bounded, documented follow-ups — no FAIL/STOP conditions met.

`STOP`
