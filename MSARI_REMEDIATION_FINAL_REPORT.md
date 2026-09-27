# MSARI — PRODUCTION RISK REMEDIATION — FINAL VERIFIED REPORT

**Mission:** fix-cycle C1–C5 + independent QA + supervisor revalidation.
**Repo:** `msari-web`, `20ccf46` → `7487b1e` (3 remediation commits).
**No-governance breaches:** booking/payment/auth architecture, Firestore
schema/indexes/rules, API contracts — all UNCHANGED (verified by diff review).
**Independent QA:** separate agent, read-only, fresh probes (results inline).

## 1. EXECUTIVE SUMMARY
Shipped fixes: F-04 (mock removal), F-01 (404 semantics), redirects leak,
CSP defense-in-depth + header hardening, log/env hygiene, catalog caching
layers. Security live proofs: logout, cross-user isolation (403/403), gentle
rate-limit probe. Full cleanup of all test identities verified.
**Residual:** TTFB improved 4.7s→~2.5s home but above 1.5s target (root cause
traced to per-request upstream data layer; final lever needs owner panel
input); served CSP still CDN-normalized (code delivers full policy on two
channels, infrastructure strips it).

## 2. CHANGES IMPLEMENTED (commits)
- `0287e67`: catalog fetch `next.revalidate 300` + `api:catalog` tags;
  bySlug null→direct verify; canonical-redirect base; flights unavailable
  state; BOOT-2 log removal; CSP directives + `poweredByHeader:false`;
  `.env.example` hygiene.
- `f33e073`: persistent `unstable_cache` (list/bySlug/byId/rooms, 300s,
  throw-on-absence so failures never cache) — required because fetch Data
  Cache is not honored inside Server Actions.
- `7487b1e`: editorial TTLs 10s→300s (homepage/settings/pages),
  destinations 120s (offers kept 60s).

## 3. FINDINGS BEFORE/AFTER
- **F-04 (was HIGH): PROVEN FIXED.** Before: `MOCK_FLIGHTS` (Qatar/Emirates/
  EgyptAir + prices + dead select buttons + "3 رحلات متاحة"). After: live page
  shows "حجز الطيران غير متاح حالياً" + WhatsApp CTA, zero airline/price
  strings (independent QA: `MOCK:False, Qatar:False, Emirates:False`).
  Root cause: flights feature never connected to a live source
  (`flights/booking/actions.ts` was deleted in the hostinger-proof merge).
- **F-01 (MEDIUM): PROVEN FIXED (semantics).** Before: API-side miss ⇒ page
  404 even for existing hotels (observed once on `panorama-hotel`, self-
  recovered). After: API null ⇒ direct-Firestore verify before any null;
  genuine absence still 404s (unknown slug → genuine 404 with `noindex`,
  QA-proven). Throw-paths still fall back, then 5xx — never 404-on-error.
  Repeated probes: panorama 200 (×3 incl. QA).
- **Redirect leak (LOW): PROVEN FIXED.** Root cause: `new URL(path, origin)`
  used proxy-supplied origin (`0.0.0.0:3000`). After: canonical base
  (`NEXT_PUBLIC_APP_URL` https-only, else `https://msari.net`). QA: evil/
  protocol-relative → `307 https://msari.net/ar`; `javascript:` → 403.
- **F-03 CSP (MEDIUM, partial): CODE DELIVERED, DELIVERY BLOCKED.**
  Root cause of absence: infrastructure normalization (both `next.config`
  `headers()` AND new middleware mirror emit the full policy; served header
  remains `upgrade-insecure-requests` only — other Next headers pass through,
  so stripping is CSP-specific at hCDN). `x-powered-by` removed (QA: absent).
  Compensating controls hold (DOMPurify, no unsafe-eval). Needs owner hPanel
  check (CDN/security-header override). Status: NOT fully closed.
- **F-02 TTFB (HIGH, partial): 4.71s → ~2.4–2.5s warm home (measured ×6+3 QA),
  detail still ~4.7s.**
  Root cause (proven by layer isolation): non-data routes serve in 0.5–0.8s
  (runtime/network healthy); every data page pays per-request upstream
  Firestore/API round-trips (raw list read ≈2.2s from EU). Applied safe levers:
  persistent catalog cache + editorial TTLs; booking/user/session paths kept
  `no-store` (never cached — rule §6 honored). Residual floor needs EITHER
  owner panel confirmation (MSARI_API_KEY present? which path serves?) OR
  API-side/shared-cache work (functions repo = out of scope → escalated, not
  attempted). No unsafe caching introduced. Status: improved, target open.

## 4. SECURITY VERIFICATION
- Secrets re-scan (tree + history): no live exposure; historical AUTH_SECRET
  rotated by owner; `.credential*` gitignored, never committed. No new secrets
  introduced (Gmail app password lives only in Secret Manager; never in repo).
