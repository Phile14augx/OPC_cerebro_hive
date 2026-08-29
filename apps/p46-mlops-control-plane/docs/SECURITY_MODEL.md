# Security Model

## Threat Model (STRIDE)
- **Spoofing**: Mitigated by mutual TLS (mTLS) for microservices and strict OIDC-based identity verification.
- **Tampering**: Model weights and artifacts are hashed (SHA-256) upon upload. Integrity checks are performed before deployment.
- **Repudiation**: All lifecycle transitions (registration, promotion, deployment) are immutably logged to an audit trail.
- **Information Disclosure**: Object storage buckets are private. Access is mediated strictly via signed URLs or service-level access control.
- **Denial of Service**: Rate limiting applied per tenant/user at the API Gateway. Auto-scaling worker pools prevent pipeline starvation.
- **Elevation of Privilege**: Role-Based Access Control (RBAC) ensures only authorized roles (e.g., MLOps Engineer) can promote to Production.

## Authentication & Authorization
- **AuthN**: OAuth2 tokens validated against the Enterprise IDP.
- **AuthZ**: Granular RBAC. Permissions defined per experiment, model, and pipeline.

## Data Protection
- **In Transit**: TLS 1.3 mandated for all API and gRPC traffic.
- **At Rest**: AES-256 encryption for PostgreSQL data and S3 object storage (KMS managed keys).

## Compliance Requirements
- SOC2 Type II standard logging and access controls.
- GDPR compliance for user IDs associated with experiment runs (right to be forgotten anonymization scripts).
