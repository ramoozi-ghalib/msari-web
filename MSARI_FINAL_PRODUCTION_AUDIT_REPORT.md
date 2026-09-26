# MSARI — FINAL PRODUCTION AUDIT REPORT (READ-ONLY)

**Mode:** AUDIT MODE — READ ONLY. Zero code/config/env/database changes made.
**Target:** https://msari.net (Production / Hostinger) + repo `msari-web` @ `20ccf46`
**Date:** 2026-09-26/27 (UTC). Backend: Cloud Functions `api` on `msariapp-v2`.
**Verdict proposal:** CONDITIONAL PASS (see Release Gate report for conditions).

## EVIDENCE GATE COMPLIANCE
Every claim below cites verifiable evidence. Status words:
PROVEN = reproduced/measured now. HISTORICAL = prior mission evidence, labeled.
NOT PROVEN = not verified (never upgraded to PASS). UNKNOWN = unverifiable from here.

## PHASE 1 — SOURCE INVENTORY (PROVEN via filesystem scan)
- `src/`: 161 files (97 .tsx, 61 .ts, 1 .css, 1 .ico, 1 .png), ~1.26 MB.
- Largest: `pages.cms.ts` 51KB, `AddHotelClient.tsx` 42KB, `hotels.ts` 33KB.
- Routes with `page.tsx`: 35 (locale group: home, hotels, hotel detail, room detail,
  destinations, booking, cars×4, flights×3, auth×6, account×2, blog, offers, admin,
  add-hotel, developers, contact, about, privacy, terms, app, favorites).
- `src/lib/api-client.ts` is the single API transport (server-only enforced —
  `import 'server-only'`, build breaks on client import by design).
- Dead-file scan: no orphan top-level modules found beyond normal page/component
  graph; `scripts/` holds local harnesses (diagnose-auth, test-cms-sync) — dev-only,
  LOW (not shipped to runtime).

## PHASE 2 — DEAD / LEGACY CODE
- TODO/FIXME/HACK/DEPRECATED/LEGACY markers: **3 hits, one file**:
  `src/app/[locale]/flights/search/page.tsx:12,163,173` — `MOCK_FLIGHTS`
  rendered on the PRODUCTION flights search page. **MEDIUM**: fake data served
  to users (severity raised: user-facing deception, not just dead code).
- `console.*`: 62 hits, all server-side error/warning logs + error boundaries
  (`global-error.tsx`, `error.tsx`) + one per-request `console.log` (`[BOOT-2]`
  in `src/i18n/request.ts:13`, noise). LOW. No secrets logged (safeLog redaction
  verified in prior missions; no credential strings in log calls — grep clean).
- No fake hotels/rooms/pricing, no demo accounts, no abandoned migrations found.

## PHASE 3 — SOURCE OF TRUTH (PROVEN via code + live Firestore reads)
| Data | SoT | Consumer | Cache | Fallback | Write authority |
|---|---|---|---|---|---|
| Hotels/Rooms/Cities | Firestore (+Storage media) | API `/v1/*` → website adapters | cities 60s; API paths `no-store` | explicit direct Firestore | API transactions / dashboard |
| Pricing/Availability | server compute (roomPriceUsd×nights×rate; txn overlap check) | booking preview/create | none (`no-store`) | none (fail-closed) | API only — client sends NO price fields (`bookings.ts` create schema) |
| Bookings | `bookings/{uid}/entries/{number}` | API + website actions | none | none | API transaction; id = server `BK-MS…` |
| Users/Auth | Firebase Auth + `customers/{uid}` | NextAuth session | session cookie only | n/a | API register; scrypt server-side |
| CMS/Editorial | Firestore CMS collections | website services | `revalidate` + tags (editorial TTLs) | none | dashboard/CMS |
| Rates/Offers | `rates/global`, `ads` | website | seconds–minutes TTL | none | dashboard |
No unauthorized operational replica. No CMS/static copies of live data found.

