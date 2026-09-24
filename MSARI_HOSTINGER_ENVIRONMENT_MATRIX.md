# MSARI Hostinger Environment Matrix (values NEVER printed — names + handling only)

| Variable | Purpose | Build? | Runtime? | Client? | Server-only? | Prod available? | Safe on Hostinger? | Risk |
|---|---|---|---|---|---|---|---|---|
| `PORT` / `NODE_ENV` | server bind / prod mode | no | yes | no | n/a (runtime) | platform-set | yes — Hostinger injects PORT; `server.js` honors it, binds 0.0.0.0 | none |
| `NEXT_PUBLIC_SITE_URL` | canonical/SEO base | yes (baked) | — | YES | no | yes (`msari.net`) | yes, but MUST be overridden to temp domain or canonicals point at msari.net | MEDIUM if forgotten |
| `NEXT_PUBLIC_API_BASE_URL` | Partner API endpoint | yes | — | YES | no | yes | yes (public URL, not secret) | none |
| `NEXT_PUBLIC_API_KEY` | legacy transitional key | yes | — | YES | no | yes | yes, but rotate to sandbox-scoped value for isolation tests | LOW |
| `NEXT_PUBLIC_FIREBASE_API_KEY` / `FIREBASE_API_KEY` | IdentityToolkit (password reset) | — | yes | publishable | no | yes | yes (publishable client key by design) | none |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Admin SDK project select | — | yes | YES | no | yes | yes (identifier, not secret) | none |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | storage bucket select | — | yes | YES | no | yes | yes | none |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | contact link | yes | — | YES | no | yes | yes | none |
| `FIREBASE_PROJECT_ID` | Admin SDK project | — | yes | no | YES | yes | yes — set as Hostinger env | none |
| `FIREBASE_CLIENT_EMAIL` | Admin SDK identity | — | yes | no | YES | yes | yes — Hostinger env | LOW (identifier; useless without private key) |
| `FIREBASE_PRIVATE_KEY` | Admin SDK auth (`\n`-escaped, handled in code) | — | yes | no | YES | yes | yes — Hostinger env (multiline paste supported; verify `\n` preserved) | HIGH if mishandled — test admin read on boot |
| `GOOGLE_APPLICATION_CREDENTIALS` | alt key-file path | — | yes | no | YES | local-only | DO NOT SET on Hostinger (no file); rely on the three vars above | none if unset |
| `MSARI_API_KEY` | server-to-server website credential | — | yes | no | YES | yes | yes — Hostinger env, never `NEXT_PUBLIC_*` | none |
| `AUTH_SECRET` | NextAuth session encryption | — | yes | no | YES | yes (rotated) | yes — MUST set or sessions break; generate fresh, never reuse prod value in docs | HIGH if missing/wrong |
| `AUTH_URL` | NextAuth base URL | — | yes | no | YES | was localhost-bug source | **MUST be `https://<hostinger-temp-domain>`** or auth redirects break (proven incident) | CRITICAL if wrong |
| `REVALIDATE_SECRET_TOKEN` | cache invalidation auth | — | yes | no | YES | yes | yes — Hostinger env (POST body only) | none |
| `MSARI_API_*_MODE`, `USE_BOOKING_API`, `MSARI_API_CANARY_RATIO` | migration gates (safe defaults) | — | yes | no | YES | optional | omit → safe defaults (Direct/SHADOW) | none |
| `UPSTASH_REDIS_REST_URL/TOKEN` | rate limiting (degraded without) | — | yes | no | YES | absent (accepted risk) | optional — same degraded behavior; add when provisioned | LOW (documented) |
| `DATABASE_URL/DIRECT_URL`, Supabase keys | legacy Supabase paths | — | unused? | mixed | — | present locally | DO NOT SET unless a route proves need (unused by audited flows) | LOW (reduce surface) |

Rules: never commit `.env`; never prefix server secrets with `NEXT_PUBLIC_`; multiline private key must retain `\n` escapes; `AUTH_URL` must exactly match the public origin served.
