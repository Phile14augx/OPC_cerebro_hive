# Security Model

## Threat Model (STRIDE)
- **Spoofing:** Handled via mTLS and strict Service Account verification. P03 only accepts writes from verified upstream producers (P02, P04).
- **Tampering:** Vectors in rest are encrypted. Modifications require strict JWT scopes (`vector:write`).
- **Repudiation:** All upsert and deletion requests are logged to an immutable audit trail.
- **Information Disclosure:** **High Risk.** A compromised query could expose sensitive enterprise vectors. Mitigated via hard tenant partitioning (row-level security in Postgres; collections in Qdrant) and ACL metadata filtering enforced at the query level.
- **Denial of Service:** Unoptimized ANN searches (e.g., massive limits or zero filters) can exhaust DB memory. Mitigated by strict rate limits, max `top_k` enforcement, and query timeouts.
- **Elevation of Privilege:** RBAC scopes isolate read vs. write privileges.

## Authentication & Authorization
- Internal service-to-service communication secured via mTLS.
- End-user queries (via P28) propagate the user's ACL groups via JWT. P03 enforces that vector `metadata.acl_groups` intersects with the user's JWT groups.

## Data Classification
- **Classification:** Highly Confidential.
- **Encryption:** 
  - *At Rest:* AES-256 for PostgreSQL EBS volumes.
  - *In Transit:* TLS 1.3 across all gRPC and HTTP endpoints.

## Compliance Requirements
- **GDPR / CCPA:** Supports "Right to be Forgotten" via cascading deletes from P04. Hard deletion removes the vector immediately from the storage abstraction.
- **SOC2:** Audit logs maintained for all mutating actions.
