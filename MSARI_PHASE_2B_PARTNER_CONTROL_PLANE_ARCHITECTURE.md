# MSARI_PHASE_2B_PARTNER_CONTROL_PLANE_ARCHITECTURE.md

> READ-ONLY design + decisions. NOTHING modified/created (except this file)/deleted/deployed/migrated.
> No credentials issued/rotated. No secrets displayed. Evidence: `D:\projects\msari\functions\index.js`
> (single `exports.api`, 987 lines), `docs/architecture/api-contract-v1.md`, `firestore.rules:58-59`,
> `msari_web` repo, live 401 probes. Grades: PROVEN / INFERRED / UNKNOWN / DECISION REQUIRED.

---

## 1. Partner Domain Model (target)

`Partner { id, name, type(first|external), status: active|suspended|deactivated|deleted, environments: [sandbox|production], commercialPlanId, createdAt, updatedAt, metadata }`.
Lifecycle: create(draft)→verify→activate→suspend↔activate→deactivate (terminal; never hard-delete while
bookings/commission reference it — retention by reference). Audit every transition.
Distinctions: **Partner** = organization identity; **Credential** = secret bound to partner+environment;
**User** = Firebase Auth end customer; **End Customer** = traveler on a booking (may differ from booker);
**Admin** = platform operator (existing `admins` registry).

## 2. Credential Model (target, scoped — B from Phase 2A)

`Credential { id, partnerId, environment, keyPrefix (e.g. `msari_live_XXXX` — lookup/display
identifier only, never a secret), secretHash (HMAC-SHA-256 with a server-side pepper/key held outside
Firestore — Secret Manager recommended; never plaintext), scopes: string[], status, expiresAt (nullable),
createdAt, revokedAt, lastUsedAt, createdByAdminId }`.
- **DECISION (Amendment 1 — binding): Credential lookup must not depend on plaintext secret storage.**
  Final flow: Credential presented → credential identifier / key prefix → credential metadata lookup →
  server-side HMAC-SHA-256 verification → constant-time comparison → status → expiry → environment → scopes.
  The secret itself is never a Firestore lookup key; plaintext appears exactly once, at issuance.
- Storage: **hash-only** (pepper/key in Secret Manager); verification server-side, constant-time; no
  plaintext storage; no secret retrieval after issuance. High-entropy cryptographically random secrets.
  (Amendment 2: HMAC-SHA-256 — Argon2/password-hashing not proposed; no architectural reason to differ.)
- Show-once: plaintext returned exactly once at issuance, never stored or re-displayed.
- Multi-credential per partner: YES (rotation overlap + env separation require it).
- Leak response: immediate revoke; audit event; reissue; investigate usage window.
- **DECISION (Amendment 3 — binding): revocation is near-instant, especially for sensitive operations
  (`bookings:create`, `bookings:cancel`, payment operations, sensitive reads).** Any credential-authorization
  cache must bound revoked-credential usability to an unacceptable-window of effectively zero for those
  operations. Distinguish: **metadata cache** (tolerable, short TTL) vs **authorization status**
  (must reflect revocation near-instantly on the sensitive path). Target behavior only; no implementation.

## 3. Credential Lifecycle

`CREATE (admin, show-once) → ACTIVE → ROTATE (new credential ACTIVE, old short overlap ≤24h, then REVOKED)
→ REVOKED (terminal, never reactivated; 401 immediately) → EXPIRED (time-driven, renewable by reissue)`.
Sandbox vs Production: disjoint namespaces (`msari_test_` vs `msari_live_`), sandbox keys rejected in
production and vice versa. Actors: create/revoke/rotate = admin-only via Control Plane API (never direct
Firestore edits — business authorization must wrap admin writes).

## 4. Scope Model (resource-bound, no bare read/write — Amendment 5 payment terms binding)

- READ: `hotels:read, rooms:read, destinations:read, offers:read, currencies:read, images:read`
  (images = URL fields inside hotel/room payloads, not a separate endpoint).
- WRITE: `bookings:create, bookings:read (own partner's), bookings:cancel (own, pending only)`.
- SENSITIVE: `payments:read-status` (receipt/payment status only — NOT payment processing),
  `payments:submit-evidence` (receipt/proof submission only — NOT creating a payment transaction),
  `users:read` (minimal traveler fields).
- Terminology declared (Amendment 5): (A) payment evidence/receipt submission ≠ (B) initiation with an
  external rail/provider ≠ (C) status ≠ (D) confirmation/rejection ≠ (E) bank/internal financial data.
  If the current system lets a partner upload proof only, no permission name may imply processor
  authorization. Endpoints/implementation unchanged.
