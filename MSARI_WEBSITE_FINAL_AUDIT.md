# MSARI Website — Final Comprehensive Audit (Production Readiness Gate)
**Target:** `D:\Dev\projects\msari_web` → `https://msari.net` (Vercel `msari-web`, Firebase `msariapp-v2` API). **AUDIT ONLY — zero files modified.**
**Method:** file-by-file static audit (162 files) + live production probes (HTTP-level) + prior live E2E evidence. No browser automation exists here: visual responsive/a11y/Lighthouse checks are marked LIMITED, not claimed.

## Executive Summary
Coherent API-first architecture, strong SEO migration, solid auth/session design. **No Critical findings.** One HIGH (rate limiting inert in production), several Mediums (open redirect, dead key-minter prototype, full-collection scans, no loading skeletons). **Verdict: CONDITIONAL PASS** — production-serving, pending the HIGH + supervisor sign-off.

## 1. Scope
Full system audit per the 26-section command: architecture, static quality, frontend, performance, caching, security, SEO, routing, UX, responsive, a11y, API contracts, scalability, supply chain, build/release, journeys, SoT. Out of scope (untouched): backend, rules, auth redesign, booking/payment logic.

## 2. Team & Responsibilities
Single owner + specialist roles executed as audit tracks (static, routes, security, perf/cache, SEO/UX, deps). Supervisor seat held by owner-operator (independence limitation noted in §24).

## 3. Architecture Audit
Coherent: App Router (Server pages + `*Client.tsx` islands), server actions per domain (`actions/`), API-first booking via `api-client.ts` to Cloud Functions, Direct-Firestore reads for catalog/CMS with SHADOW/CANARY migration gates (`lib/api-migration`, default SHADOW/OFF — not permanently on). Findings: (a) dual data layers (`services/` vs `actions/` fetching same collections, e.g. city/offer) — MEDIUM maintenance debt; (b) SHADOW mode doubles Firestore reads and logs diffs — cost note, INFO; (c) naming collisions (`auth.ts` vs `actions/auth.ts`, `lib/currency.ts` vs `actions/currency.ts`) — LOW.

## 4. Repository/File Audit
162 files (97 tsx, 62 ts, css/png/ico). Structure consistent (`app/actions/components/hooks/lib/schemas/services/types/data`). 35 pages + 6 API routes + 13 layouts inventoried (full table in evidence notes). No `loading.tsx` anywhere (0 hits) — MEDIUM UX gap. Legacy redirect stubs (`auth/login|register|forgot-password`, `offers→/`) present and intentional.

## 5. Dead Code / Dead Files
| Item | Type | Evidence | Confidence | Recommendation |
|---|---|---|---|---|
| `flights/booking/actions.ts:createApiKey` | dead prototype + fake key minting | 0 callers repo-wide; TODO persist; mints `msari_live_*` matching no backend | CONFIRMED DEAD | Remove or gate behind disabled flag (HIGH-2) |
| `lib/amenities-store.ts` | deprecated stub (`export {}`) | 0 refs | CONFIRMED DEAD | Delete (separate task) |
| `components/home/CITY_EMOJIS.tsx` | unused export, empty values | 1 self-hit | CONFIRMED DEAD | Delete |
| `components/ui/Surface|Input|Card|Badge.tsx` | unused components | 0 imports each | CONFIRMED DEAD | Delete |
| `(auth)` vs `auth/` trees | parallel auth routes | both exist; stubs redirect | PROBABLY DEAD (legacy) | Confirm live tree, remove other |
| `console.log i18n/request.ts:13` | debug leftover | literal BOOT log | CONFIRMED | Remove |
| 63× console.* (28 files), 46 error/15 warn | hygiene | mostly legitimate server-side | ACTIVE (migrate) | Move to safeLog |
| 1 TODO (above), 0 FIXME/HACK, 0 commented blocks >5 lines | — | exhaustive grep | ACTIVE | Track the one TODO |

## 6. API & Data Audit
All operational flows API-authoritative (preview/pricing/availability server-side; no invented data found). `api-client.ts`: dual error-shape parser (RFC7807+legacy), per-call timeouts (auth 15–25s), Bearer-only rule for user flows. SoT matrix: hotels/rooms/cities/CMS→Firestore Direct+API shadow; availability/pricing→API transaction; bookings→API; identity→Firebase Auth; profile→`customers/{uid}` via `/me`; editorial→CMS collections. No fake-data paths found. Gap: `lat/lng:"$undefined"` in hotel payloads (data quality, INFO).

