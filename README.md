# Lumina Odontológica — AWS Lambda & Alexa Skill

Este repositório contém o código-fonte da **AWS Lambda (Node.js 20.x com ASK SDK v2)**, o **Modelo de Interação em Português (`pt-BR.json`)** e os manifestos do **Terraform** (compatíveis com a `LabRole` do AWS Academy) para a integração de voz do sistema **Lumina Odontológica**.

---

## 1. Arquitetura da Solução

```
[Dentista] ➔ [Echo Device] ➔ [Alexa Service] ➔ [AWS Lambda (Node.js)]
                                                    │ (HTTP + Cookie HttpOnly + X-Alexa-User-Id)
                                                    ▼
                                            [EC2: Spring Boot API] ➔ [MySQL]
```

### Funcionalidades:
1. **PULL (Consultas por Voz):**
   - *"Qual a minha próxima consulta?"* (`ProximaConsultaIntent`)
   - *"Quantas consultas eu tenho hoje?"* (`ConsultasHojeIntent`)
   - *"O próximo paciente tem alguma alergia?"* (`AlertaAnamneseIntent`)
2. **PUSH (Lembretes Proativos):**
   - O backend Lumina identifica autonomamente consultas que começam em 10 minutos e dispara alertas na Alexa do dentista via **Alexa Reminders API**.
3. **Autenticação Stateful Multi-Dentista por PIN:**
   - O dentista clica em "Conectar Alexa" no painel web Lumina e gera um PIN de 6 dígitos.
   - No Echo, fala: *"Alexa, abra a Lumina e vincule o código [123456]"*.
   - A Lambda associa permanentemente o `alexa_user_id` daquele Echo à conta do dentista.

---

## 2. Estrutura do Projeto

```text
Lambda-Alexa/
├── src/
│   ├── index.js                      # Entrypoint Lambda e registro dos handlers ASK SDK
│   ├── handlers/
│   │   ├── LaunchRequestHandler.js   # Boas-vindas e verificação de vínculo
│   │   ├── VincularIntentHandler.js  # Pareamento do código PIN (6 dígitos)
│   │   ├── ProximaConsultaHandler.js # Consulta da próxima consulta
│   │   ├── ConsultasHojeHandler.js   # Resumo da agenda do dia
│   │   ├── AlertaAnamneseHandler.js  # Alertas médicos críticos da anamnese
│   │   └── StandardHandlers.js       # Help, Cancel, Stop, Fallback, Error
│   └── services/
│       ├── luminaApiClient.js        # Cliente HTTP com CookieJar em memória (HttpOnly)
│       └── reminderConsent.js        # Gestão do card de permissão para lembretes
├── skill-package/
│   └── interactionModels/custom/
│       └── pt-BR.json                # Interaction Model completo para a Alexa Console
├── terraform/
│   ├── main.tf                       # Provisionamento da Lambda com LabRole (AWS Academy)
│   ├── variables.tf                  # Variáveis configuráveis
│   ├── outputs.tf                    # ARN gerado da função Lambda
│   └── terraform.tfvars.example      # Exemplo de preenchimento
├── package.json
└── README.md
```

---

## 3. Provisionamento da Infraestrutura

A função Lambda e suas permissões de trigger da Alexa podem ser provisionadas de duas formas:

### Opção A: Provisionamento Central Automatizado (Recomendado via CI/CD)
No repositório central [`Infraestrutura`](../Infraestrutura), o módulo `modules/lambda_alexa` já é instanciado automaticamente durante o workflow **Terraform Infrastructure Deploy/Destroy** nos ambientes `dev` e `prod`. O ARN da Lambda é impresso nos outputs do Terraform ao final da execução.

### Opção B: Provisionamento Isolado Local (Testes Rápidos)
Como o projeto utiliza o **AWS Academy Learner Lab**, a criação de novas IAM Roles é restrita por SCPs da AWS. O manifesto Terraform desta pasta utiliza diretamente a role pré-existente **`LabRole`**.

1. Abra o terminal na pasta `terraform`:
   ```bash
   cd terraform
   ```
2. Crie o arquivo `terraform.tfvars` a partir do exemplo:
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   ```
3. Edite o arquivo `terraform.tfvars` informando o IP público da sua EC2 ou DNS do Load Balancer:
   ```hcl
   aws_region       = "us-east-1"
   function_name    = "lumina-alexa-skill"
   backend_url      = "http://SEU_IP_EC2:8080"
   service_email    = "john@doe.com"
   service_password = "sua_senha"
   ```
4. Inicialize e aplique o Terraform:
   ```bash
   terraform init
   terraform apply
   ```
5. Guarde o valor do output **`lambda_arn`** gerado ao final para vincular no Alexa Developer Console.

---

## 4. Configuração no Alexa Developer Console

1. Acesse o [Alexa Developer Console](https://developer.amazon.com/alexa/console/ask).
2. Clique em **Create Skill**:
   - **Name:** Lumina
   - **Primary Locale:** Portuguese (BR)
   - **Model:** Custom
   - **Hosting:** Provision your own (AWS Lambda)
3. No menu lateral, clique em **Interaction Model** ➔ **JSON Editor**:
   - Copie o conteúdo de `skill-package/interactionModels/custom/pt-BR.json` e cole no editor.
   - Clique em **Save Model** e depois **Build Model**.
4. No menu lateral, clique em **Endpoint**:
   - Selecione **AWS Lambda ARN**.
   - No campo **Default Region**, cole o `lambda_arn` obtido no Terraform.
   - Clique em **Save Endpoints**.
5. No menu lateral, clique em **Permissions**:
   - Ative a opção **Reminders** (`alexa::alerts:reminders:skill:readwrite`).
   - Copie o **Client ID** e **Client Secret** exibidos na parte inferior (Skill Messaging) e configure no seu `application.properties` ou variáveis de ambiente da EC2 (`ALEXA_LWA_CLIENT_ID` e `ALEXA_LWA_CLIENT_SECRET`).

---

## 5. Testando no Simulador da Alexa

1. No Alexa Developer Console, vá na aba **Test**.
2. Altere o teste de *Off* para **Development**.
3. Digite ou fale:
   - *"abrir lumina"*
   - *"vincular código 123456"* (código gerado previamente no painel web)
   - *"qual a minha próxima consulta"*
   - *"quantas consultas eu tenho hoje"*
   - *"o próximo paciente tem alguma alergia"*
