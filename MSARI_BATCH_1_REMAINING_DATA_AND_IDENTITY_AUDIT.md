# MSARI — Batch 1 — Remaining Data + Identity Audit (Phases 1–3) — Final Verified Report

## 1. Executive Summary
Full read-only audit of website + API + mobile data surfaces. Closed migrations re-verified
(Hotels/Rooms/Cities = API-FIRST CLOSED, not reopened). Mobile consumes **zero** MSARI REST
(all direct Firestore). No API exists for rates/ads/bank/users/CMS. Booking + partner dashboard
analysis-only, untouched. **No migration candidates**: every migratable website resource with a
suitable endpoint is already migrated. 4 Supervisor corrections applied (C1–C4, §32).
Zero production/schema/Rules/Auth/booking/payment changes (dirty-check: no modified tracked
files in either repo). Verdict: **BATCH 1 — PHASES 1–3 AUDIT COMPLETE.**

## 2. Team Structure
| Role | Assignment | Independence |
|---|---|---|
| 1 Technical Lead / single owner | orchestrator (this session) | owner, not approver of own specialist claims |
| 2 Web Architect | Task subagent (explore) — 43 call sites, actions, handlers, caches, auth/profile/booking chains | validated by Supervisor (§31–32) |
| 3 Backend/API Engineer | Task subagent (explore) — 13 routes, auth model, scopes, missing endpoints | validated by Supervisor |
| 4 Data Architect | orchestrator — SoT matrix, semantics from code (not types), amplification | QA-challenged |
| 5 Identity/Security Engineer | orchestrator — Auth/NextAuth/API-auth/sessions/boundaries | QA-challenged |
| 6 QA / Evidence Engineer | orchestrator acting adversarially — challenged every PASS/parity/"unused"/N-A claim | — |
| 7 Supervisor | orchestrator in review capacity — re-ran key greps, found 4 corrections, re-validated | final gate |

## 3. Actual Current Architecture
- **Website** (`msari_web`, Next.js): server-first reads via Admin SDK; public catalog on API-first
  routers (hotels/cities/rooms, flags OFF/SHADOW/CANARY/ON, direct fallback); booking/payment/auth
  direct via Server Actions + NextAuth credentials wrapping MSARI `/auth/*`; editorial via
  `CmsClient` (`website_*`, cached); session via Auth.js JWT.
- **API** (`functions`, Express on GCF `api` + 2 price triggers): partner reads (`hotels:read`,
  `destinations:read`, `rooms:read`) on HMAC-scoped `x-api-key`; user routes on Firebase Bearer
  (`/me`, `/bookings*`, `/auth/*` public proxies to IdentityToolkit); no rates/ads/bank/users/CMS
  endpoints (verified §6).
- **Mobile** (Flutter `msari 1.3.0+5`): **no `http/dio/retrofit`** (pubspec verified); all Firestore
  direct (cache-first streams), Firebase Auth direct, one callable (`reserveBookingNumber`),
  Storage direct, FCM + App Check. Third-party Agoda HTTP only.
- **Identity (both platforms): Firebase Auth is the authority**; `customers/{uid}` is the profile
  SoT; website adds NextAuth session + API-login proxy, mobile uses SDK directly. No divergence.

## 4. Complete Resource Inventory (website call sites; SoT traced)
Hotels (list/detail/nearby + fallback fan-out), rooms (detail/fallback + booking txn),
destinations (list/detail + admin writes), `ads` (homepage slider), `rates/global`
(display + booking txn), `bank_accounts` (booking page), `bookings/{uid}/entries` (txn + history),
`customers`/`admins` (profile/roles), `hotel_partner_requests` + `admin_notifications` (writes),
`amenities` (admin-only for website — C1), CMS `website_*` + `web_blog`, sitemap collections.
Full file:line chains per specialist report (Role 2 §§1–12, consolidated here by reference;
re-verified by Supervisor spot-greps).

