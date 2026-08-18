# Cloud-Backed Portfolio

[![Development CI](https://github.com/Jeysibn/portfolio/actions/workflows/dev-ci.yml/badge.svg?branch=dev)](https://github.com/Jeysibn/portfolio/actions/workflows/dev-ci.yml)
[![Main PR Validation](https://github.com/Jeysibn/portfolio/actions/workflows/pr-main.yml/badge.svg)](https://github.com/Jeysibn/portfolio/actions/workflows/pr-main.yml)
[![Terraform](https://img.shields.io/badge/IaC-Terraform-7B42BC?logo=terraform)](https://developer.hashicorp.com/terraform)
[![Azure](https://img.shields.io/badge/Cloud-Microsoft%20Azure-0078D4?logo=microsoftazure)](https://azure.microsoft.com/)

A production-oriented Cloud and DevOps portfolio built as an end-to-end engineering project. The deployed system combines a React + TypeScript single-page frontend, Python Azure Functions APIs, Azure Cosmos DB, Terraform-managed infrastructure, Azure-native observability, a provider-neutral AI portfolio assistant, and GitHub Actions CI/CD using OpenID Connect (OIDC) authentication to Azure.

The current frontend uses a terminal-inspired engineering visual system while keeping the site portfolio-first rather than dashboard-first. It includes a name-first hero, live production health and release metadata, interactive project details, detailed skill inspection, certification cards, a fully visible resume, optimized architecture previews, and an opportunity-focused contact experience.

## Live Project

- **Portfolio:** https://jeysibn.github.io/
- **Source repository:** https://github.com/Jeysibn/portfolio
- **Pages deployment repository:** https://github.com/Jeysibn/jeysibn.github.io
- **GitHub profile:** https://github.com/Jeysibn
- **LinkedIn:** https://www.linkedin.com/in/jeromeibon

## Architecture

![System Architecture Diagram](frontend/assets/architectural-diagram-cloudbacked-portfolio.svg)

| Layer | Technology | Responsibility |
|---|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS, GitHub Pages | Single-page portfolio UI, health monitor, visitor counter, AI chat, project details, skills, credentials, resume |
| Frontend delivery | GitHub Actions + `Jeysibn/jeysibn.github.io` | Builds `frontend/app/dist/`, publishes the generated site to the dedicated Pages repository, and verifies the root production URL |
| Backend | Azure Functions, Python 3.11 | Health, visitor-counter, and AI-assistant APIs |
| Database | Azure Cosmos DB for NoSQL | Persistent visitor count, hashed visitor records, chat rate-limit records |
| AI | OpenAI-compatible external API | Portfolio-specific conversational assistant with provider-neutral frontend branding |
| Observability | Application Insights + Log Analytics | Requests, latency, failures, exceptions, structured operational events, deployment troubleshooting |
| Infrastructure | Terraform + AzureRM | Azure resource provisioning and lifecycle management |
| CI/CD | GitHub Actions | Typechecking, builds, tests, security checks, Terraform planning, production deployment, smoke verification |
| Cloud authentication | GitHub OIDC + Microsoft Entra ID | Short-lived Azure authentication without stored client secrets |

For the full system walkthrough, see [`docs/architecture.md`](docs/architecture.md).

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
│   ├── observability.md
│   ├── runbook.md
│   └── Changelog.md
├── frontend/
│   ├── app/
│   │   ├── public/
│   │   │   ├── favicon.svg
│   │   │   ├── resume.pdf
│   │   │   └── social-preview.svg
│   │   ├── scripts/
│   │   │   └── generate-static-assets.mjs
│   │   ├── src/
│   │   │   ├── App.tsx
│   │   │   ├── api.ts
│   │   │   ├── hooks.ts
│   │   │   ├── portfolio.ts
│   │   │   ├── skill-details.ts
│   │   │   ├── styles.css
│   │   │   ├── ui-adjustments.css
│   │   │   └── main.tsx
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vite.config.ts
│   └── assets/
├── terraform/
├── CONTRIBUTING.md
├── SECURITY.md
└── README.md
```

Generated TypeScript build-info files and Vite build output are ignored and are not source-controlled deployment inputs.

## Frontend

The portfolio is a single React page hosted at the root GitHub Pages site `https://jeysibn.github.io/`. Navigation uses document anchors, so the application does not require a client-side router or static-hosting fallback rules.

The visible page order is:

```text
Hero → About → Projects → Experience → Skills → Education & Certifications → Resume → Contact
```

Current frontend features include:

- responsive desktop and mobile navigation with active-section tracking and section-start alignment;
- no active navigation item while the visitor is still inside the hero;
- a compact Light/Dark theme control; when no saved preference exists, the initial theme follows the operating-system preference;
- a **Jerome Christian Ibon** name-first hero with supporting **Cloud Support · DevOps · Cloud Engineering** positioning;
- an explicit **Open to opportunities** state for entry-level Cloud/DevOps roles;
- live production `/api/health` status from Azure Functions;
- a build-derived **Release age** value that resets with every frontend release;
- live Manila time in the monitoring panel;
- a mobile monitoring layout that switches metric groups to a readable single-column presentation;
- visitor counter with loading and unavailable states;
- AI assistant with session history, rate-limit/error handling, and a closed state that does not block page interaction;
- whole-card project interaction with architecture previews and centered detail dialogs;
- lightweight resized WebP architecture previews for normal card/detail viewing;
- deferred full-resolution architecture images that load only when the visitor explicitly opens the architecture zoom;
- clickable skill capability cards with detailed modal explanations;
- provider-styled certification cards with hover/focus descriptions;
- a concise on-page resume with direct PDF download and on-page details;
- restrained one-time reveal motion and `prefers-reduced-motion` support;
- responsive About composition with tighter title/body spacing and a terminal-style engineering-principles card.

### Health and release-age semantics

The hero monitor deliberately separates liveness from release metadata:

- `/api/health` confirms that the Azure Function worker loaded and can serve HTTP;
- it does **not** prove Cosmos DB or the external AI provider is healthy;
- **Release age** is calculated from a Vite build timestamp and is not server uptime;
- Azure Functions may scale or recycle independently of the frontend release lifecycle.

### Architecture preview strategy

The original architecture PNG files remain the full-resolution source images. Normal project-card and project-detail rendering uses resized WebP previews so the initial portfolio experience does not download multi-megabyte source diagrams unnecessarily.

Current preview behavior:

```text
Project card / project detail
        |
        v
resized WebP preview (lazy-loaded)
        |
        | user explicitly opens architecture zoom
        v
original full-resolution PNG
```

Preview transformation is performed through `wsrv.nl`; the original GitHub-hosted diagrams remain the source of truth and are used for the explicit full-resolution view.

### Local frontend development

Use Node.js **22.12+**. Node 18 is unsupported by the current Vite toolchain.

```bash
cd frontend/app
npm install
npm run dev
```

During `npm run dev`, Vite serves React/TypeScript modules separately and opens a development WebSocket for hot module replacement. Those development-only requests are not representative of the production request graph.

To test the same bundling model used for production:

```bash
npm run build
npm run preview
```

Then open the Vite preview URL (normally `http://localhost:4173`) and test with browser cache disabled when measuring initial network cost.

The production Azure Functions API is used by default. To target a local Function host, create a local `.env` from `.env.example`:

```text
VITE_API_BASE_URL=http://localhost:7071/api
```

Validation and production build:

```bash
npm run typecheck
npm run build
```

Vite writes the deployable artifact to `frontend/app/dist/`.

## CI/CD Model

The repository uses two long-lived branches:

```text
dev  → development and integration
main → protected production
```

Scoped feature branches may be used for larger work before integration into `dev`.

### Development

A push to `dev` or pull request targeting `dev` validates:

- React dependency installation;
- strict TypeScript typecheck;
- Vite production build and artifact verification;
- Python dependency compatibility, syntax, Ruff, and backend tests;
- Terraform formatting, backend-disabled initialization, and validation;
- final `Development CI Passed` gate.

### Pull Request to `main`

A `dev → main` pull request runs production-readiness checks including frontend build packaging, backend validation/security auditing, Azure Function deployment-package creation, Azure OIDC authentication, Terraform remote-backend initialization, a real authenticated Terraform plan, and the final `Production Ready` gate.

No application or infrastructure mutation occurs from the pull request itself.

### Production

After merge into `main`, path-specific workflows deploy only the affected layer:

```text
frontend/**
  → Vite build
  → checkout Jeysibn/jeysibn.github.io
  → rsync dist/ into the Pages repository
  → commit/push generated site
  → verify https://jeysibn.github.io/

backend/**
  → Azure Functions
  → health + visitor API smoke tests

terraform/**
  → Terraform plan + apply
```

The source repository remains the source of truth. The `Jeysibn/jeysibn.github.io` repository is the generated deployment target for the frontend artifact.

The frontend workflow uses the repository secret `PAGES_DEPLOY_TOKEN` to authenticate the checkout/push to the dedicated Pages repository. Azure workflows continue to use GitHub OIDC rather than stored Azure client secrets.

See [`docs/cicd.md`](docs/cicd.md).

## Security Design

Key security decisions include:

- GitHub OIDC federation with Microsoft Entra ID for Azure Actions authentication;
- no reusable Azure service-principal client secret in GitHub;
- protected `main` branch with required PR validation;
- separate OIDC trust subjects for pull-request planning and production environment deployment;
- `PAGES_DEPLOY_TOKEN` stored only as a GitHub Actions secret for publishing the generated frontend to the dedicated Pages repository;
- hashed client IP addresses before persistence in Cosmos DB;
- AI provider API key stored in GitHub Actions Secrets and passed to Terraform as a sensitive `TF_VAR` input;
- Terraform state stored remotely in Azure Blob Storage and treated as sensitive;
- backend dependency auditing in PR validation;
- local environment, TypeScript build-info, and secret files excluded from Git;
- lazy AI-client initialization so optional AI failures cannot prevent unrelated Function routes from being indexed;
- no provider API keys or Azure connection strings embedded in the React bundle.

Application-secret flow:

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

## Backend Local Development

Prerequisites:

- Python 3.11+
- Azure Functions Core Tools
- Terraform
- Azure CLI
- Node.js 22.12+

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
```

Create `backend/local.settings.json` locally with the required application settings. The file is ignored by Git.

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

Run and validate:

```bash
func start

cd backend
ruff check .
pytest -v
```

Terraform validation without touching shared remote state:

```bash
cd terraform
terraform fmt -check -recursive
terraform init -backend=false
terraform validate
```

## Terraform Remote State

Remote state is stored in Azure Blob Storage:

```text
Resource group:  rg-terraform-state
Storage account: sttfstatejeysibn
Container:       tfstate
State key:       portfolio.terraform.tfstate
```

Because Terraform manages sensitive Function App settings, access to the remote backend is restricted and state contents must not be exposed in logs or public troubleshooting output.

## Azure Resources Managed by Terraform

Terraform currently provisions:

- Azure Resource Group;
- Function App Storage Account;
- Azure Cosmos DB account;
- Cosmos DB SQL database (`PortfolioDB`);
- `Counter` container;
- `VisitorIPs` container with TTL;
- Linux Consumption App Service Plan;
- Python 3.11 Azure Function App;
- Log Analytics workspace with cost guardrails;
- workspace-based Application Insights;
- Function App configuration, telemetry connection, and CORS settings.

## Observability and Operations

Production visibility includes:

- `GET /api/health` liveness endpoint;
- Application Insights request, failure, exception, and latency telemetry;
- structured application events and correlation IDs;
- Log Analytics with 30-day retention and a `0.1 GB/day` ingestion cap;
- backend health and visitor-counter post-deployment smoke checks;
- frontend root-domain post-deployment verification;
- frontend health monitor with explicit liveness and release-age semantics;
- initial SLI/SLO targets and KQL troubleshooting queries.

See [`docs/observability.md`](docs/observability.md) and [`docs/runbook.md`](docs/runbook.md).

## Documentation

- [`docs/architecture.md`](docs/architecture.md) — system design and data flows
- [`docs/cicd.md`](docs/cicd.md) — branch model and GitHub Actions pipelines
- [`docs/observability.md`](docs/observability.md) — telemetry, health semantics, cost guardrails, SLOs, and KQL
- [`docs/azure-oidc.md`](docs/azure-oidc.md) — Azure federation design and trust subjects
- [`docs/runbook.md`](docs/runbook.md) — deployment, troubleshooting, rollback, and recovery procedures
- [`docs/Changelog.md`](docs/Changelog.md) — release history
- [`CONTRIBUTING.md`](CONTRIBUTING.md) — development workflow and validation commands
- [`SECURITY.md`](SECURITY.md) — security model and reporting guidance

## Project Goals

This repository is both a live portfolio and a learning project focused on practical Cloud and DevOps engineering:

- cloud architecture;
- infrastructure as code;
- CI/CD and protected releases;
- workload identity and secret management;
- typed frontend applications against serverless APIs;
- remote state management;
- observability and post-deployment verification;
- accessible frontend interaction design;
- frontend performance and asset-delivery decisions;
- testing and validation;
- operational documentation.

## License

This project is licensed under the MIT License. See [`LICENSE`](LICENSE).
