# MSARI Production Cutover — Credential SoT & Missing-Hotels Diagnosis
**No secrets in this file. No code changes made. No DNS/prod changes.**

## Source of Truth per Credential
| Credential | SoT (owner action) | Consumed by (code proof) |
|---|---|---|
| `MSARI_API_KEY` (server) | Partner Control Plane → prod dashboard → production target → create (7 scopes) → shown-once secret | `msari-api.ts` server-only sync (cities ON, hotels SHADOW bg, rooms); backend `apiKeyMiddleware` |
| `NEXT_PUBLIC_API_KEY` | same issuance as above | client sync calls (transitional legacy path) |
| `FIREBASE_*` triple | Firebase console `msariapp-v2` → Service accounts → key JSON | `firebase-admin.ts` env-first init (Direct Firestore reads) |
| `AUTH_SECRET`, `REVALIDATE_*` | operator-generated | sessions, revalidate (already done) |

## Why /ar/hotels Is Empty (dual failure, both config)
1. **API path 401s:** NO production partner key exists (live inventory: 1 record only — `Msari 2`/sandbox). Any API-first call with missing/dead key → 401 (backend burst 17:11–17:12Z correlates). Cities (default ON) and shadow-compares fail into fallbacks.
2. **Direct path empty:** hotels default SHADOW serves Direct Firestore; temp payload has **0 hotel slugs** → Admin SDK uninitialized on Hostinger (triple wrong — prime suspect: `FIREBASE_PRIVATE_KEY` newline mangling — or wrong project/email). Reads degrade silently to empty by design (`firebase-admin.ts` failure policy).

## Minimal Change (operator-side only)
1. Dashboard (prod login) → Partner API → **production** target → create key (7 scopes) → paste shown-once value into Hostinger `MSARI_API_KEY` + `NEXT_PUBLIC_API_KEY` → **redeploy** (NEXT_PUBLIC baked at build).
2. Re-paste Firebase triple carefully (`\n` literals intact, project `msariapp-v2`) → restart (runtime-only, no rebuild needed — but step 1 forces rebuild anyway).
3. Tell me → I re-verify: temp hotels populate + 401 burst stops + cities 200.

## Evidence Before → After
- Before: temp `/ar/hotels` 0 slugs; backend 401×8 burst; prod keys: sandbox-only record.
- After: _(pending operator actions above; re-verification on word)_

## Hostinger Ready for msari.net Test?
**NO — gate correctly held.** Cutover test requires populated hotels + clean API auth on temp first. Nothing in DNS/Vercel/Firebase-prod touched by this diagnosis.
