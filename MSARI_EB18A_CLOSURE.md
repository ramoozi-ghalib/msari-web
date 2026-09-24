# MSARI — Closure: `msari-eb18a` Out of Scope (FINAL)

**Date:** 2026-09-24
**Decision:** CLOSED — PERMANENT. No reopen.
**Ordered by:** Project owner (explicit instruction: `msari-eb18a` has no relation to the website).

## 1. Finding
- Zero code references to `msari-eb18a` in `msari_web` source, config, or env
  (`src/`, `package.json`, `.env.example`, deploy configs): grep over
  `*.{ts,tsx,js,json,env,example}` returns **no matches**.
- All 26 matches for `msari-eb18a` are in historical Markdown reports only,
  where it was labeled "intended staging" Firebase project for Cloud Functions
  (Phase 4/5 backend staging gate).
- Website truth (CORRECTED 2026-09-24 — an earlier revision of this file wrongly
  said "Vercel"; that was stale info from the Step 2 era): production is the
  **Hostinger Node.js app** serving **`https://msari.net`** via custom
  `server.js` (`HOSTNAME 127.0.0.1`, `PORT 3000`, Nginx proxy — see
  `docs/deployment/HOSTINGER_ENVIRONMENT.md` and merge `f02d527`
  release/hostinger-proof). The Vercel project is **cancelled/retired** and plays
  no role. `msari-eb18a` is not wired anywhere in this repo and is not a
  dependency of any serving path (Hotels/Cities/Rooms API-first, auth, booking).

## 2. Resolution
- `msari-eb18a` (Spark plan, cannot deploy Functions v2) is **removed as a blocker**
  for `msari_web`. Historical report mentions (Master Plan §2/§4, Phase 4 final,
  Phase 4/5 correction + syntax cleanup, Staging Gate, Phase 6 gate, Remaining
  Data Matrix) are **frozen evidence** — not edited — and superseded by this file.
- Website staging discipline going forward: **Hostinger TEMP subdomain
  (`*.hostingersite.com`) + production smoke on `msari.net`**. No Firebase
  staging project required for `msari_web`.
- Backend (separate `functions/` repo on `msariapp-v2`) keeps its own staging
  policy outside this repo; if it ever needs one, it will be tracked there —
  never again as a `msari_web` blocker.

## 3. Standing orders
- Do NOT re-open `msari-eb18a` tasks in this repo.
- Do NOT gate website releases on it.
- Booking-email work stays **on hold pending explicit owner approval** (separate item).
