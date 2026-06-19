# PRD — CoverPanda Franchisee Onboarding Portal

> **▶ Live prototypes:** [Franchisee onboarding portal](https://taylor0832.github.io/coverpanda-prototypes/Launch%20Agent/onboarding-portal-prototype.html) · [Candidate portal (hands off into this)](https://taylor0832.github.io/coverpanda-prototypes/Launch%20Agent/candidate-portal-prototype.html) · [Vendor portal (the other side of the seam)](https://taylor0832.github.io/coverpanda-prototypes/Launch%20Agent/vendor-portal-prototype.html) — clickable; sample data + proposed pricing.

**Audience:** Engineering (product + platform)
**Owner:** Taylor
**Status:** Prototype validated end-to-end (incl. entry, all four tabs, data-connect, decline); engineering scoping
**Date:** 2026-06-18
**Source of truth:** `ENGINEERING-DATA-MODEL.md`, `onboarding-portal-prototype.html`, `candidate-portal-prototype.html`

---

## 1. Summary & status

**One-liner:** The franchisee's home from invitation to open doors — a phased launch roadmap (modeled on the live Swig template) with vetted vendors woven into each step, a managed vendor roster, documents, messages, and one-click data connections. It replaces the abstract "Connections Canvas" (retired) with the franchisee's real onboarding portal.

- The portal is where **connectivity actually happens**: connecting QuickBooks/POS/bank here is the same event that lights the brand's consolidated P&L (connect-once).
- It is the **receiving end of the candidate→franchisee handoff**: when a candidate signs + pays (candidate portal / Launch Agent), this portal opens for them.
- The vendor moments are the franchisee-side half of the three-sided seam (full marketplace spec: `PRD-Vendor-Marketplace.md`).

## 2. Problem & opportunity

After a franchisee signs, they face 26 weeks of interdependent, deadline-driven work — entity, financing, lease, build-out, POS, payroll, books, marketing, opening — with vendors needed at specific moments. The old experience was a static checklist plus a node-graph "canvas" that the user found unactionable ("doesn't feel like something that's real"). Vendors were a separate abstraction.

**Opportunity:** make the portal the franchisee's single, guided source of truth — a roadmap that reads as *their* journey, with a vetted pro introduced exactly when a step needs one, a roster that tracks who's on their team, and the data connections that quietly power the brand's roll-up. Every vendor moment is also a marketplace transaction on CoverPanda's rails.

## 3. Target user / actors

- **Primary user:** the **franchisee/operator** (the "Zee"), e.g. Maya Chen opening Bright Pickleball Tucson #1.
- **Upstream:** the **candidate** they were (candidate portal) and the **Launch Agent** that closed them.
- **Adjacent:** the **brand** (sees progress + compliance), and **vendors** (receive requests from here).

## 4. Tier & pricing

- The onboarding portal is **included** for any franchisee a brand onboards; the brand is billed **$20 per connected unit** (proposed) once the unit connects (`Unit.is_connected`).
- No direct charge to the franchisee for the portal. Vendor engagements transact on the marketplace (`PRD-Vendor-Marketplace.md`); franchise fee + royalties run on the payments rail.

## 5. Goals & non-goals

**Goals**
- A 10-phase roadmap that reads as the franchisee's own launch, with real checklist tasks and clear "what's next."
- A vetted, brand-approved vendor introduced in-flow at each service step (formation, lending, insurance, payroll, accounting), with a marketplace alternative and pre-filled request.
- A **Vendors roster** = the franchisee's managed vendor network/stack, with connection status.
- **Connect-once** data integrations (QuickBooks/POS/bank) that complete roadmap tasks and feed the brand roll-up.
- Documents and Messages as first-class tabs.

**Non-goals (v1)**
- No franchisee-facing financials/P&L (that's the brand's Full Platform surface).
- No free-text vendor search (curated stack + alternative only).
- No in-portal payment execution UI beyond the marketplace accept (sign+pay handled by the rails).

## 6. The experience — screen-by-screen functional requirements `[proto: onboarding-portal]`

### Entry — invite → accept gate
- The portal opens on an **invitation gate** ("Bright Pickleball invited you to launch Tucson #1") → Accept opens the portal. This is the candidate→franchisee handoff landing. `[implemented]`

### Tab 1 — Roadmap (default)
- Welcome-on-invite banner (dismissible).
- **10 phases** (Kickoff & entity → Site → Lease → Build-out → Vendors & tech → Hiring → Marketing → Soft open → Grand open → Operating), each: title, week range, progress bar, real checklist tasks.
- `RoadmapTask` types: `upload | optional | system`; status `todo | done`; tasks auto-complete when their linked vendor engages (`service_category`) or system connects (`system_key`).
- **Contextual "Meet your pro" card** at each service step → opens the vendor engagement drawer (see Tab 2 detail).
- **"Connect a system" card** at tech/books steps → connect modal (QuickBooks/POS/bank).

### Tab 2 — Vendors (the roster) + the engagement drawer
- **Roster:** five category cards (accounting, entity & legal, lending, insurance, payroll), each showing connection status: `none | requested | engaged | self_managed`. Header "X of 5 connected · Y in progress."
- **Connected systems block:** QuickBooks / Mindbody POS / business bank, each connect/connected.
- **Engagement drawer** (the HoneyBook/Thumbtack-depth flow, Request/Proposal/Connected stepper): **Profile** (real person, avatar, rating + reviews + response time, brand-approved ribbon, what they handle for this step, franchisee review quotes, masked contact) → **Tailor request** (product checkboxes pre-filled + one context question + note) → **Review & send** (auto-attaches unit profile, brand terms, FDD minimums for insurance) → **Sent** (lifecycle; opens a vendor thread) → **Proposal** (pre-filled line items, sample estimate) → **Engaged** (on team). Decline path: "I'll handle this off-platform" → `self_managed`. `[all states implemented]`
- "Compare [alternative]" opens the marketplace alternative's profile.

### Tab 3 — Documents
- Grouped: **Signed & filed** (Franchise Agreement, fee receipt, engaged-vendor service agreements, COI once insurance engaged), **Awaiting you** (lease, certificate of occupancy — upload; COI pending until insurance bound), **Shared by brand** (brand standards, FDD, build-out spec).
- Stateful: engaging insurance auto-files the COI and adds the service agreement. `[implemented]`

### Tab 4 — Messages
- Thread list: brand HQ (always) + one thread per requested/engaged vendor; thread view + composer. Sending a vendor request opens that thread automatically. Empty-state hint when no vendor threads. `[implemented]`

## 7. The candidate → franchisee handoff

The candidate portal (`candidate-portal-prototype.html`) runs apply → qualify → discovery → Discovery Day → approval → e-sign FA → pay fee → **welcome**, whose CTA opens this onboarding portal. In data terms: `Candidate{paid} → convert →` creates `Franchisee` + `Unit{signed}` + instantiates this portal's roadmap from the brand's `RoadmapPhase` templates. Same brand + person carries across (Bright Pickleball · Maya Chen). `[both prototypes implemented; handoff is a link in proto, a conversion event in prod]`

## 8. Data model & integrations

Entities (full definitions in `ENGINEERING-DATA-MODEL.md`): `Franchisee`, `Unit`, `RoadmapPhase`/`RoadmapTask`, `RosterEntry`, `Request`/`Proposal` (seam), `DataConnection`, `Document`, `Compliance/COI`, `Thread`/`Message`.

Integrations: **QuickBooks** (read-only → `UnitFinancials`), **POS/Mindbody** (hours + sales), **bank/Plaid?** (read-only) — all `DataConnection`; **e-sign** + **payments** via the marketplace rails. `DataConnection` is read-only and never stores the login.

## 9. State machines (from the data model)

- **`RoadmapTask`:** `todo → done` (auto on vendor-engage / system-connect).
- **`RosterEntry`:** `none → requested → proposal → engaged`; `none → self_managed → none`.
- **`DataConnection`:** `pending → connecting → connected → error → (reconnect) connecting`.
- **`Compliance/COI`:** `pending → bound → filed → renewal_due → lapsed`.
- **`Unit`:** `signed → building → soft_open → open → operating`.

## 10. Build status: reused vs. net-new

| Reused production primitive | Net-new IP |
|---|---|
| Existing onboarding portal / checklist | 10-phase roadmap w/ task→vendor/system links |
| Native e-sign + payments rails | Vendor engagement drawer (profile→proposal→accept) |
| Compliance/COI auto-file | Managed roster w/ status incl. `self_managed` |
| QuickBooks/POS/bank connectors | Connect-once → completes task + feeds roll-up |

## 11. Event instrumentation

`portal_invite_accepted`, `roadmap_task_completed`, `vendor_requested`, `vendor_engaged`, `vendor_declined_selfmanaged`, `system_connected` (`kind`), `document_uploaded`, `coi_filed`, `message_sent`, `unit_connected` (billing trigger). (Canonical list: `ENGINEERING-DATA-MODEL.md` §8.)

## 12. Acceptance criteria

- Accepting the invite opens the portal to the roadmap; progress % reflects completed tasks.
- Engaging a vendor at a step marks that step done, adds the vendor to the roster (engaged), files its agreement to Documents, and opens a thread.
- Engaging insurance auto-files the COI to Documents and shares it to the brand.
- Connecting a system completes its task and (for QuickBooks) makes the unit eligible for the brand roll-up; `Unit.is_connected` flips and per-unit billing starts.
- Declining a vendor leaves the step `self_managed` with a reconnect path; empty states render on Messages/roster.

## 13. Open decisions

See `OPEN-DECISIONS.md`. Portal-relevant: **(D3)** $20/connected-unit price; **(D8)** franchisee:unit cardinality (multi-unit operator first-class?); **(D9/D10)** bank aggregator (Plaid?) + payments provider; **(D11)** sample numbers shown in the engagement drawer (keep illustrative vs "quoted").

### Appendix — sources
`ENGINEERING-DATA-MODEL.md` · prototypes: `onboarding-portal-prototype.html`, `candidate-portal-prototype.html`, `vendor-portal-prototype.html`.
