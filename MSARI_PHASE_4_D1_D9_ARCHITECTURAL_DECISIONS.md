# MSARI — Phase 4 — D1–D9 Architectural Decisions (DECISIONS ONLY, zero implementation)

## 1. Decision Summary
F1: UNRESOLVED SOURCE DRIFT (documented, protected). D1: API txn = availability authority. D2:
canonical pricing pinned to doc-truth with unified fallbacks (3.82/1600 chosen on majority +
target-authority evidence, owner to confirm market value out-of-band). D3: upfront validated
upload, no downgrade to JSON passthrough. D4: unified 6-state machine (rejected/completed/no_show
disambiguated). D5: auth-required booking (sunset `guest_user`). D6: server claims for ALL
mutations. D7: history endpoint requirements specified (no impl). D8: conditional on F1 action.
D9: mobile LAST approved with prerequisites. Verdict: **CONDITIONAL PASS** (§21).

## 2. F1 Resolution — UNRESOLVED SOURCE DRIFT (not passed off as resolved)
Hunt: full-text search of `D:\projects\msari` (all extensions, excl. node_modules/build) → hits
only in mobile caller, docs, debug symbols, deploy logs. `D:\Dev` `functions/` dirs → only
`harf_app` (different project, no export). Conclusion: **no deployable source exists locally**.
Deploy-log forensics: prod `reserveBookingNumber` = hash `2220afbd`, build `341433fa`, v3,
2026-09-01 — different tree from current repo (`475f788`). Behavior/source comparison: IMPOSSIBLE
from here (NOT PROVEN, not passed). Ownership: unknown checkout. Regression protection (binding):
never answer Y to unrelated-function deletions; reconcile before any mobile booking work.
Owner action: identify the 2026-09-01 deploying checkout (or re-implement + review + test).

## 3. D1 Decision — APPROVED: API booking transaction = Availability Authority
Overlap: `[from,to)` exclusive-end (API `<` comparisons ≡ mobile util — convergent evidence).
Capacity: `numberOfRooms || 1`. Blocking: every status except `cancelled`/`rejected` (normalize the
`canceled` spelling variant at write time). Sold-out → `400 sold-out` (existing API semantic kept).
Website UX must add an explicit sold-out rejection path (new UX, product-owned). Mobile future:
re-check inside submit or move to API; binary day-blocking must become capacity-aware.

## 4. D2 Decision — Canonical pricing (doc-truth, not "newest")
- Room price: `room.price || room.pricePerNight`; fallback hotel `price || priceFrom`; absent
  everywhere → reject (no silent 0 into totals).
- Nights: server-computed from validated dates (website `calculateNights` semantics adopted; API
  must stop trusting client `nightsCount`).
- FX: live `rates/global` doc is SoT. Fallback unification required: adopt `sar:3.82,
  yerSouth:1600` (2-of-3 surfaces + target-authority convergence — majority evidence, documented
  reason, NOT recency). Owner confirms market-correct fallback out-of-band; add missing-doc
  alerting. Currency keys case-normalized. Rounding: half-up to 2dp everywhere (API currently
  unrounded — must adopt). `transferAmount`: snapshot-only claim, stored alongside computed total,
  never auto-rejected (admin reconciles).

## 5. D3 Decision — Receipt (no downgrade)
Storage: backend buckets (existing paths kept). Validation owner: server, adopting website rules
(MIME allowlist jpeg/png/webp, ≤5MB, magic bytes, strict data-URL). Timing: upload BEFORE entry
create for transfer flows (website/mobile model — atomic coupling kept). API `POST .../payment`
must be hardened to the same bar; raw JSON `receiptUrl` passthrough MUST be removed or restricted
to allowlisted storage hosts. No `uploaded:true` without verified bytes.

## 6. D4 Decision — Unified state machine (no synonyms)
States: `pending → {confirmed, rejected, cancelled}`; `confirmed → {completed, cancelled, no_show}`;
terminal: `cancelled, completed, no_show, rejected` (`rejected` = terminal refused intake;
`completed` = stayed; `no_show` = confirmed-but-absent — distinct analytics meanings).
Actors: owner cancels own `pending`; partner cancels own `pending` (`bookings:cancel`);
admin confirms/rejects (`pending` only), completes/cancels (`pending|confirmed`).
Payment sub-status: introduce `payment.status ∈ {pending, verified, rejected}` written only by
verified-receipt/admin-confirm transitions (design requirement for the future payment step).

## 7. D5 Decision — A) Auth-required booking (product/security recorded)
Evidence: all three surfaces already gate (website UI wall + API Bearer + mobile hard-gate);
`guest_user` is a server fallback, not a product flow (orphan + email-keyed limits = weaker).
Sunset the direct `guest_user` fallback (require session). If business later demands B, it needs:
verified phone/email identity, claim-link ownership, email-rate-limit + no-history-without-auth,
and a new guest endpoint — none designed here.