## PHASE 4 — API AUDIT (website → production API)
Endpoints used (all `https://us-central1-msariapp-v2.cloudfunctions.net/api/v1`):
`/auth/register /auth/login /auth/refresh /me /cities /hotels?limit=100`
`/bookings/preview /bookings` (+ history/cancel/payment per code).
Auth: Firebase ID token Bearer; server-only key never in browser (PROVEN by
`server-only` import + prior chunk scan). Timeouts: 3.5s default / 15s auth,
timeout→explicit fallback or fail-closed per resource (no 404-masquerade —
release-gate evidence). **Zero** sandbox/localhost/test/Vercel URLs in `src`
(only a benign comment naming proxy types + `127.0.0.1` client-IP handling).

## PHASE 5 — AUTH (LIVE, 2026-09-27 + code)
- Website wrong-credential POST → `302 /login?error=CredentialsSignin`, NO
  session cookie set. PROVEN.
- API chain with single-use audit identity (created + fully removed after):
  register `201`+uid / duplicate rejected (`400`) / login `200`+token /
  `GET /me 200` email-match / `GET /me` no-auth `401` / bad token `401`. PROVEN.
  Residue verified gone (`customers/{uid}` → 404, Auth user deleted 200,
  no `bookings/{uid}` ever created).
- Cookies (code): `httpOnly + SameSite=lax + Secure in prod`
  (`src/auth.ts:54-57`, `auth.config.ts:18-21`). PROVEN (code).
- Live logout + live session-cookie flags: NOT PROVEN live (no browser session
  held); code path standard NextAuth signOut. Minor.

## PHASE 6 — BOOKING (code + recent production evidence, no new test bookings)
- Pricing server-authoritative: client schema carries no price; API computes
  `roomPriceUsd × nights × rate` (functions `index.js:1160-1162`). PROVEN.
- Availability server-authoritative: Firestore txn + collection-group overlap
  check; blocking = all except cancelled/rejected (`index.js:811-822,
  1124-1136`). PROVEN (code).
- Booking number server-generated `BK-MS…`; idempotency fail-CLOSED server-side
  (HISTORICAL: Step-2 E2E replay-same-id) + client Redis lock.
- Cross-user isolation: uid-scoped paths (`bookings/{uid}`) + `/me` 401s live.
  Full two-user cross-read test NOT done → NOT PROVEN live (code-PROVEN).
- Recent production evidence: `mailLog` shows real bookings created, receipt
  uploaded, and **cancelled** (admin+customer `sent`) — cancel flow works live.
  Preview/payment-evidence: code-PROVEN + HISTORICAL E2E.

## PHASE 9 — PERFORMANCE (measured, curl, 2026-09-26)
- `/ar`: 200, TTFB **4.71s**, total 5.66s, HTML 285KB.
- `/ar/hotels`: 200, TTFB **3.00s**, total 4.13s, HTML 269KB.
- Hotel detail: 200, TTFB 4.4–6.2s, HTML ~215KB. **HIGH**: SSR TTFB 3–6s
  (upstream `x-hcdn-upstream-rt: 2.6s`) — usable but far from healthy.
- Payload driver: React Flight payload with inlined CMS/Firestore JSON.
  No CDN caching of HTML (`Cache-Control: private, no-cache, no-store`;
  `x-hcdn-cache-status: DYNAMIC`). Images via Firebase Storage
  (`unoptimized: true` seen) — MEDIUM: no Next image optimization on
  heaviest bytes.

## PHASE 10 — CACHING
- Catalog CMS: `revalidate` + tags; cities 60s; sitemap 24h. Appropriate.
- API/booking/user paths: `no-store` everywhere checked. No user/booking/
  payment data cached globally — PROVEN (code + `private, no-store` headers).
- `/api/revalidate`: POST without secret → **401**, GET → **405**. PROVEN.

## PHASE 11 — SEO (live HTML)
- Home: title/desc/canonical (`https://msari.net/ar`)/robots/OG×6/Twitter×3/
  JSON-LD Organization+WebSite/hreflang ar/en/x-default — all present. PROVEN.
- robots.txt: clean (admin/account/booking/api disallows) + sitemap ref;
  sitemap 200 (15KB, section URLs); hotel detail 200 with per-hotel title;
  unknown slugs/rooms → genuine 404. PROVEN.
- Zero `hostingersite/vercel.app/sandbox/localhost` strings in served head. PROVEN.
- Login/register: `noindex` + canonical. PROVEN.

