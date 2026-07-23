output "endpoint" { value = aws_db_instance.main.endpoint }
output "address" { value = aws_db_instance.main.address }
output "port" { value = aws_db_instance.main.port }
output "db_name" { value = aws_db_instance.main.db_name }
output "secret_arn" { value = aws_secretsmanager_secret.db.arn }
output "kms_key_arn" { value = aws_kms_key.rds.arn }