## 7. Security Audit
- HIGH-1: **Rate limiting inert in production.** `rate-limiter.ts:22-42` fails OPEN (passthrough) without Upstash; Vercel env has NO `UPSTASH_*` (verified via env list) → login brute-force (5/15m + 20/h), booking (10/h), and admin (200/h) limiters all pass-through in prod. Firebase's own abuse controls partially mitigate (not relied upon).
- MEDIUM: **Open redirect** in `api/session-redirect/route.ts:14-27` — raw `fallback` query fed to `new URL(fallback, origin)`; absolute attacker URL wins. Login-adjacent phishing vector.
- MEDIUM: **Revalidate GET accepts secret in query** (`api/revalidate/route.ts:58`) — secret lands in logs/history (dashboard uses it; prefer POST-only).
- MEDIUM: Dead `createApiKey` prototype (see §5) — fake credential minting surface, adminGuard-gated.
- MEDIUM: CSP allows `unsafe-inline`/`unsafe-eval` (largely Next.js-required; record as accepted-with-reason, tighten later).
- OK: no secrets in `NEXT_PUBLIC_*` (only publishable IDs/URLs); `MSARI_API_KEY` server-only; JWT cookie httpOnly/lax/secure-prod; honeypot+auth+Zod on hotel-requests; Zod pervasive; safeJsonLd; no tokens logged; error messages generic client-side. LOW: hotel-requests has no rate limit (auth-gated spam possible — compounds HIGH-1).

## 8. Performance Audit (measured, production)
`/ar` 200 in 2.2–3.3s / 312KB; `/ar/hotels` 200 in 2.2s; hotel detail 200 in 2.9s (curl TTFB incl. TLS; SSR `private,no-store` → every hit renders server-side, zero edge cache). Findings: `unoptimized:true` on next/image (bypasses optimization — MEDIUM); no loading skeletons (perceived perf); full-collection scans (§13). No browser → FCP/LCP/INP/CLS NOT measured (stated, not claimed). Speed Insights installed (data accrues in Vercel dashboard).

## 9. Cache Audit
CMS/offers/cities via `unstable_cache` (60s cities; CMS persistent) + tag invalidation via secret-gated `/api/revalidate` (tags: cms:*, cities, offers); sitemap `revalidate:86400`. No user/booking data cached (history/preview uncached; HTML `private,no-store`). SHADOW double-reads noted. Verdict: safe posture, no stale-operational-data risk found.

## 10. SEO Audit
Strong: Arabic-primary canonicals, `/en` noindexed (verified live), hreflang Link headers (ar/en/x-default), 87-URL sitemap (ar only, daily), robots.txt live, ~40 legacy 301s (WordPress/cities/feeds/encoded-Arabic, single-hop), JSON-LD Hotel+Breadcrumb via sanitize, per-hotel `generateMetadata`, 404 → true 404 status. Gap: sitemap hotel-URL coverage not enumerated here (spot-check recommended) — LOW.

## 11. Routing & Navigation Audit
35 pages + 6 API routes inventoried; locale always prefixed; legacy `/auth/*` stubs redirect; `/offers` → `/` stub; 404 page exists and returns 404. No loops/dead routes found statically. Deep-link/refresh behavior standard App Router. Orphan-route risk: LOW (all pages linked or legacy-documented).

## 12. UX Audit (code-traced + operator-verified flows)
Journeys J1–J5 verified live in prior missions (signup→booking→history with real accounts). Error banners, gated buttons, empty states present on critical flows. Gaps: no global loading skeletons; booking errors previously invisible on review step (FIXED + deployed); phone UX unified (country picker). No browser click-through available here — owner spot-checks cover it.

## 13. Responsive Audit — LIMITED
Code is responsive-first (Tailwind sm/md/lg grids, mobile BottomNav + sticky bars, RTL throughout). No visual verification possible in this environment (no browser automation) — owner device checks required before claiming. Not a blocker given traffic is live without complaints, but formally LIMITED.

## 14. Accessibility Audit — STATIC SAMPLE
20 `aria-*` hits on nav/auth/sliders/pagination; labels on all auth inputs; alt texts on destination imagery; semantic headings in sampled pages. No keyboard/focus/contrast testing possible here — static PASS with LIMITED stamp; full WCAG pass deferred.

