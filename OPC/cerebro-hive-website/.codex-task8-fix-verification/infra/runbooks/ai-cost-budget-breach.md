# Runbook: AI Cost Budget Breach

**Alert:** `CerebroAICostBudgetWarning` (> 80%) / `CerebroAICostBudgetCritical` (> 95%)  
**Severity:** Warning → Critical  
**Oncall team:** Platform SRE + FinOps  
**Escalation:** `#finops-alerts` → Engineering Manager (no PagerDuty page unless > 110%)

---

## What is happening

AI inference spend for the current month has reached or exceeded the configured budget threshold. If left unchecked, overage costs will exceed budget and may trigger billing alerts with the cloud provider.

Monthly budget is defined in `infra/prometheus/recording-rules.yaml` as `cerebro:ai:cost_budget_usd:month`.

---

## Immediate response (< 15 min)

1. **Open the AI Cost dashboard.**
   ```
   https://grafana.cerebrohive.com/d/cerebro-ai-costs
   ```
   Identify: which model, which workspace, which agent type is driving spend.

2. **Check current month spend vs. budget.**
   ```promql
   cerebro:ai:cost_usd:month
   cerebro:ai:cost_budget_usd:month
   cerebro:ai:cost_usd:month / cerebro:ai:cost_budget_usd:month
   ```

3. **Find the top spending workspaces.**
   ```promql
   topk(10,
     sum by (workspace_id) (
       increase(llm_cost_usd_total{namespace=~"cerebro-.*"}[30d])
     )
   )
   ```

4. **Find the top spending models.**
   ```promql
   topk(5,
     sum by (gen_ai_request_model) (
       increase(llm_cost_usd_total{namespace=~"cerebro-.*"}[30d])
     )
   )
   ```

---

## Diagnosis

### Is it a workspace spike or organic growth?

Plot spend rate over time:
```promql
sum by (workspace_id) (
  rate(llm_cost_usd_total{namespace=~"cerebro-.*"}[1h])
) * 3600
```

A spike in a single workspace at a specific time → likely runaway agent or user error.  
Gradual growth across workspaces → organic growth, consider raising budget.

### Is it a runaway agent loop?

```promql
# Agent iterations over threshold
sum by (workspace_id, cerebro_agent_type) (
  increase(agent_iterations_total{namespace=~"cerebro-.*"}[1h])
) > 500
```

Agents exceeding 500 iterations/hour are likely stuck in a loop.

Identify and stop the agent:
```bash
# Find the workspace's agent runs via API
curl -s -H "Authorization: Bearer $ADMIN_TOKEN" \
  "https://api.cerebrohive.com/api/admin/agents/runs?workspace_id=<workspace>&status=running" \
  | jq '.[] | {id, agent_type, iterations, created_at}'

# Stop a specific run
curl -s -X POST -H "Authorization: Bearer $ADMIN_TOKEN" \
  "https://api.cerebrohive.com/api/admin/agents/runs/<run-id>/stop"
```

### Is it model misuse? (using Opus when Haiku would suffice)

```promql
sum by (gen_ai_request_model) (
  rate(llm_requests_total{namespace=~"cerebro-.*"}[1h])
)
```

If `claude-opus-*` is high for tasks that should use `haiku`, escalate to the team owning that agent.

---

## Mitigation options

| Situation | Action |
|-----------|--------|
| Runaway agent | Stop the run via admin API; add iteration cap to agent config |
| Single workspace over-consuming | Apply per-workspace budget cap in workspace settings |
| Expensive model overused | Update agent config to use cheaper model for non-critical tasks |
| Budget too low for growth | Raise monthly budget in `recording-rules.yaml` and redeploy |
| Immediate cost freeze needed | Enable spend throttle in forge-api config: `AI_BUDGET_HARD_LIMIT=true` |

### Enabling the hard spend limit (emergency)

This will cause AI requests to return 429 when the budget is exceeded:
```bash
kubectl set env deployment/forge-api \
  AI_BUDGET_HARD_LIMIT=true \
  AI_BUDGET_USD_MONTH=5000 \
  -n cerebro-prod

kubectl rollout status deployment/forge-api -n cerebro-prod
```

Remove after budget is reset or raised:
```bash
kubectl set env deployment/forge-api AI_BUDGET_HARD_LIMIT- -n cerebro-prod
```

---

## Resolution checklist

- [ ] Root cause identified (runaway agent / growth / model misuse)
- [ ] Immediate spend rate reduced if > 100% budget
- [ ] Workspace or agent responsible notified
- [ ] Budget updated if growth is legitimate
- [ ] Cost attribution labels confirmed on all AI calls (`workspace_id`, `agent_type`, `model`)
- [ ] FinOps weekly review updated with this incident
