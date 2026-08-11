# ──────────────────────────────────────────────────────────────────────────────
# CloudOps — AWS Resource Tagging Policy + Cost Optimization
# Enforces tagging compliance and implements cost-saving configurations.
# ──────────────────────────────────────────────────────────────────────────────

# ── Tag policy (Service Control Policy via AWS Organizations) ─────────────────
resource "aws_organizations_policy" "required_tags" {
  name        = "cerebro-hive-required-tags"
  description = "Enforce required tags on all CerebroHive AWS resources"
  type        = "TAG_POLICY"

  content = jsonencode({
    tags = {
      Environment = {
        tag_key = {
          "@@assign" = "Environment"
        }
        tag_value = {
          "@@assign" = ["production", "staging", "dev", "sandbox"]
        }
        enforced_for = {
          "@@assign" = [
            "ec2:instance",
            "rds:db",
            "elasticache:cluster",
            "eks:cluster",
            "s3:bucket",
          ]
        }
      }
      Project = {
        tag_key = {
          "@@assign" = "Project"
        }
        enforced_for = {
          "@@assign" = ["ec2:instance", "rds:db", "s3:bucket"]
        }
      }
      CostCenter = {
        tag_key = {
          "@@assign" = "CostCenter"
        }
        enforced_for = {
          "@@assign" = ["ec2:instance", "rds:db", "eks:cluster"]
        }
      }
      Owner = {
        tag_key = {
          "@@assign" = "Owner"
        }
        enforced_for = {
          "@@assign" = ["ec2:instance", "rds:db"]
        }
      }
    }
  })
}

# ── Default tags applied to all Terraform-managed resources ───────────────────
locals {
  common_tags = {
    Project     = "cerebro-hive"
    ManagedBy   = "terraform"
    Repository  = "cerebrohive/cerebro-hive"
  }
}

# ── Cost optimization: S3 Intelligent-Tiering ─────────────────────────────────
resource "aws_s3_bucket_intelligent_tiering_configuration" "mlflow_artifacts" {
  bucket = "cerebro-hive-mlflow-artifacts"
  name   = "EntireBucket"

  tiering {
    access_tier = "DEEP_ARCHIVE_ACCESS"
    days        = 180
  }

  tiering {
    access_tier = "ARCHIVE_ACCESS"
    days        = 90
  }
}

# ── Cost optimization: EKS Fargate Spot for non-critical workloads ─────────────
resource "aws_eks_fargate_profile" "spot_workloads" {
  cluster_name           = var.cluster_name
  fargate_profile_name   = "cerebro-hive-spot"
  pod_execution_role_arn = aws_iam_role.fargate_execution.arn
  subnet_ids             = var.private_subnet_ids

  selector {
    namespace = "cerebro-hive-dev"
    labels = {
      "scheduling.k8s.io/spot" = "true"
    }
  }

  selector {
    namespace = "mlops"
    labels = {
      "scheduling.k8s.io/spot" = "true"
    }
  }

  tags = merge(local.common_tags, {
    Environment = var.environment
    CostCenter  = "platform"
  })
}

# ── Cost optimization: Compute Savings Plan ────────────────────────────────────
# NOTE: Managed in the console — documented here for tracking.
# resource "aws_savingsplans_savings_plan" "compute" { ... }
# Recommendation: 1-year compute savings plan covering ~60% of EKS node usage.
# Estimated savings: ~35% vs on-demand.

# ── Cost optimization: RDS Reserved Instance recommendation ───────────────────
# NOTE: RDS Reserved Instances are purchased via console/CLI.
# Document here for audit trail:
locals {
  rds_reserved_instance_recommendation = {
    instance_class     = "db.r6g.large"
    multi_az           = true
    term               = "1-year"
    payment_option     = "partial-upfront"
    estimated_savings  = "42%"
    annual_cost_usd    = 1200
    break_even_months  = 7
  }
}

# ── Cost optimization: ElastiCache Reserved Nodes ─────────────────────────────
resource "aws_elasticache_reserved_cache_node" "redis" {
  count                   = var.environment == "production" ? 1 : 0
  reserved_cache_node_id  = "cerebro-hive-redis-reserved"
  offering_id             = "28c5d60b-3945-41d4-93c8-b51a17c1b99c"  # cache.r6g.large 1yr partial
}