## 15. Scalability Audit
First bottleneck: full-collection Firestore scans per listing/bySlug (`hotels.ts:89-91,609`) + per-hotel rooms subreads + SHADOW duplication — linear cost growth, fine for tens/hundreds of hotels, review before thousands. Authenticated booking path bounded (transactions + 15–25s budgets). Rate limiting ABSENT (see HIGH-1) → abuse/retry-storm exposure is the sharpest scale risk. CDN: HTML uncacheable by design (personalized SSR); static chunks/images cached. No invented capacity numbers.

## 16. Dependency/Supply Chain Audit
Lean manifest (18 prod deps). `npm audit`: 1 moderate chain (uuid via firebase-admin; fix requires breaking major — accepted, documented). No postinstall scripts. No unused-dep proof attempted beyond manifest review (bcryptjs still used by login guard; tsx build-time only). Outdated minors exist — no auto-upgrades per scope.

## 17. Build/Release Audit
`npm run build` + `tsc --noEmit` green repeatedly (latest deploys); Vercel `msari-web` production target verified live (200s across routes); env names verified (Upstash absent — see HIGH-1); `.vercelignore` excludes local `.env`. Dev/prod separation: AUTH_URL prod-correct; local `.env` holds REPLACE_ME placeholders (dev-only).

## 18. Traveler Journey Results
| # | Journey | Result | Evidence |
|---|---|---|---|
| J1 | Home→Search→Hotel→Room→Booking | PASS | 200s measured + live preview/create E2E (prior) |
| J2 | Home→Destination→City→Hotel | PASS | pages + sitemap live |
| J3 | Login→Profile→Booking | PASS | live sessions verified previously |
| J4 | Signup→Login→Booking | PASS | live accounts + deploys verified |
| J5 | Booking→Refresh→History | PASS | operator-verified on production |
| J6/J7 | Mobile/Desktop browser | LIMITED | no browser automation; code responsive-first |

## 19. Findings by Severity
- CRITICAL: none.
- HIGH-1: production rate limiting inert (Upstash unconfigured + fail-open).
- HIGH-2: dead `createApiKey` fake-key prototype (remove/gate).
- MEDIUM: open redirect (session-redirect); revalidate secret-in-query; full-collection scans; no loading skeletons; parallel auth trees; unsafe-inline/eval CSP.
- LOW: dead UI files (5), debug log, console hygiene, hotel-requests unthrottled, lat/lng gaps, naming collisions.
- INFORMATIONAL: uuid advisory, SHADOW cost, Speed Insights pending data.

## 20. Required Fixes (separate tasks, NOT in audit)
1. Configure Upstash in Vercel production (or switch fail-closed) — closes HIGH-1.
2. Delete/gate `flights/booking/actions.ts:createApiKey` — closes HIGH-2.
3. Sanitize `fallback` in session-redirect (relative-only, reuse getSafeRedirect) + POST-only revalidate.

## 21. Accepted Risks
uuid moderate advisory (breaking fix deferred); CSP unsafe-* (Next.js requirement); HTML uncacheable SSR (correctness > edge cache); SHADOW double reads (migration safety); visual responsive/a11y sign-off by owner spot-checks.

## 22. Evidence Matrix
Route table (35+6, §4 agents); grep counts (console 63/28, TODO 1, dead refs 0); live timings (home 312KB/2.25s, hotels 2.2s, detail 2.9s, sitemap/robots/en/404); env-list absence (Upstash); headers dump (CSP/HSTS/hreflang/no-store); npm audit; prior live E2E reports (signup/deploy/booking incidents).

## 23. Production Readiness Assessment
Serving live traffic correctly across all critical journeys with coherent architecture, safe caching, and strong SEO foundations. Gating items are hardening (abuse controls, redirect hygiene, dead-code removal), not functional breakage.

## 24. Independent Supervisor Review (self-challenge log)
Challenged: severity of rate limiting (HIGH — login/booking/profit abuse without it; Firebase backstop insufficient alone); whether dead key-minter deserves HIGH (yes — credential-shaped output + TODO-to-persist = future footgun); whether no-browser gaps block PASS (they force CONDITIONAL, not FAIL, given live operator usage). Independence limitation: auditor implemented past website fixes; owner-operator holds final sign-off.

## 25. Final Verdict
**`CONDITIONAL PASS`** — production-serving with no Criticals; closure to `PASS` requires: (1) Upstash configured (or fail-closed limiter), (2) dead key-minter removed/gated, (3) open redirect sanitized, (4) owner sign-off. All other gates (§25 checklist) met or explicitly LIMITED with justification.

`STOP`
