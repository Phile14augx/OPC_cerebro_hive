variable "service_name" {
  description = "Name of the service (e.g. platform-api, ai-gateway)"
  type        = string
}

variable "service_account_name" {
  description = "Kubernetes ServiceAccount name in the target namespace"
  type        = string
}

variable "namespace" {
  description = "Kubernetes namespace where the ServiceAccount lives"
  type        = string
  default     = "cerebro-hive"
}

variable "oidc_provider_arn" {
  description = "ARN of the EKS OIDC provider"
  type        = string
}

variable "environment" {
  description = "Deployment environment (dev | staging | production)"
  type        = string
}

variable "inline_policies" {
  description = "Map of inline IAM policy name → JSON document"
  type        = map(string)
  default     = {}
}

variable "managed_policy_arns" {
  description = "List of managed IAM policy ARNs to attach"
  type        = list(string)
  default     = []
}

variable "tags" {
  description = "Additional tags to merge onto the IAM role"
  type        = map(string)
  default     = {}
}
