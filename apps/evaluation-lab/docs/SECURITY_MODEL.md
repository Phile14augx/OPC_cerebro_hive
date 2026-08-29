# Security Model

## Threat Model (STRIDE)
- **Spoofing**: Unauthenticated agents submitting fake evaluation scores. Mitigated via strict mTLS/JWT validation for all metric submissions.
- **Tampering**: Modifying benchmark datasets to artificially inflate model scores. Mitigated by dataset immutability (append/version only) and strict RBAC.
- **Repudiation**: Models generating unsafe content and evading logs. Mitigated by saving complete trace of prompt/response securely before judge scoring.
- **Information Disclosure**: Exposing sensitive customer data used in custom benchmarks. Mitigated by AES-256 encryption at rest and PII redaction pipelines prior to ingestion.
- **Denial of Service**: Overwhelming the evaluation engine with massive jobs. Mitigated by tenant-level concurrency limits and auto-scaling workers.
- **Elevation of Privilege**: Adversarial payloads in datasets achieving code execution in the evaluation worker. Mitigated by running workers in isolated, gVisor-based sandboxes with no network access except to the target API.

## Data Classification
- Standard Benchmarks: **Public**
- Enterprise Custom Datasets: **Confidential** (may contain internal IP)
- Evaluation Results: **Internal**

## Compliance Requirements
- **SOC2**: Strict audit logging of all dataset modifications and evaluation run triggers.
- **GDPR**: Ability to purge specific rows from custom datasets if requested (data deletion requests).

## Known Attack Surfaces
- **Prompt Injection in LLM Judge**: The target model outputs malicious instructions designed to manipulate the LLM Judge's scoring. We mitigate this by using strict structured output formats for the judge and prefixing judge prompts with defensive meta-prompts.
