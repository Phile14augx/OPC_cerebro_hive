# Product Specification: HiveAnalytics™

**Status:** Canonical Version 1.0  
**Governing Document:** `PRODUCT_REGISTRY.md`  
**Architectural Tier:** Tier 2 — Data & Intelligence  
**Security Classification:** Tier 1 — Mission Critical

---

## 1. Product Overview

**HiveAnalytics™** is the semantic analytics layer — a distributed SQL query engine with a business-semantic layer on top. It makes enterprise data queryable by machines (CerebroInsight NL2SQL, AI agents) and by humans (data analysts, business analysts) through a single, governed interface where metric definitions are defined once and reused everywhere.

The core problem HiveAnalytics solves: in most enterprises, "revenue" means 12 different things across 12 different spreadsheets. HiveAnalytics defines it once in the semantic layer, and every consumer — dashboard, report, AI query, board presentation — uses the same number.

---

## 2. Architectural Position

```
HiveLake (data source)
HiveData (curated data marts)
     │
     ▼
HiveAnalytics
  ├── SQL Engine (Trino)         ← raw SQL queries
  ├── Semantic Layer (dbt)       ← metric definitions
  └── Query API                  ← programmatic access
     │
     ├── CerebroInsight          (NL→SQL→results)
     ├── CerebroFinance          (FP&A models)
     ├── AI Agents via HiveAgents (data retrieval tools)
     └── Direct BI (Metabase, Tableau, Power BI via JDBC)
```

---

## 3. Core Capabilities

### 3.1 Distributed SQL Engine (Trino)
- **Engine**: Trino (formerly PrestoSQL) — massively parallel, distributed query engine.
- **Federated queries**: Single SQL query can join tables from HiveLake, PostgreSQL operational databases, and external sources (Snowflake, BigQuery via connectors).
- **Scale**: Horizontal scaling on HiveCompute — query workers scale out for large queries, scale in during low utilization.
- **Performance**: Query result caching (Redis), materialized view support, cost-based optimizer.
- **Concurrency**: Query queuing and workload management — SLA classes (interactive, scheduled, batch) with priority queuing.

**Query SLA Classes**

| Class | Use Case | Max Runtime | Priority |
|---|---|---|---|
| Interactive | Analyst ad-hoc, dashboard queries | 30 seconds | High |
| Scheduled | Dashboard refresh, report generation | 5 minutes | Medium |
| Batch | Large exports, data pipeline queries | 2 hours | Low |
| ML | Training dataset extraction | 8 hours | Lowest |

### 3.2 Semantic Layer (dbt)
The semantic layer is HiveAnalytics' most important capability. Built on dbt (data build tool):

**Metric Definitions**
All business metrics are defined in YAML, version-controlled in Git, and computed from HiveLake curated data:

```yaml
# metrics/revenue.yml
metrics:
  - name: monthly_recurring_revenue
    label: MRR
    model: ref('subscription_facts')
    description: "Sum of monthly recurring revenue from all active subscriptions"
    calculation_method: sum
    expression: monthly_amount
    timestamp: subscription_start_date
    time_grains: [month, quarter, year]
    dimensions:
      - product_line
      - customer_segment
      - geography
      - account_owner

  - name: net_revenue_retention
    label: NRR
    description: "Revenue retained + expanded from existing customer cohort"
    calculation_method: derived
    expression: "(mrr_end - new_mrr) / mrr_start"
    time_grains: [month, quarter, year]
```

**What the semantic layer provides:**
- Single source of truth for every metric.
- Consistent dimension slicing (any metric can be sliced by any compatible dimension).
- Business context for AI (CerebroInsight NL2SQL reads the semantic layer as context — "MRR" in a natural language query resolves to the correct SQL).
- Automated documentation: metrics auto-documented with their lineage, definition, and sample values.

**dbt Models**
- Staging models: clean and type-cast raw HiveLake data.
- Intermediate models: business logic (joins, aggregations, business rules).
- Mart models: final, consumer-ready tables (one per domain: finance, sales, ops, people).
- Tests: every model has data quality tests (not null, unique, referential integrity, accepted values).

