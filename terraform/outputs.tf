output "lambda_arn" {
  description = "ARN da função Lambda para configurar no Endpoint do Alexa Developer Console"
  value       = aws_lambda_function.alexa_skill.arn
}

output "function_name" {
  description = "Nome da função Lambda criada"
  value       = aws_lambda_function.alexa_skill.function_name
}

output "role_arn" {
  description = "ARN da LabRole utilizada"
  value       = data.aws_iam_role.lab_role.arn
}
