# Changelog

All notable changes to the **Cloud-Backed Portfolio** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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