# Product Specification: HiveIdentity™

**Status:** Canonical Version 1.0  
**Governing Document:** `PRODUCT_REGISTRY.md`  
**Architectural Tier:** Tier 0 — Root Dependency (all other products depend on this)  
**Security Classification:** Tier 0 — Core Security

---

## 1. Product Overview

**HiveIdentity™** is the identity and access management (IAM) backbone of the CerebroHive Intelligence Mesh. It is the single source of truth for who — and what — is allowed to do anything in the platform.

It is the only product with zero upstream dependencies. Everything else depends on it. HiveIdentity must be running before any other service can accept a connection, issue a token, or log an action.

What makes HiveIdentity distinct from traditional IAM is its first-class support for **autonomous agents as identity principals**. An agent is not a user; it acts independently, holds credentials, makes decisions across API boundaries, and can operate for hours or days without a human in the loop. Traditional IAM systems were not designed for this. HiveIdentity was built specifically for it.

---

## 2. Identity Principal Types

HiveIdentity recognizes four classes of identity principal:

| Principal Type | Description | Credential Type | Trust Level |
|---|---|---|---|
| **Human User** | Authenticated employee, admin, partner | JWT (OIDC ID token) | Established via IdP |
| **Service Account** | Application / microservice | Client credentials (client_id + secret or mTLS cert) | Established at provisioning |
| **Autonomous Agent** | CerebroAgent, HiveAgents runtime | Agent Token (scoped, ephemeral JWT) | Derived from parent user's delegation |
| **API Key** | External integrators, webhooks | API Key (hashed, never stored in plaintext) | Established at creation, scoped to specific APIs |

---

## 3. Core Capabilities

### 3.1 Identity Provider (IdP) & SSO
- **Protocols**: SAML 2.0, OpenID Connect (OIDC), OAuth 2.0. HiveIdentity acts as both an identity provider and a relying party.
- **External IdP Federation**: Connect to enterprise identity providers — Azure AD, Okta, Google Workspace, Ping Identity, ADFS. HiveIdentity acts as a SAML SP / OIDC RP and issues its own tokens after federation.
- **Directory Sync**: SCIM 2.0 provisioning for automated user and group sync from enterprise directories. User lifecycle (create, update, deactivate) is automated.
- **Multi-Tenant SSO**: Each tenant configures their own IdP connection. SSO configurations are fully isolated between tenants.
- **Just-in-Time (JIT) Provisioning**: Users authenticated via federated IdP are automatically provisioned in HiveIdentity on first login, with roles derived from IdP group membership claims.

### 3.2 Multi-Factor Authentication (MFA)
- TOTP (RFC 6238) via authenticator apps (Google Authenticator, Authy).
- WebAuthn / FIDO2 (hardware security keys, passkeys, biometrics).
- Push notifications (mobile app).
- Risk-adaptive MFA: authentication risk engine evaluates login context (device, location, time, behavior) and requires step-up authentication when risk score exceeds threshold.

### 3.3 Role-Based Access Control (RBAC) + Attribute-Based Access Control (ABAC)
- **RBAC**: Roles define sets of permissions. Users are assigned roles. Roles are hierarchical (an `enterprise_admin` role implicitly includes `product_admin`).
- **ABAC Extension**: Permissions can be conditioned on attributes: `allow CerebroInsight:read IF user.department == "finance" AND resource.classification != "tier_0"`. This enables fine-grained, context-sensitive access without role explosion.
- **Permission Scopes**: Every API endpoint in every Hive product registers its required permissions. HiveIdentity enforces these at token issuance time — tokens only contain permissions the user is entitled to, never more.

### 3.4 Agent Token Escrow (The Core Innovation)
This is the capability that no traditional IAM provides.

When a human user delegates a task to an autonomous agent, the agent must be able to call APIs on the user's behalf — but only within a precisely defined scope, and only for a defined period.

**How it works:**
1. User initiates an agent task in CerebroAgent.
2. User explicitly selects: which APIs the agent may call, which resources it may access, and for how long.
3. HiveIdentity issues an **Agent Token**: a scoped JWT with:
   - `principal_type: "agent"` claim
   - `delegated_by: {user_id}` claim (full audit chain)
   - `scope: ["hive-storage:write", "hive-api:read"]` (explicit, minimal permissions)
   - `max_ttl: 3600` (maximum 1 hour; cannot be extended without re-authorization)
   - `task_id: {task_id}` (bound to a specific task execution)
