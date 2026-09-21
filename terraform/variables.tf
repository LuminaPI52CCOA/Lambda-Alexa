variable "aws_region" {
  description = "Região da AWS para deploy da Lambda (padrão us-east-1 do AWS Academy)"
  type        = string
  default     = "us-east-1"
}

variable "function_name" {
  description = "Nome da função Lambda da Skill Alexa"
  type        = string
  default     = "lumina-alexa-skill"
}

variable "backend_url" {
  description = "URL base do Backend Spring Boot na EC2 (ex: http://SEU_IP_EC2:8080)"
  type        = string
  default     = "http://localhost:8080"
}

variable "service_email" {
  description = "E-mail de serviço para login técnico da Lambda no backend"
  type        = string
  default     = "john@doe.com"
}

variable "service_password" {
  description = "Senha de serviço para login técnico da Lambda no backend"
  type        = string
  default     = "123456"
  sensitive   = true
}

variable "alexa_skill_id" {
  description = "Skill ID gerado no Alexa Developer Console (ex: amzn1.ask.skill.xxxx). Deixe vazio para autorizar qualquer skill da sua conta."
  type        = string
  default     = ""
}

variable "log_retention_days" {
  description = "Dias de retenção dos logs no CloudWatch"
  type        = number
  default     = 14
}
