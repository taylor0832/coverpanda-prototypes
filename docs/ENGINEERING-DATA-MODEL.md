# CoverPanda — Canonical Data Model & State Machines

*The engineering spine. Every entity, field, relationship, and lifecycle the prototypes imply, in one place — so the six prototypes read as one system.*

**Status:** draft for engineering review · 2026-06-18
**Source of truth:** the live prototypes at `https://taylor0832.github.io/coverpanda-prototypes/` (and this repo). Where an entity is demonstrated by a prototype, the file is cited as `[proto: …]`.
**Pricing/economics:** all dollar figures are *proposed, under review*. Never treat the marketplace take-rate as set — it is `null`/TBD by design.

---

## 1. How to use this document

This is the contract between the prototypes (what it looks and feels like) and the build (what it actually is). Read it alongside the clickable prototypes: each entity names the prototype that exercises it, so you can see the data in motion.

Three principles shape the whole model:

1. **One tenant graph, three+ audiences.** A `Brand` (franchisor) is the tenant. Franchisees, candidates, and vendors are *related principals* with scoped access — not separate apps. The same `Unit` object the franchisee onboards is the one that bills the brand $20/mo and rolls into the consolidated P&L.
2. **The three-sided seam is one object.** When a franchisee sends a vendor request, the vendor sees *that same `Request`* in their inbox. In the prototypes this is the shared `cp_marketplace` store; in production it is the `Request → Proposal → Agreement → Payment` chain. [proto: `journey-nav.js` `cpMkt*`, `onboarding-portal`, `vendor-portal`]
3. **Connect once, appears everywhere.** A `DataConnection` (QuickBooks/POS/bank) authorized during franchisee onboarding is the same event that lights the brand's consolidated P&L. No data is re-entered. [proto: `onboarding-portal` connect modal → `financial-os` network]

---

## 2. Entity catalog

Conventions: `id` is a ULID/UUID on every entity. `created_at`/`updated_at` on every entity. FK fields end in `_id`. Enumerated states are spelled out in §3. Money is stored in integer cents with a currency code; rates as basis points.

### 2.1 Identity & tenancy

#### `Brand` (a.k.a. Franchisor, Workspace, Org)
The tenant. Everything else hangs off a brand.
- `name`, `slug`, `logo_url`, `brand_color`
- `tier` → enum `lite | full` (§3 Subscription) — drives feature entitlement
- `fdd_id` → FK `Document` (current Franchise Disclosure Document)
- `royalty_rate_bps`, `brand_fund_rate_bps` — e.g. 600 / 200
- `initial_franchise_fee_cents` — e.g. 4_500_000 ($45,000)
- `default_territory_radius_mi`, `territory_population_cap`
- relationships: 1—N `User` (via `Membership`), 1—N `Unit`, 1—N `Candidate`, 1—N `StackEntry`, 1—1 `Subscription`
- [proto: `franchisor-account` (Rally & Roam), `vendor-stack-builder`, `revamped-signup`]

