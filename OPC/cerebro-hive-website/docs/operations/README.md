# Operations

Running and operating the platform in production.

| Document | Covers |
|---|---|
| [infrastructure-overview.md](./infrastructure-overview.md) | Infrastructure overview |
| [infrastructure-setup.md](./infrastructure-setup.md) | Infrastructure setup |
| [chaos-engineering.md](./chaos-engineering.md) | Chaos engineering practice |
| [disaster-recovery/](./disaster-recovery/) | DR overview plus per-failure-mode playbooks (cluster loss, Keycloak loss, NATS loss, S3 bucket loss) |
| [runbooks/](./runbooks/) | Operational runbooks (AI cost budget breach, ArgoCD out of sync, DB connection exhaustion, high error rate, node memory pressure, pod crashloop, SLO burn rate, [day1-local-bootstrap.md](./runbooks/day1-local-bootstrap.md), [nexarch-os-bootstrap.md](./runbooks/nexarch-os-bootstrap.md)) |

Infrastructure-as-code itself (Terraform/CDK/Helm) stays in the repository-root `infra/` directory next to the code it provisions — only the human-readable documentation moved here.