- ADMIN: `bookings:confirm, partners:manage, keys:manage` (platform only, never granted to partners).
- `bank_accounts`: **DENY for partners** (admin/internal only — no justification exists for exposure).

## 5. Partner Authorization Pipeline (target placement: gateway middleware)

`Request → credential identifier/prefix lookup → server-side HMAC-SHA-256 verification (constant-time) →
credential status → expiry → environment match → scope check (endpoint requires scope; 403 otherwise) →
resource auth (owner/admin rules, existing booking logic reused) → rate limit → business logic →
response (+ request ID)`.
Cross-partner/user/payment access denied by default; `bookings:read` ≠ `users:read` (separate scopes).
Revocation is near-instant on sensitive paths (Amendment 3); metadata cache never overrides status.

## 6. Booking Actor/Owner Model (P0 decision — Amendment 4 identities binding)

- **Partner** = organization / access identity. **Credential** = technical authentication identity.
  **Actor** = the credential making the request. **Booker** = party submitting the booking request
  (may be partner on behalf of a customer, or the customer directly). **Customer / Owner** = account/entity
  that owns the booking **according to the existing booking model** (`customerId`). **Traveler** = person
  actually traveling.
- Do NOT assume `customerId` = traveler. Do NOT assume `customerId` = partner. Do NOT change the current
  meaning of `customerId` in Phase 2B.
- **GATE: Phase 2C MUST verify existing booking semantics before introducing or interpreting additional
  identity fields.** `partnerId` on booking remains **additive attribution/access metadata** and must never
  break booking ownership semantics.
- Partner books *on behalf of* an end customer: request carries traveler details; booking stores `partnerId` (attribution, new field —
  additive, non-breaking) + `customerId`.
- Partner MAY: create (own-attributed), read own, cancel own-pending, submit payment receipt, see price
  totals + own commission. Partner MAY NOT: read others' bookings, confirm/reject (admin-only, keep),
  see full customer PII beyond fulfillment minimum, see bank internals.
- `actorId` (credential) needed for audit; `customerId` for ownership; `bookingId` = bookingNumber.

## 7. Idempotency (target; current: 0 hits — none exists)

Policy: client-supplied `Idempotency-Key` header on `POST /v1/bookings` (+ payment POST). Scope: per
partner+endpoint; TTL 24h; store key→response snapshot; replay returns original response (200, not
re-execution); duplicates detected before txn. Backend store: Firestore `idempotency/{hash}` with TTL
delete. Does not alter current semantics until implemented (Phase 2C).

## 8. Rate Limiting (target; current: doc-only, code 0)

Model: **per-credential token buckets** (burst + sustained), endpoint cost weights (reads 1, writes 5),
global abuse floor per IP. Website SSR credential gets high shared quota; Lovable/partners get contracted
quotas; one partner cannot starve others (isolation by key). 429 + `Retry-After` + headers
(`X-RateLimit-*`) + metered hits. Home: gateway middleware (Upstash Redis already in web stack as pattern).

## 9. Usage Metering (target; current: 0)

Record: partnerId, credentialId prefix, endpoint, status class, latency bucket, timestamp; NO payloads,
NO secrets. Store: aggregated counters (hourly/daily per partner+endpoint) + 7-day raw sample; retention
90d aggregates, 7d raw. Split: operational logs (debug) vs usage metrics (counters) vs billing/commission
records (derived monthly) vs audit events (security, immutable).

## 10. Audit Model (target; current: 0)

Events: credential.created/rotated/revoked, partner.suspended, scope.changed, booking.created/updated,
payment.initiated, auth failures spike. Fields: actor(admin/credential), partnerId, credential prefix
(never secret), action, resource+resourceId, timestamp, outcome, request ID. Payloads redacted by default.

## 11. Commission / Attribution Boundary (Amendment 7 — binding)

**DECISION: Partner identity ≠ Commission account**, unless the commercial system decides so explicitly.
Partner attribution: `Partner → Booking → Attribution`; the commission domain stays separate.
Never route commission calculation through authorization middleware.
`req.affiliate` today = whole key record, consumed nowhere → it must become **Attribution identity**:
`Partner → (partnerId stamped on booking at create) → Booking → Commission (derived offline/monthly)`.
Partner ≠ Commission Account necessarily: partner is access identity; commission is commercial terms on the
commercial plan. Commission computation is **out of API Phase 2B scope** (finance domain, separate decision).

## 12. Payment Security Boundary (Amendment 5 meanings apply)

- Partner-accessible: payment **evidence submission** (`payments:submit-evidence`), read own booking payment
  **status** (`payments:read-status`).
