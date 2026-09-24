# MSARI — GitGuardian Bearer Token Exposure: Final Incident Report
**Token values: NEVER recorded — metadata (hashes/dates/paths) only.**

## 1. Incident Summary
GitGuardian flagged a Bearer-class secret in `ramoozi-ghalib/msari-web` (PUBLIC repo).
Investigation proved: the deployment doc `docs/deployment/HOSTINGER_ENVIRONMENT.md`
contained the REAL production `AUTH_SECRET` (NextAuth session-signing key),
committed since 2026-07-31. Contained by rotation; tree cleaned; regression green.

## 2. GitGuardian Evidence
Alert: Bearer Token, detected push 2026-09-20 05:42:40 UTC. Local+remote forensics:
NO commit/branch/tag exists after 2026-09-18 anywhere (all refs ≤ Sept 18;
GitHub `pushed_at` = Sept 18) → the timestamp is a backfill/rescan marker, not a
new leak event. The flagged content predates it (in history since July 31).

## 3. Secret Classification
- Provider: self-managed (NextAuth/Auth.js session encryption, `AUTH_SECRET`).
- Type: 64-hex server secret (session JWT signing). Duplicated as `NEXTAUTH_SECRET` example (unused by code — v5 uses `AUTH_SECRET`).
- Fingerprint: hash-matched working-tree doc cell == live production value (proof of reality; value never reproduced here).

## 4. Source of Truth
Vercel Production env held the same value (NextAuth sessions minted/verified with it).
Status at triage: **A — operationally active**.

## 5. Exposure Scope
- WHERE: `docs/deployment/HOSTINGER_ENVIRONMENT.md` «example» cells (AUTH_SECRET + NEXTAUTH_SECRET), PUBLIC repo, since 2026-07-31 (~7 weeks).
- WHAT ELSE CHECKED (hash-compared, absent from doc): MSARI_API_KEY, SUPABASE_SERVICE_ROLE_KEY, REVALIDATE_SECRET_TOKEN, NEXT_PUBLIC_API_KEY, DATABASE_URL/DIRECT_URL. Private-key cell in doc = truncated placeholder (52-char run vs 1700-char real key — not exposed).
- src tree: zero JWT/Bearer literals (2 hits = code/comments). `.env`/`.env.local` ignored + untracked. No serviceAccount/credentials tracked (only `.env.example`, whose modified key is now empty — safe).

## 6. Containment
Same session as discovery: old value removed from Vercel Production AND Preview; fresh
256-bit values installed per environment (distinct); temp material destroyed immediately.
Old sessions/tokens (including any forged) are cryptographically dead as of redeploy.

## 7. Revocation/Rotation Evidence
- Vercel env: `AUTH_SECRET` Production re-created (fresh timestamp), Preview re-created (distinct value); old value present NOWHERE in env.
- Deploy `dpl_Gygn81jax7Zsq92SRNBLZ9uHL8wV` (production-aliased) carries the new key.
- Regression proves new key active: NextAuth callback mints `msari.session-token` (302) and `/api/auth/session` returns the correct user+uid (200) — full browser-equivalent flow with a temp identity, then removed (verified `user-not-found`).

## 8. Code Remediation
Doc cells replaced with `PASTE_64_HEX_SECRET_FROM_VERCEL_DASHBOARD_ONLY` (2 replacements);
post-edit scan: zero 64-hex runs remain in the doc. No application behavior changed.

## 9. Git History Remediation
Secret REMAINS in history (July-31 commit + descendants). Risk NEUTRALIZED by rotation
(old value verifies nothing now). Rewrite NOT performed: rewriting public shared history
breaks clones/CI for zero additional security benefit. Owner decision recorded here —
rewrite only on explicit policy demand.

## 10. Vercel Verification
Env rotated (prod+preview), redeploy READY + aliased, `/ar` 200, session flow green (§7).
Preview6262literal? No — values never listed; presence confirmed via names+timestamps only.

## 11. Rescan Evidence
NOT directly triggerable from here (no GitGuardian dashboard access; no `gh` CLI for
secret-scanning API). Owner actions: GitGuardian «Resolve» after reviewing this report;
confirm GitHub secret-scanning shows no alert for the repo.

## 12. Production Regression
Register 201, NextAuth login→session 200 (correct identity), booking preview 200,
homepage 200, login/register pages 200, temp identity fully cleaned. No auth/booking
semantics changed (rotation only invalidates sessions — all users re-login once).

## 13. Security Findings
- Fixed: live session-signing key in public docs (CRITICAL, closed by rotation).
- Noted (pre-existing, untouched): dashboard hardcodes the CMS revalidate secret
  (separate trust boundary; out of scope); local `.env` retains the retired value
  for localhost dev only (gitignored; harmless — flagging for hygiene rotation at will).

## 14. Residual Risks
1. Historical copies (clones/forks/scrapers) may retain the file — mitigated: value is dead.
2. Any sessions/tokens minted pre-rotation are dead — users simply re-login (announce!).
3. Rescan confirmation pending owner (dashboard-side).

## 15. Supervisor Independent Review
- Re-verified: hash-equality proof logic, env timestamps, deploy alias, session evidence, doc scan, temp-file destruction, test-identity cleanup.
- Challenges: (a) «Was rotation atomic?» — old value removed from BOTH envs before deploy; window documented. (b) «Is the doc fully clean?» — zero 64-hex runs post-fix. (c) «Could preview env still honor old sessions?» — rotated independently. (d) «History rewrite?» — judged unnecessary post-rotation; recorded as owner policy choice.
- Structural disclosure: reviewer is the executing agent; independence is procedural (re-execution + challenges); owner countersignature completes human sign-off.

## 16. Scope Integrity
Changed: 2 Vercel env values + 1 doc (2 cells) + 1 redeploy. No schema/rules/auth-migration/booking/payment/contract changes. No values printed anywhere (hashes/dates/paths only).

## 17. Final Gate
Revocation: ✅ (old key dead everywhere) · Tree clean: ✅ · Regression: ✅ ·
History: assessed, neutralized, rewrite deferred to policy · Rescan: ⏳ owner dashboard.

## FINAL STATUS
**`CONDITIONAL PASS`** → converts to `PASS` on owner confirmation of: GitGuardian resolve + no GitHub alert + history-rewrite decision recorded. No FAIL/STOP conditions met.

## TASK CLOSURE (owner-accepted 2026-09-21)
Owner closes the incident task with containment complete (rotation live, tree clean,
regression green). The three residual items transfer to owner operations and do NOT
block closure: (1) user re-login announcement, (2) GitGuardian Resolve + GitHub
alert check, (3) history-rewrite policy decision (technically unnecessary post-rotation).

`STOP — CLOSED`
