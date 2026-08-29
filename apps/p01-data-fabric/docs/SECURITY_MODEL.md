# Security Model

## Threat Model (STRIDE)
- **Spoofing:** Handled via Mutual TLS (mTLS) for inter-service communication and strict OAuth2 verification for API access.
- **Tampering:** Data at rest stored in immutable or append-only structures with cryptographic hashing. Iceberg snapshots prevent undetectable tampering.
- **Repudiation:** All API calls and pipeline executions are logged centrally with standard Nexarch audit schemas.
- **Information Disclosure:** Strict RBAC and column-level masking policies. Data classified as RESTRICTED is always encrypted with tenant-specific KMS keys.
- **Denial of Service:** API gateways employ rate limiting. Query engines use resource queues to prevent "noisy neighbor" scenarios.
- **Elevation of Privilege:** Principle of least privilege enforced; connectors use scoped credentials.

## Authentication/Authorization
- **Authentication:** Nexarch Identity Provider via OIDC/OAuth2.
- **Authorization:** Fine-grained access control policies. Trino plugins intercept queries to apply row-level and column-level security based on the caller's JWT token.

## Data Encryption
- **In Transit:** TLS 1.3 mandated for all internal and external traffic.
- **At Rest:** AES-256 GCM encryption. Key management integrated with cloud provider KMS or HashiCorp Vault.

## Compliance
- Designed to support GDPR (Right to be Forgotten handled via Iceberg row-level deletes).
- SOC2 Type II compliant logging and access controls.
- HIPAA compatibility available for configured environments.
