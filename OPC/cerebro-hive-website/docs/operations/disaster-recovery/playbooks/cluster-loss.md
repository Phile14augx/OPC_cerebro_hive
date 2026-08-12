# DR Playbook: Entire Cluster Loss

**Scenario:** The `cerebro-prod` EKS cluster is completely unavailable — all nodes terminated, control plane unreachable, or region-wide failure.  
**RPO target:** ≤ 1 hour (last successful DB snapshot + message replay)  
**RTO target:** ≤ 4 hours (new cluster provisioned, all services running)  
**Last exercised:** _Not yet exercised — exercise required before production launch_

---

## Trigger conditions

- All nodes in `cerebro-prod` return `NotReady` for > 5 minutes
- EKS control plane API is unreachable
- AWS region experiencing documented incident affecting EKS
- Deliberate DR exercise

---

## Pre-requisites (verify before starting)

- [ ] AWS credentials with `AdministratorAccess` in `cerebro-prod` account
- [ ] Terraform state in S3 is accessible (`cerebro-terraform-state` bucket)
- [ ] RDS snapshot is available (check: `aws rds describe-db-snapshots --db-instance-identifier cerebro-prod`)
- [ ] `cerebro-hive-website` Git repository is accessible
- [ ] DNS access to update `cerebrohive.com` records

---

## Step 1: Declare the incident (0–5 min)

```bash
# Post to #sre-incidents
# "DR DECLARED: cerebro-prod cluster loss. Initiating recovery. ETA: 4 hours."

# Page the oncall team if not already alerted
# Create a war room video call
# Assign roles: Incident Commander, Recovery Lead, Comms Lead
```

---

## Step 2: Provision replacement cluster (5–60 min)

```bash
# Clone the repo if the local copy is unavailable
git clone https://github.com/cerebro-hive/cerebro-hive.git
cd cerebro-hive

# Provision EKS cluster via Terraform
cd infra/terraform/environments/prod
terraform init -backend-config=bucket=cerebro-terraform-state

# If recovering in same region:
terraform apply -target=module.eks -auto-approve

# If region-loss — target the DR region:
# export AWS_DEFAULT_REGION=us-west-2
# terraform workspace select prod-dr
# terraform apply -target=module.eks -auto-approve

# Configure kubectl for the new cluster
aws eks update-kubeconfig --name cerebro-prod-dr --region us-west-2
kubectl get nodes   # wait until all nodes Ready
```

---

## Step 3: Restore platform secrets (60–75 min)

```bash
# Restore Kubernetes Secrets from AWS Secrets Manager backup
# (Requires External Secrets Operator — or manual restore if not installed)

# Install ESO
helm install external-secrets external-secrets/external-secrets \
  -n external-secrets --create-namespace

# Apply SecretStore and ExternalSecret manifests
kubectl apply -f infra/k8s/secrets/

# Verify secrets are populated
kubectl get secrets -n cerebro-prod | grep -v "default-token"
```

---

## Step 4: Restore database (75–120 min)

```bash
# Find the most recent automated snapshot
SNAPSHOT=$(aws rds describe-db-snapshots \
  --db-instance-identifier cerebro-prod \
  --query 'reverse(sort_by(DBSnapshots, &SnapshotCreateTime))[0].DBSnapshotIdentifier' \
  --output text)

echo "Restoring from: $SNAPSHOT"

# Restore to new instance (in DR region if applicable)
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier cerebro-prod-restored \
  --db-snapshot-identifier $SNAPSHOT \
  --db-instance-class db.r6g.xlarge \
  --vpc-security-group-ids $DR_SECURITY_GROUP_ID \
  --db-subnet-group-name cerebro-prod-subnet-group \
  --region us-west-2   # DR region

# Wait for restore to complete (typically 20–40 min)
aws rds wait db-instance-available \
  --db-instance-identifier cerebro-prod-restored \
  --region us-west-2

# Update the DATABASE_URL secret with the new endpoint
NEW_ENDPOINT=$(aws rds describe-db-instances \
  --db-instance-identifier cerebro-prod-restored \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text)

kubectl create secret generic database-credentials \
  --from-literal=DATABASE_URL="postgresql://cerebrohive:$DB_PASSWORD@${NEW_ENDPOINT}:5432/cerebrohive" \
  -n cerebro-prod --dry-run=client -o yaml | kubectl apply -f -
```

