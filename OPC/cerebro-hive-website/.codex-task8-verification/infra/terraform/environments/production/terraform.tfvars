# Production Terraform variables
# Sensitive values (secrets) are NOT stored here — they come from AWS Secrets Manager

aws_region      = "us-east-1"
vpc_cidr        = "10.0.0.0/16"
redis_node_type = "cache.r6g.large"
