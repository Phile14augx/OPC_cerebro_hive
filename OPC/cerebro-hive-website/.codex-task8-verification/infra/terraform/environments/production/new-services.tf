# ──────────────────────────────────────────────────────────────────────────────
# New Services — Rust Gateway, Java (Platform/Academy/CRM), C++ ML, Next.js Web
# Adds: ECR repos, IRSA roles, Secrets Manager secrets, CloudWatch log groups
# ──────────────────────────────────────────────────────────────────────────────

locals {
  new_services = ["gateway", "platform-svc", "academy-svc", "crm-svc", "ml-svc", "web"]
}

# ── ECR Repositories ──────────────────────────────────────────────────────────

resource "aws_ecr_repository" "new_services" {
  for_each = toset(local.new_services)

  name                 = "cerebro-hive/${each.key}"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "AES256"
  }

  tags = {
    Service     = each.key
    Environment = "production"
  }
}

resource "aws_ecr_lifecycle_policy" "new_services" {
  for_each   = aws_ecr_repository.new_services
  repository = each.value.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 10 production images"
        selection = {
          tagStatus     = "tagged"
          tagPrefixList = ["v", "main-"]
          countType     = "imageCountMoreThan"
          countNumber   = 10
        }
        action = { type = "expire" }
      },
      {
        rulePriority = 2
        description  = "Expire untagged images after 7 days"
        selection = {
          tagStatus   = "untagged"
          countType   = "sinceImagePushed"
          countUnit   = "days"
          countNumber = 7
        }
        action = { type = "expire" }
      }
    ]
  })
}

# ── CloudWatch Log Groups (one per service) ───────────────────────────────────

resource "aws_cloudwatch_log_group" "new_services" {
  for_each = toset(local.new_services)

  name              = "/cerebro-hive/production/${each.key}"
  retention_in_days = 30

  tags = {
    Service     = each.key
    Environment = "production"
  }
}

# ── Secrets Manager — per-service secrets ─────────────────────────────────────

# Shared database secret (references existing RDS module output)
resource "aws_secretsmanager_secret" "services_db" {
  name                    = "cerebro-hive/production/services/database"
  description             = "Database connection string for new backend services"
  recovery_window_in_days = 7
}

resource "aws_secretsmanager_secret_version" "services_db" {
  secret_id = aws_secretsmanager_secret.services_db.id
  secret_string = jsonencode({
    DATABASE_URL       = "postgresql://${module.database.username}:${module.database.password}@${module.database.endpoint}/${module.database.db_name}"
    JDBC_DATABASE_URL  = "jdbc:postgresql://${module.database.endpoint}/${module.database.db_name}"
    POSTGRES_HOST      = module.database.endpoint
    POSTGRES_DB        = module.database.db_name
    POSTGRES_USER      = module.database.username
    POSTGRES_PASSWORD  = module.database.password
  })
}

# Keycloak config secret
resource "aws_secretsmanager_secret" "keycloak_config" {
  name                    = "cerebro-hive/production/services/keycloak"
  description             = "Keycloak OIDC configuration for new services"
  recovery_window_in_days = 7
}

resource "aws_secretsmanager_secret_version" "keycloak_config" {
  secret_id = aws_secretsmanager_secret.keycloak_config.id
  secret_string = jsonencode({
    KEYCLOAK_URL    = var.keycloak_url
    KEYCLOAK_REALM  = var.keycloak_realm
  })
}

# ── IRSA Roles for new services ───────────────────────────────────────────────

# Common Secrets Manager policy for all services
locals {
  secrets_manager_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = ["secretsmanager:GetSecretValue", "secretsmanager:DescribeSecret"]
        Resource = [
          "arn:aws:secretsmanager:${var.aws_region}:${data.aws_caller_identity.current.account_id}:secret:cerebro-hive/production/*"
        ]
      },
      {
        Effect   = "Allow"
        Action   = ["logs:CreateLogStream", "logs:PutLogEvents", "logs:DescribeLogStreams"]
        Resource = "arn:aws:logs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:log-group:/cerebro-hive/production/*"
      }
    ]
  })
}

module "irsa_gateway" {
  source = "../../modules/irsa"

  service_name         = "gateway"
  service_account_name = "gateway"
  namespace            = "cerebro-hive"
  oidc_provider_arn    = module.kubernetes.oidc_provider_arn
  environment          = "production"

  inline_policies = {
    secrets-and-logs = local.secrets_manager_policy
  }
}

module "irsa_platform_svc" {
  source = "../../modules/irsa"

  service_name         = "platform-svc"
  service_account_name = "platform-svc"
  namespace            = "cerebro-hive"
  oidc_provider_arn    = module.kubernetes.oidc_provider_arn
  environment          = "production"

