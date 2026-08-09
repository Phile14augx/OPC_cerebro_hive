# Product Specification: HiveGateway™

**Status:** Canonical Version 1.0  
**Governing Document:** `PRODUCT_REGISTRY.md`  
**Architectural Tier:** Tier 2 — Platform  
**Security Classification:** Tier 0 — Core Security

---

## 1. Product Overview

**HiveGateway™** is the unified API gateway and ingress layer for the entire CerebroHive Intelligence Mesh. Every API call — from external clients, from internal services, and from autonomous agents — enters the platform through HiveGateway. It is the single enforcement point for authentication, authorization, rate limiting, routing, and AI-specific security controls.

Nothing reaches a backend service without passing through HiveGateway.

---

## 2. Architectural Position

```
External Clients          Internal Services         Autonomous Agents
(Web apps, Mobile,        (Service-to-service       (HiveAgents runtime
 Third-party APIs)         mTLS calls)               tool calls)
        │                        │                         │
        └────────────────────────┼─────────────────────────┘
                                 ▼
                         HiveGateway
                    ┌────────────────────┐
                    │ 1. TLS Termination │
                    │ 2. Authentication  │← HiveIdentity
                    │ 3. Authorization   │← HiveGovern (OPA)
                    │ 4. AI Firewall     │← HiveShield
                    │ 5. Rate Limiting   │
                    │ 6. Routing         │
                    │ 7. Observability   │→ HiveObservatory
                    └────────────────────┘
                                 │
                    Backend Services (internal mesh)
```

---

## 3. Core Capabilities

### 3.1 Authentication Enforcement
All requests authenticated before reaching backends:
- **JWT validation**: Verify HiveIdentity-issued JWTs — signature, expiry, issuer, audience.
- **API key validation**: Validate API keys for machine-to-machine integrations.
- **mTLS (internal)**: For internal service-to-service traffic, mutual TLS certificate validation via SPIFFE/SPIRE.
- **Agent token validation**: Validate agent-scoped ephemeral JWTs with scope enforcement.
- Unauthenticated requests rejected with `401 Unauthorized` before any backend processing.

### 3.2 Authorization (OPA Policy Engine)
After authentication, every request is evaluated against OPA policies:
- Resource-level: "Can this service account call `DELETE /v1/vector/collections/{id}`?"
- Tenant-level: "Is this tenant allowed to access this API product?"
- Rate/quota: "Has this tenant exceeded their monthly token quota?"
- Time-based: "Is this a privileged operation being attempted outside business hours?"
- Policy evaluation latency: <5ms (OPA decision cached, refreshed every 60 seconds).

### 3.3 AI Firewall Integration
HiveShield's AI Firewall sits inline in the HiveGateway request/response path (see HiveShield spec for full detail):
- Input inspection on all LLM API requests.
- Output scanning on all LLM API responses.
- Adds <15ms overhead (HiveShield SLA).

### 3.4 Rate Limiting & Quota Management
Multi-dimensional rate limiting:

| Dimension | Limit Type | Example |
|---|---|---|
| Per API key | Request rate | 100 req/sec |
| Per tenant | Token consumption | 10M tokens/day |
| Per endpoint | Request rate | 1000 req/min on `/v1/models/chat` |
| Per user | Request rate | 60 req/min on `/v1/search` |
| Global | Capacity protection | 50K req/sec total |

- Limit enforcement: sliding window algorithm (Redis-backed).
- Limit headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` returned on every response.
- Over-limit response: `429 Too Many Requests` with `Retry-After` header.
- Soft limits (warn, don't block) and hard limits (block) configurable per tier.

### 3.5 Request Routing
- **Path-based routing**: `/v1/vector/*` → HiveVector service, `/v1/models/*` → HiveModels service.
- **Version routing**: `/v1/` and `/v2/` can route to different backend versions for gradual migration.
- **Canary routing**: route X% of traffic to a new service version for gradual rollout.
- **Circuit breaker**: if a backend service returns >10% errors for 60 seconds, circuit opens — requests fail fast with `503` rather than queuing (Envoy circuit breaker).
- **Retry policy**: idempotent GET requests retried up to 3 times on `503` or network error with exponential backoff.

### 3.6 Protocol Support
- **REST/HTTP**: Primary protocol for all external and most internal APIs.
- **gRPC**: Supported for high-throughput internal services (HiveVector, HiveModels embedding API).
- **WebSocket**: Supported for real-time streaming (agent streaming responses, live dashboard updates).
- **Server-Sent Events (SSE)**: LLM streaming responses delivered via SSE.
- **GraphQL**: Supported for CerebroSearch and CerebroCustomer360 query APIs.

### 3.7 TLS & Security
- TLS 1.3 enforced for all external connections. TLS 1.2 minimum.
- HSTS headers on all responses.
- CORS policy: configurable per API product.
- Request size limits: 10MB default (configurable per endpoint).
- Header sanitization: strips internal headers before forwarding to backends.

### 3.8 Observability Integration
Every request through HiveGateway emits:
- **Trace**: OpenTelemetry span for the gateway leg, propagates trace context to backend.
- **Metrics**: Request rate, error rate, latency by service/endpoint/tenant.
- **Access log**: Structured JSON access log (method, path, status, latency, tenant_id, user_id, trace_id).
- All forwarded to HiveObservatory.

---

## 4. API Product Management
HiveGateway exposes the concept of API Products — groupings of API endpoints packaged for specific consumers:

| API Product | Endpoints Included | Intended Consumer |
|---|---|---|
| CerebroHive Platform API | All platform services | Enterprise integrators |
| HiveVector API | `/v1/vector/*` | Embedding pipeline builders |
| HiveModels API | `/v1/models/*` | AI application developers |
| CerebroSearch API | `/v1/search/*` | Search integrators |
| Agent SDK API | `/v1/agents/*`, `/v1/memory/*` | Agent developers |

API products are associated with: rate limit tiers, allowed authentication methods, and required subscription plans (enforced by HiveLicense).

---

## 5. Technology Stack

| Component | Technology |
|---|---|
| Gateway Core | Envoy Proxy (data plane) |
| Control Plane | Custom Go service (dynamic config push to Envoy via xDS) |
| Auth Integration | HiveIdentity JWT validation (JWKS endpoint) |
| Policy Engine | Open Policy Agent (OPA) sidecar |
| Rate Limiting | Redis (sliding window counters) |
| Circuit Breaker | Envoy native circuit breaker |
| AI Firewall | HiveShield (external auth filter in Envoy) |
| Observability | OpenTelemetry Collector (trace + metric export) |

---

## 6. SLAs

| Metric | Target |
|---|---|
| Gateway latency overhead P99 | <5ms (auth + routing, no AI firewall) |
| Gateway latency overhead P99 (with AI firewall) | <20ms |
| Auth decision latency P99 | <10ms |
| OPA policy evaluation P99 | <5ms |
| Availability | 99.99% (four nines — gateway is the front door) |
| Rate limit enforcement accuracy | >99.9% |

---

## 7. Roadmap

| Milestone | Timeline |
|---|---|
| AI-native rate limiting (token-bucket per model, not just request count) | Q4 2026 |
| GraphQL federation (unified GraphQL gateway over all Cerebro product APIs) | Q1 2027 |
| Request/response transformation (field masking, payload transformation without backend code changes) | Q1 2027 |
| Developer portal integration (self-service API key management, usage dashboard, docs) | Q2 2027 |
