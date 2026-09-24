# MSARI — WEB SIGNUP FAILURE: Diagnostic + Safe Fix Report

## 1. Root Cause
Three compounding defects in the website signup chain (all website-side; backend
correct and unchanged). Primary:

- **BUG-A (CRITICAL) — bcrypt pre-hash breaks Unified Identity.** `registerUser`
  (`src/actions/auth.ts`) bcrypt-hashed the password and sent the HASH as
  `password` to `POST /v1/auth/register`. Backend `admin.auth().createUser`
  stores what it receives, so the bcrypt string became the Firebase password.
  Every later plaintext login (web auto-login, web login, app login) fails with
  `INVALID_LOGIN_CREDENTIALS`. Web-created users could never log in anywhere.
- **BUG-B (HIGH) — raw phone breaks `createUser`.** Phone was forwarded
  unnormalized; `createUser` enforces E.164 strictly. Digits without `+`
  (which Zod accepted) → `400 registration-failed: ...E.164...`, no user and no
  profile. The UI placeholder (`+967 7XX XXX XXX`, spaced) even suggests a
  format Zod rejects.
- **BUG-D (MEDIUM) — error-shape mismatch swallows diagnostics.** Backend
  `sendError` returns flat RFC7807 (`{type,title,detail}`), but the web client
  parsed only legacy `{error:{code,message}}` → every server error surfaced as
  generic `HTTP_400 / Request failed`, and the `DUPLICATE_EMAIL` branch could
  never match.
- **BUG-C (observed risk, MEDIUM) — 3.5s client timeout** on a register path
  that runs createUser + Firestore write + IdentityToolkit login sequentially
  (cold starts exceed it) → spurious `TIMEOUT_ERROR`, possibly with the user
  already created server-side (retry → duplicate confusion).

Failure-case classification (§6): BUG-B = CASE 2; BUG-A = CASE 3;
BUG-D = hides all cases; BUG-C = CASE 4/5. Not CASE 1 (no provider/config
mismatch — login works), not CASE 7 as primary.

## 2. Exact Failing Path
`register/page.tsx` → `registerUser` server action → bcrypt(password,12) →
`apiClient.registerUser` → `POST /v1/auth/register {email, password:<bcrypt
hash>, firstName, lastName, phoneNumber:<raw>}` → backend `createUser` (+
`customers/{uid}` + internal hash-login → 201) → frontend `signIn('credentials',
{email, PLAINTEXT})` → `POST /v1/auth/login` → Firebase rejects → user dumped
to `/login` with error; password never works again. With a non-E.164 phone the
chain fails earlier at `createUser` (400).

## 3. Evidence (live, production `msariapp-v2`)
- **R1** `POST /v1/auth/register` phone `967771234567` (no `+`): → **400**
  `registration-failed / "The phone number must be a non-empty E.164 standard
  compliant identifier string."` Zero residue (createUser threw first). Proves
  BUG-B + flat error shape (BUG-D).
- **R3** web-path simulation (bcrypt-hash as password, E.164 phone): register →
  **201** (backend hash-login succeeds); `POST /v1/auth/login` with the
  PLAINTEXT → **401 `INVALID_LOGIN_CREDENTIALS`**. Proves BUG-A (CASE 3).
- **Post-fix chain** (exact fixed payload: plaintext + E.164): register **201**
  → login **200** → `GET /v1/me` **200** with correct `customers/{uid}` profile
  (phone stored E.164) → duplicate retry **400 `...already in use...`** (maps
  to `DUPLICATE_EMAIL` via the fixed parser).
- `npx tsc --noEmit`: clean. `flutter analyze` N/A (no dashboard change).

## 4. App Signup Path (operational + inferred)
App source is not present in accessible paths (`D:\projects` holds only
`msari` functions, `msari_dashboard` admin UI — whose `auth_service` does
admin login only, no user signup; the consumer app is external). From live
evidence — app-created users log in on web via plaintext
`POST /v1/auth/login` → the app creates Firebase users with the
user-chosen PLAINTEXT via the standard client SDK and writes the same
`customers/{uid}` profile the backend `/me` reads. No assumption beyond what
this evidence entails.

