# Product Specification: HiveLake™

**Status:** Canonical Version 1.0  
**Governing Document:** `PRODUCT_REGISTRY.md`  
**Architectural Tier:** Tier 2 — Data & Intelligence  
**Security Classification:** Tier 1 — Mission Critical

---

## 1. Product Overview

**HiveLake™** is the enterprise data lake — the unified, governed storage layer for all analytical, ML training, and historical data in the CerebroHive Intelligence Mesh. Where HiveStorage is the operational object store, HiveLake is the analytical data lake: structured, cataloged, schema-versioned, and optimized for large-scale query and ML consumption.

HiveLake is built on Apache Iceberg — an open table format that gives the lake ACID transactions, schema evolution, time-travel queries, and partition evolution without the vendor lock-in of proprietary lakehouse formats.

---

## 2. Architectural Position

```
HiveData (ingestion + transformation)
     │
     ▼
HiveLake (analytical data lake)
     │
     ├─── HiveAnalytics (SQL query engine)
     ├─── HiveModels (ML training datasets)
     ├─── HiveVector (re-embedding jobs)
     └─── CerebroInsight (ad-hoc analysis)

HiveStorage (raw blob store — underlying object storage)
     │
     └─── HiveLake (tables stored as Parquet files in HiveStorage)
```

---

## 3. Core Capabilities

### 3.1 Open Table Format (Apache Iceberg)
HiveLake stores all tables in Apache Iceberg format on top of HiveStorage:

**ACID Transactions**
- Multi-table transactions: commit changes to multiple tables atomically.
- Concurrent write safety: optimistic concurrency control — no write-write conflicts corrupt data.
- Read isolation: readers always see a consistent snapshot; ongoing writes don't affect read queries.

**Time Travel**
- Query any table as it existed at any point in time:
```sql
-- What did the revenue table look like 30 days ago?
SELECT * FROM revenue_mart FOR SYSTEM_TIME AS OF '2026-06-25 00:00:00';
```
- Retention configurable per table (default: 90 days of history).

**Schema Evolution**
- Add, rename, reorder, and widen columns without rewriting existing data.
- Type promotion (int → long, float → double) is safe and zero-copy.
- Column deletion marks columns as deprecated (data retained, not returned in queries by default).

**Partition Evolution**
- Change how a table is partitioned without rewriting historical data.
- New data uses the new partition scheme; old data retains its original partitioning. Query engine handles both transparently.

### 3.2 Data Zones
HiveLake organizes data into three zones reflecting data maturity:

**Raw Zone** (Bronze)
- Exact copy of source data as delivered by HiveData ingestion.
- Schema inferred, not enforced. Never modified after write.
- Retention: minimum 2 years. Purpose: reprocessing source when transformation logic changes.

**Curated Zone** (Silver)
- Cleaned, deduplicated, joined, and enriched data from HiveData transformation pipelines.
- Schema enforced by data contracts.
- Primary source for ML training and analytical queries.

**Serving Zone** (Gold)
- Aggregated, business-logic-applied data marts optimized for specific analytical use cases.
- Built by HiveAnalytics dbt models.
- Source for CerebroInsight dashboards and reports.

### 3.3 ML Dataset Management
HiveLake is the authoritative source for ML training datasets:

**Dataset Versioning**
- Every ML training dataset is a versioned Iceberg snapshot.
- Training jobs record the exact dataset version (table name + snapshot ID) used — reproducible training.
- Dataset lineage: traces from training dataset → source tables → source systems.

**Feature Store Integration**
- HiveLake serves as the offline feature store for batch ML features.
- Feature tables are Iceberg tables with point-in-time correct joins (no data leakage).
- Online features served via Redis (low-latency inference) are backfilled from HiveLake.

**Dataset Quality Gates**
- Before a dataset version is published for training use, automated quality checks validate:
  - Class balance (for classification tasks)
  - Feature distribution drift vs. baseline
  - Label quality (missing labels, impossible label values)
  - Temporal integrity (no future data leakage)

### 3.4 Data Catalog Integration
Every HiveLake table is automatically registered in HiveData's Data Catalog:
- Schema, partition structure, and row count registered at table creation.
- Statistics (column value distributions, null rates, min/max) computed on every table write and stored.
- Table popularity and query frequency tracked.
- Business metadata (owner, domain, SLA, description) editable in HiveConsole.

### 3.5 Access Control
- Table-level: read/write access controlled per table via HiveIdentity RBAC.
- Column-level: PII columns masked or redacted for users without PII access grant.
- Row-level: configurable row-level security policies (e.g., a user can only query rows where `region = their_assigned_region`).
- All access logged to HiveGovern audit trail.

### 3.6 Data Lifecycle Management
- **Compaction**: Small file compaction runs automatically (Iceberg rewrite_data_files) on high-write tables to prevent small-file performance degradation.
- **Expiry**: Old Iceberg snapshots are expired on configurable schedule (retain last N snapshots or last N days).
- **Tiering**: Parquet files not accessed in 90 days are moved from HiveStorage Hot to Warm tier automatically (transparent to query engines).
- **Deletion**: GDPR-compliant deletion — Iceberg positional delete files mark individual rows as deleted without full table rewrite.

---

## 4. Query Engines

HiveLake is query-engine-agnostic (open Iceberg format). Supported engines:

| Engine | Use Case | Access Method |
|---|---|---|
| HiveAnalytics (Trino) | Ad-hoc SQL, BI | SQL via JDBC/HTTPS |
| Spark (HiveCompute) | ML training, large-scale ETL | SparkSession.read.format("iceberg") |
| DuckDB (local) | Data scientist local exploration | DuckDB Iceberg extension |
| Python (pyiceberg) | Programmatic table management | Python SDK |

---

## 5. Technology Stack

| Component | Technology |
|---|---|
| Table Format | Apache Iceberg 1.x |
| Object Storage | HiveStorage (S3-compatible) |
| Metastore | Apache Iceberg REST Catalog (backed by PostgreSQL) |
| Compaction | Apache Spark (scheduled compaction jobs on HiveCompute) |
| Catalog UI | HiveConsole (table browser, schema explorer) |
| Lineage | HiveData lineage engine (OpenLineage events) |

---

## 6. SLAs

| Metric | Target |
|---|---|
| Table write availability | 99.9% |
| Read availability (query engines) | 99.9% |
| Compaction lag (small file ratio) | <10% of files below 128MB threshold |
| Time-travel retention | 90 days (configurable to 365) |
| GDPR row deletion propagation | <24 hours |
| ML dataset version reproducibility | 100% (exact same dataset always queryable by snapshot ID) |

---

## 7. Roadmap

| Milestone | Timeline |
|---|---|
| Delta Lake format support (dual-format tables for Databricks compatibility) | Q4 2026 |
| Automatic data quality enforcement at write (block writes that violate declared constraints) | Q1 2027 |
| Cross-region lake federation (query across regional lakes with data residency enforcement) | Q2 2027 |
| Native vector column support (store embedding vectors as Iceberg fixed-length binary columns) | Q2 2027 |
