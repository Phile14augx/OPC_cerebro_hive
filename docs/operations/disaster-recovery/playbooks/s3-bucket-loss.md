# DR Playbook: S3 Bucket Loss

**Scenario:** A critical S3 bucket is deleted, corrupted, or access is revoked. Affects: Thanos metrics, Loki log chunks, Tempo trace blocks, Terraform state, Keycloak exports, or ArgoCD artifact storage.  
**RPO target:** Depends on bucket (see table below)  
**RTO target:** ≤ 2 hours for observability data; ≤ 30 min for Terraform state  
**Last exercised:** _Not yet exercised_

---

## Bucket inventory and recovery priority

| Bucket | Contents | CRR? | Recovery Method | RPO | RTO |
|--------|----------|------|-----------------|-----|-----|
| `cerebro-thanos-metrics` | Long-term metrics blocks | ✅ us-west-2 | Restore from replica | ~0 | 30 min |
| `cerebro-loki-chunks` | Log chunks (30d) | ✅ us-west-2 | Restore from replica | ~0 | 30 min |
| `cerebro-tempo-traces` | Trace blocks (72h hot) | ❌ | Accept loss; new traces captured | 72h | N/A |
| `cerebro-terraform-state` | Terraform state files | ✅ | Versioned; restore from prior version | ~0 | 15 min |
| `cerebro-backups` | Keycloak exports, DB dumps | ✅ us-west-2 | Restore from replica | 6h | 1h |
| `cerebro-artifacts` | Build artifacts, SBOMs | ❌ | Rebuild from source | N/A | 2h |

---

## Step 1: Determine which bucket is affected

```bash
# List all platform buckets
aws s3 ls | grep cerebro

# Check if the bucket exists
aws s3 ls s3://cerebro-thanos-metrics/ 2>&1 | head -5

# Check CloudTrail for deletion events
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=EventName,AttributeValue=DeleteBucket \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%SZ) \
  | jq '.Events[] | {time: .EventTime, user: .Username, bucket: .Resources[0].ResourceName}'
```

---

## Step 2a: Restore from Cross-Region Replication (for CRR buckets)

```bash
# For buckets with CRR to us-west-2:
BUCKET="cerebro-thanos-metrics"
DR_BUCKET="${BUCKET}-dr"   # replica bucket in us-west-2

# Verify replica bucket is intact
aws s3 ls s3://${DR_BUCKET}/ --region us-west-2 | head -10

# Option A: Re-create the primary bucket and sync from replica
aws s3 mb s3://${BUCKET} --region us-east-1
aws s3 sync s3://${DR_BUCKET}/ s3://${BUCKET}/ \
  --source-region us-west-2 \
  --region us-east-1

# Re-apply bucket policies (Terraform will handle this on next apply)
cd infra/terraform/environments/prod
terraform apply -target=module.storage -auto-approve

# Option B: Update application config to point at the DR bucket directly
# (faster, avoids full sync, but requires config change)
kubectl set env deployment/thanos-store-gateway \
  OBJSTORE_BUCKET=${DR_BUCKET} \
  OBJSTORE_REGION=us-west-2 \
  -n monitoring
```

---

## Step 2b: Restore Terraform state from versioned S3

```bash
# S3 versioning is enabled on the state bucket
# List versions of the state file
aws s3api list-object-versions \
  --bucket cerebro-terraform-state \
  --prefix prod/terraform.tfstate \
  | jq '.Versions[] | {id: .VersionId, modified: .LastModified}' | head -20

# Restore a specific version
VERSION_ID="<version-id-from-above>"
aws s3api get-object \
  --bucket cerebro-terraform-state \
  --key prod/terraform.tfstate \
  --version-id $VERSION_ID \
  /tmp/terraform.tfstate.restored

# Upload restored version as current
aws s3 cp /tmp/terraform.tfstate.restored \
  s3://cerebro-terraform-state/prod/terraform.tfstate

echo "State restored — run terraform plan to verify no unexpected drift"
cd infra/terraform/environments/prod
terraform plan
```

---

## Step 3: Validate service recovery

```bash
# Thanos: verify store-gateway is reading blocks
kubectl logs -n monitoring deploy/thanos-store-gateway | grep "loaded block"

# Loki: verify chunks are accessible
kubectl exec -n monitoring deploy/loki-querier -- \
  logcli query '{namespace="cerebro-prod"}' --limit=1 --since=1h

# Tempo: verify ingestion is working (traces will appear after ~2 min)
kubectl logs -n monitoring deploy/tempo | grep "received span"
```

---

## Step 4: Re-enable bucket protection

```bash
# Ensure the recovered bucket has deletion protection re-applied
aws s3api put-bucket-versioning \
  --bucket cerebro-thanos-metrics \
  --versioning-configuration Status=Enabled

# Re-enable MFA delete for extra protection on critical buckets
# (requires root account credentials)
aws s3api put-bucket-versioning \
  --bucket cerebro-terraform-state \
  --versioning-configuration Status=Enabled,MFADelete=Enabled \
  --mfa "arn:aws:iam::ACCOUNT:mfa/root-account-mfa TOTP_CODE"

# Apply bucket policy that prevents accidental deletion
aws s3api put-bucket-policy \
  --bucket cerebro-thanos-metrics \
  --policy file://infra/terraform/modules/storage/bucket-policy.json
```

---

## Post-recovery checklist

- [ ] Affected bucket exists and is accessible
- [ ] Bucket versioning re-enabled
- [ ] CRR re-configured and replication lag is 0
- [ ] Services consuming the bucket are healthy (Thanos, Loki, Tempo)
- [ ] CloudTrail alert for `DeleteBucket` event is active (prevent recurrence)
- [ ] Terraform `apply` confirms no state drift
- [ ] RTO/RPO measured and recorded

---

## Prevention

After this exercise:
- [ ] Enable EventBridge rule to alert on `DeleteBucket` CloudTrail events
- [ ] Add S3 Object Lock to `cerebro-terraform-state` (COMPLIANCE mode, 7 day retention)
- [ ] Review IAM policies to ensure no service role has `s3:DeleteBucket` permission
- [ ] Add the bucket inventory table above to the executive DR report
