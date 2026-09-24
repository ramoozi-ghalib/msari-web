# MSARI Hostinger Compatibility Report + Migration Risk Register

## 1. Static Compatibility: COMPATIBLE
- **Scripts:** `dev/build/start` standard; `start` → `node server.js` (custom server already Hostinger-ready: PORT env, 0.0.0.0, crash logging). Set Hostinger start command to `npm run start` (or `node server.js`).
- **Next.js 16.3.3 / React 19 / Node 22.x:** meets engine needs; no Edge runtime (`runtime='edge'` zero hits); middleware is next-intl only (runs on Node).
- **Vercel independence:** zero `VERCEL_*` env refs; zero Vercel functions/cron/KV; single `@vercel/speed-insights` client import (graceful off-Vercel degrade, INFO).
- **Firebase:** client via publishable config; Admin via env triple (project/email/key with `\n` handling) + degraded-by-design fallbacks; Firestore/Storage/Auth/Functions all plain SDK calls (no Vercel bindings).
- **next.config:** headers/redirects/rewrites are framework-level (portable); image remotePatterns portable.

## 2. Required Changes (all config, zero code so far)
| # | Change | Class | Notes |
|---|---|---|---|
| 1 | Set Hostinger env vars per Environment Matrix | Required for Hostinger | ~12 server vars + publishables; critical: `AUTH_URL=https://maroon-curlew-474903.hostingersite.com`, `NEXT_PUBLIC_SITE_URL` same |
| 2 | Start command `npm run start`, Node 22.x, root `./`, build `npm run build` | Required for Hostinger | matches panel screenshots |
| 3 | Generate FRESH `AUTH_SECRET` for Hostinger (never reuse prod) | Required/Security | sessions must not validate cross-host |
| 4 | Verify `FIREBASE_PRIVATE_KEY` multiline preserved | Required | test one admin read post-deploy |
| 5 | `NEXT_PUBLIC_API_BASE_URL` (public URL, unchanged) | Required | same Partner API |

## 3. Blockers: NONE in code. Operational prerequisites (owner/panel):
- Panel env-var limits unknown from here (verify count/size fit).
- Process/RAM/CPU/build-timeout limits unknown (verify against ~3-5min build, 300MB+ transfer evidence).
- Cron/background: none required by app (no vercel.json crons found — confirm none expected).
- CDN/SSL/autodeploy/rollback/logs: panel-side, record actuals at deploy.

## 4. Risk Register
| ID | Risk | Severity | Mitigation |
|---|---|---|---|
| R1 | `AUTH_URL`/canonical left pointing at msari.net | HIGH | matrix mandates temp-domain values; verify post-deploy |
| R2 | Private-key newline mangling | HIGH | verify admin read; keep file-path option as fallback |
| R3 | Session/secret reuse across hosts | MEDIUM | fresh AUTH_SECRET per environment (mandated) |
| R4 | Slower/pooled runtime vs serverless | MEDIUM | runtime matrix re-run on temp domain; compare §11 baselines |
| R5 | Rate limiting behaves per-process (stronger, stickier bans) | LOW | same code; acceptable, note ban durations |
| R6 | Speed Insights beacon to Vercel | INFO | harmless; remove later if desired |
| R7 | `lat/lng:"$undefined"` data gaps | INFO | pre-existing, host-independent |

## 5. Supervisor Gate (independent, read-only)
- Re-verified: server.js PORT/host logic, firebase-admin env-first chain, zero edge/Vercel refs (re-grepped), env enumeration completeness (25 vars), local runtime matrix, prod baselines.
- Challenges: (1) «Does `npm start` survive Hostinger process mgmt?» — standard `listen()` + error handlers; panel must keep alive (their contract). (2) «Anything Vercel-only at runtime?» — searched; none functional. (3) «Secrets safe?» — matrix enforces server-only; no values recorded.
- Structural disclosure: same-agent execution; owner countersignature completes human sign-off.

## FINAL DECISION
**B. HOSTINGER COMPATIBLE WITH REQUIRED CHANGES** — code is portable as-is; only panel env/start-command configuration required (§2). NOT a migration recommendation: no DNS switch, no Vercel teardown. Temp-domain deployment + runtime re-run (§11 matrix) by the operator (panel access) is the remaining proof before any production discussion.

`STOP`
