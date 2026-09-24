# MSARI_PHASE_2C_P0_PEPPER_BINDING_VERIFICATION.md

> Verification only. No code modified. No secrets created/viewed/printed.
> No deployment executed. No credentials issued.
> Result scale: PROVEN / NOT PROVEN / FAILED (single overall verdict below).

---

## 1. Code side — PROVEN

- `process.env.CREDENTIAL_PEPPER` is the **only** source: exactly 1 read site
  (`partnerAuth.js` `getPepper()`); no `defineSecret`/`runWith` coupling required;
  no fallback/default pepper anywhere; hardcoded-pepper grep = 0; pepper-in-logs = 0.
- Absent pepper → new-model verification returns 500 fail-closed (suite B1a PROVEN);
  legacy path byte-identical (B1b PROVEN). No `NEXT_PUBLIC` anywhere in functions.
- Note: functions are v1 API (`functions.https.onRequest`), which supports secret
  mounting **without code changes** — no code modification is required for binding.

## 2. Live binding (Secret Manager → env of `api`) — NOT PROVEN

- Attempted read-only inspection (`gcloud functions describe api --region=us-central1`):
  **403 `cloudfunctions.functions.get` denied** for this identity. IAM/service-account
  check equally inaccessible.
- No repo-side deployment config exists to inspect (no workflows; `firebase.json` has no
  functions runtime config). v1 mounting is console/CLI-side, leaving no repo trace by design.
- Therefore the mount itself **cannot be confirmed from here**.

## 3. Required deployment configuration (not executed)

Owner action only — mount without touching code:
`gcloud functions deploy api --region <region> --update-secrets CREDENTIAL_PEPPER=<secret-name>:latest --project msariapp-v2`
(or Console → Function → Variables → Secrets → add `CREDENTIAL_PEPPER`), plus grant the
function's runtime service account **only** `roles/secretmanager.secretAccessor` on that
single secret (least privilege). Verify afterwards with the describe command above
(expect `secretEnvironmentVariables: [{key: CREDENTIAL_PEPPER, ...}]`).

## 4. IAM least-privilege — NOT PROVEN (same 403 barrier)

Owner must confirm the runtime SA holds accessor on this secret alone — exact check commands
provided above; not runnable with current permissions.

## 5. Overall verdict: **NOT PROVEN**

Code consumption is PROVEN correct and fail-closed; live Secret→env binding and IAM scoping
are unverifiable from available access and no secret value was (or will be) handled here.
Nothing in code blocks binding — the remaining step is a one-line owner-side mount.

**NOT READY FOR CANARY on pepper grounds until the mount + IAM check are confirmed by the owner.
STOP — no further action taken.**
