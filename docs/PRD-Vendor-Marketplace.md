# PRD — CoverPanda Vendor Marketplace & Portal (the three-sided network)

> **▶ Live prototypes:** [Franchisor gallery (curate)](https://taylor0832.github.io/coverpanda-prototypes/Launch%20Agent/vendor-stack-builder-prototype.html) · [Vendor portal (setup → leads → paid)](https://taylor0832.github.io/coverpanda-prototypes/Launch%20Agent/vendor-portal-prototype.html) · [Franchisee onboarding portal (meet & request)](https://taylor0832.github.io/coverpanda-prototypes/Launch%20Agent/onboarding-portal-prototype.html) — clickable; sample data + proposed pricing.

**Audience:** Engineering (product + platform)
**Owner:** Taylor
**Status:** Prototype validated end-to-end (incl. the live seam); engineering scoping
**Date:** 2026-06-18
**Source of truth:** `ENGINEERING-DATA-MODEL.md`, `ONBOARDING-CONNECTIVITY-PLAN.md`, the three prototypes above

---

## 1. Summary & status

**One-liner:** A three-sided marketplace where the **franchisor curates** a per-category vendor stack, the **franchisee meets and engages** a vendor at the exact moment of need inside onboarding, and the **vendor receives, responds, and gets paid** — all on CoverPanda's agreement + payment rails. CoverPanda is the seeded first listing in every category and earns on every transaction regardless of who the brand picks.

- The core technical asset is **the seam**: a franchisee's `Request` is the *same object* the vendor sees in their inbox — no re-keying, no cold lead. This is wired and demonstrated live across two prototypes via a shared store (`cp_marketplace`).
- **Not greenfield.** Reuses the native e-sign rail, the payments/payout rail, and the Reports/Announcements generation engine (Sources+Skills+Brand) for pre-filled proposals. Net-new IP: the `Request → Proposal → Agreement → Payment` chain and the vendor's thin SaaS surface.
- Economics deliberately incomplete: the **marketplace take-rate is `null`/TBD** and is never rendered as a number in any surface until set (§4, §13).

## 2. Problem & opportunity

A franchisee opening a unit needs an accountant, a lender, an insurance agent, a payroll provider, and an attorney — at specific, predictable moments. Today that is five cold searches, five intake forms, five back-and-forths, and zero compliance visibility for the brand. The brand mandates vendors (FDD) but can't see whether they were used; the vendor chases cold leads; the franchisee starts every relationship from a blank form.

**Opportunity — "convenience gravity":** make on-platform so obviously easier for all three sides at once that off-platform becomes the friction path and collapses on its own. Franchisee: a vetted pro in-flow with a pre-filled proposal and one-tap sign+pay. Franchisor: automatic compliance + a single reporting view, no chasing. Vendor: warm, pre-qualified inbound with the proposal half-written and payments/agreements built in. Productize the incentive to require it without actually requiring it.

## 3. Target users / personas

| Persona | Role in the marketplace | Surface |
|---|---|---|
| **Franchisor (Zor)** | Curates the stack: picks/invites a vendor per category, marks Required (FDD) vs Preferred, publishes | Gallery (`vendor-stack-builder`) |
| **Franchisee (Zee)** | Meets a vendor at the moment of need, tailors a request, accepts a proposal | Onboarding portal Vendors moments (`onboarding-portal`) |
| **Vendor** | Sets up a thin presence, receives warm leads, sends a pre-filled proposal, gets paid | Vendor portal (`vendor-portal`) |
| **CoverPanda services** | The seeded first listing in every category; transacts on the same rails | (appears in all three) |

## 4. Tier, pricing & economics

- The marketplace is **included** on every brand tier — it is a network/funnel asset, not a SKU.
- **Vendor: Free to join.** Listing, profile, brand endorsements, warm leads, and built-in payments/e-sign/proposals at no cost. A **Pro tier** (multi-brand book-of-business, analytics, priority placement, team seats) is *in design* — boundaries and price TBD.
- **CoverPanda earns a marketplace fee on what the vendor collects** (`Payment.marketplace_fee_bps`). **This number is `null` / TBD and must never be rendered in any UI** until set. Surfaces that reference it show "set per category · in design."
- CoverPanda services seed and 1-click-default every category, so even a third-party pick transacts on CoverPanda's rails and the fee accrues regardless of who the brand chose.

## 5. Goals & non-goals

**Goals**
- Curate → publish a per-category stack; Required/Preferred drives guidance + compliance tracking, **not** a hard wall.
- Deliver the franchisee a vetted pro in-flow with a pre-filled proposal and one-tap sign+pay.
- Deliver the vendor a warm, pre-qualified lead that is literally the franchisee's request object, with the proposal pre-drafted.
- Close the loop on CoverPanda's agreement + payment rails so compliance files itself and the fee accrues.

**Non-goals (v1)**
- No hard requirement to transact on-platform (convenience, not enforcement).
- No vendor marketplace discovery/search beyond the brand's curated stack + one alternative + invite-your-own.
- No vendor Pro tier build (design only).
- No marketplace take-rate displayed anywhere.

## 6. The experience — screen-by-screen functional requirements

### Part A — Franchisor curation (gallery) `[proto: vendor-stack-builder]`
- Per-category card: CoverPanda service seeded first + a marketplace alternative + "invite your own."
- **Required/Preferred** toggle per category (`StackEntry.requirement`). Required = FDD-mandated; surfaces a compliance note.
- Select / **clear** a vendor; a cleared category shows an empty state. The live "what your franchisees see" mirror updates 1:1 and flags gaps.
- **Publish is blocked while any Required category is empty** (invariant) — Panda names the gaps. `[unhappy path: implemented]`
- Invite-your-own: warm invite modal → creates an `invited` `Vendor`; links to the vendor experience.

### Part B — Vendor setup & dashboard `[proto: vendor-portal]`
- **Account creation:** passwordless (magic-link), no password stored. `[entry: implemented]`
- **Setup wizard** (left step rail): business basics → brand profile (logo/color/bio/credentials/reviews) → services & packages → **proposal designer** (section toggles + live brand-styled preview) → service agreement → **payments & payouts** (connect-bank MOCK — never collect real credentials; ACH/card toggles, deposit speed, schedules) → lead preferences → review & go-live (**gated on bank connect**).
- **Dashboard tabs:** Leads (inbox) · Proposals · Payments · Profile.
- **Lead inbox** reads **live `Request`s** as real leads — the same object the franchisee sent, with her exact selected products, unit, brand, and note. Falls back to a seeded lead when none (standalone still works).
- **Respond:** the proposal is pre-filled from the request's line items into the vendor's own template; "Send proposal" advances the `Request` to `proposal`.
- **Paid + payouts:** signed-and-paid state, payout ledger (recent + scheduled), Free/Pro economics (no take-rate number).

### Part C — Franchisee engagement (the meet-moment) `[proto: onboarding-portal]`
Covered in depth in `PRD-Franchisee-Onboarding-Portal.md` §6. The marketplace-relevant flow: profile → tailor request → review & send (`Request{requested}`) → proposal (`Request{proposal}`) → accept (`Request{engaged}` → `Agreement` → `Payment` → `RosterEntry{engaged}` → roadmap task done). Decline path → `self_managed`.

## 7. The three-sided seam (the core to build correctly)

```
FRANCHISEE selects products/cadence/note
  └─ Request{requested} ───────────────▶ VENDOR inbox: the SAME Request
                                           opens → Proposal{draft}
                                           sends ─────▶ Request{proposal}
  proposal arrives ◀───────────────────────┘
  accepts ─▶ Request{engaged}
           ├─ Agreement{vendor_service: draft→sent→signed}
           ├─ Payment{vendor_payment: staged→…→paid→payout}
           ├─ RosterEntry{engaged}, RoadmapTask{done}
           └─ BRAND sees compliance filed + a transaction on rails
```
- **Identity match:** a `Request` routes to a vendor by `category_key` + `vendor_id`. In v1 the vendor portal surfaces requests for its own category.
- **Realtime:** prototype uses `localStorage`; production needs a realtime channel pushing `Request` state both ways (franchisee ↔ vendor) plus a notification on each transition.

## 8. Data model & integrations

Entities (full definitions in `ENGINEERING-DATA-MODEL.md`): `ServiceCategory`, `Vendor`, `StackEntry`, `RosterEntry`, **`Request`**, `Proposal`, `Agreement(vendor_service)`, `Payment(vendor_payment + payout)`, `Compliance/COI`, `Thread/Message`.

Integrations: **e-sign** (Agreement), **payments + payouts** (Payment — Stripe Connect? TBD §13), **proposal generation** (Sources+Skills+Brand engine, reused). No external vendor-discovery integration in v1.

## 9. State machines (from the data model)

- **`Request`:** `requested → proposal → engaged` (+ `declined | expired`).
- **`RosterEntry`:** `none → requested → proposal → engaged`; `none → self_managed → none`.
- **`StackEntry`:** publish blocked unless every `required` entry has a `selected_vendor_id`.
- **`Agreement`:** `draft → sent → signed`. **`Payment`:** `staged → processing → paid → payout_scheduled → payout_cleared` (+ `failed → retry`).
- **`Vendor.account`:** `invited → active` (go-live gated on payout method).

## 10. Build status: reused vs. net-new

| Reused production primitive | Net-new IP |
|---|---|
| Native e-sign rail | `Request → Proposal` seam + realtime sync |
| Payments + payout rail | Vendor thin-SaaS surface (profile, packages, proposal designer) |
| Reports/Announcements generation engine (pre-filled proposals) | `StackEntry` curation + publish invariant; marketplace fee accrual |
| Compliance/COI auto-file | Roster status lifecycle incl. `self_managed` |

## 11. Event instrumentation

`vendor_invited`, `vendor_account_created`, `vendor_published_live`, `stack_published`, `stack_required_gap_blocked`, `vendor_requested`, `vendor_proposal_sent`, `vendor_engaged`, `vendor_declined_selfmanaged`, `vendor_payout_scheduled`. (Canonical list: `ENGINEERING-DATA-MODEL.md` §8.)

## 12. Acceptance criteria

- A brand cannot publish a stack with an empty Required category.
- A franchisee's sent request appears in the matching vendor's inbox as the same object (same products/unit/brand/note) within the realtime window.
- Accepting a proposal creates a signed `Agreement` + a `Payment` and marks the corresponding `RoadmapTask` done and `RosterEntry` engaged.
- The marketplace take-rate is never displayed as a number anywhere.
- Standalone vendor portal works with no live requests (seeded fallback).

## 13. Open decisions

See the consolidated register in `OPEN-DECISIONS.md`. Marketplace-specific: **(D5)** marketplace take-rate (per-category vs flat); **(D6)** vendor Pro tier boundaries + price; **(D9/D10)** payments + payout provider (Stripe Connect?) before the `Payment` contract freezes.

### Appendix — sources
`ENGINEERING-DATA-MODEL.md` · `ONBOARDING-CONNECTIVITY-PLAN.md` · prototypes: `vendor-stack-builder-prototype.html`, `vendor-portal-prototype.html`, `onboarding-portal-prototype.html`.
