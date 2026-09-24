# MSARI — Phase 4 — Booking API-First Architecture Audit (AUDIT ONLY, zero code changes)

## 1. Executive Summary
Three booking implementations coexist (website txn, mobile client batch, API txn) over one SoT
(`bookings/{uid}/entries`, Firebase uid identity). They agree on document shape core and booking
number format, but diverge on availability (API-only), status lifecycle (three different machines),
pricing fallbacks, receipt flow (atomic-upfront vs deferred), idempotency (three models), and
guest support. **One HIGH finding (F1): mobile's `reserveBookingNumber` callable exists in
production but NOT in repo source (source drift + deletion risk).** No Critical security regression.
No STOP condition requiring production action. Verdict: **CONDITIONAL PASS** (§26).

## 2. Team Structure
Single Owner (orchestrator) + Web specialist (Task agent) + API specialist (Task agent) + Mobile
auditor (Task agent) + Data/Security/QA/Supervisor (orchestrator, adversarial re-verification via
direct greps/reads). Executor ≠ approver: every significant claim below was re-checked by Supervisor
before inclusion.

## 3. Current Booking Architecture
- **Website**: NextAuth-gated UI → Server Component validation → `previewBookingPrice` (read-only,
  unauthenticated, USD-only) → `createBooking` Firestore txn (hotel/room/rates reads; writes entry +
  parent index + admin notification; receipt uploaded upfront for transfer) → history via
  `getMyBookings`. No cancel path; no status written (implicit PENDING on read).
- **Mobile**: Firebase-auth UI → client-side availability scan (cache-first) → totals computed
  client-side → receipt upload → `reserveBookingNumber` callable → client WriteBatch (parent+entry+
  notification). No txn, no re-check at submit, no cancel path.
- **API**: Bearer-gated `POST /v1/bookings` Firestore txn (room+hotel+overlap-vs-capacity+rates;
  `sold-out`/`room-unavailable` guards; writes entry with `status:pending` + parent + notification),
  partner attribution + atomic idempotency (partner calls only); `GET/PATCH/:id/payment` with
  ownership + state machine; login/register/me proxies.

## 4. Source of Truth Matrix
Booking identity: Firestore doc `bookings/{uid}/entries/{bookingNumber}` (all three).
Status: Firestore field (API writes `pending`; website/mobile omit → implicit pending).
Customer/user: Firebase uid + `customers/{uid}`. Hotel/room/price: `hotels` docs (USD base).
Availability: **no single SoT** — API computes overlap-vs-`numberOfRooms` in-txn; website has none;
mobile pre-scans client-side (TOCTOU). Totals: computed at write time per surface (divergent
fallbacks). Payment evidence: Storage `booking_receipts/{uid}/{number}.{ext}` (all three, same
convention). Partner identity/ownership: `api_keys` + `partnerId` stamp (API only).

## 5. Website Booking Paths
Creation (§3), preview (server-recomputed, tamper-proof payload — no price/nights/status accepted),
history (owner-scoped, in-memory pagination), bank accounts (active-sorted, cash default),
receipt (strict MIME/size/magic validation, tokenized URL, atomic with entry), guest blocked at UI
but `guest_user` fallback reachable by direct action call (F-finding §17, medium).

## 6. Mobile Booking Paths
Draft → availability cubit (binary day-blocking; search enforces capacity) → totals client-side
(USD×nights; FX snapshot + live re-derivation duality) → receipt → callable number → batch.
History streams with client-side status filters. Cancellation impossible (Rules deny + no UI).

## 7. API Booking Paths
As §3 + §1c–§4 of API trace: strict validation gaps (no date/range/currency allowlists — weaker
than website Zod), `hotel-not-found` mis-surfaced as 500 (minor), no list endpoint, no guest path,
JSON receipt passthrough unvalidated (vs website magic-byte validation).

## 8. Partner Booking Paths
New-model HMAC credentials with scopes (`bookings:create/read/cancel`, `payments:submit-evidence`);
attribution additive server-side (client `partnerId` ignored — proven by test); idempotency claim/
replay/`409+Retry-After:2`/5-min stale reclaim/owner-token; own-booking cancel only; payment
evidence scoped to own bookings. Sound design, untouched.

## 9. Business Logic Comparison (duplication classes)
- Price/totals: **accidental duplication** (3 fallback chains, 2 rate tables: website
  `sar:3.8/yerSouth:1561` vs API/mobile `3.82/1600`; client- vs server-nights) — MUST canonicalize.
