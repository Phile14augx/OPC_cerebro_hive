variable "environment" {
  description = "Environment name (dev, staging, production)"
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "single_nat_gateway" {
  description = "Use a single NAT Gateway (saves cost in dev, not HA)"
  type        = bool
  default     = false
}

variable "tags" {
  description = "Additional resource tags"
  type        = map(string)
  default     = {}
}