- Admin-only: confirmation/rejection, bank account records, receipt contents review.
- Internal-only: bank credentials, transfer rails, actual payment processing.
- `bank_accounts` stays non-partner resource (DENY). Receipt Storage objects: partner-readable only via
  signed, short-lived URLs for own bookings (target; current public-URL model flagged, unchanged now).

## 13. User Data Boundary (least privilege)

Partner sees per own booking: traveler name/phone (fulfillment), totals. NOT: email unless required,
other bookings, customer list, full profiles. `bookings:read` explicitly excludes `users:read`.

## 14. Dashboard Control Plane (target functions; no UI built — Amendment 8 binding)

Partners (create/activate/suspend/deactivate), Credentials (issue/show-once/revoke/rotate/inspect
metadata), Scopes (grant/revoke), Limits (configure/inspect), Usage (view), Audit (inspect).
Architecture: Dashboard → admin session → **Control Plane service** (new, authorized; owns key material
+ hashing) → Firestore. Dashboard must NOT write `api_keys` directly (would bypass lifecycle/audit).
**DECISION: the Dashboard never writes `api_keys`, partners, credentials, scopes, or audit directly to
bypass lifecycle/business authorization.** Target chain: Dashboard → Admin Authentication/Authorization
→ Control Plane Service → Partner IAM domain → Firestore. Any direct Firestore access observed today is
an implementation detail, not target architecture. No Rules changes now.

## 15. Firestore Data Model (logical only — no changes made)

Keep `api_keys/{id}` (lookup by **key prefix / credential ID**, never by plaintext secret; add composite
`prefix+status` consideration at implementation). Add: `partners/{partnerId}` (profile+plan ref),
`partner_credentials/{credId}` (hash, scopes, status, expiry, usage pointers) OR nest under partner
(prefer subcollection for IAM locality), `partner_audit/{autoId}` (append-only, TTL 1y),
`partner_usage_daily/{partnerId_YYYYMMDD}` (counters). Indexing: equality on hash/status (cheap);
lookup path single-doc-or-bounded. Retention: audit 1y, usage raw 7d.

## 16. Secret Storage — RECOMMENDATION: HMAC-SHA-256 server-side + pepper in Secret Manager

Compare: plaintext (REJECT — breach = total compromise), env vars (no per-key granularity — REJECT),
Secret Manager per secret (operationally heavy at scale — DEFER), **HMAC-SHA-256 with a server-side
pepper/key held outside Firestore — Secret Manager recommended (ADOPT)**: verification server-side with
constant-time comparison, no plaintext storage, no secret retrieval after issuance, cryptographically
random high-entropy secrets. No live secrets extracted or displayed in this review.

## 17. Environment Model (Amendment 9 — isolation is not naming)

`sandbox` vs `production`: separate key prefixes, separate base URLs (path or host split — DECISION),
sandbox bookings flagged non-operational + payments disabled, data: shared catalog reads allowed, writes
sandbox-only. Cross-env key use → 401.
**DECISION: a sandbox credential ≠ a production credential, and prefix alone does not guarantee isolation.**
`msari_test_` / `msari_live_` are identifier conventions only. The security boundary MUST be: credential
metadata + environment binding + API environment + authorization enforcement — never naming alone.

## 18. Website Credential Model (target — Amendment 10 binding)

**DECISION: the Browser MUST NOT contain Partner/API credential.** Target: Website Server → server-side
MSARI credential → gateway. `NEXT_PUBLIC_API_KEY` must NOT serve as Partner credential in the final design.
No website changes in this phase.
Web SSR → server-side credential (env, never `NEXT_PUBLIC_*`) → gateway. Browser holds zero partner
credential. Migration keeps current behavior first (same key value class, moved server-side), then scopes.
No change made now.

## 19. Mobile / Lovable (decisions, no builds)

- Mobile later: user Bearer (exists) + app-identity (DECISION: Firebase App Check vs embedded app key).
- Lovable onboarding (future): 1 create Partner → 2 issue credential → 3 grant scopes → 4 assign env →
  5 base URL → 6 docs → 7 monitor → 8 revoke path. Nothing executed.

## 20. API Contract V2 (recommendations; v1 doc untouched)

Add: authN/Z section (scopes), 429 + headers, idempotency-key, request IDs (echo + log), cursor rules
(keep), versioning `/v2/` + sunset policy, partner error taxonomy. Retire: Postgres sync chapters,
100/min claim (replace with real policy), dead `/hotels*` ambiguity.

## 21. Resource Authorization Matrix

