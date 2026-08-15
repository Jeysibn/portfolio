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
Azure Cosmos DB     OpenCode Zen
```

Infrastructure is managed with Terraform and deployed through GitHub Actions.

## Frontend

The frontend is a static site hosted on GitHub Pages. It contains the portfolio content, visitor-counter client logic, and AI assistant interface.

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
5. sends the request to OpenCode Zen through its OpenAI-compatible API;
6. returns a concise portfolio-specific response.

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

Keeping state outside the application resource group separates Terraform's control data from the infrastructure being managed.

## Delivery Architecture

The repository uses two long-lived branches:

- `dev` — development and integration
- `main` — protected production

Pull requests from `dev` to `main` run an authenticated Terraform plan against the current remote state. Terraform apply is never performed from a pull request.

After merge, path-specific production workflows deploy frontend, backend, or infrastructure changes.

## Authentication

GitHub Actions authenticates to Azure using OpenID Connect workload identity federation with Microsoft Entra ID.

There is no reusable Azure client secret required by the deployment workflows. GitHub receives a short-lived OIDC token for each eligible workflow job and exchanges it for Azure credentials.

See [azure-oidc.md](azure-oidc.md) for the trust model.

## Design Principles

The project favors:

- simple serverless components;
- infrastructure as code;
- short-lived credentials;
- automated validation before production;
- low operational cost;
- explicit documentation;
- enough separation to remain maintainable without introducing unnecessary enterprise complexity.
