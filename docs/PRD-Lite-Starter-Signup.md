# PRD — CoverPanda Lite / Starter ($99) PLG Self-Serve Signup

> **▶ Live prototype:** [Lite / Starter signup](https://taylor0832.github.io/coverpanda-prototypes/CoverPanda%20Sign-Up/revamped-signup-prototype.html) · [full adoption journey map](https://taylor0832.github.io/coverpanda-prototypes/journey-map.html) — clickable; sample data + proposed pricing.

**Audience:** Engineering + Product
**Status:** Draft for build planning. Macro flow settled; pricing proposed/under team review; activation metric proposed.
**Last source sync:** REVAMP-SPEC.md through §27 (Round 20, 2026-06-15) · PLG-SIGNUP-TEARDOWN.md (2026-06-10) · GAP-REGISTER.md (through Round 17) · DEMO-SCRIPT.md
**Owner:** Taylor

---

## 1. Summary & status

CoverPanda's Lite/Starter tier is a **brand-led, self-serve PLG signup** that lets an emerging franchisor go from landing page to a pre-built franchise workspace and a scheduled first royalty invoice without a sales call or a card at the door. The core pattern is **"Panda proposes · you approve"**: account → brand (with FDD/URL prefill as an accelerator) → goal picker → Panda builds the workspace → a "Get started" checklist where each setup runs as **plan mode** (a short question sequence → a plan summary → approve & run with receipts).

- **Interactive reference (front-end spec):** https://taylor0832.github.io/coverpanda-signup-prototype/
- **Local prototype:** `revamped-signup-prototype.html` (single self-contained HTML file, no build step)
- **Activation metric (proposed):** `first_invoice_scheduled`
- **Status:** Several primitives are already live in production (native e-sign, royalty payments via Mindbody/Thread Bank, Reports + Announcements, franchisor onboarding + Starter-trial checkout). The net-new work is the redesigned signup journey, FDD ingestion, plan-mode UX, billing metering, and instrumentation. See §9.

---

## 2. Problem & opportunity

The current production signup (teardown, 2026-06-10, 24-screenshot walkthrough) asks for **seven commitments before delivering any value**: account → email code → role → brand form → workspace naming → plan choice → credit card. The product's actual wedge — pre-building a franchisor's system from their FDD — never appears in the flow. Post-checkout the user lands on **blank canvases** ("No templates yet", "No items available", merchant onboarding "Not started") with a "Schedule a Demo" escape hatch that signals self-serve failure.

Specific failures the redesign targets:

| Problem | Current behavior | Redesign response |
|---|---|---|
| Value-after-commitment | 7 asks before anything is shown | Build the system first; ask for the account to *save* what was built |
| No FDD ingestion | The document with fees, units, AUV is never requested | FDD as an in-flow accelerator that prefills the workspace |
| Sales-call gate | Brand/franchisor dead-ends at "Schedule a Call" | Single brand-led self-serve path; "Talk to us" is optional, not a wall |
| Card-walled $0 trial | Card required for a $0-today trial | Card moves to the value gate (going live), not the door (open decision §11) |
| Blank canvases | Empty states with no starter content | Pre-built templates, fee catalog, drafted invoice |
| Setup ≠ activation | Checklist items end in saved settings | Each plan ends in a value artifact (invoice scheduled, agreement out for signature) |

---

## 3. Target user / ICP

**Primary:** the **emerging franchisor** (small-to-mid brand, roughly the self-serve end of the market) who can complete setup without a sales touch. Self-serve signup is **franchisor-only**; franchisees arrive by **invitation**, not as a competing signup path.

The broader **fractional-CFO repositioning** (consolidated financials, QuickBooks sync, network P&L, CFO-grade reporting) does **not** live in Lite. Round 19 pushed that framing into Lite; Round 20 reverted it. That ICP and feature set belong to the **Full Platform upgrade tiers (Path B)**, surfaced in Lite only as a locked teaser (§4, §7).

---

## 4. Tier & pricing

> **Pricing is PROPOSED / under team review** — sourced from the prototype's Choose-plan screen, not finalized. Flag all figures as such in any external surface. ($99 / $249 / $20 / $150).

**Lite / Starter — $99/mo + $20 per connected unit · 30-day free trial.** Contains only:

- **Agreements** — franchise agreement workflows, unlimited native e-sign, document distribution, onboarding checklist templates
- **Royalty Payments** — automated invoicing, POS/Stripe collection, payment history per franchisee
- **Basic workspace / locations / network**
- **Closing & onboarding portals** — manual, brand-driven

**Billing rule:** the $20/unit accrues only when a unit goes **live and collecting**, not when added or invited. Base $99 holds until the first unit goes live. ("$99 until your first unit goes live.")

**NOT in Lite:** consolidated financials, QuickBooks sync, AI insights. These appear **only** as a locked upgrade teaser.

### The upgrade seam (Lite → Path B)

A **locked teaser card** on the goal picker:

> 🔒 **Full Platform · +$150/mo · Consolidated financials & reports** — Connect QuickBooks → network P&L → CFO report… Unlocks with Full Platform.

- Dashed/dimmed styling.
- `teaseUpgrade()` shows a toast ("part of Full Platform — +$150/mo; you'll unlock it in your upgraded workspace") and **never sets a Lite goal** (`state.goal` stays `royalties`). It never opens a Lite journey.
- This is the routing point where Path B (`financial-os-prototype.html`, the Full Platform experience) will attach.

Upgrade story (proposed copy): both tiers are the same $20/unit; the only delta is the **+$150/mo intelligence layer** — one clean decision, not a per-seat renegotiation.

---

## 5. Goals & non-goals

**Goals**
- A single brand-led self-serve path: a franchisor can be live without a sales call.
- Value before commitment: a pre-built workspace (locations, fee catalog, drafted first invoice) appears before the account/billing asks.
- FDD/URL as an **accelerator** that prefills setup, **never** a prerequisite — every journey works without it.
- Each setup is a plan: question sequence → summary → approve & run, with honest receipts and state truth.
- Drive the proposed activation event `first_invoice_scheduled`.
- Reuse shipped primitives (native e-sign, royalty rails) rather than rebuild.

**Non-goals**
- Consolidated financials / QuickBooks / AI insights / fractional-CFO positioning (Full Platform / Path B).
- A standalone franchisee self-serve signup (franchisees are invitees).
- The full Full-Platform concierge ("Talk to us") flow beyond an optional off-ramp.
- A production-grade responsive/a11y pass (prototype is desktop-first with a mobile floor only — see §10).
- Real third-party integrations beyond what is already shipped; the prototype simulates Google/Stripe/Plaid/e-sign transitions.

---

## 6. Success metric & event instrumentation

**Proposed activation event:** `first_invoice_scheduled` (first royalty invoice scheduled / collection configured) — brand-side. Paired network-side proposed event: `payment_method_added`. Both are **proposed and unconfirmed** (GAP row 7) — confirm before build.

Supporting indicators: time-to-value (landing → activation event), per-step funnel drop-off (baseline the current card wall before removing it), checklist depth (N of 6) vs 30/60-day retention.

**Event map** (from REVAMP-SPEC §20.7 / Round 13, plus R16/R17/R18 additions). Ship instrumentation with v1.

| Event | Fires | Key props |
|---|---|---|
| `signup_completed` | account created | method |
| `brand_kit_imported` | "Pull details" | has_logo, has_colors |
| `fdd_uploaded` / `fdd_offramp_used` | FDD upload (screen or in-plan) | source, fields_extracted |
| `fdd_review_opened` / `fdd_review_confirmed` | extraction-review sheet | fields_found, low_confidence_count, corrections_made |
| `fdd_parse_partial` | bad-scan path | sections_read, missing_items |
| `fdd_gap_question_answered` | contextual re-ask | item, answered_vs_skipped |
| `plan_opened` / `plan_question_answered` | per journey / per question | journey, q_key, used_pick |
| `plan_summary_viewed` / `plan_approved` | summary / approve | journey, adjusted_count, from_fdd |
| `plan_input_challenged` | validation warn/err rendered | journey, q_key, kind, value_class |
| `plan_challenge_kept` / `plan_challenge_corrected` | keep-anyway vs retype | journey, q_key |
| `plan_delegated` / `advisor_link_opened` / `advisor_approved` | delegation loop | journey, role |
| **`first_invoice_scheduled`** ⭐ | royalties finish | est_amount, run_date — **proposed activation metric** |
| `billing_added` | go-live | days_since_signup |
| `ask_compiled` / `ask_vague` | Ask-Panda command bar | journey, entities_found, routed_away_from_goal |
| `operator_preview_opened` / `operator_invite_opened` | operator preview | entry_point, hours_since_invite |
| **`payment_method_added`** ⭐ | operator adds method | method, days_since_invite — **proposed network-side activation** |
| `day2_return` / `recap_email_clicked` | welcome-back surface | hours_since_signup |
| `share_card_opened` / `referral_link_copied` | founder loop | setups_done |
| `vendor_claim_sent` / `operator_invite_sent` | network loop | count |

---

## 7. The experience — screen-by-screen functional requirements

**Macro flow (settled):** Landing → Choose plan → **Account** → **Brand (URL + FDD prefill)** → **Goal picker ("What first?")** → Panda **builds** workspace → **Payoff** ("system ready") → **Command center / Get-started checklist** → **plan-mode journeys** (royalties · agreements · franchisee updates & reports · network).

> Macro ordering note: the spec's rounds moved the account/brand/goal ordering several times. The ratified order per the prompt is **account → brand → goal picker → build → checklist**. The prototype's most recent rounds run brand before goal picker. Treat the ratified order as canonical; the prototype is the screen-level reference for each step's content.

Cross-cutting patterns:
- **"Panda proposes · you approve."** Every journey is a plan: Panda pre-selects a recommended answer ("Panda's pick") with one-line reasoning; the user adjusts, then approves. Nothing sends without sign-off.
- **Weekly billing is the canonical money frame** (weekly system-wide figure leads; annual is secondary).
- **E-sign is native** throughout — never DocuSign or any third party.
- **Provenance everywhere** — prefilled values cite their source (FDD item/page, brand URL, or "told us only").
- **State truth** — copy never claims "collecting" before billing is live; configured ≠ live.

### 7.0 Landing
- **Purpose:** convert to self-serve trial.
- **Primary CTA:** "Start free trial" (replaces "Request Access"). Secondary: "Talk to us."
- **States:** trial note framing (30 days free, no setup calls, be live today). Pricing is one click away in nav — it informs, never gates.

### 7.1 Choose plan / Start trial
- **Purpose:** route Starter (self-serve) vs Full Platform (optional concierge).
- **Inputs:** plan selection.
- **States:** Starter → continue to signup. Full Platform → optional "Talk to us" (the only place the Cal.com booking survives), always offering "just start the Starter trial instead."

### 7.2 Account
- **Purpose:** create the account (reframed as creating the workspace that holds the franchise system — a reward, not a gate).
- **Inputs:** Google (primary, one tap) or email/password + name. **Simulated** OAuth in prototype.
- **States:** reassurance block — "30 days free, no card required"; "$99/mo + $20/unit once a unit goes live, never for setup"; "we never post or email on your behalf."
- **Email verification:** deferrable (async banner, never a wall in the recommended model); block agreement-sending and payments until verified.

### 7.3 Brand + FDD prefill
- **Purpose:** capture/derive brand identity and prefill the workspace. This is where the **accelerator** lives.
- **Inputs:** brand name, category, location counts; **"Pull details"** (import logo, colors, name, company details from brand URL — the "mirror moment": the UI repaints in brand colors); **"Upload your FDD"** (extract fee schedule, locations/units, AUV).
- **The FDD review pattern (R16, design-complete in prototype):**
  - `fddReview()` — extraction-review sheet: "Here's what I read. You sign off." Rows with **item/page provenance chips** (e.g. Royalty 8% · Item 6 p.23; Units · Item 20 p.102), low-confidence rows as choice chips, then "Looks right — apply."
  - `fddScanDemo()` — bad-scan path: fees/units found, unreadable Item 19 → one contextual question (type AUV or skip; "skip it and your money estimates stay off"). Partial state stays honest end-to-end ("FDD imported ✓ · partial").
- **States:** no-pull / URL-pulled / FDD-imported / partial-parse. Provenance must reflect which (don't claim "built from your website" if they never pulled).
- **Panda proposes · you approve:** extraction fills the form; the user **confirms** rather than authors.

### 7.4 Goal picker — "What do you want to set up first?"
- **Purpose:** personalize the workspace by job-to-be-done; capture `state.goal`.
- **Inputs:** single-select grid — Automate fees & royalties (default) · Send agreements · Onboard franchisees · See everything in one place. Plus the **locked Full Platform teaser card** (§4).
- **States:** chosen goal orders the command center and the payoff artifact. Teaser card → `teaseUpgrade()` toast only; never sets a Lite goal, never opens a journey.

### 7.5 Build
- **Purpose:** the "Panda builds your system" moment — a narrated background build the franchisor watches.
- **Inputs:** none.
- **States:** step rows tick to ✓ (read FDD → create locations → build fee catalog → draft first invoice → prepare dashboard). Narration is **goal-aware**. Token-guarded (`buildToken`) so re-entry cancels stale ticking. Built from connected data only (website + FDD — **no QuickBooks** in Lite).

### 7.6 Payoff — "Your franchise system is ready"
- **Purpose:** value realization — show the **real artifact**, not stats.
- **Real artifact (matches the declared goal):** royalties → the **actual drafted first invoice** (brand tile, real fee lines, "Weekly total · per location," "⚡ Sent via CoverPanda" footer); agreements → drafted agreement page with signature slot; reports → first-report preview.
- **States:** populated from parsed/declared data — open locations, staged units, fee catalog count, weekly system-wide estimated collection (leads weekly; equals the later money-moment number). **AUV calculator**: if no AUV, the stat card becomes an inline AUV input that recalculates every money figure live. Honest provenance variants (FDD / URL-pulled / told-us-only); suppress "0 staged units" when none.
- **CTA:** "Review my first plan →" (`enterAndPlan()`) — drops directly into the first plan; the standalone welcome modal is retired from the path.

### 7.7 Command center / Get-started checklist
- **Purpose:** the activation hub the franchisor re-enters between setups.
- **States:** "Get started" — four quick setups in any order, plus two pre-done rows (Workspace built · Fee catalog drafted), so the checklist starts at **"2 of 6 set up — Panda finished the first two"** (endowed progress). Pre-done rows are **clickable** ("View →" to locations / fee catalog).
- **Components:**
  - **Journey cards** reordered by `state.goal`; the first not-yet-done journey carries a "Start here" badge; each card shows live, billing-aware status (e.g. "Configured — add billing to go live" vs "Live · collecting").
  - **Ask-Panda command bar** — plain-language ask compiles to a routed, pre-answered plan (`compileAsk()`): routes by intent (agreement/sign → agreements, report/update → reports, invite/operator → network, royalty/fee/invoice → royalties), extracts entities (rates, cadence, contacts), opens the plan at its summary with "✨ Compiled from your ask" provenance; vague asks open the routed journey at Q1.
  - **Proactive agent card** — surfaces a real opportunity from the data (e.g. "you've sold N units that haven't opened — I can draft their agreements and pre-stage onboarding now"); one click acts on it. Auto-hides when nothing real to offer.
  - Viral/network cards (referral, share, embed) per §7 journeys below.

### 7.8 Plan-mode journeys (the shared engine)

Engine (`PLANS` config + `#planBg` overlay): **Questions → Summary → Run.**
- **Questions:** "QUESTION N OF M" + progress dots; one question per screen with context line; answers via chips (Panda's pick pre-selected + badged) or text composer (Enter to submit). ← Back retains answers. Supports `skipIf`, `fn(answers)` for dynamic text, and question types `pick` / `text` / `multi` / `preview` / `sigdoc` / `connect`.
- **Validation (R17, confirm-never-block):** `validate(v, answers)` → pass / silent-normalize / inline-err (impossible values, refocus, never advance) / inline-warn (absurd-but-possible — grounded reasoning + "Keep anyway"). `keepFix` strips a bouncing email rather than storing it. Live on royalty rate and contact (recipient/operator) inputs; extend per-field in production.
- **Summary:** "Here's the plan." + outcome line + provenance chip (FDD with item/page chips · "Built from your answers" · "Compiled from your ask") + checked rows for every answer + time honesty + **Approve & run plan →** + "← Adjust my answers" + "Send to my {finance lead / legal counsel / ops lead / head of development} →" (delegation — confirmation promises "nothing else is blocked while you wait").
- **Run:** receipts animate ◌→✓ (zombie-guarded by `planRunSeq` — rapid/duplicate clicks idempotent), then a done card with the value artifact + checklist progress + "Back to my setup checklist →."
- **FDD off-ramp:** a quiet link under the chips — "Have your FDD? Upload it — I'll answer these for you →" — fills all answers and jumps to the prefilled summary with FDD provenance. **Accelerator, never prerequisite.**

#### Royalties (proposed activation journey)
- **Questions:** how you charge (% / flat) → rate (text, validated) → cadence (Weekly = Panda's pick) → bundle marketing + tech fees (Yes = pick) → other fees (`multi`: Consultation/Training/Transfer).
- **Summary:** fee catalog rows + drafted invoice + "deposits at go-live."
- **Run / payoff:** writes real fee state; done-card lands the **money moment** — "💰 First royalty run: {next Monday} · est. ${weekly×locations} across N units." Fires **`first_invoice_scheduled`**. Status reads **"Configured — add billing to go live"** (never "collecting") until billing.
- **Go-live (inline, last step):** `planBilling()` / `planGoLive()` render the $0-today card form and "You're live" receipt **inside the plan overlay** (no screen hop). Card flips status to "Live · collecting" only after go-live. This is the proposed value gate (§11).

#### Agreements
- **Questions:** document source (CoverPanda template gallery / upload your own / draft from FDD) → gallery pick (Franchise Agreement / Proposal-LOI / Mutual NDA / Onboarding packet; skipped on non-gallery paths) → document preview + **tap-to-place signature field** (`sigdoc`) → recipient as a **new contact** (text, validated; empty by default — "No contacts yet") → terms (standard vs "legal reviews first," which holds sending).
- **Run / payoff:** native e-sign send; sent state renders the **auto-onboarding hand-off** — "When {name} signs, onboarding runs itself": portal invite sent, royalty/fee schedule applied, brand standards + onboarding checklist shared. Primary CTA → "Open onboarding & network →."

#### Franchisee updates & reports (Starter-grade — NOT consolidated financials)
- **Questions:** Q1 doc type with **live preview swap** (`preview`): performance report / franchisee update / compliance report — branches the rest. Then lead view / topic / cadence / audience per type.
- **Title/framing:** "Franchisee updates & reports" — from your **live sales & royalty data** (NOT QuickBooks, NOT consolidated P&L; those strings must not be reachable in the Lite reports plan — Round 20).
- **States:** zero-connected-franchisees is stated honestly ("Queued … 0 connected today; it sends as they join"). Doc editor with metric rows, tables, contact cards; "Published" finale with forwardable/subscribable public link (a recruiting asset and viral loop).

#### Network
- **Questions:** first operator as a **new contact** (text, validated) → starter vendor list y/n → invite finance & legal y/n (scoped roles).
- **States:** three blocks — Your franchisees (invite operators to portals) · Approved vendors · Your team. Agentic shortcuts: "invite all staged operators," "add the matched vendor set."
- **Operator-side preview (both halves of loop #1 visible):** "Preview the invite {name} gets →" / "Preview what your operator sees →" → `planFranchiseeView()` renders the branded operator portal invite (sign agreement · see royalty schedule · add payment method ~60s) with a working "Add payment method" demo. The go-live receipt also surfaces "Preview the payment link your franchisees get →."

#### Day-2 / lifecycle (demo artifact)
- "☀️ Simulate day 2" seeds a welcome-back state (billing live, agreement viewed) + act-now chips + a recap-email mock. Day-2 deep-links open plans **at the summary** (an approval, not a re-questionnaire). Production lifecycle is a gap (§10).

---

## 8. Data model & integrations

| Capability | Role in Lite | Status |
|---|---|---|
| **FDD parse/extraction** | Brand-screen upload; AUV/fee/unit prefill; in-plan off-ramp | **Net-new (P0).** Prototype designs the extraction-review UX (`fddReview`, `fddScanDemo`, page-level provenance); production needs the parse pipeline + confidence scoring behind it. Numbers currently hardcoded. |
| **Native e-sign** | Agreements journey, signature placement | **Shipped (live in prod).** Audit trail/consent/storage + reminder engine to confirm; never third-party. |
| **Royalty/payment rails** | Royalties journey, go-live, operator payment link | **Shipped (live in prod):** POS-fed via Mindbody, payment-review-before-collection, merchant onboarding (Thread Bank) complete, going live this week. Merchant app smart-fill (MCC 7399, volume scaled to brand size) is the prototype UX over it. |
| **Invite / delegate / advisor link infra** | Network journey, delegation, operator + advisor previews | **Net-new (P1).** Prototype simulates sends; production needs branded emails, secure tokenized links, expiry, nudges, take-over state sync. |
| **Operator-side portal** | Franchisee experience (sign + pay + view) | **Net-new (P1).** Prototype shows a static preview card; v1 scope question open (sign + pay + view only?). |
| **Billing metering ($99 + $20/live unit)** | Go-live inside the royalties plan | **Net-new (P1).** Starter-trial checkout shipped; usage metering keyed to **live** units is net-new. "Live unit" definition open (connected / invoiced / paying?). |
| **Instrumentation + activation metric** | Everywhere (event map §6) | **Net-new (P1).** No events fire in prototype; commit `first_invoice_scheduled` + `payment_method_added` before build. |

---

## 9. Build status — shipped-in-prod vs net-new

Derived from the live facts (prompt) + GAP-REGISTER.

| Area | Shipped in production | Net-new for this signup |
|---|---|---|
| Native e-sign | ✅ Live (agreements, signing, storage) | Signature-placement UX in the agreements plan |
| Royalty payments | ✅ Live — Mindbody POS feed, payment-review-before-collection, Thread Bank merchant onboarding, going live this week | Merchant-app smart-fill UX; in-plan go-live; "live unit" metering |
| Reports + Announcements | ✅ Live (communication pillar in full production) | Starter-grade "franchisee updates & reports" plan journey wrapping it |
| Franchisor onboarding + Starter-trial checkout | ✅ Shipped | Card-at-value-gate vs card-at-door decision; $20/live-unit metering |
| FDD ingestion | — | ✅ Parse pipeline + confidence scoring + extraction-review (P0) |
| Plan-mode signup journey | — | ✅ The full question→summary→run engine and four journeys |
| Invite/link infra, operator portal | — | ✅ Tokenized links, branded sends, operator portal v1 |
| Instrumentation | — | ✅ Full event map; commit activation metric |

**Known production bug to ticket:** the SPA **500s ("Something went wrong") on direct URL / refresh** — only client-side navigation works. File and fix; it breaks deep-linking and resume.

---

## 10. Validation/error states, mobile/a11y, day-2 lifecycle

These are the GAP-REGISTER open items the prototype intentionally does not finish.

- **Validation & error states (GAP row 8, P2):** confirm-not-block engine + grounded microcopy designed for the three highest-stakes inputs (royalty rate, recipient, operator). Open: per-field rules for AUV bounds, flat-fee cadence cross-check, dates, and production error states for non-plan forms. The 25% "warn" threshold on royalty rate is a guess — tune from `plan_challenge_kept` data.
- **FDD parse failure (GAP row 1, P0):** extraction-review sheet + bad-scan path + page-level provenance are designed in-prototype; production needs the actual parse service and confidence scoring behind them. Decide graceful degradation for scanned PDFs, missing Item 19, partial extraction.
- **Mobile & accessibility (GAP row 9, P1):** prototype has a phone floor only (≤560px: nothing clipped, CTAs reachable, single-row protobar). **Not** a designed responsive experience; no keyboard/focus/contrast audit. Decide mobile-first vs desktop-first for v1, then do a real responsive + a11y pass (focus traps in the plan overlay, chip keyboard nav, contrast).
- **Real upload moments (GAP row 10, P2):** file pickers, parse progress, virus scan, retry.
- **Day-2 lifecycle loop (GAP row 11, P2):** prototype seeds a banner + recap-email mock; production needs the real email sequence, day-9/30 surfaces, behavioral triggers, and an ESP/lifecycle owner.
- **Delegate-side persona (GAP rows 4, 5, 12):** in-prototype previews only; production needs standalone delegate sessions, link security model (expiry/re-auth/scope), and a decision on whether the multi-client advisor workspace ships in v1 or as a fast-follow.
- **Resume/cross-session momentum:** persist onboarding state server-side so a dropped franchisor returns to the same step (currently undesigned and blocked by the SPA refresh bug).
- **Plan overlay placement (GAP row 13, P2):** `#planBg` lives inside the dashboard section; production needs a body-level overlay (or route portal) so plans can open from any screen.

---

## 11. Open decisions

1. **Card at the door vs card at the value gate.** Recommendation in the spec/teardown: **value gate** (card required only at "go live," i.e. flipping a unit live; FDD upload becomes the seriousness filter). This is a single screen to move and the highest-leverage A/B — baseline the current card-wall funnel before changing it. Decides whether the go-live card form is mandatory up front or deferred.
2. **Activation metric confirmation.** `first_invoice_scheduled` (brand-side) + `payment_method_added` (network-side) are **proposed/unconfirmed**. Confirm before building instrumentation.
3. **Proposed pricing ratification.** $99 base, $20/connected unit, $249 Full Platform, +$150/mo intelligence layer — all marked proposed/under team review. Ratify. Also confirm Stripe-fee treatment (pass-through / absorb / platform cut) as it affects unit economics and go-live copy.
4. **The SPA routing bug.** Ticket and fix the 500-on-refresh/direct-URL bug; it blocks deep-linking and resume, both of which this flow depends on.
5. **"Live unit" definition for $20 metering** — connected, invoiced, or paying? (GAP row 6.)
6. **Reverse-trial downgrade vs hard paywall at day 30** — recommendation: downgrade-to-limited to preserve network density.
7. **Operator preview "Free with your franchise" copy** — a pricing commitment; keep (network bet) or soften to "included with {Brand}."

---

## 12. Appendix — source docs

- **Prototype (front-end spec):** https://taylor0832.github.io/coverpanda-signup-prototype/ · local: `CoverPanda Sign-Up/revamped-signup-prototype.html` (single self-contained HTML, no build step)
- `CoverPanda Sign-Up/REVAMP-SPEC.md` — full round history; §26 (R19) and §27 (R20) are most current; §20.7 carries the event map; R20 re-tiered Lite
- `CoverPanda Sign-Up/PLG-SIGNUP-TEARDOWN.md` — current-production teardown + §0 "Open questions for the product team"
- `CoverPanda Sign-Up/DEMO-SCRIPT.md` — golden-path walkthrough
- `CoverPanda Sign-Up/GAP-REGISTER.md` — 14 triaged rows: prototype-fakes vs real-product needs
- Path B (Full Platform / consolidated financials, out of Lite scope): `financial-os-prototype.html`