4. The Agent Token is stored in the Token Escrow vault (encrypted, never cached in the agent's memory).
5. The agent retrieves the token for each API call; the token is not long-lived in the agent's working memory.
6. Every API call made with an Agent Token is logged with the full delegation chain: `agent_id → user_id → permission → resource → action`.
7. The human user can revoke the token at any time from the HiveIdentity dashboard.

**Behavioral Anomaly Detection on Agent Tokens:**
HiveIdentity monitors agent token usage and flags anomalies:
- An agent calling APIs not consistent with its declared task type.
- A token being used at unusual times (e.g., an invoice-processing agent making API calls at 3am).
- Unusual resource access patterns (an agent accessing 10,000 documents when it typically accesses <100).
Anomalies trigger alerts to HiveShield and can auto-suspend the agent token.

### 3.5 Privileged Access Management (PAM)
- **Just-in-Time Privileged Access**: Elevated privileges are granted only for a specific duration, for a specific task, with mandatory justification. No permanent privileged accounts.
- **Session Recording**: All privileged sessions (admin console access, database access) are recorded. Recordings are stored in HiveStorage Vault (WORM).
- **Break-Glass Access**: Emergency access procedure for when normal authentication pathways are unavailable. Break-glass access triggers immediate alerting to security team and logs to HiveGovern.

### 3.6 Audit Vault
Every authentication and authorization event is written to the Audit Vault — an append-only, cryptographically signed log:
- Login events (success and failure)
- Token issuance (all token types)
- Permission grants and revocations
- Agent token delegation events
- Privileged access events
- Break-glass access

Audit logs are immutable. Even platform administrators cannot modify or delete them. Audit logs are replicated to HiveGovern for compliance reporting.

### 3.7 Key & Secret Management
HiveIdentity's key vault manages cryptographic material for the entire platform:
- **Encryption Keys**: Keys used by HiveStorage, HiveShield, and HiveLicense.
- **Service Account Credentials**: Hashed, versioned, with automatic rotation.
- **External API Keys**: Secrets for external service integrations (third-party LLM providers, SaaS APIs) stored encrypted, never exposed in plaintext to application code.
- **Certificate Authority**: Intermediate CA for HiveNetwork mTLS certificates.

---

## 4. Modules

### Identity Provider
The OIDC/SAML-compliant IdP. Handles login flows, federation, token issuance. Built on top of Ory Hydra (extended with CerebroHive-specific agent token support).

### Token Exchange
OAuth 2.0 token exchange endpoint (RFC 8693). Converts:
- IdP tokens → HiveIdentity JWTs
- Human JWTs → Agent Tokens (with scope reduction)
- Service credentials → Service JWTs

### Agent Trust Registry
Stores agent definitions and their authorized permission scopes. When an agent requests a token, the Token Exchange validates the requested scope against the agent's registered scope ceiling — agents cannot self-elevate.

### Audit Vault
Append-only event store. Backed by PostgreSQL with an append-only schema (no UPDATE/DELETE statements permitted at the database level, enforced via trigger). Events are signed with an HMAC chain — tampering with any event breaks the chain and is detectable.

### Directory Sync Engine
SCIM 2.0 client that polls connected enterprise directories and syncs user and group state.

---

## 5. Token Specification

### Human JWT (example payload)
```json
{
  "iss": "https://identity.hive.internal",
  "sub": "user_abc123",
  "aud": "hive-platform",
  "principal_type": "human",
  "tenant_id": "tenant_xyz",
  "email": "jane.doe@acme.com",
  "roles": ["product_admin", "cerebroflow_editor"],
  "permissions": ["cerebroflow:read", "cerebroflow:write", "hive-api:read"],
  "iat": 1753388400,
  "exp": 1753392000,    // 1-hour TTL for interactive sessions
  "jti": "jti_unique_id"
}
```

### Agent Token (example payload)
```json
{
  "iss": "https://identity.hive.internal",
  "sub": "agent_invoiceprocessor_v2",
  "aud": "hive-platform",
  "principal_type": "agent",
  "tenant_id": "tenant_xyz",
  "delegated_by": "user_abc123",
  "task_id": "task_2026_0724_001",
  "scope": ["hive-storage:write:bucket/invoices/*", "cerebroerp:create:invoice"],
  "iat": 1753388400,
  "exp": 1753392000,    // max 1-hour TTL, non-renewable without re-auth
  "jti": "jti_agent_unique_id",
  "revocable": true     // agent tokens support instant revocation
}
```

---

## 6. Technology Stack

| Component | Technology |
|---|---|
| IdP / OIDC Provider | Ory Hydra + Ory Kratos (extended) |
| RBAC / ABAC Engine | Open Policy Agent (OPA) |
| Certificate Authority | SPIFFE / SPIRE (intermediate CA) |
| Key Management | HashiCorp Vault (extended with HiveIdentity UI) |
| Directory Sync | SCIM 2.0 (custom client) |
| Audit Log Store | PostgreSQL (append-only) with HMAC chain |
| Database | PostgreSQL (primary), Redis (token cache) |
| API | Rust (performance-critical auth paths), Go (admin APIs) |

---

## 7. SLAs

| Metric | Target |
|---|---|
| Authentication latency P99 | <50ms |
| Token validation latency P99 | <5ms (cached), <30ms (uncached) |
| Identity service availability | 99.999% (5-nines — this is the root dependency) |
| Agent token revocation propagation | <10 seconds |
| Directory sync latency | <5 minutes from IdP change to HiveIdentity update |
| Audit log write latency | <100ms |

---

## 8. Roadmap

| Milestone | Timeline | Description |
|---|---|---|
| Cryptographic Decision Proofs | Q4 2026 | Each agent action can be accompanied by a cryptographic proof linking the action to the human's original delegation — non-repudiable audit trail |
| Post-Quantum Cryptography | Q1 2027 | Migrate all token signing to hybrid classical + post-quantum signatures (ML-DSA / CRYSTALS-Dilithium) |
| Decentralized Identity (DID) | Q2 2027 | W3C DID-based agent identity for cross-organizational agent interactions |
| Continuous Authentication | Q2 2027 | Risk engine continuously evaluates session legitimacy (not just at login) — revokes sessions on behavioral anomaly |

---

## 9. Success KPIs

| KPI | Target | Frequency |
|---|---|---|
| Auth latency P99 | <50ms | Real-time |
| Availability | 99.999% | Continuous |
| Agent token revocation time | <10 seconds | Per-incident |
| Unauthorized agent action blocks | 100% of anomalies detected | Real-time |
| SSO adoption rate | >95% of enterprise tenants | Monthly |
| Audit log completeness | 100% (zero missed events) | Daily |
