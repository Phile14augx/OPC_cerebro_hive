# Architecture Baseline Manifest — 2026-07-29

This manifest fixes the exact content of both stable baselines at the point they were declared complete, so any future drift (accidental edit, silent rewrite) is independently detectable via hash comparison rather than assumed. Recompute with `sha256sum <path>` (or `Get-FileHash -Algorithm SHA256 <path>` in PowerShell) and diff against this file to verify the baseline hasn't moved.

## Suggested git tag (run locally — this sandbox's `.git` isn't a functional repo, so I couldn't create it from here)

```
git add audit/M26.2-3-BASELINE.md hiveforge/ BASELINE-MANIFEST-2026-07-29.md audit/adr/ADR-006*.md audit/adr/ADR-007*.md
git commit -m "Freeze baseline: Engineering Review (M26.2-3) + HiveForge Masterplan (Phases 0-8, ADR-020-037)"
git tag -a baseline-2026-07-29 -m "Engineering Review vertical-slice baseline + HiveForge Masterplan Phases 0-8, ADR-020-037. Architecture-complete; execution and the Policy Inheritance ADR proceed from here."
git push origin baseline-2026-07-29
```

## Engineering Review Baseline

| File | SHA-256 |
|---|---|
| `audit/M26.2-3-BASELINE.md` | `af0e6ef0ff1e67fa5684b1c6e2c3eeea29defa9dcb1b4a2af4049f2ddebbd65e` |
| `audit/adr/ADR-006-persistence-eventing-and-transport-adopted-from-vertical-slice.md` | `9f1ac4b0e7f6c896ced8e15fde89aac9aef0c9def57d6aa5f0fc618801896add` |
| `audit/adr/ADR-007-canonical-contributor-interface-and-stub-contributor-migration.md` | `c16ef3f18c96e26fcf5742565a4033a717fd48f694767c2f7d8463b3b4157b3a` |

## HiveForge Masterplan Baseline

| File | SHA-256 |
|---|---|
| `hiveforge/00-FOUNDATION.md` | `f6c0b30b5978ae42cad182dd154405d58eee118d7375c5000aaabae51e10112b` |
| `hiveforge/01-DOMAIN-MODEL.md` | `8677d3df4b76770892346b0b35d49eac69933238a78e83e607517ff2a91e02e2` |
| `hiveforge/01-PLATFORM-ARCHITECTURE.md` | `d427870babc18732db274c22092ab559d950f72b972a3cd1e66f8e45d0f30c9f` |
| `hiveforge/02-SERVICE-CATALOG.md` | `d3393e89846ab1341339307eb1df9f93e9cac6ebf203ed3f7127c08a99c8ba75` |
| `hiveforge/03-CONTROL-PLANE.md` | `65120c14b1ccce099bbc64b3a24d09b2b371b35d7e6569188a9732c6199e07a4` |
| `hiveforge/04-PROVIDER-FRAMEWORK.md` | `05f9f32da2b491b8c715c2e163351c417e223f68edfa082712bdbebf74f4b126` |
| `hiveforge/05-BUSINESS-PLATFORM.md` | `5ab85867c931eb80a4f1535859b5e2c47ad7ddac250af749bfdb18981bd18afe` |
| `hiveforge/06-SECURITY.md` | `122fbc2f400fa6b48c3b78572eb9b5cd8c795594024c366a53fa8ab0e2a8862b` |
| `hiveforge/07-OPERATIONS.md` | `8a986860f08e908ed026c6cc53dc46a7a26a9dd155c6b7376ce9352473cbe2bd` |
| `hiveforge/08-ROADMAP.md` | `9e43b18d8efa7709b654d6a9b756b36aff30ac4a7ca3b977ba334a640a71936f` |
| `hiveforge/adr/ADR-020-provider-abstraction-layer.md` | `be85a0d8154c564ecefc57e0c2aef4d66445833c1135daca8d8d849b66c9dbdc` |
| `hiveforge/adr/ADR-021-hivegateway-as-control-plane.md` | `22c78f941f7ab6511864e10e528a743fb569b832a9985827894d126570dab435` |
| `hiveforge/adr/ADR-022-resource-lifecycle-state-machine.md` | `c6f019e31f8bc624f86f55e4556b34d27675f5ca41c6945639b7078298e7901f` |
| `hiveforge/adr/ADR-023-identity-and-credential-escrow.md` | `d44d0db20856ebcd516d8a09079e43912576cbb0ae8fa1516d0c7bb2dc781693` |
| `hiveforge/adr/ADR-024-event-driven-platform-architecture.md` | `3cb46a6895fad887fb2b09142e39bedd3d6bca45797c22679a3ebcd9c3769d02` |
| `hiveforge/adr/ADR-025-billing-and-metering-model.md` | `2bdd0e07c2c26d7d350f585b63e9a0e68dd06f154ca90fa764f80d9180eca319` |
| `hiveforge/adr/ADR-026-multi-tenant-isolation-strategy.md` | `a812da837436540324710f61e6950d377c9811fb7fa97159361321f707a377e9` |
| `hiveforge/adr/ADR-027-failure-handling-and-retry-classification.md` | `d6bea1685c7177ff39d39b799c6136f6776ea482f041ba2e3a15a1025f44bec5` |
| `hiveforge/adr/ADR-028-zero-trust-identity-abac-and-human-approval.md` | `10ed5d145c87ae413ca50e735751c53d93d6ea801aeaa32a441fd348e7d44f2f` |
| `hiveforge/adr/ADR-029-ai-agent-identity-and-governance-engine.md` | `e62b134fe65a5e49495e98dbe6c2ea263a347e4397ca37200b8618d9f495b737` |
| `hiveforge/adr/ADR-030-secure-prompt-and-ai-gateway.md` | `38df53ee10be02f904461ed6db65472f07c6b6bb81759c0b497d166551b71ead` |
| `hiveforge/adr/ADR-031-secrets-management-and-data-classification.md` | `cce96490b16fe8bce7b34986c3bc50d69eddde568410f834200b1fb0eb643e27` |
| `hiveforge/adr/ADR-032-runtime-supply-chain-and-cicd-security.md` | `d6ac9388940299255715f7e41b51c0903b3aacc67622e1fe2c852a4e14ef01bf` |
| `hiveforge/adr/ADR-033-infrastructure-security-detection-and-ai-soc.md` | `1acf5520cdccef62c57596429675b38a261875ad35436d10e448735ac8a91312` |
| `hiveforge/adr/ADR-034-service-level-objectives-and-error-budget-policy.md` | `c71feee33949467dd6b88a0141f3f46354961bc7ab16bb3f56e07130599b7190` |
| `hiveforge/adr/ADR-035-incident-management-and-operational-response.md` | `70c23e23244fd100d130a99a7a69cbf9a6960868ff3858ad21d3caa339ea8529` |
| `hiveforge/adr/ADR-036-business-continuity-and-disaster-recovery.md` | `cd36f5224d9bf6af6495a8e49926391361f693125418e1891b7d9256d1e13a44` |
| `hiveforge/adr/ADR-037-operational-cost-governance-finops.md` | `b08740b83806675d336ec21fc0a047c0c5fb0a2808b9758fd2c2157b24715d75` |

## Known open item at time of freeze

Policy inheritance precedence/override algorithm (`hiveforge/01-DOMAIN-MODEL.md` §4, tracked as an Open Architectural Question in `hiveforge/08-ROADMAP.md` §2) — not resolved as of this baseline. Per the adopted governance rule, no implementation should infer this behavior until a dedicated ADR resolves it.