## 5. Source of Truth Matrix
| Resource | SoT | Evidence |
|---|---|---|
| Hotels/rooms/prices | Firestore `hotels` + `rooms` subcoll. (API = access layer) | handlers read Firestore; displayPrice trigger recomputes from docs |
| Cities | Firestore `destinations` | API scans same collection; website fallback identical semantics |
| Rates | Firestore `rates/global` | read in txn + display; no other writer found |
| Ads/offers | Firestore `ads` | sole reader website slider + mobile carousel |
| Bank accounts | Firestore `bank_accounts` | website booking + mobile service |
| Bookings | Firestore `bookings/{uid}/entries` | both platforms write same shape; API txn same |
| Users/profile | Firebase Auth + `customers/{uid}` | both platforms; `/me` falls back to token, not persisted |
| Roles | Firestore `admins/{uid}` (fail-closed) | user-roles.ts + API getUserRole |
| CMS/editorial/blog | Firestore `website_*`, `web_blog` | CmsClient only |
| Media | Storage (`hotels/…`, `booking_receipts/…`, `users/…`, `partner_requests/…`) | direct URLs/uploads |
| Mobile-only | `taxis`, `favorites` (subcoll.), `suggestions/problem_reports` entries | no website readers (verified) |

## 6. API Coverage Matrix
| Endpoint | Auth | Website uses | Mobile uses |
|---|---|---|---|
| `GET /v1/hotels*` (list/by-id/by-slug/updated-since) | key+`hotels:read` | ✅ primary | ❌ (direct) |
| `GET /v1/cities` | key+`destinations:read` | ✅ primary | ❌ (direct) |
| `GET /v1/rooms?hotelId=` | key+`rooms:read` | ✅ primary | ❌ (direct) |
| `POST /v1/auth/*`, `GET/PUT /v1/me` | public / Bearer | ⚠️ login/register proxy only | ❌ (SDK direct) |
| `POST/GET/PATCH /v1/bookings*` | Bearer (+optional partner) | ❌ (Server Actions direct) | ❌ (batch direct) |
| rates / ads / bank / users / CMS | — **none exist** — | — | — |

## 7. Website Consumption Matrix
Public-serving reads: hotels+rooms (API-first), cities (API-first), ads (direct), rates display
(direct, cached), CMS/blog (direct, cached), sitemap (direct). Auth/session-gated: booking txn +
preview + history + bank + receipts, profile enrichment, partner intake. Admin-gated:
destinations/amenities CRUD, reseed, revalidate route. (Full chains: Role 2 §§6–11.)

## 8. Mobile Consumption Matrix
Hotels/rooms/cities/ads/rates/bank/customers/favorites/taxis/suggestions — **all direct
Firestore streams**, zero MSARI REST (pubspec + grep verified). Auth: Firebase SDK. Booking:
client batch + `reserveBookingNumber` callable + Storage receipts. Taxi/flight: WhatsApp links
(no backend booking). Push: FCM `msari_all_users`.

## 9. Ads Analysis — KEEP DIRECT BY DESIGN
SoT `ads`; consumers website slider + mobile carousel (display-only banners, no pricing/availability
logic); no endpoint; marketing content with no partner need. Migration would add failure modes for
zero benefit. No change.

## 10. Currency Analysis — KEEP DIRECT BY DESIGN
USD-base prices converted at display via `rates/global` (+ per-user `preferredCurrencyCode`);
booking totals computed server-side in USD. Single cached config doc, website+mobile direct.
No endpoint; not requested. No change.

## 11. Rates/Configuration Analysis — KEEP DIRECT BY DESIGN
`rates/global` read in website display (10-min cache + hardcoded defaults) and inside both booking
txns. No endpoint exists and none is authorized to be created in this batch. Display path stays
direct; txn path is forbidden territory. No change.

## 12. Offers Analysis — KEEP DIRECT BY DESIGN (+ dead chain noted)
`getActiveOffers` → homepage only. `getAllOffers` + `offers/page.tsx` (redirect stub) = dead chain
(C2). Same justification as ads. No change.