- Availability: **authoritative only in API**; UI-only elsewhere — gap, not duplication.
- Status: **three machines** (website implicit+unenforced map; mobile pending-only; API
  pending/cancelled/confirmed/rejected) — `completed/no_show` (website map) vs `rejected` (API)
  irreconcilable without decision.
- Validation: **authoritative in website** (strictest); API weakest — must adopt, not drop.
- Receipt: **two flows** (atomic-upfront vs deferred) — architectural choice required.
- Booking numbers: same `BK-MS` format website+API (intentional); mobile callable unknown (F1).

## 10. Availability Semantics
API: in-txn `collectionGroup(entries)` overlap count vs `numberOfRooms||1`, blocking = all except
`cancelled/rejected`. Website: none. Mobile: pre-read, cache-first, no write-time re-check
(double-book race). No unified guarantee exists today; API model is the only candidate owner.

## 11. Pricing / Total Semantics
Server-recomputed everywhere except mobile (client-computed, server must trust). Divergence points:
room-price fallback chain, rate-table values, nights source (server vs client), currency-key case
sensitivity, `transferAmount` never reconciled (all surfaces). Canonicalization required pre-migration.

## 12. Payment / Receipt Semantics
Bank list (active, sorted) shared website+mobile. Transfer requires receipt (both); cash/whatsapp
don't. Website: validated upfront, tokenized URL, atomic. Mobile: validated, uploaded pre-batch
with orphan cleanup. API: deferred endpoint, public-URL or raw-JSON passthrough, no validation,
no status coupling, no notification. Flow + validation decision required.

## 13. Booking Status Machine
Website map (unenforced): PENDING→CONFIRMED/CANCELLED; CONFIRMED→COMPLETED/CANCELLED/NO_SHOW.
API (enforced): owner pending→cancelled; admin pending→confirmed/rejected, →cancelled;
partner own pending→cancelled. Mobile: pending-only + read filters incl. cancelled.
No surface implements the full union; `rejected` vs `completed/no_show` need a decision.

## 14. Cancellation Semantics
Website: no path (admin tooling external). Mobile: impossible (rules + no UI). API: owner/admin/
partner-cancel with guards. Customer self-cancel exists ONLY in API — website migration would
*add* capability (UX decision, not just porting).

## 15. Idempotency Analysis
Three non-portable models: website Redis/uid+optional-key (unwired in prod — BookingPage passes no
key → duplicates possible on retry); mobile 2-min same-room heuristic + UI disable; API
Firestore atomic claim/replay for partner calls only (plain users unprotected). Unification needed:
server-side keyed claims for all mutating calls.

## 16. Identity / Authorization Model
Authority: Firebase Auth; profile SoT `customers/{uid}`; roles `admins/{uid}` fail-closed (website)
+ API owner-bypass. Ownership: `customerId==uid` (all); partner isolation via stamped `partnerId`
+ scopes; admin override both. NextAuth JWT wraps API-login token (website); Bearer direct (API);
SDK persistence (mobile). Converged; no change.

## 17. Security Findings
- **F1 HIGH**: `reserveBookingNumber` callable ACTIVE in production (deploy log: callable v3) but
  ABSENT from repo source (only 3 exports in index.js) — unauditable logic, and a future full
  deploy answering "yes" to deletion would silently break ALL mobile bookings. Action: reconcile
  source (locate deploying checkout or re-implement behind review) — documentation/repo task, no
  prod change. Not a live outage today (prod callable serves).
- M1 MEDIUM: website `guest_user` orphan path via direct action call (UI-walled). Accept or gate.
- M2 MEDIUM: no availability guarantee on website/mobile (overbooking possible; business-accepted
  today, must be resolved before any migration — API `sold-out` rejections need UX).
- M3 MEDIUM: website idempotency unwired (retry duplicates); mobile TOCTOU double-book window.
- LOW: API `hotel-not-found`→500 inconsistency; JSON receipt passthrough unvalidated; preview
  unauthenticated (read-only, rate-unlimited — consider throttle); flight/car mock codes insecure
  (no persistence, clearly mock).
- No Critical; no credential leakage; no IDOR (ownership checks verified on all read/mutate paths);
  no replay beyond idempotency gaps above.

## 18. Data / Transaction Findings
All creations are atomic within their surface (website txn, API txn, mobile batch) but cross-surface
races exist (no global lock; availability only inside API txn). Partial failure: mobile orphan
receipt cleanup exists; website upload-fail hard-fails transfer (correct); API fail-open on
idempotency-claim error (logged, accepted). No schema/index/Rules changes needed for the audit;
any migration needs the decisions in §22 first.

