# Runbook: ArgoCD Out of Sync

**Alert:** `CerebroArgoCDAppOutOfSync`  
**Severity:** Warning (> 30 min) → Critical (> 2 hours, if production)  
**Oncall team:** Platform SRE  
**Escalation:** `#platform-gitops` → PagerDuty P2 (P1 if prod stuck > 2h)

---

## What is happening

One or more ArgoCD applications have diverged from their desired state in Git. This means the live cluster state does not match the declared configuration, which breaks GitOps guarantees and may indicate an unauthorized manual change or a sync failure.

---

## Immediate response (< 10 min)

1. **Open ArgoCD UI.**
   ```
   https://argocd.cerebrohive.com
   ```
   Look for applications with `OutOfSync` or `Degraded` status.

2. **Check via CLI.**
   ```bash
   argocd app list --output wide | grep -v Synced

   # Detailed sync status for a specific app
   argocd app get cerebro-prod --show-operation
   ```

3. **Check the diff between live and desired.**
   ```bash
   argocd app diff cerebro-prod
   # Or in the UI: click the app → DIFF tab
   ```

---

## Diagnosis

### Why is it out of sync?

| Cause | How to identify |
|-------|----------------|
| New commit to Git repo | `argocd app history cerebro-prod` shows new revision |
| Auto-sync disabled | `argocd app get cerebro-prod` → `Auto-Sync: Disabled` |
| Sync failed (e.g., Helm render error) | `argocd app get cerebro-prod` → last operation message |
| Manual `kubectl apply` bypassed ArgoCD | Diff shows resource exists in cluster but not in Git |
| Webhook delivery failed | Check GitHub → Settings → Webhooks → delivery history |

### Sync failed with error

```bash
# See sync operation result
argocd app get cerebro-prod --show-operation | grep -A20 "Operation:"

# If it's a Helm render error
argocd app manifests cerebro-prod 2>&1 | head -50
```

Common errors:
- **`Unable to resolve 'apps/cerebro-prod' to a commit SHA`** → check repo credentials:
  ```bash
  argocd repo list
  argocd repo get https://github.com/cerebro-hive/cerebro-hive
  ```
- **`rendered manifests contain a resource that already exists`** → resource was created outside ArgoCD; adopt it:
  ```bash
  kubectl annotate <resource> <name> \
    argocd.argoproj.io/managed-by=cerebro-prod -n <namespace>
  ```
- **Helm chart version not found** → check if Chart.yaml version was bumped without publishing to the chart repo

---

## Mitigation

### Trigger a manual sync

```bash
# Sync with prune (removes resources deleted from Git)
argocd app sync cerebro-prod --prune

# Sync only specific resources
argocd app sync cerebro-prod --resource apps:Deployment:forge-api

# Force sync ignoring cached state
argocd app sync cerebro-prod --force
```

### Re-enable auto-sync if it was disabled

```bash
argocd app set cerebro-prod --sync-policy automated --auto-prune
```

### Revert unauthorized manual change

If the diff shows a resource was manually changed and should be reverted to Git state:
```bash
# Hard reset live state to match Git
argocd app sync cerebro-prod --replace
```

⚠️ `--replace` deletes and recreates resources — only use for non-stateful resources.

### Re-register failed webhook

1. GitHub → `cerebro-hive/cerebro-hive` → Settings → Webhooks
2. Find the ArgoCD webhook (payload URL: `https://argocd.cerebrohive.com/api/webhook`)
3. Click "Redeliver" on the last failed delivery

---

## Resolution checklist

- [ ] All ArgoCD apps show `Synced` and `Healthy`
- [ ] No manual changes left in cluster that conflict with Git
- [ ] Auto-sync re-enabled on all production apps
- [ ] Webhook delivery confirmed healthy
- [ ] If manual change was made: opened a PR to capture the intent in Git
- [ ] `#platform-gitops` updated with what drifted and why
