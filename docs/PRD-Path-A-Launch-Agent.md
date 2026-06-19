# PRD — CoverPanda Path A: The Launch Agent

> **▶ Live prototype:** [Launch Agent console](https://taylor0832.github.io/coverpanda-prototypes/Launch%20Agent/launch-agent-prototype.html) (closing + 10-phase onboarding; brand's view of the candidate close on screen 12) · [candidate portal (first-person close)](https://taylor0832.github.io/coverpanda-prototypes/Launch%20Agent/candidate-portal-prototype.html) · [franchisee onboarding portal](https://taylor0832.github.io/coverpanda-prototypes/Launch%20Agent/onboarding-portal-prototype.html) · [adoption journey map](https://taylor0832.github.io/coverpanda-prototypes/journey-map.html) — clickable; sample data + proposed pricing.

**Audience:** Engineering (product + platform)
**Owner:** Taylor
**Status:** Spec/prototype validated; engineering scoping
**Date:** 2026-06-16
**Source of truth:** `LAUNCH-AGENT-SPEC.md`, `FUNCTIONAL-PROTOTYPE-PLAN.md`, `PRICING-STRATEGY.md`, `launch-agent-prototype.html`

---

## 1. Summary & status

**One-liner:** The Launch Agent is an approve-by-exception autonomous agent that runs every deal from qualified prospect → signed → open doors, fusing the existing closing and onboarding portals into a single close→onboard experience; the brand is pulled in only at hard gates (binding / money / people / judgment).

- It is a paid **per-signed-franchisee add-on**, sold as an upgrade off the free/Lite workspace.
- It is **not greenfield AI**. It reuses production primitives (native e-sign, payments/royalty rails, the Reports/Announcements generation engine = Sources+Skills+Brand, existing closing/onboarding portals). The net-new IP is the **orchestration**: a per-candidate state machine, gate enforcement at the action layer, and the approve-by-exception console.
- **Prototype (12 screens, 0–11):** https://taylor0832.github.io/coverpanda-launch-agent-prototype/

---

## 2. Problem & opportunity

**Today the product is a filing cabinet the brand must both build and operate.** Even after a brand hand-builds closing + onboarding portals, a human still has to drive every deal.

The failure mode is concrete: the **Phoenix deal sat at 110 days with three months of silence**, four steps still wearing "Setup" badges, target close date unset. The closing portal goes silent exactly when the candidate's real off-platform work (financing, entity formation, insurance, lease) begins, because there is no step type to represent it. The FTC-mandated 14-day FDD cooldown is rendered as a static page — dead air at the most anxious moment of the candidate's life.

Manual close→onboard does not scale past roughly **3 concurrent deals** per operator. Beyond that, cadence slips, deals stall, and stalled deals cost the brand the entire franchise fee plus years of royalties.

**Opportunity:** an agent that runs the cadence autonomously and only interrupts the brand at consequential gates removes the operator ceiling, kills dead air (including converting the cooldown into a productive "Launch Prep Sprint"), and — critically — becomes the distribution channel for the services bench (the LTV engine, §8).

---

## 3. Target user / ICP

- **Primary user / buyer:** A franchisor (the "Zor") running a **real pipeline** — emerging-to-growth brands signing roughly 2–12 franchisees/year, unevenly. This is the upgrade buyer.
- **Buyer trigger profile:** brands that have felt a stall, are running more concurrent deals than one person can drive, or are collecting franchise fees on the CoverPanda Payments rail.
- **Secondary actor (not the buyer):** the **candidate/franchisee** (the "Zee"), who experiences the agent's outbound cadence and the candidate-side portal. The candidate-side portal is on the v3 backlog (§10).
- **Approver(s):** the franchisor principal and any delegated approvers (team/permissions is on the v3 backlog).

---

## 4. Tier & pricing

The Launch Agent is a **standalone, paid upgrade** positioned off the free/Lite workspace. The prototype opens with **Screen 0 — an upgrade/paywall entry**. It must **not** be co-mingled with the Lite signup flow.

It is an **add-on available on either tier (Lite or Full Platform)** — orthogonal, activatable per-deal on any tier.

| Component | Price | Label | Trigger |
|---|---|---|---|
| Setup co-work (build the launch system) | **Free** | — | Funnel asset; free on every tier |
| **Launch fee** | **$750 per signed franchisee** | **PROPOSED PLACEHOLDER — range $500–$1,500, never final** | Auto-deducted when the franchise fee collects on the CoverPanda Payments rail |
| **Active-pipeline fee** | **$99/mo while 3+ candidates active** | **PROPOSED PLACEHOLDER** | Charged only while 3+ candidates are in active closing |
| Onboarding continuation | Included through grand opening | — | Per launched franchisee |

> **Engineering note:** Every dollar figure above is a **proposed placeholder, not a committed price.** Surfaces that display price (Screen 0 paywall, Screen 11 pricing, upgrade prompts, billing ledger) must treat the number as configuration, not a hardcoded constant. Do not bake `750` into copy or logic.

Collection mechanic: the launch fee is deducted from the franchise fee flow **at the moment that fee collects on the CoverPanda Payments rail** — the moment of peak goodwill. Off-platform fee collection invoices normally (same price, worse experience), keeping the rail the path of least resistance.

---

## 5. Goals & non-goals

**Goals**
- Run a deal end-to-end (qualified → signed → open) with the brand approving only at gates.
- Eliminate dead air: no deal silent more than the configured threshold; the cooldown becomes a productive Launch Prep Sprint.
- Deliver a zero-gap signed→onboarding handoff (same-minute portal instantiation with real dates).
- Enforce gates at the action layer (not the prompt layer) with a full per-deal audit trail.
- Surface the services bench at each service's correct moment to drive attach.
- Hand each opened unit into the Financial OS (Path B seam, below).

**Non-goals**
- Not a seat product; not a flat SaaS feature.
- Does not source leads (the agent runs the pipeline, it does not generate it).
- Does not generate Item 19-style financial-performance claims — only brand-approved content is ever sent.
- Does not duplicate Path B (Financial OS) functionality. See seam below.
- Does not bind, pay, or change terms autonomously — those are always gated (§6).

**Seam to Path B (Financial OS):** When the agent opens a new unit, it **hands that unit into the Financial OS** so the new franchisee appears in the next consolidated P&L. This PRD references that handoff only; consolidated P&L, data-room, and reporting behavior live in Path B and are not duplicated here.

---

## 6. Autonomy model — the gate taxonomy

(From `LAUNCH-AGENT-SPEC.md` §5.) The agent is **approve-by-exception**: it runs autonomously and logs everything to the activity feed; it pauses only at defined gates.

### Runs autonomously (logged, no approval)
- All scheduling (Discovery Day, kickoff, vendor calls) within brand-set windows
- Reminders, nudges, prep packets, status chases (candidate, GC, vendors)
- Document collection + filing; evidence verification (e.g., confirm the entity exists before routing a signature)
- Portal page personalization from approved templates
- Service introductions from the bench at their mapped moments
- Onboarding instantiation + date computation at signing
- Digest + report generation

### Hard gates (always require brand approval)
1. **Binding gate** — sending the FDD (starts the legal clock); routing any agreement for signature.
2. **Money gate** — issuing/collecting any payment request; refunds.
3. **People gate** — rejecting/pausing a candidate; anything that changes deal terms.
4. **Judgment escalation** — any candidate question touching deal terms, territory, or legal interpretation: the agent drafts a reply + context, **pauses the cadence**, and escalates.

### Configurable (default → brand can tighten/loosen)
- Outbound message tone/templates (default: agent sends in brand voice, editable anytime)
- Nudge frequency caps; quiet hours
- Which onboarding gates require franchisor sign-off (site approval, layout approval, final approval to open — default on, matching today's real gates)

### Compliance guardrails (non-negotiable, baked in)
- **14-day FDD cooldown:** the agent never routes signatures or payment requests inside the window. Launch Prep Sprint activities are explicitly **non-binding** (formation, pre-qual, quotes). This is a hard assertion — alert on any near-miss (§11).
- All agent communications are identified and logged; full audit trail per deal.
- Item 19-style claims are never generated by the agent — only brand-approved content is sent.

---

## 7. The experience — screen-by-screen functional requirements

Prototype screen indices (0–11) match `launch-agent-prototype.html` `SCREENS[]`. Each screen lists purpose, gates in play, and the real artifacts it must render.

### Part A — Upgrade entry + free setup co-work

**Screen 0 · Upgrade — unlock the Launch Agent (paywall entry)**
- *Purpose:* the SKU/paywall moment. Standalone upgrade off the free/Lite workspace. Outcome-led copy ("deals don't stall"), pricing transparent one click away.
- *Gates:* none.
- *Artifacts:* upgrade CTA; pricing (proposed placeholder, §4); must not be embedded in Lite signup.

**Screen 1 · Meet your Launch Agent**
- *Purpose:* introduce the agent and the "Panda builds, you confirm" setup promise. Free, fast, pay-only-when-it-works-a-deal framing.
- *Gates:* none.
- *Artifacts:* entry to the co-work setup.

**Screen 2 · Co-work — confirm your closing motion**
- *Purpose:* the brand confirms (does not author) a pre-drafted closing flow. Each step pre-labeled **Agent runs** / **You approve (gate)** / **Services moment**.
- *Gates:* surfaces the binding and money gates inline as amber labels on the relevant steps.
- *Artifacts:* drafted closing flow from (a) brand-type templates, (b) FDD parse (Item 5/7 fees + investment ranges, Item 12 territory), (c) existing Agreements-module templates auto-bound to steps; the legacy 4-step payment wizard becomes a **pre-staged payment request bound to the fee step**. Confirm-chips mutate the flow (AR deals adds an e-sign step; multi-unit adds the schedule step; Discovery Day off removes + renumbers; fee chip opens an editor that re-renders dependents). Step-editor drawer: rename, description, who-runs segments, "pause until I approve" + "visible to candidate" switches, and the editable outbound email for that step (subject/body, merge fields, "agent-drafted · sent in your voice" labeling) with sync-scope toast.

**Screen 3 · Co-work — confirm your onboarding cadence**
- *Purpose:* confirm a concept-type-detected, multi-phase, week-dated onboarding roadmap (structured cadence, not prose — this is what makes the Gantt real and lets the agent chase deadlines). Recurring post-open obligations modeled as recurring tasks.
- *Gates:* configurable onboarding sign-off gates (site/layout/final-to-open) default on.
- *Artifacts:* phase accordion cards; **structured task schema** fields per task — `week_offset`, `duration`, `depends_on`, `recurrence`, `actor` (franchisee/franchisor/vendor/agent), `evidence` (smart defaults by task class). "Upload ops manual" refines the draft. Exact phase/task/week counts come from the brand's FDD + ops manual at runtime — **do not hardcode counts**; the prototype's numbers are illustrative.

**Screen 4 · Co-work — stock your vendor bench**
- *Purpose:* the monetization moment, framed as brand value ("every franchisee asks the same five questions"). Five CoverPanda services pre-stocked, each showing the moment it appears.
- *Gates:* none (configuration).
- *Artifacts:* **Service step primitive** (the 5th block in the +Add menu) — `vendor_id`, `appears_at[]`, `fulfillment` (CoverPanda rail vs. external link), `status` (recommended → started → done). Bench is workspace-level config, instantiated per deal. Trust line required: *"Franchisees always see these as recommendations from you, never ads from us. Swap in your own vendors any time."* Swap-out is one click.

**Screen 5 · Review — the launch line**
- *Purpose:* single-timeline review of the whole generated system (closing with its gates + full onboarding).
- *Gates:* shows the closing gates on the timeline.
- *Artifacts:* one-page combined timeline; **publish is free.**

**Screen 6 · Published — the payoff**
- *Purpose:* publish confirmation + the bridge into monitor mode.
- *Gates:* none.
- *Artifacts:* live link + copy; invite CTA; monitor-mode explanation; explicit "skip ahead" demo bridge into the populated console.

### Part B — The Launch Agent console

**Screen 7 · Agent console — approve by exception**
- *Purpose:* the operational home. Three zones.
- *Gates:* this is where gates land for action.
- *Artifacts:*
  - **Needs you (approval queue):** each item states what the agent verified, what it prepared, and why it is a human call. Gate classes shown: binding (send FDD — opens a real FDD document preview + the exact send email, approve from inside the review), money (collect the fee — opens executed signature/payment context, approve from inside), judgment call (e.g., territory question — agent drafts a reply with Item 12 talking points, pauses cadence, escalates; a real composer with "Send & resume cadence").
  - **Pipeline strip:** candidates by stage, each card with an agent-status line (working / waiting-on-you / paused-question). Cards route to the correct candidate record. **Hold** popover (48h auto-resurface / 1 week / until-I-say), held cards get an amber state, undo via toast.
  - **Activity feed:** everything done autonomously, timestamped.
  - Metrics row: qualified→signed days and "deals silent > threshold: 0" (see §11). Numbers are instrumented at runtime, not static.

**Screen 8 · Candidate record (closing) — live routing**
- *Purpose:* per-candidate closing timeline; renders per-candidate from a single data object (no cross-routing).
- *Gates:* every action tagged agent / you-approved / services / your-gate.
- *Artifacts:* closing timeline including the cooldown rendered as the **"Launch Prep Sprint"** — during the legally quiet window the agent walks the candidate through non-binding prep (entity formed, pre-qualified, insurance quoted) so the signing day is a formality. **Messages tab:** real agent↔candidate transcript with "agent · your voice" chips, escalation visible in-thread, and a "jump in as [brand principal]" composer affordance.

**Screen 9 · The handoff — activity replay (zero-gap)**
- *Purpose:* prove the signed→onboarding handoff is same-minute and **gate-honest**.
- *Gates:* the replay must explicitly show the money gate **holding** until the brand approves — onboarding must not fire before approval (this was a v1 bug; the fix is non-negotiable).
- *Artifacts:* timestamped sequence — agreement executed → fee staged to queue (gate holds) → on approval: onboarding portal opened with computed dates → kickoff booked → vendor bench staged → brand-voice welcome note sent (editable). Fee metric animates only on approval.

**Screen 10 · Franchisee record (onboarding) — Dana Park, week 16**
- *Purpose:* per-franchisee onboarding timeline mid-build; post-opening the agent becomes the operating cadence.
- *Gates:* configurable onboarding sign-off gates apply.
- *Artifacts:* week-dated onboarding progress; agent chases GC photos, confirms permits, absorbs schedule slips; services arrive at their moments (accounting at lease signing, payroll queued pre-hiring, insurance binding at certificate of occupancy). This is the screen that feeds the Path B Financial-OS handoff at unit open.

**Screen 11 · Pricing + Friday digest**
- *Purpose:* the pricing model (proposed placeholders, §4) + the weekly digest habit loop.
- *Gates:* none.
- *Artifacts:* state-aware Friday digest — what happened, what's next, the two moments next week that need the brand. The digest email is also the re-engagement loop for brands that drift.

---

## 8. The service / vendor bench (the LTV engine)

(From `LAUNCH-AGENT-SPEC.md` §6.) Five CoverPanda services are stocked out-of-the-box on every brand's bench and surfaced by the agent at the exact step each is needed. The agent fee is the wedge; **services attach is the LTV engine.**

| Service | Default moments | Fulfillment trigger | Brand-value framing | Recurring tail |
|---|---|---|---|---|
| **Formation** | Cooldown sprint; onboarding phase 1 | Candidate one-click → filing flow | "Agreement needs an entity to sign" | Registered-agent renewal |
| **Lending** | Cooldown sprint, before the fee step | Pre-qual application sized to Item 7 | "De-risks your own fee collection" | Refi, equipment, expansion loans |
| **Insurance** | Pre-final-signing; COC; annual renewals | Quote to brand spec; COI auto-filed to franchisor compliance tab | "COI compliance without chasing" | Annual premiums, every location |
| **Payroll** | Vendor-setup phase, pre-first-hire | Accounts + pay cards staged before hiring | "Ready the day the GM role posts" | Per-employee/mo |
| **Accounting** | Lease execution; post-opening forever | Books open before first construction invoice | "Royalty-ready reports without uploads" | Per-location/mo |

Mechanics:
- Bench is workspace-level config, set during free setup, editable in the `Vendor Bench` nav. CoverPanda services are defaults, not locks — one-click swap-out.
- The agent surfaces a service exactly once at its moment, then tracks status; a decline/snooze is respected, with one tasteful re-surface at the next genuinely relevant moment.
- **Attribution:** every attach is tagged to brand + deal + moment for revenue-share reporting (rev-share is an open decision, §12).

---

## 9. Data model, integrations & net-new orchestration

(From `LAUNCH-AGENT-SPEC.md` §9 and `FUNCTIONAL-PROTOTYPE-PLAN.md` §3 Phase D.)

**Net-new orchestration (the IP):**
1. **Per-candidate state machine** — the closing/onboarding state machine is the core engineering artifact; every console surface renders it. Build this first.
2. **Gate enforcement at the action layer** — gate classes per §6 enforced where actions execute, **not at the prompt layer**. Full audit log per deal.
3. **Agent runtime** — event-driven over portal events, calendar, payments, e-sign, and service-rail webhooks. Action classes per §6.
4. **Outbound engine** — email/SMS in brand voice, reusing the existing **Reports/Announcements generation substrate (Sources + Skills + Brand)**; every message identified and logged.
5. **Approval queue** — new inbox surface + mobile push; every item carries prepared-artifact links and "why this is yours" copy.

**Schema / pipeline deltas:**
- **Service step primitive** — 5th block type; bench config object; per-deal instantiation; status webhooks from each service rail.
- **Structured task schema** — `week_offset`, `duration`, `depends_on`, `recurrence`, `actor`, smart `evidence` defaults. Migration: existing checklist tasks import with `week_offset = null` (prose preserved); AI backfills dates on brand confirm.
- **Draft-generation pipeline** — brand-type template library (start: food/bev brick-and-mortar, fitness/social venue, home services) + FDD parser (fees, Item 7 ranges, Item 12 territory) + ops-manual ingestion. Human-confirm UI = Screens 2–4.
- **Auto-binding for transactional steps** — agreement templates bind at portal creation (kills "Setup" badges); payment requests pre-staged from the fee catalog (kills the legacy 4-step wizard).
- **Digest service** — weekly per-brand; doubles as the drift re-engagement loop.

**Reused production primitives (integration points, not net-new):** native e-sign; payments/royalty rails; the Reports/Announcements generation engine; existing closing/onboarding portals.

---

## 10. Build status: reused vs. net-new + remaining backlog

### Reused production primitives vs. net-new IP

| Capability | Status | Notes |
|---|---|---|
| Native e-sign | Reused (LIVE) | Agent routes via existing module; binding gate wraps it |
| Payments / royalty rails | Reused (LIVE this week) | Launch-fee deduction + fee collection ride this rail |
| Reports/Announcements AI generation (Sources + Skills + Brand) | Reused (LIVE) | Substrate for the outbound engine + digest |
| Closing / onboarding portals | Reused (exist) | Agent instantiates + drives them |
| Per-candidate state machine | **Net-new** | Core artifact; build first |
| Gate enforcement at the action layer | **Net-new** | Where the autonomy is made safe |
| Approve-by-exception console + approval queue | **Net-new** | New inbox surface + mobile push |
| Service step primitive + bench config + status webhooks | **Net-new** | The bench plumbing |
| Structured task schema + FDD/ops-manual draft pipeline | **Net-new** | Powers the co-work confirm screens |
| Outbound engine (brand-voice, audited) over the generation substrate | **Net-new** wrapper | Reuses generation substrate; adds send/audit |

### Remaining prototype backlog (v3 — from `FUNCTIONAL-PROTOTYPE-PLAN.md` §2)
1. **Candidate-side portal view** — the sprint checklist and vendor recs as the candidate sees them (the two-sided product is still shown one-sided; highest-value remaining screen).
2. **Agent settings / autonomy config surface** — gates, nudge caps, quiet hours, tone, escalation rules (referenced everywhere, editable nowhere).
3. **Exception paths** — payment failure, candidate ghosting 10+ days, financing declined, formation rejected (one scripted "financing declined → agent proposes plan-B lenders → you approve" path carries the story).
4. **Lead Inbox → Launch Agent connection** — how a candidate enters the system (a lead card with "Hand to Launch Agent").
5. **Day-zero console empty state** — the real 0-candidate console.
6. **Notifications story** — where approvals reach the brand outside the console (email/SMS/mobile push).
7. **Billing ledger** — the $750 launch fee as a statement line a CFO can read, deducted from the fee payout.
8. **Team & permissions** — who else can approve a money gate (e.g., a second approver on money gates).
9. **Onboarding task evidence flow** — upload → agent verifies → files to compliance (the COI as the example).
10. **Real mobile pass** — deliberate phone layout (approvals are a phone activity).
11. **Deeper Swig 10-phase onboarding fidelity** — fuller onboarding roadmap depth.

---

## 11. Event instrumentation

(From `LAUNCH-AGENT-SPEC.md` §8. Instrument from day one.)

- **Setup funnel (free):** time signup → published launch system; % publishing within first session; ops-manual upload rate.
- **Activation (SKU):** % of published brands activating the agent on first deal; upgrade-trigger conversion by moment (publish / first candidate / first stall / fee collection).
- **Agent value:** **avg. qualified → signed days**; **deals silent > 5 days (target 0)**; **gate / approval-queue latency** (how long gates wait on the brand — if this balloons, the brand is the bottleneck and the digest/nudge design needs work); signed → open weeks vs. plan.
- **Services:** **attach by moment** and by service per launched franchisee; cooldown-sprint completion rate (entity + pre-qual + quote all done before the cooldown ends); services revenue per launched franchisee at 12 months.
- **Compliance:** **zero binding actions inside cooldown windows** — hard assertion; alert on any near-miss.

> The Phoenix baseline (110-day deal age, 3 months silent) is the reference point the qualified→signed metric is measured against. Any improvement figures shown in product must be computed from live data, never hardcoded.

---

## 12. Open decisions

1. **Launch-fee number** — currently **$750 PROPOSED placeholder** (range $500–$1,500). Not final. The displayed price must be configuration, not a constant.
2. **Brand rev-share on services** — whether franchisors get a kickback on year-1 services revenue from their franchisees (open; lean is to pilot with design partners before generalizing). Affects the attribution data model (§8).
3. **Autonomy defaults** — the default state of configurable gates (tone/templates, nudge caps, quiet hours, which onboarding gates require sign-off). Defaults are proposed (brand-voice send on, onboarding sign-off gates on); finalize before GA.
4. **Pipeline-fee threshold** — 3 vs. 5 active candidates for the $99/mo fee (proposed: 3).
5. **AR / multi-unit per-unit fee** — whether/how to charge per opened unit beyond the first.

### Appendix — sources
- **Prototype:** https://taylor0832.github.io/coverpanda-launch-agent-prototype/ (local: `launch-agent-prototype.html`, 12 screens 0–11)
- `LAUNCH-AGENT-SPEC.md` — autonomy model (§5), services bench (§6), pricing (§7), instrumentation (§8), engineering notes (§9), event map
- `FUNCTIONAL-PROTOTYPE-PLAN.md` — stress-test findings, v3 backlog (§2), build phases (§3)
- `PRICING-STRATEGY.md` — pricing rationale; the $750 placeholder and its anchors
