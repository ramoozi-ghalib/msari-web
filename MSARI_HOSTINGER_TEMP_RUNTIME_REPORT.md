# MSARI Hostinger Temp-Domain Runtime Verification Report
**Target:** `https://royalblue-kudu-303278.hostingersite.com` (read-only probes + sandbox API tests; zero prod writes; zero secrets handled).
**Critical context:** temp domain serves STALE `main`-branch code (all post-Sept-18 fixes uncommitted locally). Results below describe the DEPLOYED artifact, not the current tree.

## Runtime Matrix (temp domain)
| ID | Test | Expected | Actual | Status |
|---|---|---|---|---|
| J1 | Homepage `/ar` | 200 | 200 (7.3s cold) + correct Arabic RTL render (operator screenshot) | ✅ |
| J2 | Hotels `/ar/hotels` | 200 + data | 200 + live data | ✅ |
| J3 | Hotel detail (+room URL) | 200 | 200/200 (3.5–5.4s) | ✅ |
| J4 | Rooms payload | data | rooms arrays in payload | ✅ |
| J5/J6 | Login/Register pages | 200 forms | 200/200 | ✅ (submit untested — no browser automation) |
| J7/J8 | Booking gate | login gate 200 | 200 | ✅ |
| J9 | History logged-out | 307 login | 307 | ✅ |
| J10 | Partner API via site | wired | bundle probe inconclusive; server reads live | ⚠️ NOT PROVEN |
| J11 | Firebase ops | live data | live catalog rendered | ✅ |
| J12 | NextAuth/session | mounted | endpoints mounted; full flow needs browser | ⚠️ operator-pending |
| J13 | Redirect evil (both routes) | sanitized `/` | **307 → evil (BOTH)** — stale code, fixes uncommitted | ❌ FAIL (stale) |
| J14 | 404 | 404 status | 404 | ✅ |
| J15 | Revalidate GET | 405 | **401 (old contract)** — stale code | ❌ FAIL (stale) |
| SEO | sitemap/robots | 200 | 200/200 | ✅ with findings below |
| SEO | canonical | temp domain | 22 temp refs ✅ BUT 4 hardcoded prod refs (author link + `og:url`) | ⚠️ |
| SEO | sitemap URLs | temp | **73/73 point to `msari.net`** (built pre-env) | ❌ FAIL (stale build) |
| SEO | hreflang | present | ar/en/x-default (temp URLs) | ✅ |
| SEC | headers | app CSP | **WEAKENED: only `upgrade-insecure-requests`** (app CSP absent — Hostinger edge override suspected) | ⚠️ |
| SEC | cookies | httpOnly/lax/secure | `NEXT_LOCALE` lax+secure observed | ✅ |
| SEC | HTML secrets scan | none | none (no key/token markers) | ✅ |
| PERF | cold/warm TTFB | observed | 7.3s cold / 0.9–5.9s mixed (no browser metrics claimed) | ✅ observed |
| AUTH | sandbox register via API | 201 | **400 INVALID_LOGIN_CREDENTIALS** — backend hardcodes PROD `FIREBASE_WEB_API_KEY` (index.js:35) for internal login; sandbox users unknown to it | ❌ FAIL (backend, affects Lovable too) |
| AUTH | login/logout/session | — | operator browser tests pending | ⚠️ |

## New Findings (beyond stale code)
- **F-BACKEND-AUTH-KEY (HIGH):** `/v1/auth/{register,login,refresh}` use a hardcoded production IdentityToolkit key → sandbox user auth via API impossible (register creates user+profile then 400s; orphaned users result). Lovable MUST use client-SDK auth + Bearer calls until backend reads per-env key. No data loss (reads/writes before the login step persist by design); orphan cleanup noted.
- **F-CSP (MEDIUM):** temp domain strips app CSP to edge default. Verify panel header settings / proxy behavior.
- **F-OG (LOW):** homepage `og:url` + author hardcoded to prod; harmless on temp (temp must not be indexed) but must be dynamic before any production move.
- **F-SITEMAP (LOW on temp):** temp sitemap lists prod URLs — correct outcome for a non-indexable test host, but proves build-time env gap.

## Production Safety
Zero mutating calls to production in this verification (all GETs + sandbox-scoped tests). No prod bookings/users/payments created. msari.net/Vercel/Firebase-prod untouched (status verified in prior missions; Vercel spend-cap outage is external, pre-existing).

## Limits Observed (Hostinger)
Process stays alive across sequential loads ✅ (stability). RAM/CPU/build-timeout/quotas: NOT EXPOSED — UNKNOWN (panel-side). Deploys: operator-driven (GitHub branch) ✅ observed working.
