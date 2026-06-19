# CoverPanda — Open Decisions Register

*The decisions and final numbers the team needs to ratify before the engineering specs freeze. Everything below is currently **proposed / under review** in the prototypes and PRDs — none is committed. Cited IDs (D1–D11) are referenced from `PRD-Vendor-Marketplace.md`, `PRD-Franchisee-Onboarding-Portal.md`, and `ENGINEERING-DATA-MODEL.md` §10.*

**Owner for all:** Taylor (with finance/GTM input)
**Status legend:** 🔴 blocks a spec/contract · 🟡 shapes UX/packaging · 🟢 nice-to-finalize

---

## A. Final numbers to lock (pricing & packaging)

| # | Decision | Proposed (placeholder) | Blocks | Pri |
|---|---|---|---|---|
| **D1** | **Lite / Starter monthly price** | **$99/mo** | signup, billing, journey ledger | 🟡 |
| **D2** | **Full Platform monthly price** | **$249/mo** (= $99 + **$150** intelligence layer) | upgrade, billing, entitlement | 🟡 |
| **D3** | **Per-connected-unit price** | **$20 / connected unit / mo** | usage metering (`Unit.is_connected`), invoices | 🔴 |
| **D4** | **Launch Agent fee per signed franchisee** | **$750** (range $500–$1,500) + **$99/mo while 3+ active** | Launch Agent paywall, usage billing | 🔴 |
| **D5** | **Marketplace take-rate** | **`null` / TBD** — per-category vs. flat? | `Payment` economics, vendor Pro tier, **never shown in UI until set** | 🔴 |
| **D6** | **Vendor Pro tier** | boundaries + price *in design* | vendor `account` paid tier, Pro features | 🟡 |
| **D7** | **Free trial length** | **30 days, no card** | signup, trial→active conversion | 🟢 |

> **Engineering rule already enforced:** every price is treated as configuration, not a hardcoded constant. D5 (take-rate) is additionally **never rendered as a number** anywhere until set.

## B. Product / data-model decisions

| # | Decision | Current assumption | Blocks | Pri |
|---|---|---|---|---|
| **D8** | **Franchisee : Unit cardinality** — is the multi-unit operator first-class in v1? | model assumes 1 franchisee : N units | `Unit`/`Franchisee` schema, billing, roster scoping | 🔴 |
| **D11** | **Sample proposal/fee numbers** in prototypes — keep illustrative or switch to "quoted to your unit"? | illustrative, labeled "sample estimate" | proposal UI copy, vendor pricing display | 🟢 |

## C. Infrastructure / provider selection (pick before contracts freeze)

| # | Decision | Candidate | Blocks | Pri |
|---|---|---|---|---|
| **D9** | **Payments + vendor payouts provider** | Stripe Connect? | `Payment` contract, payout rail, marketplace fee mechanics | 🔴 |
| **D10** | **Bank aggregator** | Plaid? | `DataConnection(bank)` contract | 🔴 |

*(Related, lower-urgency: lender pre-qual integration is **mocked in v1** — no provider decision needed yet.)*

---

## What's NOT a decision (settled / sample data, do not relitigate)
- Tier structure: Lite → Full is a **monthly tier upgrade** (+$150), Launch Agent is a **per-signing add-on** on either tier. **Ratified.**
- Path B (Financial OS) carries **no fabricated price** — it *is* the Full Platform tier.
- Brand-level sample data (e.g. Bright Pickleball $45K franchise fee, 6% royalty, 2% brand fund; Rally & Roam units) is **illustrative FDD-style sample data**, not CoverPanda pricing — no decision needed.

## Recommended sequence
Lock **🔴 first** — D3, D4, D5, D8, D9, D10 — because they freeze the billing, `Payment`, and `DataConnection` contracts that the build hangs on. The 🟡/🟢 items can finalize in parallel without blocking engineering.
