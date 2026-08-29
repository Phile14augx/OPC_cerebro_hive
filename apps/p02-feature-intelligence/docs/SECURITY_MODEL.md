# Security Model: Nexarch Feature Intelligence (P02)

## Threat Model (STRIDE)
- **Spoofing:** Unauthorized services attempting to write to the online feature store. *Mitigation:* Mutual TLS (mTLS) between transformation engines and storage layers.
- **Tampering:** Modifying feature definitions in the registry to poison downstream models. *Mitigation:* Strict RBAC, immutable versioning of feature views, and mandatory code-review/approval workflows for registry updates.
- **Repudiation:** Inability to trace who generated a flawed training dataset. *Mitigation:* Comprehensive audit logging of all API interactions and job submissions.
- **Information Disclosure:** Data leakage of Confidential/Restricted features via the serving API. *Mitigation:* Field-level encryption at rest, attribute-based access control (ABAC) on the serving API.
- **Denial of Service:** Overloading the online serving API causing inference latency spikes. *Mitigation:* strict rate limiting, tenant isolation, and autoscaling.
- **Elevation of Privilege:** Escaping compute sandboxes during feature transformations. *Mitigation:* Minimal privilege service accounts for Spark/Ray jobs.

## Authentication & Authorization
- **AuthN:** OIDC tokens (JWT) validated via an API Gateway.
- **AuthZ:** Role-Based Access Control (RBAC). Roles include `FeatureViewer`, `FeatureCreator`, `DataScientist`, and `Admin`. Fine-grained access control based on the `privacyClass` of features.

## Data Protection
- **In Transit:** All communication over TLS 1.3.
- **At Rest:** Data in the offline store (S3/GCS) and online store (Redis/Cassandra) is encrypted using AES-256 with KMS-managed keys.

## Compliance
- Designed to support GDPR (Right to be Forgotten) by propagating entity deletion requests through both online and offline stores.
- Audit trails designed to meet SOC2 requirements for data lineage and access monitoring.
