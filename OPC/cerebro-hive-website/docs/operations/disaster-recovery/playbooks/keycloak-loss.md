# DR Playbook: Keycloak Loss

**Scenario:** Keycloak is completely unavailable — pod crash loop, database corruption, or accidental deletion. All authentication fails; users cannot log in.  
**RPO target:** ≤ 24 hours (last successful realm export)  
**RTO target:** ≤ 30 minutes (restore from export + restart)  
**Severity:** P0 — platform is effectively down for all users  
**Last exercised:** _Not yet exercised — critical gap identified in PRR_

---

## Immediate impact

When Keycloak is down:
- All login attempts return 503 or redirect to an error page
- Existing sessions with valid JWT tokens continue working until they expire (typically 15 min)
- API calls with valid Bearer tokens continue to succeed until expiry
- **Effective user impact:** complete auth outage within 15 minutes of Keycloak going down

---

## Step 1: Confirm Keycloak is down (0–5 min)

```bash
# Check pod status
kubectl get pods -n cerebro-prod -l app.kubernetes.io/name=keycloak

# Check logs for root cause
kubectl logs -n cerebro-prod -l app.kubernetes.io/name=keycloak --since=10m | tail -100

# Check if Postgres (Keycloak's backend) is healthy
kubectl exec -n cerebro-prod deploy/keycloak -- \
  curl -s http://localhost:8080/health/ready || echo "Keycloak not responding"
```

**Common causes:**
- Database connection failure → see DB runbook, fix DB, Keycloak auto-recovers
- OOMKill → increase memory limit in Helm values, restart
- Realm corruption → restore from export (this playbook)
- Accidental namespace/pod deletion → restore from export

---

## Step 2: Attempt quick restart first (5–10 min)

If the issue is transient (OOMKill, network blip):

```bash
kubectl rollout restart deployment/keycloak -n cerebro-prod
kubectl rollout status deployment/keycloak -n cerebro-prod --timeout=120s

# If keycloak comes back healthy, stop here
kubectl exec -n cerebro-prod deploy/keycloak -- \
  curl -s http://localhost:8080/health/ready
```

If the restart does not resolve it within 2 minutes → proceed to restore from backup.

---

## Step 3: Restore from realm export (10–25 min)

```bash
# Find the most recent realm export
# Exports are created by the keycloak-realm-export CronJob (runs daily at 01:00 UTC)
# and stored in s3://cerebro-backups/keycloak/

LATEST_EXPORT=$(aws s3 ls s3://cerebro-backups/keycloak/ \
  | sort | tail -1 | awk '{print $4}')

echo "Restoring from: $LATEST_EXPORT"

aws s3 cp "s3://cerebro-backups/keycloak/$LATEST_EXPORT" /tmp/realm-export.json

# Inspect the export to confirm it looks valid
python3 -c "
import json
with open('/tmp/realm-export.json') as f:
    realm = json.load(f)
print(f'Realm: {realm[\"realm\"]}')
print(f'Users: {len(realm.get(\"users\", []))}')
print(f'Clients: {len(realm.get(\"clients\", []))}')
print(f'Roles: {len(realm.get(\"roles\", {}).get(\"realm\", []))}')
"
```

---

## Step 4: Import realm into a fresh Keycloak instance (15–25 min)

```bash
# Scale down existing Keycloak (in case it's crash-looping and would interfere)
kubectl scale deployment keycloak --replicas=0 -n cerebro-prod

# Copy the export into the Keycloak pod's import directory
# Use a temporary init-container or restart with KEYCLOAK_IMPORT env var

# Option A: Use Keycloak's built-in import on startup
kubectl create configmap keycloak-realm-import \
  --from-file=realm.json=/tmp/realm-export.json \
  -n cerebro-prod --dry-run=client -o yaml | kubectl apply -f -

# Patch the deployment to mount the ConfigMap and import on startup
kubectl patch deployment keycloak -n cerebro-prod --type=json -p='[
  {
    "op": "add",
    "path": "/spec/template/spec/volumes/-",
    "value": {
      "name": "realm-import",
      "configMap": { "name": "keycloak-realm-import" }
    }
  },
  {
    "op": "add",
    "path": "/spec/template/spec/containers/0/volumeMounts/-",
    "value": {
      "name": "realm-import",
      "mountPath": "/opt/keycloak/data/import"
    }
  },
  {
    "op": "add",
    "path": "/spec/template/spec/containers/0/args",
    "value": ["start", "--import-realm"]
  }
]'

# Scale back up
kubectl scale deployment keycloak --replicas=2 -n cerebro-prod
kubectl rollout status deployment keycloak -n cerebro-prod --timeout=180s
```

---

## Step 5: Validate the restore (25–30 min)

```bash
# Check health
kubectl exec -n cerebro-prod deploy/keycloak -- \
  curl -s http://localhost:8080/health/ready

# Verify the realm was imported
kubectl exec -n cerebro-prod deploy/keycloak -- \
  curl -s http://localhost:8080/realms/cerebrohive/.well-known/openid-configuration \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print('Realm OK:', d['issuer'])"

# Verify synthetic probe for auth
curl -s https://auth.cerebrohive.com/.well-known/openid-configuration \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print('Auth OK:', d['issuer'])"

# Test a login flow (requires a test user in the export)
curl -s -X POST https://auth.cerebrohive.com/realms/cerebrohive/protocol/openid-connect/token \
  -d "grant_type=password&client_id=forge-api&username=test@cerebrohive.com&password=$TEST_USER_PASSWORD" \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print('Login OK' if 'access_token' in d else f'Login FAIL: {d}')"
```

---

## Step 6: Remove import artifacts (30 min)

```bash
# Remove the import configmap and patch (to avoid re-importing on next restart)
kubectl patch deployment keycloak -n cerebro-prod --type=json -p='[
  {"op": "remove", "path": "/spec/template/spec/containers/0/args"}
]'

kubectl delete configmap keycloak-realm-import -n cerebro-prod --ignore-not-found

kubectl rollout restart deployment keycloak -n cerebro-prod
kubectl rollout status deployment keycloak -n cerebro-prod --timeout=120s
```

---

## Post-recovery checklist

- [ ] `probe_success{service="auth"}` == 1
- [ ] OpenID configuration endpoint responding
- [ ] Test login succeeds
- [ ] User count in imported realm matches expected (validate against user database)
- [ ] All client credentials (forge-api, studio) are functional
- [ ] Alert `CerebroProbeDown{service="auth"}` has resolved
- [ ] Realm export CronJob confirmed running (so tomorrow's export captures current state)

---

## Preventing recurrence

The root cause of RPO > 24h is that the realm export only runs daily. After this exercise:
- [ ] Increase export frequency to every 6 hours
- [ ] Add a Prometheus alert: `keycloak_realm_export_age_hours > 25` → warning alert
- [ ] Test the restore procedure quarterly
- [ ] Document the RTO/RPO achieved in this exercise
