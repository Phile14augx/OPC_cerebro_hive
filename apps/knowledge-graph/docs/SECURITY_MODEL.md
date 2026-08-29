# Security Model

## Threat Model (STRIDE)

1. **Spoofing:** Unauthenticated agents attempting to query the graph.
   - *Mitigation:* Strict mTLS and short-lived JWTs via the API Gateway.
2. **Tampering:** Malicious insertion of false relationships (poisoning the graph).
   - *Mitigation:* Ontology validation pipelines; confidence scoring on edges; immutable audit logs of all writes.
3. **Repudiation:** Inability to trace who executed a mass graph deletion.
   - *Mitigation:* Comprehensive access logging pushed to a write-once-read-many (WORM) audit store.
4. **Information Disclosure:** Transitive queries exposing `Restricted` nodes through multi-hop inference.
   - *Mitigation:* Graph-level row/node security. Cypher queries are intercepted, and sub-graphs that the user lacks RBAC permissions for are pruned before execution.
5. **Denial of Service (DoS):** Unbounded recursive Cypher queries (e.g., `MATCH (n)-[*]->(m)`) exhausting database CPU.
   - *Mitigation:* Query analysis pre-execution; strict hop limits (max 5 hops); query execution timeouts.
6. **Elevation of Privilege:** A low-privilege service escalating access to modify the base ontology.
   - *Mitigation:* Segregated Ontology Management API accessible only by designated Ontology Stewards.

## Authentication & Authorization
- Zero-trust architecture.
- Token-based identity mapping to specific subgraph access grants.

## Data Encryption
- **At Rest:** Transparent Data Encryption (TDE) on PostgreSQL persistent volumes via Google Cloud KMS.
- **In Transit:** TLS 1.3 for all internal and external communication.

## Compliance
- **GDPR / CCPA:** Nodes containing PII can be queried and hard-deleted via the "Right to be Forgotten" API workflow.
- **SOC2:** Full access logging and change management controls on the ontology.