---

## Step 5: Deploy via ArgoCD (120–180 min)

```bash
# Install ArgoCD on the new cluster
kubectl create namespace argocd
kubectl apply -n argocd \
  -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for ArgoCD to be ready
kubectl wait pods -n argocd --all --for=condition=Ready --timeout=300s

# Register the Git repo
argocd repo add https://github.com/cerebro-hive/cerebro-hive \
  --username $GITHUB_USER \
  --password $GITHUB_TOKEN

# Apply app-of-apps (bootstraps all platform services)
kubectl apply -f infra/argocd/app-of-apps.yaml

# Sync all applications
argocd app sync --all --prune

# Watch rollout
watch -n5 "argocd app list | grep -v Synced"
```

---

## Step 6: Restore observability stack (180–210 min)

```bash
# Grafana dashboards are in Git — re-provisioned by ArgoCD automatically
# Prometheus: fresh instance, will start collecting from t=0
# Thanos: store-gateway rehydrates historical data from S3 automatically

# Verify Thanos store-gateway is reading from S3:
kubectl logs -n monitoring deploy/thanos-store-gateway | grep "loaded block"

# Reconnect Alertmanager to PagerDuty (if using external URL not in Secrets)
kubectl apply -f infra/alertmanager/alertmanager.yml
```

---

## Step 7: Restore NATS message queues (210–220 min)

```bash
# NATS JetStream data is on PersistentVolumes
# If PVs were in the failed region, restore from PV snapshot or accept message loss

# Check if messages need replay from application-level dead-letter storage
kubectl exec -n cerebro-prod deploy/forge-api -- \
  node -e "
  const { connect, StringCodec } = require('nats');
  // Reconnect and check pending messages in each stream
  "
```

---

## Step 8: Update DNS and validate (220–240 min)

```bash
# Get new load balancer hostname
NEW_LB=$(kubectl get svc -n ingress-nginx ingress-nginx-controller \
  -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')

echo "New LB: $NEW_LB"

# Update DNS (Route 53)
aws route53 change-resource-record-sets \
  --hosted-zone-id $HOSTED_ZONE_ID \
  --change-batch "{
    \"Changes\": [{
      \"Action\": \"UPSERT\",
      \"ResourceRecordSet\": {
        \"Name\": \"api.cerebrohive.com\",
        \"Type\": \"CNAME\",
        \"TTL\": 60,
        \"ResourceRecords\": [{\"Value\": \"$NEW_LB\"}]
      }
    }]
  }"

# Wait for DNS propagation
sleep 120

# Validate synthetic probes are passing
curl -s https://api.cerebrohive.com/health
curl -s https://studio.cerebrohive.com
```

---

## Post-recovery checklist

- [ ] All synthetic probes show `probe_success == 1`
- [ ] No critical alerts firing in Alertmanager
- [ ] Grafana dashboards showing live data
- [ ] Thanos store-gateway showing historical blocks from S3
- [ ] A sample inference request succeeds end-to-end
- [ ] NATS JetStream streams are healthy and consumers are active
- [ ] RPO confirmed: check timestamp of first transaction after restore
- [ ] RTO confirmed: record total elapsed time from incident declaration to validation
- [ ] Update this playbook with lessons learned

---

## RTO/RPO measurement

After the exercise, record:

```
Exercise date: _______________
Trigger time (T0): _______________
Cluster provisioned (T1): _______________ (T1-T0 = ___ min)
Database restored (T2): _______________ (T2-T0 = ___ min)
Services running (T3): _______________ (T3-T0 = ___ min)
DNS updated + validated (T4): _______________ (T4-T0 = ___ min)

RTO = T4 - T0 = ___ hours ___ min  (target: ≤ 4 hours)
RPO = timestamp of oldest data gap = ___ (target: ≤ 1 hour)
```