## 13. Booking Analysis (ANALYSIS ONLY — untouched)
Owner: website Server Actions txn (price/availability/totals/receipts/notifications) and mobile
client batch; API offers parallel txn implementation for partner/user-Bearer flows. Duplicate logic
exists by design (per-surface transactions, not shared library). Candidates for any future work:
NONE in this batch (forbidden). Risks if ever migrated: availability semantics, idempotency,
receipt pipeline — documented, not acted upon.

## 14. Bank/Payment Analysis (ANALYSIS ONLY — untouched)
`bank_accounts` (active, sorted) read by website booking page + mobile service; transfer evidence
= receipt uploads + free-form sender fields on both surfaces; no bank/payment-methods endpoint;
`bank_accounts = INTERNAL/DENY` for partners (no scope exists — correctly absent). No change.

## 15. Users/Profile Analysis
SoT: Firebase Auth + `customers/{uid}` (both platforms same shape); website enriches session from
customers→admins→Auth fallbacks; API `/me` self-service only. No migration needed or possible
without auth-architecture change (forbidden). No change.

## 16. Auth/Unified Identity Analysis
Canonical identity: **Firebase uid**. Authentication Authority: **Firebase Auth (Google)** —
website via NextAuth-credentials→API→IdentityToolkit proxy (+Google provider path in SDK? website
uses credentials provider against API login; mobile uses firebase_auth/Google SDK directly).
Session Authority: NextAuth JWT (website) / Firebase SDK persistence (mobile). Authorization:
`admins/{uid}` registry both sides (website fail-closed; API owner-bypass). Password/reset: website
IdentityToolkit-REST→admin-SDK fallback; mobile SDK. Converged, no drift requiring action. No change.

## 17. CMS Boundary
`website_settings/homepage/pages/destinations/web_blog` via allow-by-convention `CmsClient`
(FLAG: generic helper without collection allow-list — hygiene note, admin/ops risk LOW, no fix
authorized). Rule upheld: editorial never becomes public API. No change.

## 18. Security Findings
- S1 (info): `CmsClient` generic read/write helper, no allow-list (convention-only CMS boundary).
- S2 (info): `reseedAmenities` batch mass-write without revalidation/audit (admin-gated).
- S3 (low): `createApiKey` stub returns fake `msari_live_…` unpersisted (admin-guarded, TODO-marked;
  must never be wired to UI as-is).
- S4 (info): `firebase-admin` dummy-chain returns empty reads when uninitialized (build resilience;
  could mask misconfiguration as "no data").
- S5 (accepted): legacy `NEXT_PUBLIC_API_KEY` client confined to auth/booking flows (out of scope).
- No Critical/High: no browser server-keys, no plaintext credentials, pepper in Secret Manager,
  partner scopes enforced, user isolation (owner-scoped bookings), no secret logging.
- No unauthorized fixes applied (audit only).

## 19. Cost/Performance Findings (no fabricated billing)
- No N+1 on website primary paths (bounded calls, cached cities/offers/CMS).
- Full-collection scans exist (hotels/cities for counts, fallbacks) — bounded by 57/9 docs;
  no monetary claim made.
- Mobile uses cache-first streams + preload service — reasonable; availability scans are
  collection-group range queries (mobile-side cost, out of scope).
- Projection/select noted as non-billing-relevant per order; no savings claimed.

## 20. Migration Candidates — NONE
Every website resource with a suitable existing endpoint is already migrated (hotels, cities,
rooms). Criterion applied strictly; nothing qualifies.

## 21. Keep-Direct Candidates
rates/global (+currency display), ads/offers (+currency display config), roles/session/profile
(security boundary), all CMS/editorial/blog, sitemap infra (N/A but listed for completeness).

## 22. New-API Candidates — NONE PROPOSED
Rates/ads/bank/users/CMS would need new endpoints, but each is classified Keep-Direct or
Forbidden with justification — no architectural decision requested, per the Final Rule
(no manufactured phases).

## 23. Forbidden/OOS Candidates
Booking txn/preview/history, payment/receipts/bank, auth architecture, Rules/schema/index,
partner credentials, operational writes, production serving changes. Untouched (verified clean
dirty-check).

