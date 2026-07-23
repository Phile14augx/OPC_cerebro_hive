variable "environment" { type = string }
variable "private_subnet_ids" { type = list(string) }
variable "rds_sg_id" { type = string }
variable "instance_class" { type = string; default = "db.t3.medium" }
variable "allocated_storage" { type = number; default = 20 }
variable "max_allocated_storage" { type = number; default = 100 }
variable "multi_az" { type = bool; default = false }
variable "backup_retention_days" { type = number; default = 7 }
variable "deletion_protection" { type = bool; default = false }
variable "tags" { type = map(string); default = {} }