## 5. Web Signup Path (audited)
`src/app/[locale]/(auth)/register/page.tsx` (client form, ≥10-char password,
required phone) → `src/actions/auth.ts:registerUser` (Zod → bcrypt → API) →
`src/lib/api-client.ts:registerUser` (`POST /auth/register`, 3.5s timeout) →
backend `index.js:151` (createUser → `customers/{uid}` → IdentityToolkit login
→ 201 `{uid,email,token}`) → `signIn('credentials')` → `auth.ts:authorize` →
`apiClient.loginUser` (`POST /auth/login` + `GET /me`) → JWT session.

## 6. Difference (why app works, web fails)
| | App | Web (before fix) |
|---|---|---|
| Password sent | plaintext (client SDK, TLS) | bcrypt hash (server action) |
| Stored Firebase password | user password | bcrypt string → plaintext login impossible |
| Phone | client-SDK-validated E.164 | raw (spaces / missing `+` → createUser throws) |
| Error surfacing | SDK codes | swallowed to generic HTTP_400 |
| Result | unified identity works | signup fails or creates unusable account |

## 7. Source of Truth
- **Identity:** Firebase Auth, project `msariapp-v2`; UID created by backend
  `admin.auth().createUser` (web path) or client SDK (app path) — one identity.
- **Profile:** `customers/{uid}` (`{uid,firstName,lastName,email,phoneNumber,
  preferredCurrencyCode,profileImageUrl,createdAt}`); written by backend
  register, read by backend `GET /v1/me` (`index.js:265-267`), surfaced on web
  via `loginUser` → `/me`. Same document for app and web users.
- **Login:** `POST /v1/auth/login` (plaintext → IdentityToolkit) → web
  NextAuth `authorize` → JWT session. Unchanged.

## 8. Fix Implemented (website only, minimal)
1. `src/actions/auth.ts` — REMOVED bcrypt pre-hash; password forwarded as
   entered over TLS (Firebase scrypt-hashes server-side, exactly app
   semantics). Added `normalizePhoneE164` (strip separators; `00`→`+`; bare
   `967…`→`+…`; bare Yemeni `7XXXXXXXX`→`+967…`; strict `+\d{7,15}` gate) with
   fail-closed clear Arabic message. Validation errors now surface the FIRST
   field message instead of generic text.
2. `src/schemas/auth.schema.ts` — phone regex relaxed to accept common
   separators (strict E.164 gate stays in the action).
3. `src/lib/api-client.ts` — error parser supports flat RFC7807
   (`type`→code, `detail`/`title`→message) + legacy shape; duplicate variants
   normalized to `DUPLICATE_EMAIL`; optional per-call timeout (register 25s,
   login 15s, default 3.5s unchanged).
No backend, schema, rules, provider, project, booking, payment, CMS, or
Partner-Plane change. No second signup path. No fallback masking errors.

## 9. Files Changed (3, website only)
- `D:\Dev\projects\msari_web\src\actions\auth.ts`
- `D:\Dev\projects\msari_web\src\schemas\auth.schema.ts`
- `D:\Dev\projects\msari_web\src\lib\api-client.ts`
Backend `D:\projects\msari`: untouched (working-tree dirt there predates this
session). Other `msari_web` dirt (`.md` reports etc.) predates this session.

## 10. Security Impact
- Plaintext-over-TLS to first-party API = pre-existing login behavior + app
  behavior; password never stored (no Firestore field), never logged (backend
  logs `error.message` on failure only — Firebase messages echo email, not
  password). Strictly SAFER than before (previously the hash was effectively
  a password-equivalent stored string users could never rotate via login).
