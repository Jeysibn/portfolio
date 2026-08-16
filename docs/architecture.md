# Architecture

## Overview

The Cloud-Backed Portfolio is a small production-oriented serverless application designed to demonstrate end-to-end cloud and DevOps engineering practices.

```text
Browser
  |
  | HTTPS
  v
GitHub Pages
  |
  | API requests
  v
Azure Functions (Python)
  |                \
  |                 \ OpenAI-compatible API
  v                  v
Azure Cosmos DB     AI Provider
```

Infrastructure is managed with Terraform and deployed through GitHub Actions.

## Frontend

The frontend is a static site hosted on GitHub Pages. It contains the portfolio content, visitor-counter client logic, and AI assistant interface.

The AI interface is intentionally model/provider-neutral so backend model changes do not require frontend branding changes.

The frontend calls anonymous Azure Function HTTP endpoints. Anonymous Function authorization is intentional because the APIs are consumed directly by the public website; abuse controls are therefore implemented at the application layer where appropriate.

## Backend

The backend runs as an Azure Functions Python 3.11 application.

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

Lazy AI-client initialization is a reliability boundary: missing optional AI configuration can produce a controlled AI-route error without preventing Azure Functions from indexing unrelated routes such as the visitor counter.

## Application Secret Flow

The AI provider key is not stored in source control. It follows this deployment path:

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

Because Terraform manages the Function App setting, the secret value is represented in Terraform state. The remote backend must therefore be treated as sensitive infrastructure data.

## Data Layer

Azure Cosmos DB for NoSQL stores application state.

### Database

`PortfolioDB`

### Containers

- `Counter` — persistent visitor counter document
- `VisitorIPs` — hashed visitor identifiers and chat rate-limit records

The `VisitorIPs` container uses a 24-hour default TTL so temporary visitor records are automatically removed.

## Infrastructure

Terraform manages the application resource group and Azure resources.

Remote Terraform state is stored separately in Azure Blob Storage:

```text
Resource group:  rg-terraform-state
Storage account: sttfstatejeysibn
Container:       tfstate
Key:             portfolio.terraform.tfstate
```

Keeping state outside the application resource group separates Terraform's control data from the infrastructure being managed. State access is restricted because it can contain sensitive managed values.

## Delivery Architecture

The repository uses two long-lived branches:

- `dev` — development and integration
- `main` — protected production

Pull requests from `dev` to `main` run an authenticated Terraform plan against the current remote state. Terraform apply is never performed from a pull request.

Dependabot pull requests use a safe validation path with the Terraform backend disabled and no Azure authentication because repository secrets are intentionally unavailable to Dependabot.

After merge, path-specific production workflows deploy frontend, backend, or infrastructure changes.

## Authentication

GitHub Actions authenticates to Azure using OpenID Connect workload identity federation with Microsoft Entra ID.

There is no reusable Azure client secret required by the deployment workflows. GitHub receives a short-lived OIDC token for each eligible workflow job and exchanges it for Azure credentials.

Application secrets such as the external AI provider key are managed separately from Azure workload identity.

See [azure-oidc.md](azure-oidc.md) for the trust model.

## Design Principles

The project favors:

- simple serverless components;
- infrastructure as code;
- short-lived cloud credentials;
- explicit application-secret handling;
- automated validation before production;
- runtime isolation for optional integrations;
- low operational cost;
- explicit documentation;
- enough separation to remain maintainable without introducing unnecessary enterprise complexity.
