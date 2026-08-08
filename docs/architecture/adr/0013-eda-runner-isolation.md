# 0013: CerebroEDA Runner Isolation

**Decision ID:** D2
**Gates:** Phase 1 (Thin Vertical Slice)
**Date:** 2026-08-01

## Status

Accepted

## Context

Runners execute EDA tools over customer design data. The threat is concrete and unusual in its severity: **third-party binaries of unknown provenance, processing the most valuable IP a customer owns, on infrastructure we control.**

Specific exposures:

1. **Tool adapters are third-party code** (Blueprint §16). A marketplace adapter is code we did not write, running with access to a design workspace.
2. **EDA tools are large legacy C++ codebases** parsing untrusted input (Verilog, LEF/DEF, GDS, SPICE). Memory-safety issues in these parsers are routine. A malicious `.lib` file is a plausible attack vector.
3. **Tools legitimately need enormous resources** — 64GB+ RAM, 500GB scratch, 40-hour runtimes. Aggressive resource limits are not available as a mitigation.
4. **Some tools require licence daemon network access**, so blanket egress denial cannot be universal.
5. **PDKs are export-controlled** and mounted into runners (ADR 0010).
6. **Tenants share node pools** in the Standard tier.

Container escape from a shared kernel is the primary risk. The consequence of a successful escape is access to other tenants' design data — the worst outcome in the system's threat model.

## Decision

**We run all tool execution under gVisor (`runsc`) by default, on dedicated runner node pools, with deny-all egress, read-only root filesystems, and no service account tokens. Kata Containers is available as a per-tenant Enterprise-tier option. Plain runc is permitted only for first-party, signed images in single-tenant deployments.**

### Isolation tiers

| Tier | Runtime | Applies to |
|---|---|---|
| Default | gVisor (`runsc`) | All tool execution, all tenants, all marketplace adapters |
| Enterprise | Kata Containers (VM-isolated) | Per-tenant option; required for ITAR-classified projects |
| Trusted | runc + full policy | First-party signed images, single-tenant/air-gapped only, explicit opt-in |

gVisor as the default is the central judgement. It intercepts syscalls in a userspace kernel, so a kernel-exploit escape must first defeat the Sentry — dramatically reducing the attack surface relative to seccomp-filtered runc, at a performance cost that is acceptable for this workload profile (see Consequences).

### Layered controls (all tiers)

```yaml
runtimeClassName: gvisor
automountServiceAccountToken: false
hostNetwork: false
hostPID: false
hostIPC: false
securityContext:
  runAsNonRoot: true
  runAsUser: 10001
  readOnlyRootFilesystem: true
  allowPrivilegeEscalation: false
  capabilities: { drop: ["ALL"] }
  seccompProfile: { type: RuntimeDefault }
volumes:
  - workspace:   { readOnly: false }   # emptyDir or per-run PVC
  - pdk:         { readOnly: true }
  - tmp:         { emptyDir, sizeLimit: 500Gi }
```

**Network policy.** Deny-all ingress and egress by default. Three narrow exceptions, each explicitly declared in the plugin manifest and granted per installation:

| Exception | Scope |
|---|---|
| Licence daemon | Single host:port, per licence pool |
| Artifact upload | Storage endpoint only, via presigned URL |
| Status callback | `job-service` ingress endpoint only |

No DNS egress. Endpoints are resolved by the control plane and injected as IPs, since DNS is both an exfiltration channel and a resolution dependency we do not want in the data path.

**Node pools.** Runners are tainted onto dedicated pools with no control-plane workloads. In the Enterprise tier, pools are per-tenant. Nodes are immutable and recycled on a fixed cadence.

**Credentials.** Runners receive no long-lived credentials. Artifact access uses narrowly scoped presigned URLs with short TTLs, generated per job, valid only for that job's paths. A compromised runner cannot enumerate storage.

**Workspace lifecycle.** Per-run volumes, wiped on completion. No shared scratch between runs, ever — shared scratch is the cheapest cross-tenant leak available and it is not worth the storage savings.

### Defence in depth summary

| Layer | Control | Defeats |
|---|---|---|
| Runtime | gVisor userspace kernel | Kernel exploit escape |
| Kernel | seccomp, dropped capabilities, user namespaces | Privilege escalation |
| Filesystem | Read-only root, per-run volumes | Persistence, cross-run leakage |
| Network | Deny-all + explicit narrow allowlist | Exfiltration, lateral movement |
| Identity | No SA token, no long-lived credentials | Control-plane pivot |
| Scheduling | Dedicated tainted pools | Co-tenancy with control plane |
| Supply chain | Signed images, digest pinning, admission control | Malicious image substitution |
| Detection | Falco runtime rules, egress volume anomaly detection | Post-compromise activity |

## Alternatives Considered

**Plain runc with seccomp and dropped capabilities.**
Rejected as the default. This is the industry-standard baseline and it is not sufficient here. Shared-kernel isolation means one kernel CVE separates a malicious adapter from every tenant's design data on that node. The historical rate of container escape CVEs makes this a question of when, not whether. Retained only for first-party signed images in single-tenant deployments, where the threat model is materially different.