- Logout: LIVE PROVEN (session held user email → signout 200 → session `null`).
- Cross-user isolation: LIVE PROVEN with dedicated A/B identities —
  A creates (201) → B reads A's booking **403**, A reads own **200**,
  B cancels A's **403**, A cancels own **200**. Full cleanup verified
  (Auth users deleted, Firestore docs deleted, mailLog/notif traces removed,
  residue check 404).
- Rate limiting: code limiters on booking/admin/public-API (PROVEN code);
  live gentle probe (8 rapid wrong logins) → all 302 no-429 (no lockout at
  that volume; Firebase-side throttling assumed). No brute force run.
  Status: code-PROVEN, live-threshold NOT PROVEN (accepted, documented).
- Headers post-fix: HSTS/frame/nosniff/referrer/permissions PROVEN live;
  `x-powered-by` gone; CSP partial (above).

## 5. DATA / SOURCE-OF-TRUTH VERIFICATION
Unchanged and re-confirmed: Firestore SoT, server-computed pricing/availability,
server booking numbers, uid-scoped access. No operational data copied to CMS/
frontend. No schema/index/rule/contract touched (diff-clean on those axes).

## 6. PERFORMANCE MEASUREMENTS (UTC 2026-09-26/27, curl)
| Page | Before | After (warm) |
|---|---|---|
| /ar | 4.71s | 2.36–2.60s |
| /ar/hotels | 3.00s | 2.47–3.40s |
| detail | 4.4–6.2s | ~4.7s |
| csrf/sitemap/robots | — | 0.5–0.8s (baseline healthy) |
Payloads unchanged (~270KB HTML). No private-data caching added.

## 7. PRODUCTION VERIFICATION (independent QA, fresh probes)
Flights unavailable-state / redirects / headers / robots+sitemap / genuine
404+noindex / revalidate 401+405 / code markers (cache/tags/env/log/fingerprint)
/ TTFB numbers — ALL PROVEN with exact evidence (see QA table in session log).

## 8. SEO VERIFICATION
Unchanged PASS surface re-checked (canonical/OG/Twitter/JSON-LD/sitemap/
noindex-auth) + genuine-404 preserved + mock removal eliminates fake-content
risk on /flights/search.

## 9. FUNCTIONAL REGRESSION
Auth (register/login/me/401s/logout) / booking authority paths untouched /
hotels-city-rooms serving / redirects / revalidate gating — no breakage
observed in any probe. Flights search behavior intentionally changed (mock →
honest empty state) — the only UX delta, as specified.

## 10. INFRASTRUCTURE VERIFICATION
Deploy pipeline PROVEN working (3 pushes → auto-deploy → live verification
each). Remaining UNKNOWN (no panel/SSH in this mission): Node runtime version,
restart policy, log retention, rollback procedure. Owner checklist appended
(§13). No infra config changed by this mission.

## 11. REMAINING RISKS
R1 TTFB floor ~2.5s/4.7s detail (HIGH remnant) — needs owner panel answers +
  possible API-side work. R2 CSP stripped at CDN (MEDIUM remnant). R3 rate-limit
  live threshold untested (LOW). R4 Hostinger runtime unknowns (LOW, info-only).

## 12. UNKNOWN / NOT PROVEN
Node version; restart/logs/rollback; live rate-limit threshold; API-vs-direct
serving share in prod (inferred, not instrumented).

## 13. OWNER CHECKLIST (hPanel, no code)
1. Confirm `MSARI_API_KEY` present (controls API-vs-direct serving path).
2. Report values of `MSARI_API_*_MODE` (or confirm unset = defaults).
3. Node.js version + restart policy + log retention + rollback steps.
4. hPanel CDN/security-header setting that normalizes CSP (for R2).
5. Add SPF `include:_spf.google.com` (alias-mail alignment, prior thread).

## 14. SUPERVISOR DECISION (16 answers)
1. F-01 closed? YES (semantics proven; monitoring advised).
2. F-02 closed by evidence? PARTIAL — improved + root-caused; target open (R1).
3. CSP live? NO — code delivered, CDN strips (R2). Not closed.
4. Mock gone? YES, QA-proven.
5. Current secrets clean? YES.
6. Logout proven? YES (live).
7. Cross-user proven? YES (live 403/403 + cleanup).
8. Rate limiting proven? Code yes / live threshold no (LOW residual).
9. Hostinger unknowns closed? NO — checklist issued.
10. Regressions? None observed (one intended UX change: flights empty state).
11. SoT changed? NO. 12. Schema/rules/auth/payment/booking changed? NO.
13. Critical? None. 14. High? One remnant (TTFB floor). 15. Unjustified
    MEDIUM? None (F-03/R2 justified residual with path forward).
16. Every claim evidenced? Yes — probes, logs, file:lines, QA table above.

## FINAL DECISION: **CONDITIONAL PASS (unchanged)**
Production serving approved to continue. Final Delivery stays OPEN pending:
TTFB target (R1), CSP delivery (R2), owner checklist (§13). No re-audit needed —
targeted re-gate on R1/R2 only.