## 24. Dead/N/A Candidates
`getAllAmenities` (no website importers — C1), `getAllOffers` + `offers/page.tsx` stub (C2),
`CmsClient.setDoc` (no callers — C3), `fetchAllHotels`/`fetchHotelById` legacy methods (no callers),
website `/favorites` link (no route — C4, minor UX dead-end), `amenities-store.ts` (empty),
`getAllCities` chain (no page callers; code retained).

## 25. Schema Changes Required — NONE
No migration candidate exists; nothing requires schema/index/Rules work. (Mobile-only collections
`taxis/favorites/suggestions` need nothing from this batch.)

## 26. Open Architectural Decisions — NONE
Nothing escalated: no SoT ambiguity (all resolved in §5), no required breaking change, no
credential risk found.

## 27. Recommended Phase 4 Inputs
No Phase 4 implementation is triggered by this batch (no candidates). If a future business need
arises (e.g., partner-facing rates/offers), the inputs are: SoT (§5), current consumers (§7–8),
missing-endpoint list (§6), and the partner scope model (`hotels:read` pattern + `displayPrice`
in-hotel-response precedent; no `prices:read`; `bank_accounts` DENY).

## 28. Recommended Phase 5 Inputs
Same as §27 — nothing queued. Partner dashboard remains analysis-only.

## 29. Risks
- Residual: S1–S4 hygiene notes (§18) — accepted, no action authorized.
- Mobile bypasses all API controls by design (direct Firestore + Rules-dependent) — architectural
  fact, not a regression; partner/API governance applies to server surfaces only.
- `displayPrice` consumers must keep reading it from the hotel response (no separate price
  endpoint to invent).

## 30. Acceptance Criteria — ALL CHECKED
Inventory ✓ SoT-per-resource ✓ direct paths classified ✓ hotels/rooms/cities CLOSED ✓ ads/
currency/rates/offers/booking/bank/users/profiles/auth/identity/CMS analyzed ✓ website+mobile
consumption ✓ security ✓ cost (no fabrications) ✓ candidates triaged (migrate: none;
keep-direct/new-API/forbidden/dead documented) ✓ no prod/schema/Rules/Auth/booking/payment/new-endpoint
changes (dirty-check clean) ✓ no secrets exposed ✓ supervisor review + corrections ✓ evidence index (§33) ✓.

## 31. Supervisor Review (adversarial)
Re-ran targeted greps instead of trusting reports. Probed: "unused" claims (amenities, offers page,
setDoc, legacy fetchers, getAllCities), N/A claims (taxis/Agoda on website), SoT (rates writers),
coverage (scope strings vs IAM work), mobile no-REST (pubspec). Found 4 misclassifications (§32);
verified API grep counts plausible; confirmed dirty-check clean. No missed operational collections
found (mobile-only `taxis/favorites/suggestions/problem_reports` correctly out of website scope;
`admin_notifications` write-only in txn, covered).

## 32. Corrections Performed
- **C1** (Web, medium): `getAllAmenities` claimed public-serving → corrected to admin-only/DEAD
  for website (zero importers). Acceptance: grep shows no page imports. ✓
- **C2** (Web, medium): `offers/page.tsx` claimed consumer → page is a redirect stub; `getAllOffers`
  chain dead; `getActiveOffers` homepage-only. Accepted by file read. ✓
- **C3** (Web, low): `CmsClient.setDoc` write-capable with no callers → recorded DEAD (hygiene note,
  not a live risk). ✓
- **C4** (Web, low): website `/favorites` link without route vs mobile favorites feature → recorded
  dead-link UX note, explicitly not a migration. ✓
All re-validated; no open findings.

## 33. Final Evidence Index
Web inventory (Role 2 §§0–12) · API matrix (Role 3 §§1–5) · Mobile matrix (Mobile §§1–6) ·
Supervisor greps: amenities/taxis/agoda (0 hits), legacy fetchers (defs only), getAllOffers
(homepage only), offers page (stub), setDoc (def only), pubspec (no http/dio), dirty-check
(clean both repos) · Prior gate artifacts (parities, serve-proofs, readiness report) by reference.

**MSARI — BATCH 1 — PHASES 1–3 AUDIT COMPLETE.**
