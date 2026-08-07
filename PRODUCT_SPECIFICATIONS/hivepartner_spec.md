# Product Specification: HivePartner™

**Status:** Canonical Version 1.0  
**Governing Document:** `PRODUCT_REGISTRY.md`  
**Architectural Tier:** Tier 5 — Ecosystem  
**Security Classification:** Tier 2 — Business Critical

---

## 1. Product Overview

**HivePartner™** is the partner relationship management and co-sell platform — the infrastructure that enables CerebroHive's partner ecosystem to discover opportunities, co-sell, build joint solutions, earn referral revenue, and manage their commercial relationship with CerebroHive.

A strong partner ecosystem multiplies reach and accelerates enterprise adoption. HivePartner makes that ecosystem manageable at scale.

---

## 2. Partner Types

| Type | Description | Primary Value |
|---|---|---|
| Reseller | Sells CerebroHive directly to their customers | Margin on software + services |
| Referral | Refers opportunities; CerebroHive closes the deal | Referral fee (% of ARR) |
| Systems Integrator (SI) | Implements and customizes CerebroHive for enterprise customers | Professional services revenue |
| ISV (Technology Partner) | Builds products that integrate with or extend CerebroHive | HiveExchange revenue share |
| OEM | Embeds CerebroHive capabilities in their own product | Embedded license fees |
| Strategic Alliance | Joint GTM, co-development, or co-investment | Revenue share + co-marketing |

---

## 3. Core Capabilities

### 3.1 Partner Portal
Self-service portal for all partner types:
- **Deal registration**: Partners register opportunities to protect commission on deals they originated.
- **Pipeline visibility**: Partners see their registered pipeline and co-sell opportunities.
- **Co-sell collaboration**: Shared deal workspace — partner and CerebroHive seller collaborate on deal strategy, shared documents, and mutual action plans.
- **Training & certification**: Partner team members complete training and earn CerebroHive certifications (tracked in the portal).
- **Marketing resources**: Brand assets, case studies, pitch decks, competitive battlecards — localized for key markets.
- **Support escalation**: Partners log support tickets on behalf of their customers; visibility into resolution status.

### 3.2 Deal Registration
- Partner submits deal with: prospect name, contact, estimated ARR, expected close date, products.
- Validation: CerebroHive reviews for conflict with existing CerebroHive sales motion.
- Approval: approved deals give the partner protection — if deal closes, partner earns their agreed commission.
- Expiry: deal registration expires after 90 days if no progress; renewable.
- Protection rules: clear rules for when protection applies (partner originated lead vs. CerebroHive sourced).

### 3.3 Referral & Commission Tracking
- Every closed deal linked to the originating partner (via deal registration or UTM tracking).
- Commission calculation: configurable commission rates by partner tier, product, and deal size.
- Commission statement: monthly statement showing earned commissions per deal.
- Payout: via HiveBilling partner payout mechanism (Stripe Connect or wire).

### 3.4 Partner Tiers & Benefits

| Tier | Requirements | Benefits |
|---|---|---|
| Registered | Basic profile, 1 certification | Portal access, standard margin |
| Silver | $500K partner-sourced ARR, 3 certifications | Increased margin, co-marketing budget, deal desk access |
| Gold | $2M partner-sourced ARR, 5 certifications, dedicated practice | Premium margin, dedicated partner manager, NFR licenses, joint QBR |
| Platinum | $10M partner-sourced ARR, joint solution, co-invest | Maximum margin, executive alignment, co-development budget |

### 3.5 Not-For-Resale (NFR) License Management
- Partners receive NFR licenses for their own use (demo, development, internal use).
- NFR licenses tracked in HiveLicense — automatically provisioned at tier advancement.
- Usage monitoring: HiveLicense verifies NFR licenses are not used for commercial customer deployments.

### 3.6 Partner Analytics
- Partner-sourced pipeline by stage and partner.
- Partner-influenced vs. partner-sourced ARR distinction.
- Partner performance ranking: identify top-performing partners for increased investment.
- Training completion rates by partner organization.

---

## 4. Technology Stack

| Component | Technology |
|---|---|
| Partner Portal | Next.js 14 (separate deployment from main app) |
| CRM Integration | CerebroCRM (partner opportunities sync to CRM) |
| Commission Engine | Python (configurable commission rules) |
| Payout | HiveBilling (Stripe Connect payouts) |
| License Provisioning | HiveLicense |
| Document Store | HiveStorage |
| API | NestJS |

---

## 5. SLAs

| Metric | Target |
|---|---|
| Deal registration response | <2 business days |
| Commission statement generation | By 5th of each month |
| Partner portal availability | 99.9% |
| NFR license provisioning | <30 minutes after tier approval |

---

## 6. Roadmap

| Milestone | Timeline |
|---|---|
| AI partner matching (match partners to opportunities based on their past deal profile) | Q1 2027 |
| Joint solution certification program (CerebroHive certifies partner-built solutions for HiveMarketplace) | Q2 2027 |
| Partner co-marketing automation (co-branded campaign execution with partner-specific UTM tracking) | Q2 2027 |