- No privilege escalation: `customerData` carries no role; web role resolves
  server-side from `admins` registry (unchanged). No client-controlled roles.
- No secrets/tokens/passwords recorded in this report. Negatives preserved:
  Zod validation, Firebase email/weak-password enforcement, duplicate-email
  controlled error, 401/403 surfacing, rate-limited authorize (untouched).

## 11. Tests
| # | Test | Expected | Actual | Result |
|---|---|---|---|---|
| T1 | Fixed-payload register (plaintext+E.164) | 201+uid+token | 201, uid+token | ✅ |
| T2 | Plaintext login (auto-login equiv.) | 200 | 200 | ✅ |
| T3 | `GET /me` profile | 200 correct doc | 200, E.164 phone | ✅ |
| T4 | Duplicate email | controlled 400 | 400 already-in-use → DUPLICATE_EMAIL | ✅ |
| T5 | Non-E.164 phone (R1) | server reject | 400 E.164 detail; action now pre-validates | ✅ |
| T6 | BUG-A repro (R3, pre-fix shape) | login fails | 401 INVALID_LOGIN_CREDENTIALS | ✅ (root cause proven) |
| T7 | Invalid/weak/empty inputs | Zod controlled | schema unchanged + first-message surfacing | ✅ (code) |
| T8 | No escalation | server roles only | untouched paths | ✅ (code) |
| T9 | Existing-user login regression | unchanged | login path identical except timeout+parser (backward-compat) | ✅ (code) |
| T10 | `tsc --noEmit` | clean | clean | ✅ |

## 12. Production Deployment
NOT yet deployed. Changes are local and uncommitted in `D:\Dev\projects\msari_web`.
Operator step: review diff → commit → push → Vercel build → verify live
(§13). No backend deploy needed (nothing changed there).

## 13. Production Verification (pending deploy)
After deploy, with a fresh test address: web signup → auto-login lands home →
logout → web login → profile shows same data → same credentials log in on the
app → delete test user. Evidence to capture: timestamps, uid, HTTP statuses.

## 14. Test Accounts Created/Removed
- R1 `wstest-r1@example.com`: nothing created (rejected pre-creation). No cleanup needed.
- R3 `wstest-r3@example.com` (uid `KtsmULYqiuhbW9CZXhMykZWRI7l2`): Auth user +
  `customers/{uid}` created, then BOTH deleted; verified `auth/user-not-found`.
- Fix-verify `wstest-fix1@example.com` (uid `xGxdy2gTnugh4nk1HFYKWwSbjq33`):
  created, verified, then BOTH deleted; verified `auth/user-not-found`.
No real users touched. No production credentials touched. Temp scripts live
outside repos (`Temp\opencode\msari_*.js`) and contain no live secrets (test
accounts deleted; tokens revoked with them).

## 15. Remaining Risks
- LOW: `normalizePhoneE164` assumes Yemen (`+967`) for bare 9-digit
  `7XXXXXXXX` — documented, matches site locale/currency/placeholder; explicit
  `+<cc>` input always wins.
- LOW: 25s/15s timeouts are heuristic (cold starts); failures now surface real
  messages instead of generic ones.
- INFO: pre-existing backend `FIREBASE_WEB_API_KEY` is hardcoded in
  `functions/index.js:35`; pre-existing `.env` holds live secrets — both
  untouched, flagged for separate hardening.
- INFO: `bcryptjs` remains a dependency (only the register import removed;
  login guard in `auth.ts` keeps using it).

## 16. Supervisor Verdict
Self-challenge: root cause proven live (not inferred); fix is minimal and
website-confined; Unified Identity preserved (same Auth project, same
`customers/{uid}`, same login path the app uses); security negatives intact;
all test accounts cleaned. Independent supervisor sign-off + post-deploy
browser verification still pending → **`CONDITIONAL PASS`**. No unresolved
Critical/High in code; no STOP condition triggered (no migration, schema,
rules, or contract change required).

`STOP`
