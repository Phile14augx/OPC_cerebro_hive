# Product Specification: HiveBilling™

**Status:** Canonical Version 1.0  
**Governing Document:** `PRODUCT_REGISTRY.md`  
**Architectural Tier:** Tier 5 — Ecosystem  
**Security Classification:** Tier 1 — Mission Critical (financial)

---

## 1. Product Overview

**HiveBilling™** is the monetization infrastructure for the CerebroHive Intelligence Mesh — the metering, billing, and revenue management platform that enables every product in the portfolio to charge for its value. It handles the full revenue lifecycle: usage measurement → rating → invoicing → payment collection → revenue recognition.

HiveBilling also powers the commerce layer for HiveExchange, HiveMarketplace, and HivePartner — enabling third-party publishers and partners to charge for their artifacts and solutions through the platform.

---

## 2. Core Capabilities

### 2.1 Usage Metering
Sub-second metering of all billable platform events:

| Resource | Metered Unit | Products |
|---|---|---|
| LLM tokens | Per 1K input/output tokens | HiveModels, CerebroSearch (synthesis), HiveAgents |
| Embedding operations | Per 1M vectors embedded | HiveVector |
| Vector storage | Per GB-month stored | HiveVector |
| Compute | Per GPU-hour, vCPU-hour | HiveCompute |
| Storage | Per GB-month (by tier) | HiveStorage |
| API calls | Per 1K API requests | HiveGateway |
| Agent tasks | Per task execution | HiveAgents |
| Workflow executions | Per workflow run + per activity | HiveAutomation |
| Data records processed | Per 1M rows | HiveData |
| Seats | Per user/month | Application products (CerebroCRM, CerebroHR, etc.) |

**Metering architecture:**
- Meter events emitted from every platform service via Kafka.
- Meter ingestion service: consumes events, validates, deduplicates (idempotency keys), and writes to ClickHouse.
- Immutable meter ledger: all meter events are append-only with cryptographic chain (same architecture as HiveGovern audit log).
- Real-time aggregation: running totals updated continuously — no batch jobs for usage data.

### 2.2 Pricing Engine
Flexible pricing model support:

| Pricing Model | Configuration |
|---|---|
| Fixed (subscription) | Flat monthly/annual fee for a product |
| Tiered | Price per unit decreases as volume increases (0–100K tokens: $0.01/1K; 100K–1M: $0.008/1K) |
| Volume | All units priced at the rate of the highest volume tier reached |
| Per-seat | Monthly fee × active user count |
| Usage-based | Pay-per-use with no commitment |
| Hybrid | Committed base + overage (most common enterprise model) |
| Custom enterprise | Negotiated rates stored as custom price list per tenant |

**Plan management:**
- Plans defined in configuration (not code). New plans deployable without engineering.
- Plan assignment per tenant: each tenant is on a named plan with a specific price list.
- Mid-cycle plan changes: prorate calculations handled automatically.
- Committed spend discounts: tenants committing to minimum annual spend receive configured discount %.

### 2.3 Invoice Generation
- Monthly invoice auto-generated on the first of each month for prior month usage.
- Invoice components: subscription fees + usage charges + marketplace purchases + overage.
- Line item detail: each usage dimension broken down — tenants can see exactly what drove their bill.
- Invoice PDF generated (WeasyPrint) and stored in HiveStorage.
- Invoice delivered via: email, API (webhook), and self-service billing portal.
- Credit notes: issued for corrections, adjustments, and HiveExchange revenue share payouts.

### 2.4 Payment Collection
- **Credit card**: Stripe (primary for SMB and developer tier).
- **ACH / Wire**: Bank transfer for mid-market and enterprise accounts.
- **Invoice terms**: Net-30 for enterprise (with credit check).
- **Automatic collection**: Failed payment retry schedule (3 days, 7 days, 14 days before suspension).
- **Dunning management**: automated email sequence for failed payments; sales alert for strategic accounts.
- **Payment portal**: self-service portal for tenants to update payment methods, view invoices, download receipts.

### 2.5 Revenue Recognition
- Revenue recognition rules configurable per product type:
  - SaaS subscription: recognized ratably over contract term (ASC 606 compliant).
  - Usage-based: recognized as consumed.
  - One-time: recognized at point of delivery.
- Deferred revenue tracking: subscription revenue paid upfront → deferred until earned.
- Revenue waterfall report: bookings → billings → recognized revenue — with variance analysis.
- Integrates with CerebroERP GL for automated journal entries.

### 2.6 Partner Revenue Share
For HiveExchange and HivePartner revenue:
- Gross transaction revenue metered when a customer pays for a third-party artifact/solution.
- Platform fee (20%) retained; partner's share (80%) calculated.
- Monthly revenue share statement generated per partner.
- Payout via Stripe Connect (bank transfer) or platform credit.
- 1099-K generation for US partners exceeding IRS thresholds.

### 2.7 Billing Analytics
- MRR / ARR dashboard: new MRR, expansion MRR, contraction MRR, churn MRR, net MRR.
- Customer lifetime value tracking.
- Product revenue breakdown: which products generate the most revenue?
- Usage-vs-commit tracking: which tenants are over/under their committed amounts?
- Cohort analysis: revenue retention by signup cohort.
- Integrates with CerebroFinance for FP&A consumption.

---

## 3. Technology Stack

| Component | Technology |
|---|---|
| Meter Event Bus | Apache Kafka |
| Meter Store | ClickHouse (high-throughput append; columnar aggregation) |
| Pricing Engine | Python (custom rating engine) |
| Invoice Generation | WeasyPrint + Jinja2 templates |
| Payment Processing | Stripe (card, ACH) |
| Revenue Recognition | Python (ASC 606 rules engine) → CerebroERP journal entries |
| Database | PostgreSQL (plans, invoices, payment records) |
| API | NestJS (TypeScript) |

---

## 4. SLAs

| Metric | Target |
|---|---|
| Meter event ingestion latency | <10 seconds |
| Invoice generation (after month close) | <24 hours |
| Payment collection retry execution | Within configured schedule |
| Revenue recognition accuracy | 100% (auditable, every entry has source meter event) |
| Billing API availability | 99.99% (revenue-impacting) |
| Usage dashboard freshness | <5 minutes |

---

## 5. Roadmap

| Milestone | Timeline |
|---|---|
| Real-time spend alerting (notify tenant when projected bill exceeds budget threshold) | Q4 2026 |
| Usage forecasting (predict next month's bill based on usage trend) | Q1 2027 |
| Flexible invoice scheduling (weekly, bi-monthly, quarterly invoicing options) | Q1 2027 |
| Multi-currency support (invoice in customer's local currency, FX conversion at transaction date) | Q2 2027 |
