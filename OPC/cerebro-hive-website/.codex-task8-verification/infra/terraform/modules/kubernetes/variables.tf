variable "environment" {
  description = "Environment name"
  type        = string
}

variable "kubernetes_version" {
  description = "Kubernetes version for EKS"
  type        = string
  default     = "1.30"
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "private_subnet_ids" {
  description = "Private subnet IDs for EKS nodes"
  type        = list(string)
}

variable "cluster_sg_id" {
  description = "EKS cluster security group ID"
  type        = string
}

variable "public_api_endpoint" {
  description = "Enable public EKS API endpoint"
  type        = bool
  default     = false   # Private by default for security
}

variable "public_api_cidrs" {
  description = "CIDRs allowed to access the public API endpoint"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "general_instance_types" {
  description = "EC2 instance types for general node group"
  type        = list(string)
  default     = ["m5.xlarge", "m5a.xlarge"]
}

variable "general_desired_size" {
  type    = number
  default = 2
}

variable "general_min_size" {
  type    = number
  default = 1
}

variable "general_max_size" {
  type    = number
  default = 10
}

variable "enable_spot_nodes" {
  description = "Enable spot node group"
  type        = bool
  default     = false
}

variable "spot_instance_types" {
  type    = list(string)
  default = ["m5.xlarge", "m5a.xlarge", "m4.xlarge", "m5d.xlarge"]
}

variable "spot_max_size" {
  type    = number
  default = 10
}

variable "tags" {
  type    = map(string)
  default = {}
}
