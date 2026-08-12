# Product Specification: HiveSemantic™

**Status:** Canonical Version 1.0  
**Governing Document:** `PRODUCT_REGISTRY.md`  
**Architectural Tier:** Tier 3 — AI Runtime  
**Security Classification:** Tier 2 — Business Critical

---

## 1. Product Overview

**HiveSemantic™** is the enterprise semantic layer — the platform that gives AI systems and human analysts a shared, machine-readable understanding of business concepts, terminology, and context. It is the bridge between raw data (tables, columns, values) and business meaning (revenue, customer, churn rate) that enables every AI system in the Intelligence Mesh to reason about enterprise data correctly.

Without HiveSemantic, every AI application must rediscover that "ARR" means Annual Recurring Revenue, that the "customers" table excludes churned accounts, and that "revenue" excludes deferred subscription income. HiveSemantic encodes this once, and every AI system inherits it.

---

## 2. Core Capabilities

### 2.1 Business Glossary
The authoritative dictionary of enterprise concepts:

```yaml
term:
  name: "Annual Recurring Revenue (ARR)"
  aliases: ["ARR", "annual recurring revenue", "annual run rate"]
  definition: "Normalized annual revenue from all active subscription contracts. 
               Excludes one-time fees, professional services revenue, and 
               revenue from churned accounts."
  domain: finance
  owner: "Finance Team"
  approved_by: "CFO"
  related_terms: ["MRR", "NRR", "Churn ARR", "Expansion ARR"]
  
  # Data linkage
  data_mapping:
    primary_table: "subscription_facts"
    primary_column: "monthly_amount"
    calculation: "SUM(monthly_amount * 12) WHERE status = 'active'"
    excludes: ["one_time_fees", "professional_services"]
  
  # Semantic tags for AI consumption
  tags: ["financial_metric", "subscription", "saas"]
  
  versioned: true
  last_updated: "2026-06-01"
  change_log:
    - version: "2.0", date: "2026-06-01", change: "Excluded deferred revenue per new accounting policy"
```

**Glossary features:**
- Version history: every definition change is tracked. AI systems can query the definition as of a specific date.
- Conflict detection: if two terms have conflicting definitions, a resolution workflow is triggered.
- AI-assisted definition drafting: LLM suggests definition improvements based on actual data usage patterns.
- Usage tracking: which AI systems and reports reference this term? Who breaks if we change the definition?

### 2.2 Data Semantic Mapping
Maps business concepts to the physical data layer (HiveLake tables and columns):

- **Column semantic tagging**: Every column in HiveLake is tagged with its semantic type (identifier, metric, dimension, date, PII type).
- **Business entity mapping**: "The 'accounts' table in CerebroERP and 'companies' table in CerebroCRM both represent the same business entity: Customer Account."
- **Cross-system entity resolution**: The same real-world entity (a customer, a vendor, a product) appears in multiple systems. HiveSemantic maintains the canonical entity definition and its mapping across systems.
- **Metric → SQL mapping**: Every business metric in the glossary maps to a concrete SQL expression in HiveAnalytics. When CerebroInsight resolves "ARR", it gets the verified SQL.

### 2.3 Ontology Management
For complex enterprise domains, HiveSemantic maintains formal ontologies:
- Entity type hierarchy: `Business Entity → Organization → Customer → Enterprise Customer → Named Account`
- Relationship types: "is-a", "part-of", "belongs-to", "is-related-to", "depends-on"
- Constraints: "A Customer must have at least one active Contract", "A Contract must reference exactly one Customer"
- Domain ontologies: Finance, Sales, HR, Supply Chain — pre-built domain models available as starting templates.

### 2.4 Context Injection for AI
HiveSemantic's primary runtime function: provide AI systems with the semantic context they need to reason correctly:

**For NL2SQL (CerebroInsight)**
When a user asks "What's our ARR by product line?", CerebroInsight queries HiveSemantic before generating SQL:
- Resolves "ARR" → definition + SQL expression + source table
- Resolves "product line" → dimension column + accepted values
- Injects this context into the LLM prompt alongside the raw schema
- Result: SQL that correctly excludes churned accounts and one-time fees

**For Agents (HiveAgents)**
When an agent needs to understand a business concept, it calls HiveSemantic:
```python
context = await tools.hive_semantic.resolve_term("customer churn")
# Returns: definition, calculation, thresholds, related metrics
# Agent now reasons about churn using the correct, approved definition
```

**For Models (HiveModels)**
When a fine-tuned model is trained, HiveSemantic provides the business glossary as part of the training context, so the model internalizes enterprise-specific terminology.

### 2.5 Semantic Search Enhancement
HiveSemantic enriches CerebroSearch and HiveVector retrieval:
- Synonym expansion: a search for "revenue" also matches documents about "ARR", "MRR", "sales".
- Domain-aware embeddings: documents are re-embedded with business context from HiveSemantic, improving retrieval relevance for domain-specific queries.
- Concept disambiguation: "bank" in a financial services company means the institution, not the riverbank.

### 2.6 Change Impact Analysis
When a business definition changes, HiveSemantic maps the downstream impact:
- "The definition of 'active customer' is changing to exclude customers on payment pause. Which reports, dashboards, models, and AI systems will be affected?"
- Generates an impact report: list of affected artifacts, their owners, and the nature of the change.
- Triggers a review workflow: owners of affected artifacts are notified and must confirm before the definition change takes effect.

---

## 3. Technology Stack

| Component | Technology |
|---|---|
| Glossary Store | PostgreSQL (versioned term definitions) |
| Ontology Store | Apache Jena (RDF/OWL ontology + SPARQL) |
| Data Mapping | dbt (physical-to-semantic mapping maintained alongside HiveAnalytics models) |
| Semantic Search | HiveVector (term and definition embeddings) |
| API | FastAPI (Python) |
| UI | HiveConsole (glossary browser, mapping editor) |

---

## 4. SLAs

| Metric | Target |
|---|---|
| Term resolution latency (NL2SQL path) | <50ms (critical path) |
| Glossary availability | 99.99% (LLM queries block on this) |
| Definition change impact analysis generation | <2 minutes |
| Cross-system entity mapping coverage | >95% of entities in core systems |
| Term change propagation (after approval) | <5 minutes |

---

## 5. Roadmap

| Milestone | Timeline |
|---|---|
| Auto-discovery of implicit business rules from query patterns (learn from how analysts actually query data) | Q4 2026 |
| Federated semantic layer (multiple business units have sub-glossaries; HiveSemantic federates them) | Q1 2027 |
| Natural language definition authoring (describe a term in plain language, AI generates formal definition + SQL mapping) | Q1 2027 |
| Semantic versioning API (consumers declare which definition version they depend on — time-travel for semantics) | Q2 2027 |
