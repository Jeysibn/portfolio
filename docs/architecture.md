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

The assistant's factual content is built before deployment rather than fetched
from a runtime repository crawler:

```text
content/portfolio.json
        |
        | explicit allow-list + validation in CI
        v
backend/data/approved_knowledge.json
        |
        | deterministic project/technology retrieval
        v
AiChatAssistant → provider → { reply, sources, usage }
```

## Frontend

The frontend is a Vite-built React + TypeScript single-page application. Source lives under `frontend/app`; Vite emits the static production artifact to `frontend/app/dist`.

The application uses document-anchor navigation instead of client-side routes. The visible flow is:

```text
  Hero → Projects → Experience → Capabilities → Credentials → Principles → Resume → Contact
```

Navigation scrolls the selected section to the start of the viewport beneath the sticky header. The hero intentionally has no active navigation item; active-section indication begins when a content section is reached.

### Frontend responsibilities

- responsive desktop and mobile navigation with active-section tracking;
- compact Light/Dark theme switching with saved-preference persistence and initial system-preference fallback;
- typed portfolio content rendering;
- a name-first hero centered on `Jerome Christian Ibon` with Cloud Support / DevOps / Cloud Engineering positioning;
- backend `/api/health` remains available for deployment verification;
- visitor-counter display;
- AI assistant conversation state, starter questions, source links, and session history;
- a four-project System Deck with numbered project selection, keyboard arrows, and pointer swipe support;
- compact typed delivery-flow previews paired with repository-derived architecture sheets in the inspection dialog;
- static-host-safe `?project=<slug>` inspection deep links;
- native project-detail dialogs with full SVG architecture sheets and text equivalents;
- clickable skill-detail dialogs;
- restrained certification and education lists;
- fully visible on-page resume plus direct PDF download;
- form-less recruiter-focused Contact section with direct email, copy-email, LinkedIn, resume, and GitHub paths;
- height-aware desktop density and an in-view Control Plane orbital topology with slow domain/tool motion, focus stability, and a static constrained-width fallback;
- keyboard focus behavior and reduced-motion support.

The AI interface remains provider-neutral so backend model/provider changes do not require frontend branding changes.

The frontend never receives the AI provider secret or Azure connection strings. Sensitive provider interaction remains server-side.

## Theme Behavior

Theme selection is intentionally compact in the current UI.

On initial load:

1. if `color-theme` contains `light` or `dark`, the saved value is applied;
2. otherwise the browser operating-system preference is used.

The visible header control toggles between Light and Dark and persists the selected value. Theme changes update the document color scheme and browser theme-color metadata.

## Backend health semantics

### Liveness

`GET /api/health` is a lightweight Azure Functions liveness check. A successful response means the Function worker loaded the application and can serve HTTP traffic.

It does **not** query Cosmos DB or the external AI provider, so an Operational health state must not be interpreted as proof that every downstream dependency is healthy.

## Project Architecture Delivery

The System Deck keeps the homepage evidence focused and data-driven:

```text
Project preview data
   |
   v
typed flow in the System Deck
   |
   | Read the case study
   v
native dialog -> repository-derived SVG sheets -> text equivalents
```

Architecture assets live under `frontend/app/public/architecture/`:

- `portfolio/runtime.svg` and `portfolio/delivery.svg`;
- `homelab/system.svg` and `homelab/gitops.svg`;
- `monikey/system.svg` and `monikey/delivery.svg`;
- `noc-report/system.svg` and `noc-report/ai-report-pipeline.svg`.

Each SVG contains a meaningful `<title>` and `<desc>`. The dialog also renders a text summary so architecture understanding does not depend on image rendering or motion.

Project inspection is static-host safe: opening a dossier updates `?project=<slug>`, while closing removes the query and back/forward events resynchronize the selected project.

### Contact handoff

The final Contact section is intentionally form-less. Its recruiter-focused
The closing leads with working-together intent and canonical availability,
then exposes the canonical email as separate Send email and Copy email actions.
LinkedIn, the downloadable resume, and GitHub remain visible as secondary
engineering-presence paths. Copy feedback is announced through a local live
region and falls back to a DOM copy attempt when the Clipboard API is
unavailable. The header wordmark uses the relative `#top` anchor, which is
owned by the hero section and works across local, Pages, and custom-domain
deployments.

## Backend

The backend runs as an Azure Functions Python 3.11 application using the Python v2 programming model.

### Health

`GET /api/health` verifies that the Function worker loaded and can serve HTTP without making dependency calls to Cosmos DB or the AI provider.

The backend deployment workflow uses the same route as a post-deployment gate. The portfolio presentation keeps that operational endpoint available without promoting live health widgets into the hero.

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

1. validates the request and rejects clearly unrelated requests before the accepted-AI question quota;
2. identifies a visitor with a hashed IP-derived key and applies the authoritative hourly Cosmos DB quota;
3. retrieves a small project/profile context from the allow-listed `approved_knowledge.json` projection;
4. builds separate behavior and factual-context messages and records prompt/knowledge versions;
5. lazily creates the OpenAI-compatible AI client at request time;
6. sends the bounded request to the configured AI provider;
7. sanitizes the answer and returns curated source links plus remaining hourly usage;
8. records privacy-conscious retrieval, latency, quota, provider, and failure telemetry.

Lazy AI-client initialization is a reliability boundary: optional AI configuration failures can produce a controlled AI-route error without preventing unrelated Function routes from being indexed.

The assistant does not use embeddings, a vector database, LangChain, Pinecone,
or an autonomous agent. The corpus is currently small enough for deterministic
exact matching. The canonical content and generated artifact are checked in CI
so the frontend cannot silently advertise a project the assistant does not
know.

## Application Secret Flow

The AI provider key and visitor HMAC pseudonymization key are not stored in source control or bundled into the React frontend. Both are injected through deployment secrets; the visitor key is required for privacy-preserving deduplication.

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