# ── CloudWatch cost anomaly monitor ───────────────────────────────────────────
resource "aws_ce_anomaly_monitor" "eks_costs" {
  name         = "cerebro-hive-eks-cost-anomaly"
  monitor_type = "DIMENSIONAL"
  monitor_dimension = "SERVICE"
}

# ── Auto-shutdown non-production environments (Lambda) ────────────────────────
data "archive_file" "env_scheduler" {
  type        = "zip"
  output_path = "/tmp/env-scheduler.zip"

  source {
    content  = <<-PYTHON
import boto3, os, json

def handler(event, context):
    action = event.get("action", "stop")  # "stop" or "start"
    env    = os.environ["ENVIRONMENT"]

    # Scale down EKS node group to 0 for cost savings
    eks = boto3.client("eks")
    asg = boto3.client("autoscaling")

    cluster     = f"cerebro-hive-{env}"
    nodegroup   = f"{cluster}-workers"
    min_size    = 0 if action == "stop" else 2

    try:
        eks.update_nodegroup_config(
            clusterName=cluster,
            nodegroupName=nodegroup,
            scalingConfig={"minSize": min_size, "desiredSize": min_size, "maxSize": 10}
        )
        print(f"Set {nodegroup} minSize/desiredSize to {min_size}")
    except Exception as e:
        print(f"Error: {e}")
        raise
PYTHON
    filename = "handler.py"
  }
}

resource "aws_iam_role" "env_scheduler" {
  name = "cerebro-hive-env-scheduler"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy" "env_scheduler_eks" {
  name = "eks-scale"
  role = aws_iam_role.env_scheduler.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "eks:UpdateNodegroupConfig",
        "autoscaling:SetDesiredCapacity",
        "autoscaling:UpdateAutoScalingGroup",
      ]
      Resource = "*"
      Condition = {
        StringEquals = {
          "aws:ResourceTag/Project" = "cerebro-hive"
        }
      }
    }]
  })
}

resource "aws_lambda_function" "env_scheduler" {
  count            = var.environment == "staging" ? 1 : 0
  filename         = data.archive_file.env_scheduler.output_path
  function_name    = "cerebro-hive-${var.environment}-scheduler"
  role             = aws_iam_role.env_scheduler.arn
  handler          = "handler.handler"
  runtime          = "python3.12"
  source_code_hash = data.archive_file.env_scheduler.output_base64sha256
  timeout          = 60

  environment {
    variables = {
      ENVIRONMENT = var.environment
    }
  }

  tags = merge(local.common_tags, {
    Environment = var.environment
    CostCenter  = "platform"
  })
}

# Stop staging at 8 PM UTC
resource "aws_cloudwatch_event_rule" "stop_staging" {
  count               = var.environment == "staging" ? 1 : 0
  name                = "cerebro-hive-staging-stop"
  description         = "Stop staging environment at 8 PM UTC to save costs"
  schedule_expression = "cron(0 20 * * ? *)"
}

resource "aws_cloudwatch_event_target" "stop_staging" {
  count     = var.environment == "staging" ? 1 : 0
  rule      = aws_cloudwatch_event_rule.stop_staging[0].name
  target_id = "StopStaging"
  arn       = aws_lambda_function.env_scheduler[0].arn
  input     = jsonencode({ action = "stop" })
}

# Start staging at 7 AM UTC
resource "aws_cloudwatch_event_rule" "start_staging" {
  count               = var.environment == "staging" ? 1 : 0
  name                = "cerebro-hive-staging-start"
  description         = "Start staging environment at 7 AM UTC"
  schedule_expression = "cron(0 7 * * ? *)"
}

resource "aws_cloudwatch_event_target" "start_staging" {
  count     = var.environment == "staging" ? 1 : 0
  rule      = aws_cloudwatch_event_rule.start_staging[0].name
  target_id = "StartStaging"
  arn       = aws_lambda_function.env_scheduler[0].arn
  input     = jsonencode({ action = "start" })
}