  inline_policies = {
    secrets-and-logs = local.secrets_manager_policy
    nats-publish = jsonencode({
      Version = "2012-10-17"
      Statement = [
        {
          Effect   = "Allow"
          Action   = ["sqs:SendMessage"]  # NATS bridge via SQS for cloud events
          Resource = "arn:aws:sqs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:cerebro-hive-*"
        }
      ]
    })
  }
}

module "irsa_academy_svc" {
  source = "../../modules/irsa"

  service_name         = "academy-svc"
  service_account_name = "academy-svc"
  namespace            = "cerebro-hive"
  oidc_provider_arn    = module.kubernetes.oidc_provider_arn
  environment          = "production"

  inline_policies = {
    secrets-and-logs = local.secrets_manager_policy
    ses-send-email = jsonencode({
      Version = "2012-10-17"
      Statement = [
        {
          Effect   = "Allow"
          Action   = ["ses:SendEmail", "ses:SendTemplatedEmail", "ses:SendRawEmail"]
          Resource = "*"
          Condition = {
            StringEquals = {
              "ses:FromAddress" = "academy@cerebrohive.com"
            }
          }
        }
      ]
    })
  }
}

module "irsa_crm_svc" {
  source = "../../modules/irsa"

  service_name         = "crm-svc"
  service_account_name = "crm-svc"
  namespace            = "cerebro-hive"
  oidc_provider_arn    = module.kubernetes.oidc_provider_arn
  environment          = "production"

  inline_policies = {
    secrets-and-logs = local.secrets_manager_policy
    ses-send-email = jsonencode({
      Version = "2012-10-17"
      Statement = [
        {
          Effect   = "Allow"
          Action   = ["ses:SendEmail", "ses:SendTemplatedEmail", "ses:SendRawEmail"]
          Resource = "*"
          Condition = {
            StringEquals = {
              "ses:FromAddress" = "crm@cerebrohive.com"
            }
          }
        }
      ]
    })
  }
}

module "irsa_ml_svc" {
  source = "../../modules/irsa"

  service_name         = "ml-svc"
  service_account_name = "ml-svc"
  namespace            = "cerebro-hive"
  oidc_provider_arn    = module.kubernetes.oidc_provider_arn
  environment          = "production"

  inline_policies = {
    secrets-and-logs = local.secrets_manager_policy
    # ml-svc can call SageMaker for hosted model inference (future upgrade path)
    sagemaker-runtime = jsonencode({
      Version = "2012-10-17"
      Statement = [
        {
          Effect   = "Allow"
          Action   = ["sagemaker:InvokeEndpoint", "sagemaker:InvokeEndpointAsync"]
          Resource = "arn:aws:sagemaker:${var.aws_region}:${data.aws_caller_identity.current.account_id}:endpoint/cerebro-hive-*"
        }
      ]
    })
  }
}

module "irsa_web" {
  source = "../../modules/irsa"

  service_name         = "web"
  service_account_name = "web"
  namespace            = "cerebro-hive"
  oidc_provider_arn    = module.kubernetes.oidc_provider_arn
  environment          = "production"

  inline_policies = {
    secrets-and-logs = local.secrets_manager_policy
  }
}

# ── Route53 — marketing site subdomain ───────────────────────────────────────

data "aws_route53_zone" "main" {
  name = "cerebrohive.com."
}

# Add A-record alias for www → ALB (assuming ALB is created by EKS ingress controller)
data "aws_lb" "ingress" {
  tags = {
    "kubernetes.io/cluster/${module.kubernetes.cluster_name}" = "owned"
    "kubernetes.io/service-name"                              = "ingress-nginx/ingress-nginx-controller"
  }
}

resource "aws_route53_record" "www" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "www.cerebrohive.com"
  type    = "A"

  alias {
    name                   = data.aws_lb.ingress.dns_name
    zone_id                = data.aws_lb.ingress.zone_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "apex" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "cerebrohive.com"
  type    = "A"

  alias {
    name                   = data.aws_lb.ingress.dns_name
    zone_id                = data.aws_lb.ingress.zone_id
    evaluate_target_health = true
  }
}

# ── Variables (add to variables.tf) ──────────────────────────────────────────

variable "keycloak_url" {
  description = "External Keycloak URL"
  type        = string
  default     = "https://auth.cerebrohive.com"
}

variable "keycloak_realm" {
  description = "Keycloak realm name"
  type        = string
  default     = "cerebro"
}

# ── Outputs ───────────────────────────────────────────────────────────────────

output "ecr_registry" {
  value = "${data.aws_caller_identity.current.account_id}.dkr.ecr.${var.aws_region}.amazonaws.com"
}

output "ecr_repos" {
  value = {
    for k, v in aws_ecr_repository.new_services : k => v.repository_url
  }
}

output "services_db_secret_arn" {
  value     = aws_secretsmanager_secret.services_db.arn
  sensitive = true
}
