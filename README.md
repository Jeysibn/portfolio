# Cloud-Backed Portfolio

[![Development CI](https://github.com/Jeysibn/portfolio/actions/workflows/dev-ci.yml/badge.svg?branch=dev)](https://github.com/Jeysibn/portfolio/actions/workflows/dev-ci.yml)
[![Main PR Validation](https://github.com/Jeysibn/portfolio/actions/workflows/pr-main.yml/badge.svg)](https://github.com/Jeysibn/portfolio/actions/workflows/pr-main.yml)
[![Terraform](https://img.shields.io/badge/IaC-Terraform-7B42BC?logo=terraform)](https://developer.hashicorp.com/terraform)
[![Azure](https://img.shields.io/badge/Cloud-Microsoft%20Azure-0078D4?logo=microsoftazure)](https://azure.microsoft.com/)

A production-oriented cloud portfolio built as a hands-on DevOps project. The site combines a static frontend, a Python serverless API, Azure Cosmos DB, Terraform-managed infrastructure, a model-neutral AI portfolio assistant, and GitHub Actions CI/CD with OpenID Connect (OIDC) authentication to Azure.

The project is intentionally small enough to understand end-to-end, while applying real engineering practices around infrastructure as code, automated validation, protected production releases, remote state, short-lived cloud credentials, application-secret management, and operational documentation.

## Live Project

- **Portfolio:** https://jeysibn.github.io/portfolio
- **GitHub:** https://github.com/Jeysibn
- **LinkedIn:** https://www.linkedin.com/in/jeromeibon

## Architecture

![System Architecture Diagram](frontend/assets/architectural-diagram-cloudbacked-portfolio.png)

### Components

| Layer | Technology | Responsibility |
|---|---|---|
| Frontend | HTML, JavaScript, Tailwind CSS, GitHub Pages | Static portfolio UI, visitor counter, AI chat interface |
| Backend | Azure Functions, Python 3.11 | Visitor counter API and AI assistant API |
| Database | Azure Cosmos DB for NoSQL | Persistent visitor count, hashed visitor records, chat rate-limit records |
| AI | OpenAI-compatible external API | Portfolio-specific conversational assistant with model-neutral frontend branding |
| Infrastructure | Terraform + AzureRM | Azure resource provisioning and lifecycle management |
| CI/CD | GitHub Actions | Validation, security checks, build packaging, Terraform planning, production deployment |
| Cloud authentication | GitHub OIDC + Microsoft Entra ID | Short-lived Azure authentication without stored client secrets |

For a deeper system walkthrough, see [`docs/architecture.md`](docs/architecture.md).

## Repository Structure

```text
portfolio/
├── .github/
│   ├── dependabot.yml
│   └── workflows/
│       ├── dev-ci.yml
│       ├── pr-main.yml
│       ├── frontend-deploy.yml
│       ├── backend-deploy.yml
│       └── terraform-deploy.yml
├── backend/
│   ├── data/
│   ├── tests/
│   ├── function_app.py
│   ├── host.json
│   └── requirements.txt
├── docs/
│   ├── architecture.md
│   ├── azure-oidc.md
│   ├── cicd.md
│   ├── runbook.md
│   └── Changelog.md
├── frontend/
├── terraform/
├── .gitignore
├── CONTRIBUTING.md
├── LICENSE
├── SECURITY.md
└── README.md
```

## CI/CD Model

The repository uses a deliberately simple two-branch model:

```text
dev  → development and integration
main → protected production
```

### Development

A push to `dev` or pull request targeting `dev` runs automated validation for the frontend, backend, and Terraform configuration.

### Pull Request to `main`

A `dev → main` pull request runs production-readiness checks including:

- HTML and JavaScript validation
- Python dependency compatibility checks
- Ruff linting
- dependency security auditing
- backend tests
- Azure Function deployment package build
- Azure OIDC authentication for normal contributor PRs
- Terraform initialization against the real remote backend
- authenticated Terraform production plan
- final `Production Ready` merge gate

Dependabot PRs use a safe Terraform validation path with the backend disabled and no Azure authentication because repository secrets are intentionally unavailable to Dependabot.

No infrastructure or application deployment occurs from a pull request.

### Production

After a successful PR is merged into `main`, path-specific workflows deploy only the affected part of the system:

```text
frontend/**  → GitHub Pages
backend/**   → Azure Functions
terraform/** → Terraform plan + apply
```

Production Azure workflows authenticate using GitHub-issued OIDC tokens rather than stored Azure client secrets.

See [`docs/cicd.md`](docs/cicd.md) for the complete pipeline design.

## Security Design

Key security decisions include:

- GitHub OIDC federation with Microsoft Entra ID for Azure Actions authentication
- no reusable Azure service principal client secret in GitHub
- protected `main` branch with required PR validation
- separate OIDC trust subjects for pull-request planning and production environment deployment
- hashed client IP addresses before storage in Cosmos DB
- AI provider API key stored in GitHub Actions Secrets and passed to Terraform as a sensitive `TF_VAR` input
- Terraform state stored remotely in Azure Blob Storage and treated as sensitive because managed secret values can be represented in state
- backend dependency auditing in PR validation
- environment and local-secret files excluded from Git
- lazy AI client initialization so optional AI configuration failures cannot prevent unrelated Function routes from being indexed

The application-secret flow is:

```text
GitHub Actions Secret: OPENCODE_API_KEY
        |
        v
TF_VAR_opencode_api_key
        |
        v
Terraform sensitive variable
        |
        v
Azure Function App application setting
```

See [`docs/azure-oidc.md`](docs/azure-oidc.md) and [`SECURITY.md`](SECURITY.md).

## Local Development

### Prerequisites

- Python 3.11+
- Azure Functions Core Tools
- Terraform
- Azure CLI
- Node.js (for frontend validation tools)

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
```

Create `backend/local.settings.json` locally with the required application settings. This file is intentionally ignored by Git.

Typical settings include:

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "python",
    "CosmosDbConnectionString": "<local-or-development-connection-string>",
    "OPENCODE_API_KEY": "<api-key>"
  }
}
```

Run the Function App locally:

```bash
func start
```

### Tests and linting

```bash
cd backend
ruff check .
pytest -v
```

### Terraform validation

```bash
cd terraform
terraform fmt -check -recursive
terraform init -backend=false
terraform validate
```

Use the real backend only when intentionally working with the shared Azure state.

## Terraform Remote State Bootstrap

The application infrastructure uses an Azure Blob Storage backend. The state storage must exist before Terraform can initialize the remote backend.

```bash
az login

az group create \
  --name rg-terraform-state \
  --location koreacentral

az storage account create \
  --name sttfstatejeysibn \
  --resource-group rg-terraform-state \
  --location koreacentral \
  --sku Standard_LRS \
  --encryption-services blob

az storage container create \
  --name tfstate \
  --account-name sttfstatejeysibn
```

Terraform backend configuration:

```text
Resource group:  rg-terraform-state
Storage account: sttfstatejeysibn
Container:       tfstate
State key:       portfolio.terraform.tfstate
```

The CI/CD identity also requires permission to access the remote state blob. Because Terraform manages application settings containing sensitive values, state access should be restricted and state contents should not be exposed in logs or public troubleshooting output.

## Azure Resources Managed by Terraform

Terraform currently provisions:

- Azure Resource Group
- Azure Storage Account for the Function App
- Azure Cosmos DB account
- Cosmos DB SQL database (`PortfolioDB`)
- `Counter` container
- `VisitorIPs` container with TTL
- Linux Consumption App Service Plan
- Python 3.11 Azure Function App
- application configuration and CORS settings

## Operational Notes

The portfolio is designed to remain low-cost and suitable for a personal cloud project. The architecture uses serverless/consumption-oriented services and Cosmos DB free-tier configuration where applicable.

A successful deployment job is not considered equivalent to runtime readiness. The Azure Functions incident that motivated lazy AI initialization is documented in the runbook and informs the roadmap for post-deploy health checks and observability.

For troubleshooting and deployment operations, see [`docs/runbook.md`](docs/runbook.md).

## Documentation

- [`docs/architecture.md`](docs/architecture.md) — system design and data flows
- [`docs/cicd.md`](docs/cicd.md) — branch model and GitHub Actions pipelines
- [`docs/azure-oidc.md`](docs/azure-oidc.md) — Azure federation design and trust subjects
- [`docs/runbook.md`](docs/runbook.md) — common operational and recovery procedures
- [`docs/Changelog.md`](docs/Changelog.md) — project release history
- [`CONTRIBUTING.md`](CONTRIBUTING.md) — development workflow and contribution standards
- [`SECURITY.md`](SECURITY.md) — security model and reporting guidance

## Project Goals

This repository is both a live portfolio and a learning project focused on demonstrating practical Cloud and DevOps engineering skills:

- designing cloud architecture
- managing infrastructure with Terraform
- building CI/CD pipelines
- implementing secure workload identity
- managing application secrets without committing credentials
- managing remote state
- enforcing production release gates
- testing and validating application changes
- documenting engineering decisions and operational procedures

## License

This project is licensed under the MIT License. See [`LICENSE`](LICENSE).
