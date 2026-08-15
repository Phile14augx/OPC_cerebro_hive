# ──────────────────────────────────────────────────────────────────────────────
# FinOps — AWS Budgets + Cost Anomaly Detection Terraform Module
# ──────────────────────────────────────────────────────────────────────────────

variable "environment" {
  type        = string
  description = "Environment name (production|staging|dev)"
}

variable "monthly_budget_usd" {
  type        = number
  description = "Monthly spend limit in USD"
  default     = 5000
}

variable "alert_email" {
  type        = string
  description = "Email address for budget alerts"
}

variable "slack_webhook_url" {
  type        = string
  description = "Slack webhook URL for budget alerts"
  sensitive   = true
}

variable "aws_account_id" {
  type        = string
  description = "AWS Account ID"
}

# ── Monthly total budget ──────────────────────────────────────────────────────
resource "aws_budgets_budget" "monthly_total" {
  name         = "cerebro-hive-${var.environment}-monthly-total"
  budget_type  = "COST"
  limit_amount = tostring(var.monthly_budget_usd)
  limit_unit   = "USD"
  time_unit    = "MONTHLY"

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 70
    threshold_type             = "PERCENTAGE"
    notification_type          = "FORECASTED"
    subscriber_email_addresses = [var.alert_email]
  }

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 90
    threshold_type             = "PERCENTAGE"
    notification_type          = "ACTUAL"
    subscriber_email_addresses = [var.alert_email]
  }

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 100
    threshold_type             = "PERCENTAGE"
    notification_type          = "ACTUAL"
    subscriber_email_addresses = [var.alert_email]
  }

  cost_filters = {
    TagKeyValue = "user:Environment$${var.environment}"
  }
}

# ── Service-specific budgets ──────────────────────────────────────────────────
resource "aws_budgets_budget" "eks" {
  name         = "cerebro-hive-${var.environment}-eks"
  budget_type  = "COST"
  limit_amount = tostring(ceil(var.monthly_budget_usd * 0.5))
  limit_unit   = "USD"
  time_unit    = "MONTHLY"

  cost_filters = {
    Service     = "Amazon Elastic Kubernetes Service"
    TagKeyValue = "user:Environment$${var.environment}"
  }

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 80
    threshold_type             = "PERCENTAGE"
    notification_type          = "ACTUAL"
    subscriber_email_addresses = [var.alert_email]
  }
}

resource "aws_budgets_budget" "rds" {
  name         = "cerebro-hive-${var.environment}-rds"
  budget_type  = "COST"
  limit_amount = tostring(ceil(var.monthly_budget_usd * 0.2))
  limit_unit   = "USD"
  time_unit    = "MONTHLY"

  cost_filters = {
    Service     = "Amazon Relational Database Service"
    TagKeyValue = "user:Environment$${var.environment}"
  }

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 80
    threshold_type             = "PERCENTAGE"
    notification_type          = "ACTUAL"
    subscriber_email_addresses = [var.alert_email]
  }
}

# ── Cost Anomaly Detection ────────────────────────────────────────────────────
resource "aws_ce_anomaly_monitor" "cerebro_hive" {
  name              = "cerebro-hive-${var.environment}-anomaly-monitor"
  monitor_type      = "DIMENSIONAL"
  monitor_dimension = "SERVICE"
}

resource "aws_ce_anomaly_subscription" "cerebro_hive_alerts" {
  name      = "cerebro-hive-${var.environment}-anomaly-alerts"
  frequency = "IMMEDIATE"

  monitor_arn_list = [aws_ce_anomaly_monitor.cerebro_hive.arn]

  subscriber {
    address = var.alert_email
    type    = "EMAIL"
  }

  # Alert when anomaly exceeds $50 or 20% above expected
  threshold_expression {
    and {
      dimension {
        key           = "ANOMALY_TOTAL_IMPACT_ABSOLUTE"
        values        = ["50"]
        match_options = ["GREATER_THAN_OR_EQUAL"]
      }
    }
    and {
      dimension {
        key           = "ANOMALY_TOTAL_IMPACT_PERCENTAGE"
        values        = ["20"]
        match_options = ["GREATER_THAN_OR_EQUAL"]
      }
    }
  }
}

