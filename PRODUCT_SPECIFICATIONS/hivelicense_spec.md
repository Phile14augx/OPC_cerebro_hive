# Product Specification: HiveLicense™

**Status:** Canonical Version 1.0  
**Governing Document:** `PRODUCT_REGISTRY.md`  
**Architectural Tier:** Tier 5 — Ecosystem  
**Security Classification:** Tier 2 — Business Critical

---

## 1. Product Overview

**HiveLicense™** is the software licensing and entitlement management platform — the system that controls what capabilities each tenant is entitled to use, enforces those entitlements at runtime, and manages the commercial relationship between CerebroHive and its customers and partners.

It is the runtime enforcement partner to HiveBilling: HiveBilling measures what was consumed; HiveLicense controls what can be consumed.

---

## 2. Core Capabilities

### 2.1 Entitlement Management
Every tenant has an entitlement record that defines:

```yaml
tenant: acme-corp
plan: enterprise-plus
entitlements:
  # Products
  products:
    - cerebro_crm: {seats: 50, modules: [core, ai_copilot, revenue_intelligence]}
    - cerebro_hr: {seats: 200}
    - hive_agents: {enabled: true}
    - hive_models: {enabled: true, allowed_models: [gpt-4o, claude-3-5-sonnet, text-embedding-3-large]}
    - cerebro_search: {enabled: true}
  
  # Usage quotas (enforced at runtime by HiveGateway)
  quotas:
    llm_tokens_per_month: 100_000_000
    vector_storage_gb: 500
    agent_tasks_per_month: 10_000
    api_calls_per_second: 500
    compute_gpu_hours_per_month: 200
  
  # Features
  features:
    sso: true
    audit_log_export: true
    custom_models: true
    data_residency: [eu-west-1]
    support_tier: enterprise
    
  # Commercial terms
  contract_start: 2026-01-01
  contract_end: 2026-12-31
  auto_renew: true
```

Entitlements are stored in HiveLicense and served via a low-latency API to HiveGateway for runtime enforcement.

### 2.2 Runtime Entitlement Enforcement
HiveGateway queries HiveLicense on every API call:
- Is this tenant entitled to call this API product?
- Does this tenant have available quota for this resource?
- Is this specific feature enabled for this tenant?
- Is this tenant's contract active (not expired or suspended)?

Enforcement latency: <5ms (HiveLicense response served from Redis cache; cache invalidated on entitlement change).

### 2.3 Seat Management
For per-seat licensed products:
- Seat pool: total licensed seats per product.
- Seat assignment: admin assigns seats to specific users. Unassigned users cannot log in to that product.
- Seat utilization report: used vs. available seats per product.
- Seat reclamation: inactive users (>90 days) flagged for potential seat reclamation.
- Over-assignment prevention: assigning more seats than licensed is blocked (or triggers auto-expansion if configured).

### 2.4 License Key Management
For ISV and partner scenarios:
- License key generation: time-limited, feature-scoped cryptographic keys.
- Offline license support: for air-gapped enterprise deployments, signed license files that can be validated without calling home.
- License activation: device/instance-based activation tracking.
- License transfer: move a license from one deployment to another (with audit trail).

### 2.5 Contract Lifecycle
- Contract creation: terms, products, quantities, pricing, start/end dates.
- Auto-renewal management: reminder emails 90/60/30 days before renewal; auto-renew or require manual renewal.
- Amendment management: mid-term expansions, reductions, and product additions recorded as amendments.
- Renewal forecasting: feeds into CerebroFinance ARR model.

### 2.6 Compliance Reporting
- License compliance audit: at any point in time, report on whether actual usage is within licensed limits.
- Over-usage alerts: notify admins when usage approaches quota limits (80%, 90%, 100% threshold alerts).
- Usage vs. entitlement report: monthly summary of what was licensed vs. what was used.

---

## 3. Technology Stack

| Component | Technology |
|---|---|
| Entitlement Store | PostgreSQL |
| Runtime Cache | Redis (fast entitlement lookup — <5ms SLA) |
| License Crypto | RSA-256 signed JWT (offline licenses) |
| API | FastAPI (Python) |
| Contract Management | PostgreSQL + HiveStorage (contract documents) |

---

## 4. SLAs

| Metric | Target |
|---|---|
| Entitlement check latency P99 | <5ms (cached) |
| Cache refresh on entitlement change | <30 seconds |
| License key generation | <1 second |
| Entitlement service availability | 99.99% |

---

## 5. Roadmap

| Milestone | Timeline |
|---|---|
| AI-recommended entitlement expansions (predict when tenant will hit quota and recommend upgrade before disruption) | Q1 2027 |
| Self-service license expansion (tenant can expand quota mid-cycle, immediately active, billed automatically) | Q1 2027 |
| Usage-based auto-scaling entitlements (quotas expand automatically within pre-approved limits) | Q2 2027 |
