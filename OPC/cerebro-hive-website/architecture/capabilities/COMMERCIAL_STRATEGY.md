# CerebroHive™ Commercial Strategy

**Status:** Canonical Version 1.0  
**Governing Document:** `CEREBROHIVE_CONSTITUTION.md`  
**Upstream Dependency:** `SERVICES_PORTFOLIO.md`

Enterprise AI cannot be priced like traditional SaaS (per-seat) or raw infrastructure (per-compute). CerebroHive employs a hybrid commercial strategy that aligns platform value with enterprise outcomes, packaging our capabilities into cohesive tiers rather than disjointed product licenses.

---

## 1. Commercial Packaging & Editions

Rather than selling 30 individual products, CerebroHive is packaged into distinct commercial editions. Each edition bundles specific Cerebro Applications and Hive Platform capabilities tailored to organizational maturity.

### Starter Edition
* **Target Audience**: Startups and Small Teams exploring AI.
* **Packaging Strategy**: Self-serve, multi-tenant SaaS.
* **Included Products**: CerebroStudio (Basic), CerebroFlow (10k runs/mo), HiveIdentity.
* **Support SLA**: Community & Standard Business Hours.
* **Deployment Model**: Shared Cloud only.

### Professional Edition
* **Target Audience**: Mid-Market organizations automating core workflows.
* **Packaging Strategy**: Standardized SaaS with advanced features.
* **Included Products**: Everything in Starter + CerebroAgent (up to 5 active agents), CerebroInsight, HiveForge, HiveAPI (Standard limits).
* **Support SLA**: 24/5 Support.
* **Deployment Model**: Shared Cloud only.

### Business Edition
* **Target Audience**: Departments within Large Enterprises.
* **Packaging Strategy**: High-capacity SaaS with custom integrations.
* **Included Products**: Everything in Professional + CerebroERP (Beta), CerebroSearch, CerebroLearn (up to 100 seats).
* **Support SLA**: 24/7 Support with 4-hour response.
* **Deployment Model**: Dedicated Tenant (Single-tenant cloud).

### Enterprise Edition (The Core OS)
* **Target Audience**: Fortune 500 / Global Enterprises.
* **Packaging Strategy**: Full Intelligence Mesh access.
* **Included Products**: Everything in Business + HiveOps, HiveShield, HiveGovern, CerebroArchive, Unlimited Agents.
* **Support SLA**: 24/7 Priority Support (1-hour response) + Dedicated Technical Account Manager (TAM).
* **Deployment Model**: Private Cloud (VPC) or On-Premises Air-Gapped.

### Enterprise Plus Edition
* **Target Audience**: Highly regulated or massive scale organizations.
* **Packaging Strategy**: Unlimited platform utilization with white-glove managed services.
* **Included Products**: The complete product registry + HiveCompute (Dedicated GPU scheduling), HiveNetwork.
* **Support SLA**: 15-minute response + Included Managed MLOps & Red-Teaming (from Services Portfolio).
* **Deployment Model**: Multi-Cloud / Federated.

### Government / Defense Edition
* **Target Audience**: Federal Agencies, DoD.
* **Packaging Strategy**: Maximum security and data sovereignty.
* **Included Products**: Enterprise Edition restricted to IL5/IL6 certified modules.
* **Support SLA**: Cleared US-citizen support only.
* **Deployment Model**: strictly Air-gapped on gov-approved hardware.

### OEM / Embedded Edition
* **Target Audience**: Independent Software Vendors (ISVs).
* **Packaging Strategy**: White-labeling Hive Platform to power third-party applications.
* **Included Products**: HiveAPI, HiveForge, CerebroFlow (headless).
* **Deployment Model**: API-driven.

---

## 2. Licensing & Subscription Philosophy

Our pricing philosophy rejects pure "per-seat" models because AI agents do the work of humans. If we charge per seat, we penalize automation. 

Instead, our licensing relies on a **Platform Base + Consumption** model.

### Component 1: The Platform Base (Annual Subscription)
A flat annual fee based on the chosen Edition (e.g., Enterprise Edition). This fee grants access to the software, the UI, the governance tools, and basic support. 

### Component 2: The Intelligence Compute (Consumption)
A metered billing system based on "Hive Credits". Hive Credits are burned when:
- LLMs are invoked (inference tokens).
- Agents execute background workflows (compute minutes).
- Vectors are stored and queried (storage gigabytes).
- Advanced automated workflows run (task completion).

*Customers prepay for Hive Credits annually, with overage billed monthly.*

### Component 3: Human Seats (Minimal Licensing)
We only charge for seats for users who actively author workflows or administer the platform (e.g., "Creator" or "Admin" seats). "Consumer" seats (users just viewing dashboards or chatting with Studio) are included in the Platform Base at no extra cost.

---

## 3. Marketplace Revenue Model (HiveExchange)

As the ecosystem matures, HiveExchange will become a primary revenue driver.
- **For CerebroHive-Authored Assets**: Included in the Platform Base or sold as premium add-ons (e.g., "Financial Industry Prompt Pack").
- **For Partner-Authored Assets**: CerebroHive takes a standard 20% platform fee on all transactions (Agents, Workflows, Models) sold by third-party developers to our enterprise customers.

---

## 4. Alignment with Services

The Commercial Strategy is explicitly tied to the Services Portfolio:
- **Enterprise** and **Enterprise Plus** editions automatically include mandatory implementation services (e.g., *Intelligence Mesh Architecture Design*) to ensure deployment success.
- Lower tiers (Starter, Professional) are strictly self-serve or partner-led implementations.