# ── SNS → Lambda → Slack for real-time budget alerts ─────────────────────────
resource "aws_sns_topic" "budget_alerts" {
  name = "cerebro-hive-${var.environment}-budget-alerts"

  tags = {
    Environment = var.environment
    Project     = "cerebro-hive"
    CostCenter  = "platform"
    Owner       = "platform-team"
  }
}

resource "aws_sns_topic_subscription" "budget_email" {
  topic_arn = aws_sns_topic.budget_alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email
}

# Lambda function for Slack notifications
data "archive_file" "budget_notifier" {
  type        = "zip"
  output_path = "/tmp/budget-notifier.zip"

  source {
    content = <<-PYTHON
import json, urllib.request, os

def handler(event, context):
    webhook = os.environ["SLACK_WEBHOOK_URL"]
    for record in event.get("Records", []):
        msg = json.loads(record["Sns"]["Message"])
        budget_name = msg.get("budgetName", "unknown")
        amount = msg.get("budgetedAmount", "?")
        actual = msg.get("actualSpend", {}).get("amount", "?")
        threshold = msg.get("notificationThreshold", "?")

        payload = {
            "text": f":money_with_wings: *Budget Alert — CerebroHive {os.environ['ENVIRONMENT']}*",
            "attachments": [{
                "color": "#ff4444" if float(threshold) >= 100 else "#ffaa00",
                "fields": [
                    {"title": "Budget", "value": budget_name, "short": True},
                    {"title": "Threshold", "value": f"{threshold}%", "short": True},
                    {"title": "Budgeted", "value": f"$${amount}", "short": True},
                    {"title": "Actual", "value": f"$${actual}", "short": True},
                ]
            }]
        }
        req = urllib.request.Request(
            webhook, json.dumps(payload).encode(), {"Content-Type": "application/json"}
        )
        urllib.request.urlopen(req)
PYTHON
    filename = "handler.py"
  }
}

resource "aws_iam_role" "budget_notifier" {
  name = "cerebro-hive-${var.environment}-budget-notifier"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "budget_notifier_logs" {
  role       = aws_iam_role.budget_notifier.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_lambda_function" "budget_notifier" {
  filename         = data.archive_file.budget_notifier.output_path
  function_name    = "cerebro-hive-${var.environment}-budget-notifier"
  role             = aws_iam_role.budget_notifier.arn
  handler          = "handler.handler"
  runtime          = "python3.12"
  source_code_hash = data.archive_file.budget_notifier.output_base64sha256
  timeout          = 30

  environment {
    variables = {
      SLACK_WEBHOOK_URL = var.slack_webhook_url
      ENVIRONMENT       = var.environment
    }
  }

  tags = {
    Environment = var.environment
    Project     = "cerebro-hive"
    CostCenter  = "platform"
    Owner       = "platform-team"
  }
}

resource "aws_sns_topic_subscription" "budget_lambda" {
  topic_arn = aws_sns_topic.budget_alerts.arn
  protocol  = "lambda"
  endpoint  = aws_lambda_function.budget_notifier.arn
}

resource "aws_lambda_permission" "sns_invoke" {
  statement_id  = "AllowSNSInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.budget_notifier.function_name
  principal     = "sns.amazonaws.com"
  source_arn    = aws_sns_topic.budget_alerts.arn
}

# ── Outputs ───────────────────────────────────────────────────────────────────
output "budget_alert_sns_arn" {
  value = aws_sns_topic.budget_alerts.arn
}

output "anomaly_monitor_arn" {
  value = aws_ce_anomaly_monitor.cerebro_hive.arn
}
