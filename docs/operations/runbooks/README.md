# CerebroHive Incident Runbooks

Operational runbooks for on-call engineers. Each file maps to one or more Alertmanager alert names.

| Runbook | Alert(s) | Severity |
|---------|----------|----------|
| [SLO Burn Rate](./slo-burn-rate.md) | `CerebroSLOErrorBudgetBurning`, `CerebroSLOErrorBudgetCritical` | Warning → Critical |
| [High Error Rate](./high-error-rate.md) | `CerebroHighErrorRate` | Warning → Critical |
| [Pod CrashLoop](./pod-crashloop.md) | `CerebroPodCrashLooping` | Warning → Critical |
| [DB Connection Exhaustion](./db-connection-exhaustion.md) | `CerebroDBConnectionPoolExhausted` | Warning → Critical |
| [AI Cost Budget Breach](./ai-cost-budget-breach.md) | `CerebroAICostBudgetWarning`, `CerebroAICostBudgetCritical` | Warning → Critical |
| [ArgoCD Out of Sync](./argocd-out-of-sync.md) | `CerebroArgoCDAppOutOfSync` | Warning → Critical |
| [Node Memory Pressure](./node-memory-pressure.md) | `CerebroNodeMemoryPressure` | Warning → Critical |

## Quick reference

- **Grafana:** https://grafana.cerebrohive.com
- **ArgoCD:** https://argocd.cerebrohive.com
- **Alertmanager:** https://alertmanager.cerebrohive.com
- **PagerDuty:** https://cerebrohive.pagerduty.com
- **Incident channel:** `#sre-incidents` in Slack
- **Postmortems:** Notion → CerebroHive → Postmortems

## Escalation path

```
Alert fires
  └─> On-call SRE (PagerDuty)
        └─> Acknowledge within 5 min (P0/P1) / 30 min (P2)
              └─> Resolve or escalate to:
                    - Engineering Manager (business impact)
                    - Database team (DB alerts)
                    - FinOps (cost alerts)
                    - Security (Semgrep/Trivy critical findings)
```

## Severity definitions

| Level | Response SLA | Examples |
|-------|-------------|---------|
| P0 Critical | Page immediately, respond < 5 min | Platform down, auth failure, >14× SLO burn |
| P1 High | Page, respond < 30 min | Service degraded, >95% DB connections, cost > 100% |
| P2 Medium | Slack notify, respond < 4h | ArgoCD drift, pod crashloop (non-prod), TLS cert < 14d |
| P3 Low | Ticket, respond < 48h | Slow burn rate, non-critical probe down |