### 3.3 Query API
Programmatic access for AI agents and application integrations:

```http
POST /v1/analytics/query
Authorization: Bearer {service_token}

{
  "query": "SELECT product_line, SUM(mrr) as mrr FROM metrics.monthly_recurring_revenue WHERE month = '2026-07' GROUP BY 1 ORDER BY 2 DESC",
  "execution_class": "interactive",
  "max_rows": 1000,
  "timeout_seconds": 30
}

→ 200 OK
{
  "query_id": "qry_abc123",
  "columns": ["product_line", "mrr"],
  "rows": [
    ["Enterprise", 1840000],
    ["Mid-Market", 920000],
    ["SMB", 340000]
  ],
  "execution_time_ms": 847,
  "rows_scanned": 2840000
}
```

**Metric API** (semantic layer — no raw SQL required):
```http
POST /v1/analytics/metrics
Authorization: Bearer {service_token}

{
  "metric": "monthly_recurring_revenue",
  "grain": "month",
  "dimensions": ["product_line"],
  "filters": [{ "dimension": "geography", "value": "EMEA" }],
  "start_date": "2026-01-01",
  "end_date": "2026-07-01"
}
```

### 3.4 BI Tool Integration
HiveAnalytics exposes standard interfaces for every BI tool in the market:
- **JDBC/ODBC**: Tableau, Power BI, Qlik, SAP BusinessObjects, any JDBC-compatible tool.
- **REST API**: Metabase, Grafana, custom dashboards.
- **dbt Semantic Layer API**: Tools that understand dbt metrics (Metabase, Lightdash, Cube.dev).

### 3.5 Query Governance
- **Column-level access control**: Queries that select PII columns require PII access grant (enforced at query time by HiveIdentity policy).
- **Query audit log**: Every query (SQL text, user/service, result row count, execution time) logged to HiveGovern.
- **Data residency enforcement**: Queries cannot join tables across restricted regional boundaries (enforced by HiveGovern policy).
- **Cost controls**: Query cost estimates (data scanned × cost/TB) enforced per user/tenant to prevent runaway queries.

### 3.6 Observability
- Query performance dashboard: P50/P95/P99 query latency by class, cache hit rate, worker utilization.
- Slow query log: queries exceeding SLA thresholds flagged with execution plan for optimization.
- Metric freshness: for every metric, when was the underlying dbt model last refreshed? Stale metric warnings surfaced in CerebroInsight.

---

## 4. Technology Stack

| Component | Technology |
|---|---|
| SQL Engine | Trino (distributed, open-source) |
| Semantic Layer | dbt Core + dbt Semantic Layer |
| Query Cache | Redis (result cache for repeated queries) |
| Metastore | Apache Iceberg REST Catalog (via HiveLake) |
| Coordinator | Trino coordinator (query planning + scheduling) |
| Workers | Trino workers on HiveCompute (auto-scaling) |
| API Layer | Python FastAPI (wraps Trino HTTP API) |
| BI Connectivity | Trino JDBC driver + REST API |

---

## 5. SLAs

| Metric | Target |
|---|---|
| Interactive query P99 latency | <5 seconds (cached), <30 seconds (uncached) |
| Scheduled query completion (within SLA class) | >99% |
| Cache hit rate (dashboard queries) | >70% |
| dbt model refresh frequency | Hourly (configurable per model) |
| Query availability | 99.9% |
| Federated query latency overhead vs. native | <2x |

---

## 6. Roadmap

| Milestone | Timeline |
|---|---|
| Real-time metrics (streaming dbt models, sub-minute freshness) | Q4 2026 |
| AI-assisted metric definition (describe metric in plain language → generated dbt YAML) | Q1 2027 |
| Metric versioning and change impact analysis (who breaks if I change this metric?) | Q1 2027 |
| Autonomous query optimization (AI rewrites slow queries using execution plan feedback) | Q2 2027 |
