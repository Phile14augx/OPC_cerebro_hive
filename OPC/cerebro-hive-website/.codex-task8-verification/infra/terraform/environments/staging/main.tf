# ──────────────────────────────────────────────────────────────────────────────
# CerebroHive — Staging Terraform Root
#
# Mirror of production at reduced scale.
# State: same S3 bucket, separate key.
# Spot instances used throughout for cost savings.
# ──────────────────────────────────────────────────────────────────────────────

terraform {
  required_version = ">= 1.8.0"

  required_providers {
    aws        = { source = "hashicorp/aws", version = "~> 5.0" }
    kubernetes = { source = "hashicorp/kubernetes", version = "~> 2.0" }
    helm       = { source = "hashicorp/helm", version = "~> 2.0" }
  }

  backend "s3" {
    bucket         = "cerebro-hive-terraform-state-prod"
    key            = "staging/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "cerebro-hive-terraform-locks"
    kms_key_id     = "alias/cerebro-hive-terraform-state"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "cerebro-hive"
      Environment = "staging"
      ManagedBy   = "terraform"
      Owner       = "platform-engineering"
    }
  }
}

data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

# ── Networking ────────────────────────────────────────────────────────────────

module "networking" {
  source = "../../modules/networking"

  environment        = "staging"
  vpc_cidr           = var.vpc_cidr
  single_nat_gateway = true   # Single NAT GW to save cost in staging
}

# ── Kubernetes (EKS) ──────────────────────────────────────────────────────────

module "kubernetes" {
  source = "../../modules/kubernetes"

  environment        = "staging"
  kubernetes_version = "1.30"
  vpc_id             = module.networking.vpc_id
  private_subnet_ids = module.networking.private_subnet_ids
  cluster_sg_id      = module.networking.eks_cluster_sg_id

  public_api_endpoint    = true    # Allow direct kubectl access in staging
  general_instance_types = ["m5.xlarge", "m5a.xlarge"]
  general_min_size       = 2
  general_desired_size   = 3
  general_max_size       = 8

  enable_spot_nodes   = true
  spot_instance_types = ["m5.xlarge", "m5a.xlarge", "m5d.xlarge", "m4.xlarge"]
  spot_max_size       = 5
}

# ── Database ──────────────────────────────────────────────────────────────────

module "database" {
  source = "../../modules/database"

  environment        = "staging"
  vpc_id             = module.networking.vpc_id
  private_subnet_ids = module.networking.private_subnet_ids
  db_sg_id           = module.networking.db_sg_id

  # Smaller instance, no Multi-AZ in staging
  instance_class          = "db.t3.medium"
  multi_az                = false
  deletion_protection     = false
  backup_retention_period = 3

  db_name     = "cerebrohive_staging"
  db_username = "cerebrohive"
}

# ── ElastiCache Redis ─────────────────────────────────────────────────────────

resource "aws_elasticache_subnet_group" "staging" {
  name       = "cerebro-hive-staging"
  subnet_ids = module.networking.private_subnet_ids
}

resource "aws_elasticache_replication_group" "staging" {
  replication_group_id = "cerebro-hive-staging"
  description          = "CerebroHive staging Redis"
  engine               = "redis"
  engine_version       = "7.2"
  node_type            = "cache.t3.small"
  num_cache_clusters   = 1    # Single node in staging
  automatic_failover_enabled = false

  subnet_group_name  = aws_elasticache_subnet_group.staging.name
  security_group_ids = [module.networking.redis_sg_id]

  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  auth_token_enabled         = true

  apply_immediately = true

  tags = {
    Name        = "cerebro-hive-staging-redis"
    Environment = "staging"
  }
}

# ── IRSA Roles ────────────────────────────────────────────────────────────────

locals {
  oidc_provider_arn = module.kubernetes.oidc_provider_arn
}

# Platform API: Secrets Manager read + S3 read/write
module "irsa_platform_api" {
  source = "../../modules/irsa"

  service_name         = "platform-api"
  service_account_name = "platform-api"
  namespace            = "cerebro-hive"
  oidc_provider_arn    = local.oidc_provider_arn
  environment          = "staging"

  inline_policies = {
    secrets-manager-read = jsonencode({
      Version = "2012-10-17"
      Statement = [
        {
          Effect   = "Allow"
          Action   = ["secretsmanager:GetSecretValue", "secretsmanager:DescribeSecret"]
          Resource = "arn:aws:secretsmanager:${var.aws_region}:${data.aws_caller_identity.current.account_id}:secret:cerebro-hive/staging/*"
        }
      ]
    })
    s3-assets = jsonencode({
      Version = "2012-10-17"
      Statement = [
        {
          Effect   = "Allow"
          Action   = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject", "s3:ListBucket"]
          Resource = [
            "arn:aws:s3:::cerebro-hive-assets-staging",
            "arn:aws:s3:::cerebro-hive-assets-staging/*"
          ]
        }
      ]
    })
  }
}

# AI Gateway: Secrets Manager (API keys) + Bedrock (optional fallback)
module "irsa_ai_gateway" {
  source = "../../modules/irsa"

  service_name         = "ai-gateway"
  service_account_name = "ai-gateway"
  namespace            = "cerebro-hive"
  oidc_provider_arn    = local.oidc_provider_arn
  environment          = "staging"

  inline_policies = {
    secrets-manager-ai-keys = jsonencode({
      Version = "2012-10-17"
      Statement = [
        {
          Effect   = "Allow"
          Action   = ["secretsmanager:GetSecretValue"]
          Resource = "arn:aws:secretsmanager:${var.aws_region}:${data.aws_caller_identity.current.account_id}:secret:cerebro-hive/staging/ai-providers*"
        }
      ]
    })
    bedrock-inference = jsonencode({
      Version = "2012-10-17"
      Statement = [
        {
          Effect   = "Allow"
          Action   = ["bedrock:InvokeModel", "bedrock:InvokeModelWithResponseStream"]
          Resource = "arn:aws:bedrock:${var.aws_region}::foundation-model/*"
        }
      ]
    })
  }
}

# External Secrets Operator: read all platform secrets
module "irsa_eso" {
  source = "../../modules/irsa"

  service_name         = "external-secrets"
  service_account_name = "external-secrets"
  namespace            = "external-secrets"
  oidc_provider_arn    = local.oidc_provider_arn
  environment          = "staging"

  inline_policies = {
    secrets-manager-list-get = jsonencode({
      Version = "2012-10-17"
      Statement = [
        {
          Effect = "Allow"
          Action = [
            "secretsmanager:GetSecretValue",
            "secretsmanager:DescribeSecret",
            "secretsmanager:ListSecretVersionIds"
          ]
          Resource = "arn:aws:secretsmanager:${var.aws_region}:${data.aws_caller_identity.current.account_id}:secret:cerebro-hive/staging/*"
        }
      ]
    })
  }
}

# ── S3 Buckets ────────────────────────────────────────────────────────────────

resource "aws_s3_bucket" "assets_staging" {
  bucket        = "cerebro-hive-assets-staging"
  force_destroy = true   # OK to destroy in staging

  tags = { Name = "cerebro-hive-assets-staging" }
}

resource "aws_s3_bucket_versioning" "assets_staging" {
  bucket = aws_s3_bucket.assets_staging.id
  versioning_configuration { status = "Enabled" }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "assets_staging" {
  bucket = aws_s3_bucket.assets_staging.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "assets_staging" {
  bucket                  = aws_s3_bucket.assets_staging.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
