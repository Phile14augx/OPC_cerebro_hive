# ──────────────────────────────────────────────────────────────────────────────
# CerebroHive — Production Terraform Root
#
# State: S3 backend with DynamoDB locking
# Region: us-east-1
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
    key            = "production/terraform.tfstate"
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
      Environment = "production"
      ManagedBy   = "terraform"
      Owner       = "platform-engineering"
    }
  }
}

# ── Data sources ──────────────────────────────────────────────────────────────

data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

# ── Networking ────────────────────────────────────────────────────────────────

module "networking" {
  source = "../../modules/networking"

  environment        = "production"
  vpc_cidr           = var.vpc_cidr
  single_nat_gateway = false   # 3 NAT Gateways for HA in production

  tags = {
    CostCenter  = "platform"
    Criticality = "high"
  }
}

# ── Kubernetes (EKS) ──────────────────────────────────────────────────────────

module "kubernetes" {
  source = "../../modules/kubernetes"

  environment        = "production"
  kubernetes_version = "1.30"
  vpc_id             = module.networking.vpc_id
  private_subnet_ids = module.networking.private_subnet_ids
  cluster_sg_id      = module.networking.eks_cluster_sg_id

  public_api_endpoint    = false
  general_instance_types = ["m5.2xlarge", "m5a.2xlarge"]
  general_min_size       = 3
  general_desired_size   = 5
  general_max_size       = 20

  # Spot nodes for AI Gateway burst (tolerated with taints)
  enable_spot_nodes   = true
  spot_instance_types = ["m5.2xlarge", "m5a.2xlarge", "m5d.2xlarge", "m4.2xlarge"]
  spot_max_size       = 10

  tags = {
    CostCenter  = "platform"
    Criticality = "high"
  }
}

# ── Database (RDS PostgreSQL 16 + pgvector) ───────────────────────────────────

module "database" {
  source = "../../modules/database"

  environment        = "production"
  private_subnet_ids = module.networking.private_subnet_ids
  rds_sg_id          = module.networking.rds_sg_id

  instance_class        = "db.r6g.xlarge"    # Memory-optimized for pgvector
  allocated_storage     = 100
  max_allocated_storage = 1000
  multi_az              = true               # HA for production
  backup_retention_days = 30
  deletion_protection   = true

  tags = {
    CostCenter  = "platform"
    Criticality = "critical"
    DataClass   = "confidential"
  }
}

# ── ElastiCache Redis ─────────────────────────────────────────────────────────

resource "aws_elasticache_replication_group" "redis" {
  replication_group_id = "cerebro-hive-prod"
  description          = "CerebroHive production Redis cluster"

  node_type            = var.redis_node_type
  num_cache_clusters   = 3    # Multi-AZ with replica
  engine_version       = "7.2"
  port                 = 6379

  subnet_group_name    = aws_elasticache_subnet_group.main.name
  security_group_ids   = [module.networking.elasticache_sg_id]

  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  auth_token                 = random_password.redis.result
  auth_token_update_strategy = "ROTATE"

  automatic_failover_enabled = true
  multi_az_enabled           = true
  auto_minor_version_upgrade = true

  snapshot_retention_limit   = 7
  snapshot_window            = "05:00-06:00"
  maintenance_window         = "sun:06:00-sun:07:00"

  log_delivery_configuration {
    destination      = aws_cloudwatch_log_group.redis.name
    destination_type = "cloudwatch-logs"
    log_format       = "json"
    log_type         = "slow-log"
  }

  tags = {
    Name        = "cerebro-hive-prod-redis"
    Environment = "production"
    ManagedBy   = "terraform"
  }
}

resource "random_password" "redis" {
  length  = 32
  special = false   # Redis auth token doesn't allow some special chars
}

resource "aws_elasticache_subnet_group" "main" {
  name       = "cerebro-hive-prod-redis-subnet-group"
  subnet_ids = module.networking.private_subnet_ids
}

resource "aws_cloudwatch_log_group" "redis" {
  name              = "/aws/elasticache/cerebro-hive-prod"
  retention_in_days = 14
}

# Store Redis auth in Secrets Manager
resource "aws_secretsmanager_secret_version" "redis" {
  secret_id = aws_secretsmanager_secret.redis.id
  secret_string = jsonencode({
    REDIS_URL      = "rediss://:${random_password.redis.result}@${aws_elasticache_replication_group.redis.primary_endpoint_address}:6379"
    REDIS_PASSWORD = random_password.redis.result
    REDIS_HOST     = aws_elasticache_replication_group.redis.primary_endpoint_address
    REDIS_PORT     = 6379
  })
}

resource "aws_secretsmanager_secret" "redis" {
  name                    = "cerebro-hive/production/redis"
  description             = "Redis connection for production"
  recovery_window_in_days = 7
}

# ── S3 Buckets ────────────────────────────────────────────────────────────────

resource "aws_s3_bucket" "documents" {
  bucket        = "cerebro-hive-documents-prod-${data.aws_caller_identity.current.account_id}"
  force_destroy = false

  tags = {
    Name        = "cerebro-hive-documents-prod"
    Environment = "production"
    DataClass   = "confidential"
  }
}

resource "aws_s3_bucket_versioning" "documents" {
  bucket = aws_s3_bucket.documents.id
  versioning_configuration { status = "Enabled" }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "documents" {
  bucket = aws_s3_bucket.documents.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "aws:kms"
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_public_access_block" "documents" {
  bucket                  = aws_s3_bucket.documents.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "documents" {
  bucket = aws_s3_bucket.documents.id

  rule {
    id     = "intelligent-tiering"
    status = "Enabled"
    transition {
      days          = 30
      storage_class = "INTELLIGENT_TIERING"
    }
    noncurrent_version_expiration { noncurrent_days = 90 }
  }
}

# AI outputs bucket (model responses, generated content)
resource "aws_s3_bucket" "ai_outputs" {
  bucket        = "cerebro-hive-ai-outputs-prod-${data.aws_caller_identity.current.account_id}"
  force_destroy = false
  tags = {
    Name        = "cerebro-hive-ai-outputs-prod"
    Environment = "production"
  }
}

resource "aws_s3_bucket_versioning" "ai_outputs" {
  bucket = aws_s3_bucket.ai_outputs.id
  versioning_configuration { status = "Enabled" }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "ai_outputs" {
  bucket = aws_s3_bucket.ai_outputs.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "aws:kms"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "ai_outputs" {
  bucket                  = aws_s3_bucket.ai_outputs.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# ── Outputs ───────────────────────────────────────────────────────────────────

output "cluster_name" {
  value = module.kubernetes.cluster_name
}

output "cluster_endpoint" {
  value     = module.kubernetes.cluster_endpoint
  sensitive = true
}

output "rds_endpoint" {
  value     = module.database.endpoint
  sensitive = true
}

output "redis_endpoint" {
  value     = aws_elasticache_replication_group.redis.primary_endpoint_address
  sensitive = true
}

output "db_secret_arn" {
  value = module.database.secret_arn
}

output "documents_bucket" {
  value = aws_s3_bucket.documents.id
}
