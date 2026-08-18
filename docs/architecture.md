# Architecture

## Overview

The Cloud-Backed Portfolio is a small production-oriented serverless application designed to demonstrate end-to-end Cloud and DevOps engineering practices.

```text
Browser
  |
  | HTTPS
  v
https://jeysibn.github.io/
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

Application source, CI/CD, backend code, and Terraform remain in `Jeysibn/portfolio`. The generated frontend artifact is published to the dedicated Pages repository `Jeysibn/jeysibn.github.io` so the live portfolio can use the root GitHub Pages URL.

Infrastructure is managed with Terraform and delivery is automated with GitHub Actions.

## Frontend

The frontend is a Vite-built React + TypeScript single-page application. Source lives under `frontend/app`; Vite emits the static production artifact to `frontend/app/dist`.

The application uses document-anchor navigation instead of client-side routes. The visible flow is:

```text
Hero → About → Projects → Experience → Skills → Education & Certifications → Resume → Contact
```

Navigation scrolls the selected section to the start of the viewport beneath the sticky header. The hero intentionally has no active navigation item; active-section indication begins when a content section is reached.

### Frontend responsibilities

- responsive desktop and mobile navigation with active-section tracking;
- compact Light/Dark theme switching with saved-preference persistence and initial system-preference fallback;
- typed portfolio content rendering;
- a name-first hero centered on `Jerome Christian Ibon` with Cloud Support / DevOps / Cloud Engineering positioning;
- live Azure Function `/api/health` status;
- build-derived release-age display;
- live Manila time in the monitoring panel;
- responsive monitoring-card geometry, including single-column phone metrics;
- visitor-counter display;
- AI assistant conversation state and session history;
- whole-card project-detail interaction;
- centered project-detail dialogs;
- lightweight project architecture previews;
- in-page full-resolution architecture zoom;
- clickable skill-detail dialogs;
- provider-styled certification cards;
- fully visible on-page resume plus direct PDF download;
- keyboard focus behavior and reduced-motion support.

The AI interface remains provider-neutral so backend model/provider changes do not require frontend branding changes.

The frontend never receives the AI provider secret or Azure connection strings. Sensitive provider interaction remains server-side.

## Theme Behavior

Theme selection is intentionally compact in the current UI.

On initial load:

1. if `color-theme` contains `light` or `dark`, the saved value is applied;
2. otherwise the browser operating-system preference is used.

The visible header control toggles between Light and Dark and persists the selected value. Theme changes update the document color scheme and browser theme-color metadata.

## Frontend Monitoring Semantics

The hero monitor intentionally combines two different categories of information without treating them as equivalent.

### Liveness

`GET /api/health` is a lightweight Azure Functions liveness check. A successful response means the Function worker loaded the application and can serve HTTP traffic.

It does **not** query Cosmos DB or the external AI provider, so an Operational health state must not be interpreted as proof that every downstream dependency is healthy.

### Release age

The frontend build injects a compile-time timestamp through Vite. The UI calculates **Release age** from that timestamp and resets naturally with every new frontend build/release.

Release age is **not server uptime**. Azure Functions is serverless and may scale or recycle instances independently of the frontend release lifecycle.

## Architecture Image Delivery

The project showcase contains large architecture diagrams. The original PNG files remain the full-resolution source assets, but normal portfolio browsing does not fetch those originals immediately.

```text
Project card
   |
   v
lazy-loaded resized WebP preview
   |
   v
Project details
   |
   v
same lightweight preview
   |
   | explicit "open architecture" action
   v
