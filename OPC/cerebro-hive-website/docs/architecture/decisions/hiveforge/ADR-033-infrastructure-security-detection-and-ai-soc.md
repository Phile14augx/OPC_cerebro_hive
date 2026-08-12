# ADR-033: Infrastructure security, detection platform, and AI Security Operations Center

**Status:** Proposed (Phase 6, security track)

## Context

`CloudSecurityPosture` and `SecurityEvents` (existing HiveShield modules) were named in `00-FOUNDATION.md` §1 without a concrete tool set or event taxonomy. Separately, a traditional SOC monitors users/infrastructure but not AI-specific failure modes (prompt injection, model drift, hallucination, cost anomaly) — a gap this ADR closes.

## Decision

**Infrastructure security** (`CloudSecurityPosture`): Terraform + Policy as Code (OPA, Sentinel), AWS Security Hub, GuardDuty, Inspector, Macie, IAM Access Analyzer, CloudTrail, AWS Config as the first-provider (AWS) instantiation. Per `00-FOUNDATION.md` principle #2 (multi-cloud), Azure/GCP equivalents (Defender for Cloud, Security Command Center) are the same `CloudSecurityPosture` abstraction applied to a different `Provider` (`ADR-020`), not a separate module per cloud.

**Detection platform** (`SecurityEvents`): a SIEM (product choice deferred — OpenSearch, Elastic, Splunk, or Microsoft Sentinel, not fixed here) ingesting LLM calls, authentication events, agent decisions, prompt injection attempts, data access, policy violations, API calls, and infrastructure events. These are Integration Events (`ADR-024`'s domain/integration split, `03-CONTROL-PLANE.md` §5) — consumed by an external SIEM, not by HiveForge's own aggregates.

**AI Security Operations Center:** a monitoring/alerting layer consuming `AIGovernanceEngine`'s (`ADR-029`) and `PromptFirewall`'s (`ADR-030`) evaluation results — prompt monitoring, agent monitoring, model drift, hallucinations, prompt injection, cost anomalies, data leakage, tool misuse. Not a new policy-evaluation component; an observability layer over ones already defined.

## Consequences

- No new aggregate or evaluator is introduced by the AI SOC — it is purely a consumer of events and evaluation outcomes already produced elsewhere in this phase.
- SIEM product selection remains an Open Decision, deferred to implementation, not a vendor commitment.
- Compliance certifications (ISO 27001, SOC 2, NIST CSF 2.0, NIST AI RMF, PCI DSS, GDPR, HIPAA) surfaced on the security dashboard (`06-SECURITY.md` §16) are Planned status only — no certification is claimed or implied by this ADR.