**Kata Containers for everything.**
Rejected as the default, adopted for Enterprise. Hardware-virtualised isolation is stronger than gVisor and has near-native compute performance for CPU-bound work. Against: per-VM memory overhead (~100–150MB) and slower startup (~1–3s vs ~200ms), nested-virtualisation requirements that complicate cloud node selection, and materially higher operational complexity. For a 40-hour P&R job the startup cost is irrelevant — but for a 10,000-job regression sweep of short simulations it is not. gVisor is the better default across our actual workload mix; Kata is the right answer where the customer's risk tolerance justifies the cost, so we offer it as a tier.

**Firecracker microVMs.**
Rejected. Excellent isolation and startup, but designed around short-lived, modest-footprint functions. Our workloads need 64GB+ RAM, 500GB scratch, and multi-day runtimes with complex volume mounts. Poor fit.

**Dedicated bare-metal per tenant.**
Rejected as a default; effectively what on-prem deployments provide. Strongest isolation, unaffordable at SaaS scale, and poor utilisation given bursty regression load.

**WASM sandboxing for tools.**
Not applicable. EDA tools are large native binaries with heavy filesystem and threading requirements. WASM is the right answer for *parsers* (ADR 0014), not for tool execution.

**Trust the tools, isolate only marketplace adapters.**
Rejected. The distinction is illusory — an adapter's job is to invoke a tool, so the tool runs in whatever context the adapter has. And the tools themselves are the memory-unsafe parsers of untrusted input.

## Consequences

**Positive**

- Container escape requires defeating a userspace kernel first — a substantially harder problem than a shared-kernel exploit.
- Explicable to a customer security team as a coherent layered story, which matters commercially in this market.
- Deny-all egress removes an entire class of exfiltration regardless of what executes inside.
- No credentials on runners means compromise does not pivot to the control plane.
- Tiering aligns cost with the customer's own risk assessment.

**Negative**

- **gVisor syscall overhead is real**: typically 10–30% on syscall-heavy workloads, notably filesystem-intensive ones. EDA tools do heavy file I/O. This is the principal cost of the decision and must be measured on the reference SoC during Phase 1 rather than assumed.
- Some tools may fail under gVisor due to unimplemented syscalls or `/proc` and `/sys` expectations. Each requires investigation, and some may need the Trusted tier as a documented exception.
- GPU passthrough under gVisor is constrained. GPU-accelerated tools may require Kata or an explicit exception.
- Operating three runtime classes increases surface area. Mitigated by making tier a deployment configuration, with the same pod spec otherwise.
- Deny-all egress by default will produce adapter failures during development. This is intended friction — the failure is visible and forces explicit declaration.

**Neutral**

- Startup overhead (~200ms) is negligible against typical job durations but non-trivial for very short jobs in large regression sweeps. If measured to matter, short-simulation batching (multiple tests per runner invocation) addresses it better than weakening isolation.

## Migration Strategy

Adopted from Phase 1 — the first runner ships under gVisor. Retrofitting isolation onto a working execution path is exactly the kind of change that gets deferred indefinitely under delivery pressure.

**Phase 1 validation.** Run the full reference flow (Yosys, OpenSTA) under both gVisor and runc, and record the performance delta. This number determines whether the default holds, and it is a real gate — if the overhead proves to be 3× rather than 30% on our actual I/O profile, this ADR must be revisited rather than quietly ignored.

**Tool compatibility matrix.** Every supported tool is recorded with its verified runtime class. A tool requiring the Trusted tier is documented with the reason, and its adapter carries a warning at installation.

**Kata rollout.** Introduced in Phase 6 alongside enterprise features, validated on nested-virtualisation-capable node types in staging first.

**Exception process.** Trusted-tier grants require security review, are recorded in the plugin registry, are visible to the customer in the admin UI, and are never available for marketplace-sourced adapters.

## Open Questions

1. **Measured gVisor overhead on real EDA workloads.** The single most important unknown in this ADR. Published benchmarks do not cover this workload profile. Phase 1 must answer it.

   *Amended 2026-08-01:* the original single 40% mixed-workload threshold was too coarse — it would pass a 4x startup regression (startup is a small share of a mixed run) while failing a benign uniform 45%. Superseded by per-workload thresholds in `tools/arch/gate-a/criteria.json`, which is now the single source of truth. Harness: `node tools/harness/cli.mjs run gate-a-sandbox-overhead --phase 1`.
2. **Slurm and LSF isolation.** gVisor assumes Kubernetes. On a customer's existing HPC estate we do not control the runtime. Likely answer: document the reduced isolation guarantee and rely on the customer's existing controls, since jobs there run within one tenant's own infrastructure. Needs explicit statement in customer-facing security documentation.
3. **Licence daemon egress as an exfiltration channel.** FlexLM-family protocols permit arbitrary vendor-defined data in checkout requests. A malicious adapter could in principle encode data into licence traffic. Detection-only for now; a protocol-aware proxy is possible but expensive.
4. **Falco rule set.** Which runtime behaviours constitute an alert for EDA tools is unspecified. These tools do genuinely strange things — a naive rule set will be pure noise. Needs a baselining period in staging.
5. **Multi-tenant node pool packing.** Even under gVisor, is co-scheduling two tenants' jobs on one node acceptable for the Standard tier? Currently yes. A tenant-affinity soft constraint might be a cheap improvement worth measuring.

## Related ADRs

- 0009: CerebroEDA Workflow Substrate — activities dispatch into these sandboxes
- 0010: CerebroEDA Multi-Tenancy and Data Isolation — compute-plane isolation requirements
- 0014: CerebroEDA Parser Runtime — the WASM sandbox for the parsing extension point