| Resource | Scope | R | C | U | D | Partner | Admin | User |
|---|---|---|---|---|---|---|---|---|
| Hotels/rooms/destinations/offers/currencies | *:read | ALLOW | DENY | DENY | DENY | ALLOW | ALLOW | n/a |
| Bookings | bookings:* | own-only | ALLOW | own-pending/admin | DENY | scoped | ALLOW | own |
| Payments | payments:read-status, payments:submit-evidence | status-only | evidence-submit | DENY | DENY | scoped | ALLOW | own |
| Bank accounts | — | DENY | DENY | DENY | DENY | DENY | ALLOW | DENY |
| Users | users:read | minimal | DENY | DENY | DENY | scoped-min | ALLOW | self |
| CMS | — | DENY (separate system) | DENY | DENY | DENY | DENY | via CMS | n/a |

**NOTE (Amendment 6 — binding): a resource appearing in this matrix does NOT authorize creating an
endpoint for it.** Any new resource needs: business requirement + source of truth + data ownership +
security classification + API contract + authorization model — before implementation. Applies especially
to: images, currencies, offers, destinations, ads, users, bank accounts, CMS.

## 22. Security Threat Model (residual after target; current protection noted)

Stolen credential (CRITICAL now → scoped+revoke+expiry); leaked site key (HIGH → server-side move);
replay (MEDIUM → TLS + idempotency for writes); privilege escalation (HIGH now → scope enforcement);
cross-partner/user/payment access (HIGH now → resource auth); scraping/abuse (MEDIUM → rate limits);
audit tampering (MEDIUM → append-only + admin-only); enumeration (LOW → uniform 401s, keep).

## 23. GAP Register — Phase 2B (severity-ordered deltas vs Phase 2A)

- GAP-2B-001 CRITICAL: authorization unenforced (affiliate unused) → pipeline §5.
- GAP-2B-002 CRITICAL: credential lifecycle absent → §2-3 + D2B-002.
- GAP-2B-003 HIGH: booking actor/partner unattributed → §6 + idempotency §7.
- GAP-2B-004 HIGH: rate limiting absent → §8.
- GAP-2B-005 HIGH: payment/bank/user boundaries undeclared → §12-14.
- GAP-2B-006 MEDIUM: usage/audit absent → §9-10.
- GAP-2B-007 MEDIUM: secret storage unhardened → §16.
- GAP-2B-008 MEDIUM: env separation absent → §17.
- GAP-2B-009 LOW: site key client-side → §18.
- GAP-2B-010 LOW: dead code/docs drift → cleanup approvals.

## 24. Architectural Decisions (D2B-001…015 summarized; full rationale above — AMENDED)

Partner model (org identity + lifecycle) · scoped credentials + prefix-lookup/HMAC + show-once · Secret
Manager pepper · resource scopes (§4, payment terms per Amendment 5) · six-role booking identity
(Amendment 4: Partner/Credential/Actor/Booker/Customer-Owner/Traveler; `customerId` meaning frozen;
Phase 2C must verify semantics; `partnerId` additive-only) · idempotency-Key 24h · per-credential
buckets · counters+7d raw · append-only audit · control-plane service, Dashboard never writes IAM
directly (Amendment 8) · sandbox/prod binding beyond naming (Amendment 9) · browser holds zero
credential, `NEXT_PUBLIC_API_KEY` excluded from partner design (Amendment 10) · Partner≠Commission
(Amendment 7) · matrix≠endpoint-mandate (Amendment 6) · near-instant revocation on sensitive paths
(Amendment 3) · mobile identity deferred · Lovable 8-step future · bank DENY. **All REQUIRE approval
before implementation.**

## 26b. Amendment Status (corrective gate)

Phase 2B remains **ARCHITECTURALLY APPROVED WITH IMPLEMENTATION GATES** (not Phase 2C).
Amendments applied: A1 prefix-lookup (no plaintext storage/lookup) · A2 HMAC-SHA-256 · A3 revocation
semantics (metadata vs status) · A4 six-role booking identity + frozen `customerId` · A5 payment
terminology (`submit-evidence`/`read-status`) · A6 matrix≠mandate · A7 Partner≠Commission · A8 control-plane
no-direct-writes · A9 env binding beyond naming · A10 browser-zero-credential. Plan
(Firestore=SoT, API=access layer, Dashboard=control plane, CMS independent) unchanged.

## 25. Implementation Boundary (Phase 2C candidates, NOT started)

Partner domain, lifecycle service, scopes middleware, rate limiting, audit/usage writers, booking
attribution field, idempotency store, docs v2, dashboard wiring, site key server-side move.

## 26. Production Safety Gate (this phase)

[✓] Untouched [✓] No code modified [✓] No keys touched/issued [✓] No secrets exposed
[✓] Rules/Auth/booking/payment semantics intact [✓] No web/mobile migration [✓] No deployment.

*Phase 2B COMPLETE as design. Awaiting architectural approval before any Phase 2C work.*
