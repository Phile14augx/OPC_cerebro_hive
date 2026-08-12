# Product Specification: HiveAPI™

**Status:** Canonical Version 1.0  
**Governing Document:** `PRODUCT_REGISTRY.md`  
**Architectural Tier:** Tier 2 — Platform  
**Security Classification:** Tier 2 — Business Critical

---

## 1. Product Overview

**HiveAPI™** is the developer-facing API management layer — the published, versioned, documented, and contractually-stable interface through which external developers, enterprise integrators, and partners consume CerebroHive capabilities. Where HiveGateway is the runtime enforcement layer (auth, rate limiting, routing), HiveAPI is the lifecycle management layer (API design standards, versioning, deprecation, developer onboarding, and SDK generation).

---

## 2. Core Capabilities

### 2.1 API Catalog
- Complete catalog of all published API products with OpenAPI 3.1 specifications.
- Searchable by product, capability, data type, and use case.
- API health status: real-time uptime and latency for each API product.
- Changelog: version history with breaking change annotations.

### 2.2 API Design Standards Enforcement
All CerebroHive APIs conform to enforced design standards:

| Standard | Specification |
|---|---|
| Specification Format | OpenAPI 3.1 (machine-readable, used for SDK generation and validation) |
| REST conventions | Nouns for resources, HTTP verbs for actions, plural resource names |
| Error format | RFC 7807 Problem Details (`type`, `title`, `status`, `detail`, `instance`) |
| Pagination | Cursor-based (not offset) — `next_cursor` token in response |
| Idempotency | Idempotency-Key header supported on all POST/PATCH/DELETE |
| Versioning | URL path versioning (`/v1/`, `/v2/`) with 12-month deprecation period |
| Dates | ISO 8601 (RFC 3339) with UTC timezone |
| IDs | Prefixed resource IDs (e.g., `col_abc123`, `mem_xyz456`) for debuggability |
| gRPC | protobuf definitions maintained alongside OpenAPI for all gRPC-compatible endpoints |

**Automated Linting**: All API changes are validated against these standards in CI/CD via Spectral (OpenAPI linter). Breaking changes (removing fields, changing types) are blocked without a major version increment.

**Breaking Change Definition** (anything in this list requires a new major version):
- Removing or renaming a field in a request or response
- Changing a field type (string → integer, optional → required)
- Removing an endpoint
- Changing response status codes
- Changing authentication requirements

### 2.3 Versioning & Deprecation
Formal API lifecycle:

```
BETA → GA → DEPRECATED → SUNSET
```

- **BETA**: Available, breaking changes possible with 30-day notice.
- **GA**: Stable. Breaking changes require new major version + 12-month deprecation period.
- **DEPRECATED**: Still works; sunset date announced. Callers receive `Deprecation` header in responses.
- **SUNSET**: Version removed. After 12-month deprecation period minimum.

Deprecation notices:
- `Deprecation: Sat, 31 Dec 2027 00:00:00 GMT` response header on deprecated endpoints.
- Email notifications to all API key holders using deprecated endpoints (tracked via HiveGateway usage data).
- Migration guides published alongside deprecation announcements.

### 2.4 SDK Generation
Client SDKs auto-generated from OpenAPI 3.1 specs:

| Language | Package | Update Frequency |
|---|---|---|
| Python | `cerebro-hive` (PyPI) | On every API change |
| TypeScript/Node | `@cerebro-hive/sdk` (npm) | On every API change |
| Go | `github.com/cerebro-hive/go-sdk` | On every API change |
| Java | `com.cerebro-hive:sdk` (Maven Central) | On every API change |
| Ruby | `cerebro_hive` (RubyGems) | Quarterly |
| cURL examples | Auto-generated in docs | On every API change |

SDK generation pipeline: OpenAPI spec → OpenAPI Generator → post-processing (add retry logic, auth helpers, streaming support) → publish.

**SDK features beyond generated code:**
- Automatic retry with exponential backoff (configurable).
- Streaming support (SSE and gRPC streaming).
- Idempotency key generation.
- Rate limit handling (respect `Retry-After` headers).
- Built-in auth (token refresh, API key injection).

### 2.5 Developer Portal
Self-service developer experience:

**Getting Started**
- Interactive onboarding: choose use case → get recommended APIs → generate first API key → run first request in browser.
- Quickstart guides per API product (under 5 minutes to first successful call).

**Reference Documentation**
- Auto-generated from OpenAPI specs — always in sync with the API.
- Interactive API explorer (try any endpoint directly from the docs, authenticated with the developer's own API key).
- Code examples in all SDK languages, auto-generated per endpoint.

**API Key Management**
- Self-service API key creation with configurable scopes.
- Per-key rate limit configuration (within plan limits).
- Key rotation workflow (create new → test → deactivate old).
- Usage dashboard: calls per key, per endpoint, error rate, cost.

**Webhooks**
- Subscribe to platform events (model evaluation complete, agent task finished, compliance alert triggered).
- Webhook management: endpoint registration, secret rotation, delivery logs, retry management.
- Delivery guarantees: at-least-once delivery, automatic retry with exponential backoff for non-2xx responses.

### 2.6 API Mocking & Testing
- **Mock server**: For each API version, a mock server returns realistic responses based on the OpenAPI spec. Developers build against the mock before using the production API.
- **Sandbox environment**: Full isolated sandbox environment with real services but no production data. API keys issued for sandbox use separately from production.
- **Contract testing**: Consumers can run contract tests against the live API to verify their integration is compatible with the current version.

---

## 3. API Products Published

| API Product | Version | Status |
|---|---|---|
| HiveVector API | v1 | GA |
| HiveModels API | v1 | GA |
| HiveMemory API | v1 | GA |
| HiveData API | v1 | GA |
| HiveIdentity API | v1 | GA |
| CerebroSearch API | v1 | GA |
| HiveAgents API | v1 | Beta |
| HiveAutomation API | v1 | Beta |
| CerebroInsight API | v1 | Beta |
| HiveKnowledge API | v1 | Beta |

---

## 4. Technology Stack

| Component | Technology |
|---|---|
| API Specification | OpenAPI 3.1 (source of truth, Git-versioned) |
| Linting | Spectral (OpenAPI linting in CI/CD) |
| SDK Generation | OpenAPI Generator + custom post-processing |
| Developer Portal | Mintlify (documentation hosting) + custom React components |
| API Key Management | Custom service (backed by PostgreSQL + HiveIdentity) |
| Webhook Engine | Custom service (Temporal for delivery + retry) |
| Mock Server | Prism (OpenAPI-native mock server) |

---

## 5. SLAs

| Metric | Target |
|---|---|
| SDK release latency (API change → SDK published) | <4 hours |
| Documentation freshness (API change → docs updated) | <1 hour (auto-generated) |
| Deprecation notice minimum lead time | 12 months (GA APIs) |
| Webhook delivery latency (P99) | <30 seconds |
| Webhook delivery success rate | >99.9% (with retries) |
| Developer portal availability | 99.9% |

---

## 6. Roadmap

| Milestone | Timeline |
|---|---|
| AI API assistant (answer developer questions about the API in natural language, with live code examples) | Q4 2026 |
| Automatic migration guide generation (new major version → AI generates upgrade guide from diff) | Q1 2027 |
| GraphQL SDL publication (all REST APIs also available as GraphQL, auto-generated) | Q2 2027 |
| API analytics for partners (partners see aggregated usage of their integration by customers) | Q2 2027 |
