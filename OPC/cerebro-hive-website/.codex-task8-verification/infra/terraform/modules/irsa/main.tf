# ──────────────────────────────────────────────────────────────────────────────
# CerebroHive — IRSA (IAM Roles for Service Accounts) Module
# Creates a per-service IAM role that a K8s ServiceAccount can assume via OIDC.
# Usage: one instance per service that needs AWS access.
# ──────────────────────────────────────────────────────────────────────────────

data "aws_iam_policy_document" "assume_role" {
  statement {
    effect = "Allow"
    principals {
      type        = "Federated"
      identifiers = [var.oidc_provider_arn]
    }
    actions = ["sts:AssumeRoleWithWebIdentity"]
    condition {
      test     = "StringEquals"
      variable = "${replace(var.oidc_provider_arn, "/^.*oidc-provider\\//", "")}:sub"
      values   = ["system:serviceaccount:${var.namespace}:${var.service_account_name}"]
    }
    condition {
      test     = "StringEquals"
      variable = "${replace(var.oidc_provider_arn, "/^.*oidc-provider\\//", "")}:aud"
      values   = ["sts.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "this" {
  name               = "cerebro-hive-${var.service_name}-irsa-${var.environment}"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json

  tags = merge(var.tags, {
    Service     = var.service_name
    Environment = var.environment
    ManagedBy   = "terraform"
  })
}

# Attach provided inline policy documents
resource "aws_iam_role_policy" "this" {
  for_each = var.inline_policies

  name   = each.key
  role   = aws_iam_role.this.id
  policy = each.value
}

# Attach managed policy ARNs
resource "aws_iam_role_policy_attachment" "managed" {
  for_each = toset(var.managed_policy_arns)

  role       = aws_iam_role.this.name
  policy_arn = each.value
}
