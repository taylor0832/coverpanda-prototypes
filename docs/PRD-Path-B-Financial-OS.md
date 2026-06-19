# PRD — CoverPanda Path B: The Financial OS

> **▶ Live prototype:** [Financial OS](https://taylor0832.github.io/coverpanda-prototypes/Launch%20Agent/financial-os-prototype.html) (network connectivity canvas → consolidated P&L → agentic CFO report) · [adoption journey map](https://taylor0832.github.io/coverpanda-prototypes/journey-map.html) — clickable; sample data + proposed pricing.

**Audience:** Engineering
**Status:** Draft for build scoping · backbone largely LIVE in production
**Owner:** Taylor Byington
**Last updated:** 2026-06-16
**Prototype:** https://taylor0832.github.io/coverpanda-launch-agent-prototype/financial-os.html

---

## 1. Summary & status

Path B is the **Financial OS** — consolidated multi-unit financials plus agentic CFO reporting, packaged as the **Full Platform "+$150/mo intelligence layer."** It is a **monthly tier upgrade** off the Lite/Starter workspace, **not a separate SKU**.

**Critical scoping note:** the data backbone is **already live in production** at app.coverpanda.co. The Financials tab (Chart of Accounts, Submissions, Analytics, Reports) and the Reports/Announcements AI-generation engine ship today. Path B is **mostly productization and packaging** — the upgrade/paywall framing, the CFO-report packaging, and the Path A↔B seam — **not net-new foundation.** Build scoping should start from "what exists" (Section 9), not from zero.

---

## 2. Problem & opportunity

Franchisors fly blind across their units. Each franchisee keeps its own books in its own QuickBooks with its own chart of accounts, so the franchisor has no live, comparable, system-wide view of the money. The monthly "where do we stand across the network" answer is assembled by hand, late, and inconsistently.

The buyer archetype is the **fractional-CFO / outsourced-CFO function** — **"Jared is the archetype customer."** Jared's deliverable to corporate is a consolidated multi-unit P&L and board report he charges for (the **"$950-to-corporate" consolidated report**). Path B's opportunity is to make that deliverable a one-click, brand-styled, data-grounded artifact that drafts itself each month — turning a manual services grind into a recurring software output.

The defensible moat is the financial workflow: connected books → mapped accounts → consolidated P&L → AI narrative → board report. Path B packages that moat as a priced upgrade.

---

## 3. Target user / ICP

- **Primary:** the COO/CFO / fractional CFO / outsourced-CFO function serving a multi-unit franchise brand (the "Jared" archetype).
- **Workspace context:** an org operating multiple units (e.g. B&B Management with 21 locations, 12 live-syncing QuickBooks), already on Lite/Starter for agreements + royalties.
- **Job to be done:** produce the consolidated multi-unit P&L and the brand-styled board report sent to corporate, on a monthly cadence, without manual roll-up work.

Path B is a **franchisor-side** experience (not franchisee-facing). The franchisee's only touchpoint is connecting their QuickBooks.

---

## 4. Tier & pricing

| Item | Value | Provenance |
|---|---|---|
| Lite / Starter | $99/mo + $20/connected unit | **PROPOSED** — signup prototype Choose-plan screen, under team review |
| Full Platform (Path B) | $249/mo + $20/connected unit | **PROPOSED** — same source |
| Intelligence layer delta | +$150/mo | **PROPOSED** — same source |

- Path B is the **Full Platform tier** = "Everything in Starter, plus" the intelligence layer.
- It is a **monthly tier upgrade**, not a separate SKU. Same $20/connected-unit pricing carries across both tiers.
- Billing mechanic: upgrade Lite → Full Platform flips on the intelligence-layer features; downgrade is allowed ("upgrade or downgrade anytime" per prototype Screen 0/5).
- **All dollar figures above are PROPOSED / under team review.** Do not hardcode pricing as final; surface it from config so ratification (Section 10) is a config change, not a code change.

---

## 5. Goals & non-goals

**Goals**
- Package the live Financials tab + Reports engine as a coherent, sellable Full Platform upgrade experience.
- Build the upgrade/paywall entry that gates the intelligence layer off the free/Lite workspace (standalone, not co-mingled with Lite signup).
- Deliver the agentic CFO board-report packaging (Sources + Skills + Brand → approve & send → tracked) as a first-class monthly flow.
- Wire the Path A → Path B seam: a unit opened by the Launch Agent appears in the next month's consolidated P&L.

**Non-goals**
- Net-new financial data infrastructure (QuickBooks sync, chart-of-accounts mapping, P&L aggregation, report generation substrate already exist — do not rebuild).
- Franchisee-facing UI beyond the QuickBooks connect handoff.
- Path A (Launch Agent) closing/onboarding scope — referenced only at the seam (Section 7, Screen 5), not duplicated here.
- Finalizing pricing (Section 10 open decision).

---

## 6. Success metric + events

**North-star funnel:** `quickbooks_connected` → `consolidated_report_sent`.

Instrument these events:

| Event | Fires when | Key properties |
|---|---|---|
| `upgrade_viewed` | Screen 0 paywall renders | org_id, current_tier |
| `upgrade_completed` | Lite → Full Platform commit | org_id, mrr_delta |
| `quickbooks_connected` | A unit's QBO OAuth completes + accounts read | org_id, unit_id, units_synced, units_total |
| `coa_mapping_locked` | Chart-of-accounts mapping signed off | org_id, accounts_mapped, ambiguous_resolved |
| `consolidated_pnl_viewed` | Analytics roll-up rendered | org_id, units_active, period |
| `consolidated_report_generated` | CFO report drafted from Sources+Skills+Brand | org_id, report_id, period |
| `consolidated_report_sent` | Report approved & sent | org_id, report_id, recipients_count |
| `report_opened` / `report_commented` | Recipient engagement (already tracked live) | report_id, recipient_id |

**Engagement metrics:** report opens / open-rate / threaded comments — already captured by the live Reports engine; surface them as the Path B retention signal.

---

## 7. The experience — screen-by-screen functional requirements

Six screens, mapped from the prototype. For each: **purpose · inputs · live backend it maps to.**

### Screen 0 — Upgrade (the +$150/mo paywall entry)
- **Purpose:** establish the franchisor is already on free/Lite CoverPanda (agreements + royalties live), and present the Full Platform upgrade that unlocks the intelligence layer. Standalone entry, not co-mingled with Lite signup.
- **Inputs:** current tier state; locked-feature list (consolidated financials, CFO reporting shown as locked on Lite); upgrade CTA.
- **Content (from prototype):** left card = "On Lite ($99/mo) — already running" (Agreements & e-sign ✓, Royalty payments ✓, Consolidated financials 🔒, CFO reporting 🔒); right card = "The intelligence layer" (QuickBooks live sync + COA mapping, consolidated network P&L, AI narrative signals, cross-location benchmarking + system-wide reporting, brand-styled CFO report drafted & sent). Price: **+$150/mo · $249 Full Platform · same $20/unit** (PROPOSED).
- **Live backend:** new gating/paywall surface; routes from the Lite signup's locked teaser card (`teaseUpgrade()`). **Net-new packaging.**

### Screen 1 — Connect your books (QuickBooks)
- **Purpose:** connect each franchisee's QuickBooks and map every chart of accounts to one network template, so a Rancho P&L lines up with a Goleta P&L. Franchisor confirms the mapping; system keeps it in sync.
- **Inputs:** per-location QuickBooks OAuth connect link; alternative one-time upload (trial balance / P&L / balance sheet as CSV/XLS/XLSX); industry template presets (Basic / Food service / Retail / Home services).
- **COA review modal:** read source accounts from QBO → propose mapping to brand template → flag ambiguities for human sign-off (prototype example: `"Royalty expense"` — operating expense vs contra-revenue; one unit books it differently — franchisor picks the canonical treatment). Confirm = "lock the mapping."
- **State shown:** "12 of 21 locations syncing automatically"; "9 awaiting QuickBooks connect."
- **Live backend:** **LIVE** — Chart of Accounts sub-tab does QuickBooks LIVE SYNC per location + upload trial balance/P&L/balance sheet + industry templates (Basic/Food service/Retail/Home services), mapped to a standardized brand template. The map-and-confirm review flow is the productization layer over this.

### Screen 2 — Consolidated P&L + narrative signals
- **Purpose:** show "your money in one number" — the consolidated roll-up across connected units, plus AI narrative signals explaining the story behind the numbers.
- **Inputs:** rolled-up P&L from connected QuickBooks; period selector; sync freshness indicator.
- **Live numbers (use exactly — do not invent):** system revenue **$642,607** across **12 active units**; gross margin **47.1%**; net margin **−1.4%**; **9 idle locations** (no P&L activity); 5 of 12 active units profitable; gross profit ~$302,457.
- **Narrative signals (AI-generated, examples from prototype):** "Margin pressure is concentrated, not systemic"; "Eastlake's COGS is the outlier to watch (58.9% vs 47.3% at Goleta)"; "Gross margin is healthy network-wide."
- **Live backend:** **LIVE** — Analytics sub-tab: real consolidated P&L ($642,607 / 47.1% / 12 active / 9 idle) + AI "narrative signals" for finance/bookkeeping. This screen is faithful to the shipped Analytics view.

### Screen 3 — The consolidated report (by unit)
- **Purpose:** the "$950-to-corporate" CFO deliverable — multi-unit consolidated P&L with per-unit columns, every unit on the same template so numbers actually compare.
- **Inputs:** per-unit financial rows (Income, COGS %, Gross Profit, Net Operating Income, Net Income with % of revenue); P&L / Balance Sheet tab toggle; export (PDF + XLSX).
- **Per-unit example data (prototype, faithful):** Rancho San Diego (inc $54,692.35, COGS 53.1%, NI −4.4%), Goleta CA (inc $42,138.19, COGS 52.7%, NI −13.3%), Eastlake Cookies (inc $49,572.39, COGS 58.9%, NI −15.0%).
- **Live backend:** **LIVE** — Reports sub-tab: multi-unit consolidated P&L + Balance Sheet, per-unit columns, exportable.

### Screen 4 — Agentic CFO report generation
- **Purpose:** turn the consolidated numbers into the board-ready, brand-styled report — drafted, held for review, approved, sent, and engagement-tracked.
- **Inputs:** **Sources** (consolidated financials; prior reports for continuity) + **Skills** (CFO analysis & structure) + **Brand** context (brand kit) → generated brand-styled report page. Approve & send to corporate + operators; edit in report builder.
- **Lifecycle:** Draft → generate/assemble → set recipients & access control → Send → engagement analytics (opens, open-rate, threaded comments).
- **Guardrail:** "Drafted in your voice, held for your review. Nothing sends until you approve."
- **Live backend:** **LIVE** — this is the Reports + Announcements AI-generation engine in production: Sources + Skills + Brand → brand-styled, data-grounded page → access-controlled → sent → engagement-tracked. Path B reuses this substrate; the CFO-report packaging (the specific Skill/template + the monthly board-report framing) is the productization layer.

### Screen 5 — Operating cadence + pricing (+ the Path A↔B seam)
- **Purpose:** establish the recurring monthly rhythm and the price, and document the seam to the Launch Agent.
- **Inputs:** monthly digest email ("May close is ready — board report drafted, awaiting your approval") summarizing system revenue/margins, narrative signal count, drafted board report, idle-unit nudges; pricing card.
- **Cadence:** connect once → each month the consolidated P&L rolls up, narrative signals refresh, the board report drafts itself → franchisor approves & sends.
- **Live backend:** recurring **Series** in the live Reporting engine (e.g. a "Monthly Performance Review" series — locations × months matrix with sent/draft/scheduled/missing status). The monthly digest email is net-new packaging over the live engine.
- **THE SEAM (Path A → Path B):** when the **Launch Agent (Path A)** opens a new unit, it hands that unit into Path B so the new franchisee shows up in next month's consolidated P&L automatically. **Reference only — do not duplicate Path A content.** Implementation: on Launch Agent "unit opened," register the unit into the org's Financial OS unit set (QBO connect prompt + COA mapping inherited from brand template) so it joins the next roll-up.

---

## 8. Data model & integrations

The substrate exists in production; documented here for the packaging layer to build against.

- **QuickBooks sync:** per-location OAuth, live sync of source accounts; status tracked per unit (synced / awaiting connect). Also accepts one-time uploads (trial balance / P&L / balance sheet → CSV/XLS/XLSX).
- **Chart-of-accounts mapping:** source QBO accounts → standardized brand template, with industry presets (Basic / Food service / Retail / Home services). Ambiguous accounts flagged for human sign-off (confidence/review step); franchisor locks the canonical mapping. Once locked, mapping kept in sync.
- **P&L aggregation engine:** rolls mapped per-unit data into a consolidated network P&L (system revenue, gross profit/margin, NOI, net income/margin) + Balance Sheet, with per-unit columns. Tracks active vs idle units and submission/compliance rate (Submissions sub-tab — collection tracking).
- **Generation substrate (Sources / Skills / Brand):** Sources (financial data + prior reports) + Skills (analysis style/structure) + Brand context → brand-styled, data-grounded report pages, assembled into a report.
- **Report delivery + analytics:** access control (tie to location, operator groups, individual contacts; view/comment perms) → send → engagement tracking (opens, open-rate, threaded comments). Recurring **Series** + one-off **Folders**.

---

## 9. Build status — LIVE vs net-new

**Be honest: the backbone is largely shipped.** Net-new is the upgrade/paywall framing, the CFO-report packaging, and the Path A↔B seam.

| Capability | Status | Notes |
|---|---|---|
| QuickBooks live sync (per location) | **LIVE** | Chart of Accounts sub-tab; 12 of 21 locations live-syncing |
| Upload trial balance / P&L / balance sheet | **LIVE** | CSV/XLS/XLSX + industry templates (Basic/Food service/Retail/Home services) |
| Chart-of-accounts mapping to brand template | **LIVE** | Mapping exists; **map-and-confirm review UX** = light productization |
| Submissions / collection tracking + compliance rate | **LIVE** | Submissions sub-tab |
| Consolidated P&L + analytics ($642,607 / 47.1% / 12 active / 9 idle) | **LIVE** | Analytics sub-tab |
| AI narrative signals | **LIVE** | Analytics sub-tab, generated from connected QBO |
| Multi-unit consolidated P&L + Balance Sheet, per-unit, export | **LIVE** | Reports sub-tab |
| Reports/Announcements AI engine (Sources+Skills+Brand → send → track) | **LIVE** | Production engine; recurring Series + Folders; opens/comments tracked |
| **Upgrade / paywall entry (+$150/mo, Screen 0)** | **NET-NEW** | Gating surface; routes from Lite's locked teaser; standalone, not co-mingled with Lite signup |
| **CFO board-report packaging** (Skill/template + monthly board framing) | **NET-NEW (packaging)** | Reuses live generation engine; new Skill + template + monthly digest |
| **Monthly digest email** (Screen 5) | **NET-NEW (packaging)** | Over the live Series engine |
| **Path A → Path B seam** (Launch Agent unit → consolidated P&L) | **NET-NEW** | Register opened unit into org's Financial OS unit set |
| Tier/billing flip (Lite ↔ Full Platform, $20/unit carry) | **NET-NEW** | Subscription mechanic + feature gating |

---

## 10. Open decisions

1. **Pricing ratification.** $99 / $249 / +$150 / $20-per-unit are **PROPOSED** (sourced from the signup prototype Choose-plan screen, under team review). Ratify before launch; keep in config until then.
2. **Uploaded-statement parse accuracy.** For non-QuickBooks units uploading trial balance / P&L / balance sheet, which extraction engine — **Reducto vs Claude/GPT**? Open accuracy question; affects mapping confidence and the human-review burden on Screen 1.
3. **SPA routing bug (known, ticket it).** Direct-URL deep links / refresh **500** ("Something went wrong"); only client-side nav clicks work. Affects shareable links to reports/financials views — relevant to the report-delivery flow (Screen 4) where recipients open links directly.

---

## Appendix

**Prototype:** https://taylor0832.github.io/coverpanda-launch-agent-prototype/financial-os.html
(local: `Launch Agent/financial-os-prototype.html` — 6 screens)

**Source docs:**
- `project_reports_announcements_live.md` — live-app walkthrough; ground truth for shipped Financials tab + Reports/Announcements engine
- `project_launch_agent.md` — tier architecture; Path B prototype description; ratified facts (Taylor 2026-06-15)
- `Launch Agent/financial-os-prototype.html` — front-end spec, 6 screens
- `CoverPanda Sign-Up/REVAMP-SPEC.md` §26–27 — consolidated-financials framing + tier coherence (consolidated financials = Full Platform, not Lite)

**Pricing flag:** all dollar figures are PROPOSED / under team review. Live financial figures ($642,607, 47.1%, −1.4%, 12 of 21, per-unit rows) are from the live app — use exactly, do not invent.