## 8. D6 Decision — Server-side idempotency for ALL booking mutations
Adopt the API Firestore-claim model generalized: client UUID per mutation; scope user+endpoint;
replay identical response; `409 + Retry-After` on conflict; stale-claim reclaim; owner-token
guard. Covers create + payment submission + cancel. Website must generate/pass UUID (currently
unwired); mobile must send UUID (replacing the 2-min heuristic); partner model already conforms.

## 9. D7 Decision — `GET /v1/bookings` requirements (NO implementation)
Owner-scoped (Bearer; admins/partner-scoped reads with `bookings:read`); cursor pagination
(`createdAt`+`id`, never offset — website/mobile in-memory slicing is the anti-pattern to retire);
filters `status/date-range/hotelId`; partner isolation (own `partnerId`); response = current `GET
/:id` projection PLUS `bookingNumber/channel/source/customer` additive fields website readers need.

## 10. D8 Decision — CONDITIONAL (blocked on F1 owner action)
Closed as a documented decision set EXCEPT source restoration, which is an owner-side repo task.
Gate for any mobile booking work: F1 reconciled (source found or re-implemented + reviewed).

## 11. D9 Decision — APPROVED: mobile migration LAST
Prerequisites (binding order): F1 closure → D1 availability redesign → D2 server pricing → D3
receipt semantics → D6 idempotency → txn ownership → then mobile port. No mobile changes until then.

## 12. Source of Truth Matrix
Bookings/status/totals/availability: Firestore via Booking Domain (API) once migrated; until then
per-surface as today. Identity: Firebase Auth + `customers/{uid}`. Prices: hotel/room docs (USD).
FX: `rates/global`. Receipts: Storage. Partners: `api_keys`. Editorial: out of scope.

## 13. Business Logic Ownership Matrix
Validation/pricing/availability/idempotency/status: Booking Domain (API). Presentation/currency
display/UX copy: clients. Persistence: Firestore. Admin transitions: admin tooling via API.
Partner attribution: API only. Receipt bytes validation: server (any uploader).

## 14. State Machine
`pending → confirmed | rejected | cancelled; confirmed → completed | cancelled | no_show`
(terminals: cancelled/completed/no_show/rejected). Payment: `pending → verified | rejected`.
Actors per §6.

## 15. Security Boundaries
Bearer/user isolation kept; partner scopes kept; admin registry kept; receipt validation raised
(API side); guest sunset tightens boundary; idempotency owner-tokens kept. No boundary weakened
by any decision above.

## 16. Migration Preconditions (binding checklist for any future booking migration)
F1 reconciled; D1 UX ready; D2 canonicalized + owner-confirmed fallback; D3 hardened; D4
implemented; D5 enforced; D6 wired on all clients; D7 specified; `channel/customer` additive
fields handled; notification parity decided.

## 17. Deferred Decisions
Nonetechnical-product: sold-out UX copy, guest-flow business call (if ever), receipt URL host
allowlist exact set, missing-rates alert channel. All owned outside this audit.

## 18. Risks
F1 deletion risk until reconciled (mitigated by N-procedure). Price/availability/idempotency gaps
persist until implementation (pre-existing, accepted). No new risk introduced (zero changes).

## 19. Acceptance Criteria
F1 hunt exhaustive + documented ✓ D1–D9 each decided with cited evidence ✓ no recency-based
pricing ✓ no validation downgrade ✓ states disambiguated ✓ guest explicitly chosen ✓ partner-only
idempotency rejected as end-state ✓ history specified without impl ✓ mobile last with prereqs ✓
no implementation/prod/schema/Rules/Auth/payment/mobile changes (dirty-check clean) ✓.

## 20. Supervisor Independent Review
Re-ran: exports inventory (F1), bookings.ts export/status audit, single-arg call, API availability
+ PATCH + idempotency-trigger reads, mobile callable call-site. Challenged parity framing (correctly
absent — static comparison only, no live claims). Forced one correction: outage-framing of F1 →
source-drift (prod serves per deploy log). Verified D2 fallback choice is majority-evidence, not
recency. Verified no hidden implementation (git clean). No suppressed findings. UNKNOWNs labeled
(NOT PROVEN nowhere needed — all items evidenced or explicitly conditional).

## 21. Final Verdict: CONDITIONAL PASS
D1–D9 architecturally closed; F1 actionably documented with protection. Conditions: F1 owner
reconciliation + D1–D9 implementation prerequisites (§16) before any migration design.
No Phase 5 without a separate order. Team stands down.
