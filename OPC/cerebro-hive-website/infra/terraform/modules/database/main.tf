# ──────────────────────────────────────────────────────────────────────────────
# CerebroHive — RDS PostgreSQL Module (with pgvector)
#
# Creates:
#   - RDS PostgreSQL 16 Multi-AZ instance
#   - DB subnet group (private subnets)
#   - Parameter group with pgvector support
#   - Enhanced monitoring IAM role
#   - Performance Insights enabled
#   - Automated backups to S3 (encrypted)
#   - Secret in AWS Secrets Manager
# ──────────────────────────────────────────────────────────────────────────────

terraform {
  required_providers {
    aws    = { source = "hashicorp/aws", version = "~> 5.0" }
    random = { source = "hashicorp/random", version = "~> 3.0" }
  }
}

locals {
  identifier  = "cerebro-hive-${var.environment}"
  common_tags = merge(var.tags, {
    Environment = var.environment
    ManagedBy   = "terraform"
    Project     = "cerebro-hive"
  })
}

resource "random_password" "db" {
  length           = 32
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

# ── DB Subnet Group ───────────────────────────────────────────────────────────

resource "aws_db_subnet_group" "main" {
  name        = "${local.identifier}-db-subnet-group"
  description = "CerebroHive ${var.environment} DB subnet group"
  subnet_ids  = var.private_subnet_ids

  tags = local.common_tags
}

# ── Parameter Group (pgvector + tuning) ──────────────────────────────────────

resource "aws_db_parameter_group" "main" {
  family = "postgres16"
  name   = "${local.identifier}-pg16-params"

  parameter {
    name  = "shared_preload_libraries"
    value = "pg_stat_statements,pgvector"
  }

  parameter {
    name  = "log_statement"
    value = "ddl"
  }

  parameter {
    name  = "log_min_duration_statement"
    value = "1000"   # Log queries > 1s
  }

  parameter {
    name  = "work_mem"
    value = "65536"  # 64MB — supports vector operations
  }

  parameter {
    name  = "maintenance_work_mem"
    value = "524288" # 512MB — for index builds
  }

  parameter {
    name  = "max_connections"
    value = "200"
  }

  parameter {
    name  = "ssl"
    value = "1"
  }

  tags = local.common_tags
}

# ── KMS Key for RDS encryption ────────────────────────────────────────────────

resource "aws_kms_key" "rds" {
  description             = "RDS encryption — cerebro-hive-${var.environment}"
  deletion_window_in_days = 7
  enable_key_rotation     = true
  tags                    = local.common_tags
}

# ── RDS Instance ──────────────────────────────────────────────────────────────

resource "aws_db_instance" "main" {
  identifier = local.identifier

  # Engine
  engine               = "postgres"
  engine_version       = "16.3"
  instance_class       = var.instance_class
  allocated_storage    = var.allocated_storage
  max_allocated_storage = var.max_allocated_storage
  storage_type         = "gp3"
  storage_encrypted    = true
  kms_key_id           = aws_kms_key.rds.arn

  # Credentials
  db_name  = "cerebrohive_db"
  username = "cerebrohive"
  password = random_password.db.result

  # Network
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [var.rds_sg_id]
  publicly_accessible    = false
  port                   = 5432

  # High Availability
  multi_az               = var.multi_az

  # Backups
  backup_retention_period = var.backup_retention_days
  backup_window           = "03:00-04:00"   # UTC — low traffic window
  maintenance_window      = "Mon:04:00-Mon:05:00"
  deletion_protection     = var.deletion_protection
  skip_final_snapshot     = !var.deletion_protection
  final_snapshot_identifier = var.deletion_protection ? "${local.identifier}-final-snapshot" : null
  copy_tags_to_snapshot   = true

  # Performance
  parameter_group_name     = aws_db_parameter_group.main.name
  performance_insights_enabled          = true
  performance_insights_retention_period = 7
  performance_insights_kms_key_id       = aws_kms_key.rds.arn
  monitoring_interval      = 60
  monitoring_role_arn      = aws_iam_role.rds_monitoring.arn
  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]

  # Auto minor version upgrades
  auto_minor_version_upgrade = true
  apply_immediately          = false

  tags = merge(local.common_tags, {
    Name = "${local.identifier}-postgres"
  })
}

# ── Enhanced Monitoring Role ──────────────────────────────────────────────────

resource "aws_iam_role" "rds_monitoring" {
  name = "${local.identifier}-rds-monitoring-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "monitoring.rds.amazonaws.com" }
    }]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy_attachment" "rds_monitoring" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
  role       = aws_iam_role.rds_monitoring.name
}

# ── Store connection string in Secrets Manager ────────────────────────────────

resource "aws_secretsmanager_secret" "db" {
  name        = "cerebro-hive/${var.environment}/database"
  description = "CerebroHive ${var.environment} PostgreSQL connection string"
  kms_key_id  = aws_kms_key.rds.arn

  recovery_window_in_days = 7

  tags = local.common_tags
}

resource "aws_secretsmanager_secret_version" "db" {
  secret_id = aws_secretsmanager_secret.db.id

  secret_string = jsonencode({
    DATABASE_URL = "postgresql://${aws_db_instance.main.username}:${random_password.db.result}@${aws_db_instance.main.endpoint}/${aws_db_instance.main.db_name}?sslmode=require"
    host         = aws_db_instance.main.address
    port         = aws_db_instance.main.port
    dbname       = aws_db_instance.main.db_name
    username     = aws_db_instance.main.username
    password     = random_password.db.result
  })
}