original full-resolution PNG
```

Preview transformation uses `wsrv.nl` with width, WebP, quality, and no-upscale parameters. Only public diagram URLs are passed to that service; no credentials or application data are involved.

The original diagram locations remain the source of truth:

- Cloud-Backed Portfolio architecture: public GitHub-hosted PNG in `Jeysibn/portfolio`;
- Homelab GitOps architecture: public GitHub-hosted PNG in `Jeysibn/homelab-gitops`.

This split keeps normal page-transfer cost low while preserving a full-resolution inspection path for visitors who request it.

## Backend

The backend runs as an Azure Functions Python 3.11 application using the Python v2 programming model.

### Health

`GET /api/health` verifies that the Function worker loaded and can serve HTTP without making dependency calls to Cosmos DB or the AI provider.

The React hero checks this endpoint when the page loads, and the backend deployment workflow uses the same route as a post-deployment gate.

### Visitor Counter

`GetVisitorCount`:

1. extracts the originating client IP from forwarded headers;
2. hashes the address using SHA-256 before persistence;
3. checks the `VisitorIPs` Cosmos DB container;
4. increments the counter only when the visitor has not been recorded within the TTL window;
5. stores the hashed visitor identifier.

Raw IP addresses are not intentionally persisted.

### AI Assistant

`AiChatAssistant`:

1. identifies a visitor with a hashed IP-derived key;
2. applies a per-visitor rate limit using Cosmos DB records;
3. loads the portfolio knowledge base from `backend/data/knowledge_base.json`;
4. builds a constrained system prompt;
5. lazily creates the OpenAI-compatible AI client at request time;
6. sends the request to the configured AI provider;
7. returns a portfolio-specific response.

Lazy AI-client initialization is a reliability boundary: optional AI configuration failures can produce a controlled AI-route error without preventing unrelated Function routes from being indexed.

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

Because Terraform manages the Function App setting, the secret can be represented in Terraform state. The remote backend is therefore treated as sensitive infrastructure data.

## Data Layer

Azure Cosmos DB for NoSQL stores application state.

### Database

`PortfolioDB`

### Containers

- `Counter` — persistent visitor counter document
- `VisitorIPs` — hashed visitor identifiers and chat rate-limit records

The `VisitorIPs` container uses a 24-hour default TTL so temporary visitor records are automatically removed.

## Observability

Terraform provisions workspace-based Application Insights and a dedicated Log Analytics workspace.

Telemetry includes:

- Function request/response telemetry;
- request latency and HTTP result codes;
- application exceptions;
- structured portfolio events;
- correlation identifiers for request troubleshooting.

The Log Analytics workspace uses 30-day retention and a `0.1 GB/day` ingestion cap as a cost guardrail.

Application code avoids logging raw IP addresses, prompts, AI responses, API keys, connection strings, and other secrets.

See [observability.md](observability.md).

## Infrastructure

Terraform manages:

- application resource group;
- Function storage account;
- Cosmos DB account, database, and containers;
- Linux Consumption service plan;
- Python Function App;
- Log Analytics workspace;
- Application Insights;
- Function App configuration, observability connection settings, and CORS.

Remote Terraform state is stored separately in Azure Blob Storage:

```text
Resource group:  rg-terraform-state
Storage account: sttfstatejeysibn
Container:       tfstate
Key:             portfolio.terraform.tfstate
```

Keeping state outside the application resource group separates Terraform control data from managed application infrastructure. State access is restricted because sensitive managed values can be represented in state.

## Delivery Architecture

Two long-lived branches are used:

- `dev` — development and integration
- `main` — protected production

Scoped feature branches may be used for larger changes before integration into `dev`.

### Development validation

```text
React install → TypeScript check → Vite build
Python dependencies → Ruff → tests
Terraform fmt → init (no backend) → validate
                    |
                    v
         Development CI Passed
```

### Production readiness

A `dev → main` pull request builds the frontend artifact, validates the backend, audits dependencies, builds the Function package, authenticates to Azure through OIDC, initializes the real Terraform backend, and generates a production plan. `terraform apply` never runs from the pull request.

Dependabot uses a backend-disabled Terraform validation path without Azure login because repository secrets are intentionally unavailable to Dependabot.

### Frontend production deployment

The source repository does not directly host the production Pages branch. After a frontend-affecting merge to `main`:

```text
Jeysibn/portfolio main
        |
        | build frontend/app/dist/
        v
GitHub Actions frontend-deploy.yml
        |
        | PAGES_DEPLOY_TOKEN
        v
checkout Jeysibn/jeysibn.github.io@main
        |
        | rsync --delete dist/ → repository root
        | create .nojekyll
        | commit generated site
        v
push main
        |
        v
https://jeysibn.github.io/
        |
        v
live-page smoke verification
```

`Jeysibn/portfolio` remains the source of truth. `Jeysibn/jeysibn.github.io` is treated as the generated publication repository.

### Backend and infrastructure production deployment

After merge into `main`, path-specific workflows deploy only the affected layer:

```text
backend/**
  Azure Functions deploy → /health verification → visitor API smoke test

terraform/**
  Terraform plan → Terraform apply
```

Documentation-only changes do not trigger application or infrastructure deployment unless a workflow file itself is also changed.

## Authentication

GitHub Actions authenticates to Azure using OpenID Connect workload identity federation with Microsoft Entra ID. GitHub receives a short-lived OIDC token for each eligible workflow job and exchanges it for Azure credentials.

Frontend publication to the separate GitHub Pages repository is a different trust boundary. It uses the repository secret `PAGES_DEPLOY_TOKEN` only for checkout/push access to `Jeysibn/jeysibn.github.io`; it is not used for Azure authentication.

Application secrets such as the AI provider key are managed separately from both deployment mechanisms.

See [azure-oidc.md](azure-oidc.md).

## Design Principles

The project favors:

- static frontend delivery with dynamic serverless APIs;
- infrastructure as code;
- short-lived cloud credentials;
- explicit application-secret handling;
- automated validation before production;
- generated frontend publication from a separate source repository;
- post-deployment verification rather than upload-only success;
- observable runtime behavior;
- accurate monitoring semantics rather than decorative uptime claims;
- typed frontend/backend contracts where practical;
- accessible interaction patterns;
- performance-aware asset loading;
- low operational cost;
- explicit documentation;
- enough separation to stay maintainable without unnecessary enterprise complexity.
