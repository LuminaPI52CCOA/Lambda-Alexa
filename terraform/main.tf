terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.4"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# ==============================================================================
# IAM Role (AWS Academy Learner Lab)
# O ambiente de estudante restringe a criação de novas roles IAM.
# Utilizamos diretamente a role pré-existente "LabRole".
# ==============================================================================
data "aws_iam_role" "lab_role" {
  name = "LabRole"
}

# ==============================================================================
# Empacotamento do Código da Lambda
# ==============================================================================
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = "${path.module}/.."
  output_path = "${path.module}/dist/lambda.zip"
  excludes = [
    ".git",
    ".gitignore",
    "terraform",
    "dist",
    "tests"
  ]
}

# ==============================================================================
# CloudWatch Log Group
# ==============================================================================
resource "aws_cloudwatch_log_group" "lambda_logs" {
  name              = "/aws/lambda/${var.function_name}"
  retention_in_days = var.log_retention_days
}

# ==============================================================================
# AWS Lambda Function
# ==============================================================================
resource "aws_lambda_function" "alexa_skill" {
  function_name    = var.function_name
  role             = data.aws_iam_role.lab_role.arn
  handler          = "src/index.handler"
  runtime          = "nodejs20.x"
  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256

  timeout     = 8
  memory_size = 256

  environment {
    variables = {
      BACKEND_URL      = var.backend_url
      SERVICE_EMAIL    = var.service_email
      SERVICE_PASSWORD = var.service_password
    }
  }

  depends_on = [
    aws_cloudwatch_log_group.lambda_logs
  ]

  tags = {
    Projeto   = "Lumina Odontológica"
    Component = "Alexa Skill Lambda"
  }
}

# ==============================================================================
# Permissão de Invocação pelo Alexa Skills Kit (Trigger)
# ==============================================================================
resource "aws_lambda_permission" "alexa_trigger" {
  statement_id       = "AllowExecutionFromAlexaSkillsKit"
  action             = "lambda:InvokeFunction"
  function_name      = aws_lambda_function.alexa_skill.function_name
  principal          = "alexa-appkit.amazon.com"
  event_source_token = var.alexa_skill_id != "" ? var.alexa_skill_id : null
}
