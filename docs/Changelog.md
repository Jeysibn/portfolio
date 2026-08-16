# Changelog

All notable changes to the **Cloud-Backed Portfolio** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
* **Expanded AI Knowledge Base**: Added richer career, project, homelab, technical-skill, availability, relocation, language, and recruiter FAQ context with guardrails that distinguish professional experience from personal project experience.
* **Terraform-Managed AI Configuration**: Added the AI provider API key as a sensitive Terraform input populated from the GitHub Actions `OPENCODE_API_KEY` secret through `TF_VAR_opencode_api_key`.

### Changed
* **Model-Neutral AI Branding**: Removed model-specific branding from the portfolio chat interface so backend AI model/provider changes do not require frontend branding changes.
* **Runtime-Safe AI Initialization**: Changed the AI client from import-time initialization to lazy request-time initialization so optional AI configuration failures cannot prevent unrelated Azure Function routes from being indexed.
* **Function App Secret Ownership**: Terraform now manages the `OPENCODE_API_KEY` Function App setting instead of relying on an out-of-band application setting protected by `ignore_changes`.

### Fixed
* **Azure Function Route Discovery**: Restored Function App route indexing after an import-time AI configuration failure caused the Function App to expose no indexed routes.
* **AI Assistant Configuration Recovery**: Restored the AI assistant after the `OPENCODE_API_KEY` application setting was missing, while keeping the visitor counter operational.
* **Frontend Counter Error Handling**: Improved visitor-counter response handling so HTTP failures are reported as HTTP errors instead of misleading JSON parsing failures.

### Security
* **GitHub-Managed Application Secret**: `OPENCODE_API_KEY` is stored in GitHub Actions Secrets and injected into Terraform at workflow runtime rather than committed to the repository.
* **Sensitive Terraform Input**: The API key Terraform variable is marked sensitive. Because Terraform manages the Function App setting, the value is also present in the protected remote Terraform state and access to that backend must be treated as sensitive.

---

## [1.4.0] - 2026-08-16

### Added
* **Professional Project Documentation**: Rebuilt the root README as a complete project entry point with architecture, repository structure, CI/CD flow, security model, local development, Terraform bootstrap, operational notes, and documentation links.
* **Architecture Guide**: Added `docs/architecture.md` describing frontend, backend, Cosmos DB, AI integration, Terraform, data flows, and design principles.
* **CI/CD Guide**: Added `docs/cicd.md` documenting the `dev`/`main` branch model, validation stages, authenticated Terraform PR planning, and production deployments.
* **Azure OIDC Guide**: Added `docs/azure-oidc.md` documenting GitHub-to-Azure workload identity federation, immutable subject claims, RBAC considerations, and troubleshooting.
* **Operations Runbook**: Added `docs/runbook.md` with common deployment, backend, Terraform, CI, rollback, and recovery procedures.
* **Repository Governance**: Added `CONTRIBUTING.md`, `SECURITY.md`, and an MIT `LICENSE`.
* **Dependency Automation**: Added Dependabot configuration for Python and GitHub Actions dependencies.
* **Backend Test Suite**: Added unit coverage for IP hashing and extraction, AI knowledge-base prompt behavior, knowledge-base loading, and HTTP OPTIONS/preflight routes.
* **Terraform CLI Constraint**: Added an explicit supported Terraform CLI version range.

### Changed
* **Mandatory Backend Testing**: Development CI and PR production-readiness validation now require pytest to pass instead of conditionally skipping an empty test suite.
* **Reproducible Backend Dependencies**: Pinned the production versions proven by the last successful Azure Function deployment: `azure-functions==1.25.0`, `azure-cosmos==4.16.3`, and `openai==3.1.0`.
* **Expanded Git Ignore Rules**: Added virtual environments, local secrets, Python tooling caches, coverage files, Terraform plans/state variants, build artifacts, and editor files.

