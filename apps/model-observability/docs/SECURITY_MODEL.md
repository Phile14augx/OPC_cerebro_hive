# Security Model

## Threat Model (STRIDE)
- **Spoofing:** Services forging telemetry data. Mitigated by mTLS and API key validation.
- **Tampering:** Modifying historical metrics. Mitigated by append-only time-series databases.
- **Repudiation:** Actions on alert configurations cannot be traced. Mitigated by comprehensive audit logging of all configuration changes in the dashboard.
- **Information Disclosure:** Inference payloads containing PII leaking through logs. Mitigated by payload obfuscation/scrubbing rules before storage.
- **Denial of Service:** Telemetry flood overwhelming the collector. Mitigated by adaptive sampling and rate limiting.
- **Elevation of Privilege:** A user escalating their privileges via the dashboard API. Mitigated by strict Role-Based Access Control (RBAC) enforced at the Nexarch Identity API gateway level.

## Authentication & Authorization
- OTel Collectors use internal certs for authentication.
- Dashboard users authenticated via standard enterprise IdP (OIDC/SAML) mapped to Nexarch RBAC.

## Data Classification & Encryption
- In Transit: TLS 1.3 mandatory.
- At Rest: AES-256 encryption on volumes storing traces and metrics.

## Compliance
- Adheres to GDPR regarding data minimization in trace collection.
- Support for automatic PII redaction to maintain SOC2 compliance in logging.