## PHASE 12 — HEADERS (live)
Present: HSTS (63072000, subdomains), X-Frame SAMEORIGIN, nosniff,
Referrer strict-origin, Permissions-Policy, `x-powered-by: Next.js`
(INFORMATIONAL disclosure). **MEDIUM**: production CSP is only
`upgrade-insecure-requests` — the full policy from `next.config.ts`
(XSS defense-in-depth) is NOT enforced in served responses (CDN or config
gap). Mitigated by DOMPurify sanitizer + no `unsafe-eval` in code.

## PHASE 13 — REDIRECTS
`/api/session-redirect` + `/api/auth/redirect` with external,
protocol-relative URLs → 307 to internal `/ar` (never evil); `javascript:` →
403. **PROVEN safe.** Note: Location exposes `https://0.0.0.0:3000/ar`
(internal bind address) — LOW (CDN rewrites in practice; harden anyway).

## PHASE 14 — CONFIG
- `.env.example` carries stale entries (`NEXT_PUBLIC_API_KEY` legacy,
  SUPABASE/DATABASE_URL remnants) — LOW hygiene (values empty; not loaded).
- `middleware.ts` = next-intl locale only; no edge auth (enforcement lives in
  actions/API — verified). `USE_BOOKING_API` default-true in code matches prod.
- No sandbox/test/staging flags in prod paths (grep PROVEN).

## PHASE 15 — HOSTINGER (observed, no host access)
`platform: hostinger / panel: hpanel / Server: hcdn`, HTTPS+HSTS, root 307→/ar,
`npm run start` (custom `server.js`), env-driven config. **UNKNOWN**: Node
runtime version, restart policy, log retention, deploy reproducibility from
panel (no SSH/panel access in this audit — marked, not assumed).

## PHASE 16 — SCALABILITY
- Bounded N+1 PROVEN in direct-fallback list path only (per-hotel rooms read
  for min-price, `hotels.ts:216`, page-bounded; API-primary unaffected).
- Bounded `/hotels?limit=100`, cursor pagination on history/audit. No full
  collection scans in hot paths found. Future risk: SSR TTFB under traffic
  (see HIGH above). No current blocker besides performance headroom.

## PHASE 17 — JOURNEYS (evidence each)
J1 home 200+SEO ✅ / J2 hotels 200 ✅ / J3 hotel detail 200 (after one transient
404 — see finding F-01) ✅ / J4 room select page exists+routes ✅(smoke: valid
200/invalid 404 HISTORICAL) / J5 register 201 live ✅ / J6 login+`/me` live ✅ /
J7 preview code+HISTORICAL / J8 create code+mailLog-recent ✅(no new test
booking per mission rule) / J9 history via API pattern+401s ✅(live list not
re-run) / J10 receipt trigger live-deployed + mailLog ✅ / J11 logout
code-level (NOT PROVEN live) / J12 invalid creds 302+no-cookie, bad tokens 401,
genuine 404s ✅.

## FINDINGS (severity-ordered)
- F-01 MEDIUM: transient 404 on EXISTING hotel (`panorama-hotel`, listed but
  detail 404 once ~20:0xZ, self-recovered 200 ~20:2xZ). Data verified healthy
  (published, not deleted, slug intact). Indicates error-path returning 404
  for transient backend failure. Recommend: 5xx+retry instead of 404; monitor.
- F-02 HIGH: production TTFB 3–6s (measured ×5 across pages).
- F-03 MEDIUM: production CSP reduced to `upgrade-insecure-requests` only.
- F-04 MEDIUM: `MOCK_FLIGHTS` served on production `/flights/search`.
- F-05 LOW: `Location: https://0.0.0.0:3000/...` internal leak on API redirects.
- F-06 LOW: stale `.env.example` entries; per-request `[BOOT-2]` log noise.
- F-07 INFORMATIONAL: `x-powered-by: Next.js` exposed.
- Historical AUTH_SECRET exposure in git history: TRUE, status ROTATED by owner
  2026-09-25 (new value active, site verified working) → residual LOW.
- STOP CONDITIONS: none met (no live secret, no SoT ambiguity, no auth/booking/
  payment regression, no data duplication, no breaking contract).

*— End of audit report. Open items become fix-cycle input only after owner approval.*
