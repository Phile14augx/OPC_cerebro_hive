# Security Model

## Threat Model (STRIDE)
* **Spoofing:** Handled via strict JWT-based authentication for all API endpoints. Agents must provide verifiable identities.
* **Tampering:** Provenance records and audit logs are cryptographically signed and stored in immutable, append-only storage.
* **Repudiation:** All policy evaluations and approval actions are logged with actor identities, preventing repudiation.
* **Information Disclosure:** Strict RBAC limits access to sensitive governance data and approval justifications. Data encrypted at rest.
* **Denial of Service:** Rate limiting on policy evaluation APIs. Policies are cached to handle high throughput.
* **Elevation of Privilege:** Role-based access control separates governance administrators from regular evaluators.

## Authentication & Authorization
* Enforces Nexarch Identity standards (OAuth2/OIDC).
* Fine-grained permissions (e.g., `governance:policy:write`, `governance:approval:approve`).

## Data Classification & Encryption
* All data is encrypted in transit using TLS 1.3.
* Database volumes and audit log storage are encrypted at rest using AES-256 via KMS.
* Sensitive fields (e.g., approval justifications) are classified as Confidential.

## Compliance Requirements
* Meets SOC2 Type II requirements for auditability.
* Supports GDPR compliance through integration with P44.
