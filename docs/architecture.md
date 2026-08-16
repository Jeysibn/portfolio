# Architecture

## Overview

The Cloud-Backed Portfolio is a small production-oriented serverless application designed to demonstrate end-to-end cloud and DevOps engineering practices.

```text
Browser
  |
  | HTTPS
  v
GitHub Pages
React + TypeScript SPA
  |
  | anonymous HTTPS API requests
  v
Azure Functions (Python 3.11)
  |                 \
  |                  \ OpenAI-compatible API
  v                   v
Azure Cosmos DB      AI Provider
  |
  +------------------------------+
                                 |
Azure Functions telemetry ------> Application Insights
                                 |
                                 v
                           Log Analytics
```

Infrastructure is managed with Terraform and delivery is automated with GitHub Actions.

## Frontend

The frontend is a Vite-built React + TypeScript single-page application hosted on GitHub Pages.

Source lives in `frontend/app`. Vite emits a static production artifact to `frontend/app/dist`, and only that generated artifact is uploaded to GitHub Pages.

The SPA uses document-anchor navigation instead of client-side routes. This keeps direct navigation compatible with static hosting while still providing one continuous About → Experience → Projects → Skills → Resume → Contact experience.

Frontend responsibilities include:

- responsive navigation and active-section state;
- system/light/dark theming;
- typed portfolio content rendering;
- live `/api/health` status;
- visitor-counter display;
- AI assistant conversation UI and session history;
- project case-study presentation;
- print-optimized resume output.

The AI interface remains model/provider-neutral so backend provider changes do not require frontend branding changes.

The frontend never receives the AI provider secret or Azure connection strings. It calls public Azure Function HTTP endpoints, and sensitive provider interaction remains server-side.

## Backend

The backend runs as an Azure Functions Python 3.11 application using the Python v2 programming model.

### Health

`GET /api/health` is a lightweight liveness endpoint. It verifies that the Function worker loaded and can serve HTTP without making dependency calls to Cosmos DB or the external AI provider.

The React hero checks this endpoint when the page loads, and the backend deployment workflow also uses it as a post-deployment gate.

### Visitor Counter

`GetVisitorCount`:

1. extracts the originating client IP from forwarded headers;
2. hashes the address using SHA-256 before persistence;
3. checks the `VisitorIPs` Cosmos DB container;
4. increments the counter only for a visitor that has not been recorded within the TTL window;
5. stores the hashed visitor identifier.

The raw IP address is not intentionally persisted.

### AI Assistant

`AiChatAssistant`:

1. identifies a visitor using a hashed IP-derived key;
2. applies a per-visitor rate limit using Cosmos DB records;
3. loads the portfolio knowledge base from `backend/data/knowledge_base.json`;
4. builds a constrained system prompt;
5. lazily creates the OpenAI-compatible AI client at request time;
6. sends the request to the configured AI provider;
7. returns a concise portfolio-specific response.

Lazy AI-client initialization is a reliability boundary: missing optional AI configuration can produce a controlled AI-route error without preventing Azure Functions from indexing unrelated routes.

## Application Secret Flow

The AI provider key is not stored in source control or bundled into the React frontend.

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
Azure Function App OPENCODE_API_KEY setting
```

Because Terraform manages the Function App setting, the secret value can be represented in Terraform state. The remote backend must therefore be treated as sensitive infrastructure data.

## Data Layer

Azure Cosmos DB for NoSQL stores application state.

### Database

`PortfolioDB`

### Containers

- `Counter` — persistent visitor counter document
- `VisitorIPs` — hashed visitor identifiers and chat rate-limit records

The `VisitorIPs` container uses a 24-hour default TTL so temporary visitor records are automatically removed.

## Observability

Terraform provisions a workspace-based Application Insights resource and a dedicated Log Analytics workspace.

Telemetry includes:

- Function request and response telemetry;
- request latency and HTTP result codes;
- application exceptions;
- structured portfolio events;
- correlation identifiers for request troubleshooting.

The Log Analytics workspace uses 30-day retention and a `0.1 GB/day` ingestion cap as a cost guardrail.

Application code avoids logging raw IP addresses, prompts, AI responses, API keys, connection strings, and other secrets.

See [observability.md](observability.md) for SLOs, KQL queries, and operating guidance.

## Infrastructure

Terraform manages:

- application resource group;
- Function storage account;
- Cosmos DB account, database, and containers;
- Linux Consumption service plan;
- Python Function App;
- Log Analytics workspace;
- Application Insights;
- Function App configuration and observability connection settings.

Remote Terraform state is stored separately in Azure Blob Storage:

```text
Resource group:  rg-terraform-state
Storage account: sttfstatejeysibn
Container:       tfstate
Key:             portfolio.terraform.tfstate
```

Keeping state outside the application resource group separates Terraform control data from the infrastructure being managed. State access is restricted because it can contain sensitive managed values.

## Delivery Architecture

The repository uses two long-lived branches:

- `dev` — development and integration
- `main` — protected production

Feature branches may be used for explicitly scoped milestones before integration into `dev`.

### Development validation

A pull request into `dev` validates:

```text
React install → TypeScript check → Vite build
Python dependencies → Ruff → tests
Terraform fmt → init (no backend) → validate
                    |
                    v
         Development CI Passed
```

### Production readiness

A `dev → main` pull request creates real production build artifacts and performs an authenticated Terraform plan against the remote state. Terraform apply is never performed from a pull request.

Dependabot uses a safe validation path with no Azure login and the Terraform backend disabled because repository secrets are intentionally unavailable to Dependabot.

### Production deployment

After merge into `main`, path-specific workflows deploy only the affected layer:

```text
frontend/**
  React/Vite build → GitHub Pages → live page verification

backend/**
  Azure Functions deploy → /health verification → visitor API smoke test

terraform/**
  Terraform plan → Terraform apply
```

## Authentication

GitHub Actions authenticates to Azure using OpenID Connect workload identity federation with Microsoft Entra ID.

There is no reusable Azure service-principal client secret required by the deployment workflows. GitHub receives a short-lived OIDC token for each eligible workflow job and exchanges it for Azure credentials.

Application secrets such as the external AI provider key are managed separately from Azure workload identity.

See [azure-oidc.md](azure-oidc.md) for the trust model.

## Design Principles

The project favors:

- static frontend delivery with dynamic serverless APIs;
- infrastructure as code;
- short-lived cloud credentials;
- explicit application-secret handling;
- automated validation before production;
- post-deployment verification rather than upload-only success;
- observable runtime behavior;
- typed frontend/backend contracts where practical;
- low operational cost;
- explicit documentation;
- enough separation to remain maintainable without introducing unnecessary enterprise complexity.