#### `User`
A person. Passwordless (magic-link) auth; no password is ever stored. [proto: every portal's gate/login]
- `name`, `email` (unique), `phone?`, `avatar_url?`
- `auth`: magic-link / SSO token only — **no password field**
- a user can hold memberships across multiple brands and roles
- relationships: N—N `Brand` via `Membership`

#### `Membership`
Join row binding a `User` to a `Brand` (or other principal scope) with a role.
- `user_id`, `brand_id`
- `role` → enum `owner | admin | finance | franchisee | candidate | vendor | internal`
- `scope` → what they can see (whole brand, a single `Unit`, a single `Vendor` account)
- [proto: `franchisor-account` Team tab (owner/admin/finance); franchisee/candidate/vendor portals are role-scoped views]

> **Auth/roles matrix** lives in §7. The key rule: a franchisee sees only their `Unit`(s); a vendor sees only `Request`s routed to them; the brand sees everything in its tenant.

### 2.2 Closing & onboarding (candidate → franchisee → unit)

#### `Candidate`
A pre-sign prospect, owned by a brand, worked by the Launch Agent. Converts to a `Franchisee` + `Unit` on sign+pay.
- `name`, `email`, `market` (e.g. "Tucson, AZ")
- `stage` → enum (§3 Candidate lifecycle)
- `qualification`: `{ liquid_capital_band, timeline, background }`
- `discovery_day_at?`
- `guide_user_id?` — the human/agent guide ("Riley")
- `assigned_territory?` → prospective `Territory`
- `agent_activity[]` — log of automated touches (nudges, scheduling, re-engagement)
- relationships: belongs to `Brand`; on conversion spawns `Franchisee` + `Unit` + signed `Agreement` + `Payment`
- [proto: `candidate-portal` (first-person), `launch-agent-prototype` (brand's console view, incl. the **stalled** Priya case)]

#### `Franchisee` (Operator)
A signed owner. The principal behind the onboarding portal.
- `user_id`, `brand_id`, `converted_from_candidate_id?`
- relationships: 1—N `Unit`, 1—N `RosterEntry`, N `Thread`s
- [proto: `onboarding-portal` (Maya Chen)]

#### `Unit` (Location)
The physical franchise location. **The billing atom** (`$20/mo` once connected) and the financial roll-up atom.
- `brand_id`, `franchisee_id`, `name` (e.g. "Tucson #1"), `territory_id`
- `status` → enum (§3 Unit lifecycle): `prospect → signed → building → soft_open → open → operating`
- `projected_open_date`
- `is_connected` (bool) — has ≥1 live `DataConnection`; **drives per-unit billing**
- relationships: 1—N `RoadmapTask`, 1—N `DataConnection`, 1—N `Document`, 1—1 `UnitFinancials`, 1—N `RosterEntry` (vendor per category)
- [proto: `onboarding-portal` (one unit), `financial-os` (21-unit network), `franchisor-account` Usage]

#### `Territory`
Protected geography tied to a unit/candidate. Drives the candidate "territory question" judgment call.
- `brand_id`, `label`, `radius_mi`, `population_cap`, `status` → `open | reserved | claimed`
- [proto: `launch-agent-prototype` (Sam's Oro Valley question), `candidate-portal` (Tucson reserved)]

#### `RoadmapPhase` & `RoadmapTask`
The onboarding launch roadmap (modeled on the real Swig template). Phases are brand-level templates; tasks are instantiated per unit.
- `RoadmapPhase`: `brand_id`, `title`, `order`, `week_range`, `icon`
- `RoadmapTask`: `unit_id`, `phase_id`, `title`, `description`, `order`, `type` → `upload | optional | system`, `status` → `todo | done`, `service_category?` (links the "connect a vendor" moment), `system_key?` (links the "connect a system" moment)
- [proto: `onboarding-portal` (10 phases, tasks auto-complete on vendor engage / system connect)]

### 2.3 Marketplace (the three-sided core)

#### `ServiceCategory`
The vendor categories. Brand-level config of which are required.
- `key` → `accounting | formation | lending | insurance | payroll | legal`
- `label`, `icon`
- per-brand: `requirement` → `required | preferred` (Required = FDD-mandated; see `StackEntry`)
- [proto: `vendor-stack-builder` (Required/Preferred toggle), `onboarding-portal` Vendors tab]

#### `Vendor`
A service provider — CoverPanda first-party services **and** third-party firms. CoverPanda is always the seeded first listing in every category.
- `name`, `kind` → `coverpanda | third_party`
- `category_key`, `is_brand_approved` (bool)
- profile: `person_name`, `person_title`, `firm`, `location`, `rating`, `review_count`, `response_time`, `bio`, `avatar`/`logo`, `contact` (masked until engaged)
- `products[]` — `{ name, note, amount, recommended }`
- `reviews[]` — `{ text, author, unit }`
- `account_status` → `invited | active` (third-party onboarding), `payout_method?`
- relationships: belongs to `Brand`'s marketplace via `StackEntry`; receives `Request`s; owns `Proposal`s
- [proto: `onboarding-portal` (vendor profiles + alternatives), `vendor-portal` (Hatch CPA's own account), `vendor-stack-builder` (gallery)]

#### `StackEntry` (brand's curated marketplace)
The brand's choice per category: which vendor fills it + required/preferred. Published to franchisees.
- `brand_id`, `category_key`, `selected_vendor_id?` (nullable → empty category), `requirement` → `required | preferred`, `published` (bool)
- **invariant:** a brand cannot `publish` while any `requirement = required` entry has `selected_vendor_id = null` (§3 enforces). [proto: `vendor-stack-builder` publish-blocked-on-gaps]

#### `RosterEntry` (franchisee's vendor network)
The franchisee's actual vendor per category — their managed stack.
- `unit_id` (or `franchisee_id`), `category_key`, `vendor_id?`, `status` → enum (§3 Vendor connection): `none | requested | proposal | engaged | self_managed`
- `request_id?` — links to the live `Request`
- [proto: `onboarding-portal` Vendors tab + inline cards (incl. self-managed decline)]

#### `Request` — **the seam object**
A franchisee's request to a vendor. Written by the franchisee portal, read by the vendor portal as the same object. This is the heart of the three-sided model.
- `id`, `unit_id`, `franchisee_id`, `brand_id`, `category_key`, `vendor_id`
- `products[]` — the line items the franchisee selected `{ name, amount }`
- `context` — the one tailoring answer (e.g. "Bookkeeping cadence: Monthly")
- `note?`
- `status` → enum (§3 Request lifecycle): `requested → proposal → engaged` (+ `declined | expired`)
- auto-attached context: `unit_profile`, `brand_terms`, `fdd_minimums?` (insurance)
- relationships: 1—1 `Proposal` (vendor's response), → `Agreement`, → `Payment`
- [proto: shared `cp_marketplace` store — `onboarding-portal.requestVendor()` → `vendor-portal.rInbox()`]

#### `Proposal`
The vendor's pre-filled response to a `Request`.
- `request_id`, `vendor_id`
- `line_items[]` — `{ name, scope, amount }` (pre-filled from the request)
- `total_label`, `total` (estimate), `terms`
- `status` → `draft | sent | accepted | declined`
- [proto: `onboarding-portal` proposal step, `vendor-portal` rRespond → sendProposal]

### 2.4 Money & compliance

#### `Agreement`
Any e-signed document: the **Franchise Agreement** (brand↔candidate) and **vendor service agreements** (franchisee↔vendor). Runs on the native e-sign rail.
- `type` → `franchise | vendor_service`
- `parties[]`, `unit_id?`, `request_id?` (vendor agreements)
- `status` → enum (§3 Agreement lifecycle): `draft | sent | signed | voided`
- `signed_at`, `signature_events[]`, `document_id` (the stored PDF)
- [proto: `candidate-portal` (FA e-sign), `vendor-portal` (service agreement), `onboarding-portal` Documents]

#### `Payment`
Any money movement on CoverPanda's rails: franchise fee, vendor payment, royalty collection, subscription charge. **No raw card/bank credentials are stored — tokenized by the processor.**
- `type` → `franchise_fee | vendor_payment | royalty | subscription`
- `amount_cents`, `currency`, `direction` → `inbound | payout`
- `method` → `ach | card` (tokenized), `status` → enum (§3 Payment lifecycle)
- `payer`, `payee`, `unit_id?`, `agreement_id?`, `request_id?`
- vendor side: `payout` sub-record `{ destination_masked, eta_days, status }`
- `marketplace_fee_bps` → **TBD/null** (never rendered as a number in UI until set)
- [proto: `candidate-portal` (fee), `vendor-portal` (payouts ledger), `franchisor-account` (subscription), `onboarding-portal` (royalty mention)]

#### `Compliance` / `COI`
Insurance certificate + brand-mandate tracking. The COI auto-files to the brand when insurance is engaged.
- `unit_id`, `type` → `coi | brand_audit`
- `status` → enum (§3 Compliance lifecycle): `pending | bound | filed | renewal_due | lapsed`
- `fdd_minimums` snapshot (e.g. $2M GL), `bound_at`, `filed_to_brand_at`
- [proto: `onboarding-portal` (COI auto-files on insurance engage → appears in Documents), `vendor-stack-builder` (FDD-required insurance)]

#### `Subscription`, `Entitlement`, `Invoice`
The brand's billing. Usage-based: tier base + per-connected-unit + per-Launch-Agent-signing.
- `Subscription`: `brand_id`, `tier` → `lite | full`, `status` → enum (§3), `payment_method` (tokenized), `autopay`
- billing components (all **proposed**): `base_cents` (`lite=9900`, `full=24900`), `per_unit_cents=2000` × connected units, `per_signing_cents=75000` × signings in period
- `Entitlement`: derived from `tier` — gates features (e.g. consolidated financials require `full`)
- `Invoice`: `period`, `line_items[]`, `total_cents`, `status` → `paid | due | failed`
- [proto: `franchisor-account` Plan & billing / Usage / Invoices; `revamped-signup` (tier choice); `financial-os` upgrade]

### 2.5 Data & financials (connect-once)

#### `DataConnection`
An authorized integration on a unit. Read-only; CoverPanda never stores the login. **Connecting one is what lights the consolidated P&L.**
- `unit_id`, `kind` → `quickbooks | pos | bank` (extensible: lender_prequal, e-sign, payments)
- `status` → enum (§3 DataConnection lifecycle): `pending | connecting | connected | error`
- `provider_ref` (opaque token), `last_synced_at`, `error_reason?`
- [proto: `onboarding-portal` (connect modal, POS connect completes a task), `financial-os` (network nodes incl. **sync-error/reconnect**)]

#### `UnitFinancials` & `ConsolidatedPnL`
Per-unit P&L mapped to the brand chart of accounts; the network roll-up.
- `UnitFinancials`: `unit_id`, `period`, `revenue`, `cogs`, `gross_profit`, `noi`, `net_income`, `coa_mapping_status` → `unmapped | mapped | locked`
- `ConsolidatedPnL`: `brand_id`, `period`, derived aggregate + `signals[]` (AI narrative)
- [proto: `financial-os` (consolidated P&L, per-unit columns, AI signals, COA review)]

#### `ChartOfAccountsMapping`
Maps each unit's source accounts to the brand template (the review-and-sign-off step).
- `unit_id`, `mappings[]` `{ source_account, target, status }`, `locked_by`, `locked_at`
- [proto: `financial-os` reviewCOA modal]

### 2.6 Communications

#### `Thread` & `Message`
Conversations: franchisee↔HQ, franchisee↔vendor, candidate↔guide, agent↔candidate.
- `Thread`: `brand_id`, `participants[]`, `context` → `hq | vendor | guide`, `subject_ref?` (vendor/request)
- `Message`: `thread_id`, `from_user_id`, `body`, `sent_at`, `is_agent` (bool), `read_at?`
- [proto: `onboarding-portal` Messages (HQ + per-vendor), `candidate-portal` (Riley), `launch-agent-prototype` (agent↔candidate)]

#### `Notification` & `Event`
The "ping me when the proposal lands" system + the analytics instrumentation.
- `Notification`: `user_id`, `type`, `payload`, `read_at?`
- `Event` (analytics): `name`, `actor`, `entity_ref`, `props`, `at` — see §8 for the canonical event list

#### `Approval` (Launch Agent gates)
Items the agent escalates to a human. Three gate types.
- `brand_id`, `candidate_id`, `gate` → `binding | money | judgment`
- `status` → `pending | resolved | held`, `hold_until?`
- examples: send FDD (binding), collect fee (money), territory question / **stalled candidate** (judgment)
- [proto: `launch-agent-prototype` approvals queue, holds, the Priya re-engage/release decision, "all caught up" empty state]

---

## 3. State machines

Each lifecycle below is a finite state machine. Transitions list `trigger → from → to`. Terminal/error states noted. These are the unhappy paths the prototype pass now covers, made explicit.

### Candidate / deal
```
lead ─qualify→ qualified ─review→ discovery ─schedule→ discovery_day
  ─approve(mutual)→ approved ─esign→ signed ─pay_fee→ paid ─convert→ converted
```
- Side branches (from the cold-candidate work):
  - any active state ─no_activity(>Nd)→ **stalled** ─re_engage→ (prior state) | ─release→ **lost** (territory → `open`)
  - `paid → converted` spawns `Franchisee` + `Unit(status=signed)` + onboarding instantiation
- [proto: `candidate-portal` happy path; `launch-agent-prototype` stalled→re-engage/release]

### Unit
```
prospect ─sign→ signed ─permit→ building ─benchmarks→ soft_open ─grand_open→ open ─→ operating
```
- `is_connected` flips true on first `DataConnection=connected` → starts per-unit billing.

### RoadmapTask
```
todo ─complete→ done        (auto-completes when its service_category engages or system_key connects)
```

### Vendor connection (`RosterEntry`)
```
none ─request→ requested ─proposal_received→ proposal ─accept→ engaged
none ─decline→ self_managed          (franchisee handles off-platform)
self_managed ─reconsider→ none
```
- [proto: `onboarding-portal` — all four states incl. self_managed]

### Marketplace `Request` (the seam)
```
requested ─vendor_sends→ proposal ─franchisee_accepts→ engaged
requested ─vendor_declines | timeout→ declined | expired
```
- `engaged` triggers: `Agreement(draft→…)`, then `Payment`, marks `RoadmapTask=done`.
- [proto: `cpMktAdd/Update` across the two portals]

### Agreement
```
draft ─send→ sent ─all_parties_sign→ signed
sent ─void→ voided
```

### Payment
```
staged ─authorize→ processing ─settle→ paid ─(vendor)→ payout_scheduled ─→ payout_cleared
processing ─fail→ failed ─retry→ processing
```

### DataConnection
```
pending ─authorize→ connecting ─ok→ connected
connecting ─fail | token_expired→ error ─reconnect→ connecting
```
- [proto: `financial-os` Poway error → reconnect]

### Subscription
```
trial ─activate→ active
active ─upgrade(lite→full) | downgrade(full→lite)→ active
active ─cancel→ canceled        active ─pause→ paused ─resume→ active
```
- entitlement recomputes on every tier change. [proto: `franchisor-account` upgrade/downgrade/cancel + retention]

### Compliance / COI
```
pending ─bind→ bound ─auto_file→ filed ─time→ renewal_due ─lapse→ lapsed ─rebind→ bound
```

### Approval (Launch Agent)
```
pending ─approve→ resolved        pending ─hold(48h|1wk|until)→ held ─auto_resurface | manual→ pending
```

---

## 4. The three-sided seam (data flow)

The single most important flow to build correctly. One object, three vantage points.

```
FRANCHISEE (onboarding-portal)              VENDOR (vendor-portal)
  selects products, cadence, note
  └─ Request{status:requested} ───────────▶ appears in inbox as the SAME Request
                                              vendor opens → Proposal{draft}
                                              sends ─────────▶ Request{status:proposal}
  proposal arrives in portal ◀──────────────┘
  accepts ──▶ Request{status:engaged}
            ├─ Agreement{franchise/vendor_service: draft→sent→signed}
            ├─ Payment{vendor_payment: staged→…→paid→payout}
            ├─ RosterEntry{status:engaged}
            └─ RoadmapTask{done}, Document(agreement) filed
BRAND (franchisor-account / financial-os) sees: compliance filed, unit progress, $ on rails
```

In the prototypes this is `localStorage('cp_marketplace')`. In production it is a `Request` table with a realtime channel to the vendor's inbox and back to the franchisee's portal. The vendor's identity is matched on `category_key` + `vendor_id`.

---

## 5. Relationship map (text ER)

```
Brand 1─N Unit            Brand 1─N Candidate         Brand 1─1 Subscription
Brand 1─N StackEntry      Brand 1─N User (Membership) Brand 1─N Vendor(listed)
Candidate ─converts→ Franchisee (+ Unit, Agreement, Payment)
Franchisee 1─N Unit       Unit 1─N RoadmapTask        Unit 1─N DataConnection
Unit 1─1 UnitFinancials   Unit 1─N Document           Unit 1─N RosterEntry
Unit 1─1 Compliance(COI)  Unit 1─1 Territory
RosterEntry N─1 Vendor    RosterEntry 1─1 Request
Request 1─1 Proposal      Request 1─1 Agreement(vendor) 1─1 Payment(vendor)
Brand 1─N ConsolidatedPnL (← rolls up Unit.UnitFinancials)
Thread 1─N Message        Brand 1─N Approval ─N─1 Candidate
```

---

## 6. Multi-tenancy & isolation
- Every row carries `brand_id`; all queries are brand-scoped at the data layer.
- A `Vendor` may be listed across multiple brands; its `Request`s/`Proposal`s are still brand-scoped.
- A `User` may be a franchisee under brand A and a vendor under brand B — `Membership` resolves the active scope per session.

## 7. Auth & roles matrix (who sees what)

| Capability | owner | admin | finance | franchisee | candidate | vendor |
|---|---|---|---|---|---|---|
| Brand settings / billing | ✓ | ✓ | billing only | — | — | — |
| Curate marketplace (`StackEntry`) | ✓ | ✓ | — | — | — | — |
| Launch Agent console / approvals | ✓ | ✓ | money gates | — | — | — |
| Consolidated financials | ✓ | ✓ | ✓ | — | — | — |
| Own onboarding roadmap / roster | — | — | — | ✓ (own unit) | — | — |
| Own closing journey | — | — | — | — | ✓ (self) | — |
| Requests routed to them | — | — | — | — | — | ✓ (own) |

- Auth is passwordless (magic link); `internal` (CoverPanda ops) is a future scope, not yet prototyped.

## 8. Canonical analytics events (success-state instrumentation)
Tie these to the activation targets in the pricing/journey plan:
- `account_created`, `workspace_published`
- `first_invoice_scheduled` *(Lite activation)*
- `candidate_qualified`, `candidate_signed`, `franchise_fee_paid`, `candidate_converted`
- `vendor_requested`, `vendor_proposal_sent`, `vendor_engaged` *(marketplace loop)*
- `system_connected` (`kind`), `coa_locked`
- `quickbooks_connected` → `consolidated_report_sent` *(Full activation)*
- `unit_connected` *(billing trigger)*, `subscription_upgraded` / `_downgraded` / `_canceled`
- `coi_filed`, `approval_resolved`, `candidate_stalled`, `candidate_released`

## 9. Integration contracts (v1 real vs. mocked)
| Integration | Entity | v1 | Notes |
|---|---|---|---|
| QuickBooks Online | `DataConnection(quickbooks)` | **real** | read-only sync → `UnitFinancials` |
| POS (Mindbody first) | `DataConnection(pos)` | real | hours → payroll, sales → reporting |
| Bank (Plaid?) | `DataConnection(bank)` | real | read-only; never store login |
| Payments (Stripe?) | `Payment` | **real** | tokenized; powers fee/vendor/royalty/subscription |
| E-sign | `Agreement` | real | native rail; or wrap a provider |
| Lender pre-qual | `DataConnection(lender)` | mocked v1 | soft-pull integration later |

## 10. Open decisions (need a human call)
1. **Marketplace take-rate** — `marketplace_fee_bps` is `null`. Set per category? Flat? Blocks `Payment` economics + vendor Pro tier.
2. **Vendor Pro tier** boundaries & price — `Vendor.account` has no paid tier yet.
3. **$750/signing** Launch Agent fee — confirm or replace the placeholder.
4. **Franchisee ↔ Unit cardinality** — model assumes 1 franchisee : N units; confirm multi-unit operators are first-class in v1.
5. **Payments provider** (Stripe Connect for vendor payouts?) and **bank aggregator** (Plaid?) — pick before the `Payment`/`DataConnection` contracts freeze.
6. Sample proposal/fee numbers in prototypes — keep as illustrative or replace with "quoted"?

---

*Next spine artifacts (recommended order): (1) wire this into the two missing PRDs — Vendor Marketplace/Portal + Franchisee Onboarding Portal; (2) integration/API contracts per §9; (3) the events spec per §8 as a tracking plan; (4) design-token handoff. Each builds directly on the entities above.*
