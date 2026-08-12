# DR Playbook: NATS Cluster Loss

**Scenario:** The NATS cluster is completely unavailable — all pods crash-looped, PersistentVolumes lost, or the entire NATS StatefulSet deleted.  
**RPO target:** ≤ 5 minutes of in-flight messages (JetStream max_age)  
**RTO target:** ≤ 20 minutes (fresh cluster + stream recreation)  
**Last exercised:** _Not yet exercised_

---

## Impact when NATS is down

- Agent dispatch fails immediately (new agent runs cannot be queued)
- Workflow state transitions queue in forge-api memory (bounded by `MAX_QUEUE_SIZE`)
- Audit log streaming pauses (events buffered in application memory)
- Webhook delivery halts (events not published to subscribers)
- Existing agent runs in progress are unaffected (they hold in-memory state)

---

## Step 1: Confirm NATS is down

```bash
kubectl get pods -n cerebro-prod -l app.kubernetes.io/name=nats
kubectl logs -n cerebro-prod -l app.kubernetes.io/name=nats --since=5m | tail -50

# Check JetStream status
kubectl exec -n cerebro-prod nats-0 -- \
  nats server report jetstream 2>/dev/null || echo "NATS not responding"
```

---

## Step 2: Attempt quick recovery (0–5 min)

If the StatefulSet exists but pods are crash-looping:

```bash
# Force delete the stuck pods (they will reschedule)
kubectl delete pods -n cerebro-prod -l app.kubernetes.io/name=nats --force

# Wait for pods to reschedule
kubectl rollout status statefulset/nats -n cerebro-prod --timeout=120s

# Check cluster formed (should show 3 members)
kubectl exec -n cerebro-prod nats-0 -- nats server list
```

If the StatefulSet or PVs are gone → proceed to full restore.

---

## Step 3: Full restore — redeploy NATS (5–15 min)

```bash
# Redeploy via ArgoCD (preferred — ensures config matches Git)
argocd app sync cerebro-nats --prune

# Or directly via Helm
helm upgrade --install nats nats/nats \
  -n cerebro-prod \
  -f infra/helm/nats/values-prod.yaml \
  --wait --timeout=300s

# Verify cluster formed
kubectl exec -n cerebro-prod nats-0 -- nats server list
# Expected: 3 members, all healthy
```

---

## Step 4: Recreate JetStream streams (15–17 min)

JetStream stream definitions are in Git. Recreate them:

```bash
# Recreate all streams from the stream config
kubectl exec -n cerebro-prod nats-0 -- bash -c "
  nats stream add agent-dispatch \
    --subjects 'agent.dispatch.>' \
    --storage file \
    --replicas 3 \
    --retention limits \
    --max-age 24h \
    --max-msgs -1 \
    --ack

  nats stream add workflow-events \
    --subjects 'workflow.events.>' \
    --storage file \
    --replicas 3 \
    --retention limits \
    --max-age 7d

  nats stream add audit-log \
    --subjects 'audit.>' \
    --storage file \
    --replicas 3 \
    --retention limits \
    --max-age 30d
"

# Verify streams exist
kubectl exec -n cerebro-prod nats-0 -- nats stream list
```

---

## Step 5: Replay buffered messages from forge-api (17–20 min)

```bash
# forge-api buffers messages in memory when NATS is unavailable.
# After NATS restores, the buffer should flush automatically.
# Verify by checking the queue depth metric:

kubectl exec -n monitoring deploy/prometheus -- \
  wget -qO- 'http://localhost:9090/api/v1/query?query=nats_consumer_pending_count' \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data']['result'])"

# Trigger a manual flush if the buffer did not auto-flush
kubectl rollout restart deployment/forge-api -n cerebro-prod
kubectl rollout status deployment/forge-api -n cerebro-prod --timeout=120s
```

---

## Step 6: Validate recovery

```bash
# Publish a test message and confirm it is consumed
kubectl exec -n cerebro-prod nats-0 -- \
  nats pub agent.dispatch.test '{"type": "dr-validation-probe", "ts": "'$(date -u +%s)'"}'

# Check consumer received it
kubectl exec -n cerebro-prod nats-0 -- \
  nats stream view agent-dispatch --count=1

# Verify forge-api can dispatch an agent
curl -s -X POST https://api.cerebrohive.com/api/agents/runs \
  -H "Authorization: Bearer $TEST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "dr-probe", "workspace_id": "'$TEST_WORKSPACE_ID'"}' \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print('Dispatch OK:', d.get('id', 'FAIL'))"
```

---

## Post-recovery checklist

- [ ] 3 NATS pods in Running state
- [ ] JetStream streams recreated and healthy
- [ ] `nats_consumer_pending_count` at 0 (no backlog)
- [ ] Agent dispatch functioning (test run above succeeded)
- [ ] forge-api buffer flushed
- [ ] `CerebroNATSDown` alert has resolved in Alertmanager
- [ ] Audit log stream receiving events
- [ ] RTO confirmed: record time from incident declaration to step 6 passing

---

## Accepted risk

Messages that were in-flight at the time of the outage and not yet acknowledged by JetStream consumers are lost. This is accepted because:
- Agent dispatch operations are idempotent (re-dispatch is safe)
- Audit log gaps during the outage window are logged as a known gap (not silently dropped)
- Workflow state transitions are persisted to Postgres first; NATS events are notifications only
