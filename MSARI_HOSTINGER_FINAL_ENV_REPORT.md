# MSARI Hostinger Final Environment Manifest (SUPERVISOR VERIFIED)
**No secret values in this document — names, classification, and sources only.**
Temp domain (OPERATOR-CORRECTED 2026-09-22, supersedes mission brief):
`https://royalblue-kudu-303278.hostingersite.com` (referred below as `TEMP`).

## Classification Legend
- **REQUIRED** — temp deployment fails/misbehaves without it.
- **REQUIRED_WITH_SANDBOX_VALUE** — required, and MUST be a sandbox/dev value (never production).
- **OPTIONAL** — safe defaults exist; set only for parity.
- **DO_NOT_COPY** — must not be copied (legacy/unused/platform-owned).

## Manifest
| Variable | Class | Build/Runtime | Client/Server | Value source |
|---|---|---|---|---|
| `AUTH_URL=https://<TEMP>` | REQUIRED | Runtime | Server | operator types temp domain |
| `NEXT_PUBLIC_SITE_URL=https://<TEMP>` | REQUIRED | **Build** (baked; must precede build) | Client | operator types temp domain |
| `AUTH_SECRET` (fresh, Hostinger-only) | REQUIRED | Runtime | Server-only | operator GENERATES fresh (never reuse prod) |
| `FIREBASE_PROJECT_ID=msari-sandbox` | REQUIRED_WITH_SANDBOX_VALUE | Runtime | Server | fixed string (this doc) |
| `FIREBASE_CLIENT_EMAIL` (sandbox SA) | REQUIRED_WITH_SANDBOX_VALUE | Runtime | Server-only | operator creates SA key in console, enters fields |
| `FIREBASE_PRIVATE_KEY` (sandbox SA) | REQUIRED_WITH_SANDBOX_VALUE | Runtime | Server-only | same as above (`\n` preserved) |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID=msari-sandbox` | REQUIRED_WITH_SANDBOX_VALUE | Runtime | Client (publishable) | sandbox sdkconfig (operator re-pulls) |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` (sandbox) | REQUIRED_WITH_SANDBOX_VALUE | Runtime | Client | sdkconfig |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` (sandbox) | REQUIRED_WITH_SANDBOX_VALUE | Runtime | Client | sdkconfig |
| `NEXT_PUBLIC_API_BASE_URL` (sandbox API URL) | REQUIRED_WITH_SANDBOX_VALUE | Build | Client (public URL) | fixed: sandbox cloudfunctions URL (in contract doc) |
| `NEXT_PUBLIC_API_KEY` (sandbox partner key) | REQUIRED_WITH_SANDBOX_VALUE | Build | Client (see note) | operator-held Lovable key OR dedicated temp key |
| `MSARI_API_KEY` (same sandbox key) | REQUIRED_WITH_SANDBOX_VALUE | Runtime | Server-only | same as above |
| `REVALIDATE_SECRET_TOKEN` (fresh) | REQUIRED | Runtime | Server-only | operator generates fresh |
| `USE_BOOKING_API=true` | OPTIONAL | Runtime | Server | literal (exercises API path; default already true) |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | OPTIONAL | Build | Client | omit → code fallback |
| `MSARI_API_*_MODE`, `MSARI_API_CANARY_RATIO` | OPTIONAL | Runtime | Server | omit → safe defaults |
| `UPSTASH_*` | OPTIONAL | Runtime | Server-only | omit → documented degraded mode |
| `NODE_ENV`/`PORT` | DO_NOT_COPY | platform | — | Hostinger injects |
| `GOOGLE_APPLICATION_CREDENTIALS` | DO_NOT_COPY | — | — | no file on Hostinger; env triple instead |
| `DATABASE_URL/DIRECT_URL`, Supabase keys | DO_NOT_COPY | — | — | unused by audited flows |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | OPTIONAL | Runtime | Client | publishable; omit unless password-reset tested |

**Note on `NEXT_PUBLIC_API_KEY`:** publishable *identifier of access* — the key must still be treated as a credential (server logs/URLs hygiene); sandbox-scoped so blast radius is the sandbox project.

## Supervisor Verification (manifest gate)
- Every variable has exactly one class above. Build-time items flagged (must precede `npm run build`).
- No legacy/unused variable copied. Platform-owned items excluded.
- Sandbox-vs-production separation enforced per row; production values appear NOWHERE in this plan.
- Operator enters ALL secret values directly into Hostinger; team handles none.
- **Manifest status: VERIFIED — deployment may proceed on operator action.**

`GATE OPEN FOR OPERATOR DEPLOY`
