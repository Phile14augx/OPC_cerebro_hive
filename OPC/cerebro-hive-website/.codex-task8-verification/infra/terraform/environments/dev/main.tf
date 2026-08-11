# ──────────────────────────────────────────────────────────────────────────────
# CerebroHive — Dev Terraform Root
# Lighter than production: single NAT GW, smaller instances, no Multi-AZ
# ──────────────────────────────────────────────────────────────────────────────

terraform {
  required_version = ">= 1.8.0"

  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
  }

  backend "s3" {
    bucket         = "cerebro-hive-terraform-state-dev"
    key            = "dev/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "cerebro-hive-terraform-locks-dev"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "cerebro-hive"
      Environment = "dev"
      ManagedBy   = "terraform"
    }
  }
}

module "networking" {
  source = "../../modules/networking"

  environment        = "dev"
  vpc_cidr           = var.vpc_cidr
  single_nat_gateway = true   # Single NAT GW — save cost in dev
}

module "kubernetes" {
  source = "../../modules/kubernetes"

  environment        = "dev"
  kubernetes_version = "1.30"
  vpc_id             = module.networking.vpc_id
  private_subnet_ids = module.networking.private_subnet_ids
  cluster_sg_id      = module.networking.eks_cluster_sg_id

  public_api_endpoint    = true   # Dev: allow public API access
  public_api_cidrs       = ["0.0.0.0/0"]
  general_instance_types = ["t3.medium", "t3a.medium"]
  general_min_size       = 1
  general_desired_size   = 2
  general_max_size       = 5
  enable_spot_nodes      = false
}

module "database" {
  source = "../../modules/database"

  environment        = "dev"
  private_subnet_ids = module.networking.private_subnet_ids
  rds_sg_id          = module.networking.rds_sg_id

  instance_class        = "db.t3.small"
  allocated_storage     = 20
  max_allocated_storage = 50
  multi_az              = false
  backup_retention_days = 3
  deletion_protection   = false
}

output "cluster_name" { value = module.kubernetes.cluster_name }
output "cluster_endpoint" { value = module.kubernetes.cluster_endpoint; sensitive = true }
output "rds_endpoint" { value = module.database.endpoint; sensitive = true }
