# Security Model: Nexarch Privacy Intelligence

## Threat Model (STRIDE)
- **Spoofing**: Attackers mimicking internal services to consume privacy budget maliciously. Mitigated by strict mTLS and service mesh identity enforcement.
- **Tampering**: Modifying the Consent Ledger to falsify consent. Mitigated by append-only, immutable database designs and cryptographic hashing of ledgers.
- **Repudiation**: Services denying they processed sensitive data. Mitigated by comprehensive audit logging tied to P41.
- **Information Disclosure**: PII leakage through ML models. Mitigated by Differential Privacy noise bounds.
- **Denial of Service**: Exhausting privacy budgets rapidly to halt analytics. Mitigated by per-user and per-dataset rate limits on budget consumption.
- **Elevation of Privilege**: Unauthorized access to the Anonymization API. Mitigated by RBAC and API Gateway policies.

## Authentication & Authorization
- **Service-to-Service**: mTLS via Nexarch Istio/Service Mesh.
- **User Actions**: OAuth2/OIDC claims validation. Access to privacy configurations requires the `PrivacyAdmin` role.

## Data Classification & Encryption
- **At Rest**: AES-256 encryption for all databases. The Consent Ledger uses field-level encryption for user identifiers.
- **In Transit**: TLS 1.3 mandated for all internal and external communication.

## Compliance
- **GDPR**: Core product capability directly addresses Article 5 (Data minimization), Article 6 (Lawfulness of processing), and Article 32 (Security of processing).
- **SOC2**: Comprehensive audit logs support the Security and Privacy Trust Services Criteria.