## 19. Cost / Performance Findings (no billing numbers claimed)
Per-booking Firestore ops: website ~4 reads + 3 writes (1 txn); API ~4 reads + 3 writes (1 txn) +
optional idempotency doc; mobile ~reads (cache-first) + 3 batch writes + callable + upload.
`getMyBookings` full-collection read + slice (both website history and mobile cache-first) —
pagination-at-query improvement is optimization debt, not a gate. No fan-out; no retries storms.

## 20. Migration Classification (per path)
- Website create → **MIGRATE AFTER API GAP** (needs: availability UX, price canonicalization,
  receipt-flow decision, guest-policy decision, idempotency wiring, status `completed/no_show`
  vs `rejected` decision, list endpoint for history).
- Website preview → **MIGRATE AFTER API GAP** (needs currency-aware authoritative quote endpoint;
  current API has none — quote logic lives only in txn).
- Website history → **BLOCKED: needs `GET /v1/bookings` list** (no endpoint; do not design here).
- Website cancel → **NEW CAPABILITY** (no website path; API supports) — product decision first.
- Mobile submit → **KEEP DIRECT — HIGH RISK to migrate** (works today; migration requires F1
  resolution + race/price-trust redesign — bigger than website port).
- Receipt upload → **KEEP DIRECT BY DESIGN candidate** (Storage-direct with validation is sound;
  API JSON-passthrough is weaker — do not "unify" downward).
- Booking reads (GET/PATCH/payment per-id) → **MIGRATE AFTER API GAP** (shape additive gaps:
  `channel/customer` fields website readers expect).
- Partner paths → **KEEP (already API-native)**.

## 21. Target Architecture
Recommended (pending §22 decisions): Website/Mobile/Partner → MSARI API → Booking Domain
(validation, pricing, availability, idempotency, status machine) → Transaction/DAL → Firestore,
with Storage-direct receipt upload (validated) + upfront for transfer flows. KEEP DIRECT BY DESIGN:
auth/session/roles boundaries, admin tooling, CMS, rates-display; mobile migrates LAST (highest
risk, needs F1 + race redesign).

## 22. Required Architectural Decisions (before ANY booking migration)
D1: availability model owner (API txn) + sold-out UX. D2: price canonicalization (fallbacks, rate
table single value, nights authority, currency keys). D3: receipt flow (atomic-upfront mandated;
harden API payment endpoint to match). D4: status machine union (`rejected` vs `completed/no_show`).
D5: guest policy (auth-required everywhere vs guest endpoint). D6: idempotency unification
(server claims for all). D7: history list endpoint (design when authorized). D8: F1 source
reconciliation. D9: mobile migration sequencing (last).

## 23. Risks
F1 deletion-risk on next full deploy (mitigation: always answer N to unrelated deletions until
reconciled — already the practiced procedure). Overbooking windows persist until D1. Price drift
until D2. Duplicate-submit until D6 wired. None are new regressions; all pre-date this audit.

## 24. Acceptance Criteria — MET (audit scope)
SoT per item ✓ all surfaces traced with file:line ✓ duplication classified ✓ target proposed ✓
paths classified ✓ security reviewed (no unresolved Critical; HIGH documented with action) ✓
transaction reviewed ✓ cost without fabrication ✓ no implementation/prod/schema/Rules/Auth/payment
changes (dirty-check clean) ✓ evidence or NOT-PROVEN labels throughout ✓.

## 25. Supervisor Review
Re-verified by direct inspection: exports list (3 only — F1 confirmed via deploy log cross-check),
no-cancel-export + no-status-write (bookings.ts:116/509/605 only; entry 366–440 statusless),
single-arg createBooking call, preview-nights/rate differentials, API availability block + PATCH
machine + idempotency trigger conditions (partner-only), mobile callable call-site vs missing export.
Challenged "parity" language (no live parity run in this audit — correctly none claimed; static
semantic comparison only). One correction applied during consolidation: mobile `reserveBookingNumber`
first framed as outage → corrected to source-drift (prod callable exists per deploy evidence).
No suppressed findings; booking/Mobile/API agents' traces accepted as evidence-backed.

## 26. Final Verdict: CONDITIONAL PASS
Audit complete and decision-grade. Conditions (no prod action, documentation/design track):
resolve F1 source reconciliation, then decide D1–D9 in order before any booking migration design.
STOP triggers: none fired (no Critical, no required prod/schema/Auth/payment change).
Next: Principal Architect Review of D1–D9. No implementation authorized by this report.
