# MSARI Hostinger Runtime Test Report (isolated local runtime, Node production mode)
**Server:** `node server.js` (`npm start`), PORT honored (3100/3101 tested), 0.0.0.0 bind, `NODE_ENV=production`. Fresh `npm run build` green before run. Server stopped after tests; no production touched.

## Functional Matrix (local runtime → production baseline)
| # | Test | Expected | Actual (local) | Baseline prod | Result |
|---|---|---|---|---|---|
| J1 | Homepage `/ar` | 200 | 200 (7.8s cold) | 200 (2.3s) | ✅ |
| J2 | Hotels `/ar/hotels` | 200 + data | 200 + live Firestore data | 200 | ✅ |
| J3 | Hotel detail `ocean-hotel-aden` | 200 | 200 | 200 | ✅ |
| J4 | Rooms (via detail payload) | data present | rooms arrays present | same | ✅ |
| J5/J6 | Login/Register pages | 200 (forms) | 200/200 | 200/200 | ✅ (submit flow = NextAuth/API, unchanged) |
| J7/J8 | Booking page (logged-out gate) | login gate 200 | 200 gate | same behavior | ✅ |
| J9 | Booking history (logged-out) | 307 login | 307 | same | ✅ |
| J10 | Partner API via site | same endpoints | api-client unchanged; preview proven live earlier | 200s | ✅ (code-identical) |
| J11 | Firebase ops | live data | live hotels/rooms rendered | same | ✅ |
| J12 | NextAuth/session | session endpoints mounted | `/api/auth/*` mounted (redirect matrix below) | live logins proven | ✅ |
| J13 | Redirects (evil absolute) | sanitized `/` | `307 → /` (origin 0.0.0.0:3101) | same code | ✅ |
| J14 | 404 page | 404 status | 404 | 404 | ✅ |
| J15 | Revalidate GET | 405 | 405 + message | 405 prod | ✅ |
| SEO | sitemap/robots | 200 | 200/200 (0.03–0.07s) | 200/200 | ✅ |
| SEO | canonical/hreflang/JSON-LD | present | code-verified (generateMetadata, safeJsonLd, alternates); hreflang Link headers observed on prod | present | ✅ (code+prod) |

## Performance Notes (measured, not browser metrics)
Local cold SSR 7–9s (dev machine, cold Firestore); prod 2.2–3.3s. No FCP/LCP/INP claimed (no browser). Homepage ~312KB transfer (prod). Hostinger single-process runtime will differ (no cold serverless, but shared CPU).

## Security Notes (runtime)
Security headers are code-defined (`next.config.ts`) → identical on Hostinger. Cookies httpOnly/lax/secure-prod unchanged. No secrets observed in responses. Rate limiting per-instance IMPROVES on long-running Hostinger vs serverless spread (documented behavior change, positive).
