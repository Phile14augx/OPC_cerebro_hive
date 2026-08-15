# ADR-032: Runtime, supply chain, and CI/CD security

**Status:** Proposed (Phase 6, security track)

## Context

HiveForge's own control plane and capability services, and customer workloads provisioned via `HiveCompute`'s Kubernetes Clusters service, need a hardening baseline. None of this was previously specified.

## Decision

**Runtime (containers/Kubernetes):** distroless images, read-only filesystem, non-root, seccomp, AppArmor, SELinux at the container level; OPA Gatekeeper, Kyverno, network policies, Pod Security Standards at the Kubernetes level; Falco, eBPF, Sysdig, Tetragon, Tracee for runtime detection. Mandatory for HiveForge's own deployed services; available to customer `HiveCompute` Kubernetes workloads as a Policy-gated hardening profile, not a mandatory constraint on customer workload configuration.

**Supply chain:** every build produces an SBOM, and runs dependency scan, container scan, secrets scan, license scan, IaC scan (Trivy, Grype, Syft, Semgrep, CodeQL, OSV, Snyk, Dependabot).

**CI/CD:** `GitHub → CodeQL → Semgrep → Unit Tests → SAST → Dependency Scan → Container Scan → IaC Scan → Policy Validation → Artifact Signing → Deployment`. "Policy Validation" here is a `PolicyEngine` (`ADR-028`) check, not `AIGovernanceEngine` — no AI content is involved in a deployment gate.

## Consequences

- HiveForge's own build pipeline is the first place these controls apply — a claim that any of this is Verified requires a real pipeline running them, per Phase 0 principle #8; today this is entirely Planned.
- Customer-facing hardening (Kubernetes workloads) is opt-in via Policy, consistent with not overriding a customer's own workload security decisions unilaterally.
- Specific SIEM/scanning tool selection among the options listed is deferred to implementation, not fixed as a vendor commitment by this ADR.