### Removed
* **Tracked Python Virtual Environment**: Removed `backend/.venv/` and its generated packages from version control.
* **Local Installation Artifact**: Removed the committed Microsoft package installer artifact from the backend directory.
* **Temporary OIDC Test Workflow**: Removed the one-off Azure OIDC validation workflow after production OIDC authentication was proven.

---

## [1.3.0] - 2026-08-16

### Added
* **Two-Branch CI/CD Model**: Established `dev` as the development/integration branch and `main` as the protected production branch.
* **Development CI Pipeline**: Added automated frontend, backend, and Terraform validation for pushes to `dev`, including HTML validation, JavaScript syntax checks, Python compilation, Ruff linting, dependency validation, conditional pytest execution, Terraform formatting, initialization, and validation.
* **Pull Request Production Readiness Pipeline**: Added a dedicated `dev` → `main` PR workflow that validates frontend and backend code, performs dependency security auditing, builds deployment artifacts, and gates merges through a final `Production Ready` check.
* **Authenticated Terraform PR Plan**: Added Azure OIDC authentication to pull request validation so Terraform can initialize the real remote backend and generate an infrastructure plan against current production state without applying changes.
* **Azure OIDC Federation**: Added GitHub Actions workload identity federation with Microsoft Entra ID, removing the need for long-lived Azure client secrets in deployment workflows.
* **Production Terraform Deployment**: Added a dedicated production workflow that authenticates to Azure through OIDC, initializes remote state, validates configuration, generates a fresh Terraform plan, and applies infrastructure changes after merge to `main`.
* **Main Branch Protection**: Added a GitHub branch ruleset requiring pull requests and successful production-readiness checks before changes can be merged into `main`.

### Changed
* **Deployment Workflow Separation**: Split production delivery into dedicated frontend, backend, and Terraform workflows with path-specific triggers on `main`.
* **Backend Deployment Authentication**: Migrated Azure deployment authentication from a Function App publish profile to short-lived OIDC-based Azure authentication.
* **Terraform Validation Strategy**: PR validation now checks planned infrastructure changes against the remote backend, while Terraform apply remains restricted to the post-merge production workflow.
* **Backend Code Quality**: Improved Python lint compliance and exception logging behavior to support stricter automated CI validation.

### Security
* **Secretless Azure Authentication**: Production and pull request workflows now exchange GitHub-issued OIDC tokens for short-lived Azure credentials instead of storing a reusable Azure service principal secret.
* **Protected Production Branch**: Direct production changes are constrained through PR-based validation and required status checks.

---

## [1.2.0] - 2026-08-14

### Added
* **Expanded Portfolio Showcase**: Added a second project card to the Projects page (`projects.html`) featuring modal details and architecture breakdowns.

---

## [1.1.0] - 2026-08-10

### Changed
* **Visitor Counter Logic**: Upgraded the `GetResumeCounter` Azure Function to log unique visitors by IP address.

### Added
* **IP Deduplication & 24-Hour TTL**: Implemented rate-limiting logic so each unique IP address is counted only once every 24 hours to prevent counter inflation and spam requests.

---

## [1.0.0] - 2026-08-01

### Added
* **Initial Release**: Launched the initial version of the Cloud-Backed Portfolio site.
* **Frontend UI**: Responsive static site built using HTML5, JavaScript, and Tailwind CSS hosted on GitHub Pages.
* **Dark / Light Mode**: Added a persistent theme toggle with `localStorage` memory and OS theme preference auto-detection across `index.html`, `projects.html`, and `resume.html`.
* **Serverless Backend**: Built an asynchronous HTTP trigger API in Python 3.11 (Azure Functions v2 programming model).
* **Database Integration**: Integrated Azure Cosmos DB (NoSQL API) for persistent visitor counts.
* **Infrastructure as Code (IaC)**: Provisioned cloud resources using HashiCorp Terraform.
* **CI/CD Automation**: Configured GitHub Actions workflows for automated build, test, and deployment of both frontend and backend code.
