# ──────────────────────────────────────────────────────────────────────────────
# PolicyOps — OPA/Conftest: Terraform Plan Gates
# Run: conftest test <terraform-plan.json> --policy infra/policy/opa/terraform.rego
# ──────────────────────────────────────────────────────────────────────────────
package terraform

import future.keywords.contains
import future.keywords.if
import future.keywords.in

# ── Deny: S3 buckets must not be publicly accessible ─────────────────────────
deny contains msg if {
  resource := input.resource_changes[_]
  resource.type == "aws_s3_bucket"
  resource.change.after.acl in ["public-read", "public-read-write", "authenticated-read"]
  msg := sprintf(
    "POLICY: S3 bucket '%s' must not have a public ACL (got: %s)",
    [resource.address, resource.change.after.acl],
  )
}

deny contains msg if {
  resource := input.resource_changes[_]
  resource.type == "aws_s3_bucket_public_access_block"
  not resource.change.after.block_public_acls == true
  msg := sprintf(
    "POLICY: S3 bucket public access block '%s' must set block_public_acls=true",
    [resource.address],
  )
}

# ── Deny: RDS instances must have encryption enabled ─────────────────────────
deny contains msg if {
  resource := input.resource_changes[_]
  resource.type == "aws_db_instance"
  not resource.change.after.storage_encrypted == true
  msg := sprintf(
    "POLICY: RDS instance '%s' must have storage_encrypted=true",
    [resource.address],
  )
}

# ── Deny: RDS must not be publicly accessible ─────────────────────────────────
deny contains msg if {
  resource := input.resource_changes[_]
  resource.type == "aws_db_instance"
  resource.change.after.publicly_accessible == true
  msg := sprintf(
    "POLICY: RDS instance '%s' must not be publicly accessible",
    [resource.address],
  )
}

# ── Deny: EKS clusters must have envelope encryption configured ───────────────
deny contains msg if {
  resource := input.resource_changes[_]
  resource.type == "aws_eks_cluster"
  count(resource.change.after.encryption_config) == 0
  msg := sprintf(
    "POLICY: EKS cluster '%s' must have envelope encryption configured",
    [resource.address],
  )
}

# ── Deny: Security groups must not allow 0.0.0.0/0 on port 22 or 3389 ────────
deny contains msg if {
  resource := input.resource_changes[_]
  resource.type == "aws_security_group"
  rule := resource.change.after.ingress[_]
  rule.cidr_blocks[_] in ["0.0.0.0/0", "::/0"]
  rule.from_port <= 22
  rule.to_port >= 22
  msg := sprintf(
    "POLICY: Security group '%s' allows SSH (port 22) from the public internet",
    [resource.address],
  )
}

deny contains msg if {
  resource := input.resource_changes[_]
  resource.type == "aws_security_group"
  rule := resource.change.after.ingress[_]
  rule.cidr_blocks[_] in ["0.0.0.0/0", "::/0"]
  rule.from_port <= 3389
  rule.to_port >= 3389
  msg := sprintf(
    "POLICY: Security group '%s' allows RDP (port 3389) from the public internet",
    [resource.address],
  )
}

# ── Deny: All taggable resources must have required tags ─────────────────────
required_tags := {"Environment", "Owner", "CostCenter", "Project"}

taggable_resource_types := {
  "aws_instance",
  "aws_db_instance",
  "aws_elasticache_cluster",
  "aws_eks_cluster",
  "aws_s3_bucket",
  "aws_security_group",
  "aws_vpc",
  "aws_subnet",
}

deny contains msg if {
  resource := input.resource_changes[_]
  resource.type in taggable_resource_types
  resource.change.action in [["create"], ["update"]]
  tags := object.get(resource.change.after, "tags", {})
  missing := required_tags - {k | tags[k]}
  count(missing) > 0
  msg := sprintf(
    "POLICY: Resource '%s' (%s) is missing required tags: %v",
    [resource.address, resource.type, missing],
  )
}

# ── Deny: ElastiCache must have encryption in transit ────────────────────────
deny contains msg if {
  resource := input.resource_changes[_]
  resource.type == "aws_elasticache_replication_group"
  not resource.change.after.transit_encryption_enabled == true
  msg := sprintf(
    "POLICY: ElastiCache replication group '%s' must enable transit encryption",
    [resource.address],
  )
}

# ── Deny: IAM roles must not have wildcard actions in inline policies ─────────
deny contains msg if {
  resource := input.resource_changes[_]
  resource.type == "aws_iam_role_policy"
  doc := json.unmarshal(resource.change.after.policy)
  statement := doc.Statement[_]
  statement.Effect == "Allow"
  action := statement.Action
  is_string(action)
  action == "*"
  msg := sprintf(
    "POLICY: IAM role policy '%s' uses wildcard Action '*' — use least-privilege",
    [resource.address],
  )
}

# ── Warn: Non-production environments should use smaller instance classes ──────
warn contains msg if {
  resource := input.resource_changes[_]
  resource.type == "aws_db_instance"
  resource.change.after.instance_class in ["db.r6g.4xlarge", "db.r6g.8xlarge", "db.r6g.16xlarge"]
  tags := object.get(resource.change.after, "tags", {})
  tags["Environment"] in ["staging", "dev", "development"]
  msg := sprintf(
    "WARN: RDS instance '%s' uses a large instance class (%s) in non-production environment",
    [resource.address, resource.change.after.instance_class],
  )
}
