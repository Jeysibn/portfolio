# CI/CD

## Branch Model

The repository uses two long-lived branches:

```text
dev  -> development / integration
main -> protected production
```

This model is intentionally simple for a single-maintainer project while still separating integration from production release. Explicitly scoped feature branches may be used for larger milestones before merging into `dev`.

## Development CI

Workflow: `.github/workflows/dev-ci.yml`

Triggers:

- push to `dev`
- pull requests targeting `dev`
- manual workflow dispatch

The development pipeline validates all major project layers.

### Frontend

Working directory: `frontend/app`

```text
npm install
-> strict TypeScript typecheck
-> Vite production build
-> dist artifact verification
```

The generated build must contain `dist/index.html` plus JavaScript and CSS assets before frontend validation passes.

### Backend

- Python 3.11 setup
- dependency installation
- dependency compatibility check
- Python compilation
- Ruff linting
- pytest

### Terraform

- formatting check
- initialization without the remote backend
- Terraform validation

The final `Development CI Passed` job depends on all validation jobs.

## Pull Request Validation

Workflow: `.github/workflows/pr-main.yml`

Trigger:

- pull requests targeting `main`

The pull request pipeline is the production-readiness gate.

### Frontend Production Readiness

The frontend job:

1. installs the React application dependencies;
2. runs strict TypeScript validation;
3. creates a Vite production build;
4. verifies the generated `dist` artifact;
5. packages only the static production output;
6. uploads the artifact for review/debugging.

Source files and development dependencies are not part of the deployable frontend artifact.

### Backend Production Readiness

Runs:

- dependency compatibility checks
- Python compilation
- Ruff linting
- dependency security audit with `pip-audit`
- backend tests

### Backend Production Build

Builds the Azure Function deployment package using the same project dependencies required in production.

### Terraform Production Plan

For normal pull requests, the Terraform job:

1. requests a GitHub OIDC token;
2. authenticates to Azure through Microsoft Entra ID;
3. initializes the real Azure Blob remote backend;
4. validates the Terraform configuration;
5. injects the AI provider key as `TF_VAR_opencode_api_key` from the GitHub Actions `OPENCODE_API_KEY` secret;
6. generates a real plan against current production state;
7. writes the plan to the GitHub Actions step summary.

The PR workflow never runs `terraform apply`.

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
Azure Function App OPENCODE_API_KEY setting
```

Because Terraform manages the Function App setting, the secret value is also present in Terraform state. Access to the remote backend must therefore be treated as sensitive.

### Dependabot Terraform Validation

Dependabot pull requests intentionally do not receive repository secrets. For Dependabot, the PR workflow:

- skips Azure OIDC login;
- initializes Terraform with `-backend=false`;
- runs formatting and validation checks;
- skips authenticated remote-state planning.

This keeps dependency-update PRs safe without weakening secret isolation.

### Final Gate

`Production Ready` depends on frontend readiness, backend validation/build, and Terraform validation/plan. It is the final merge gate for protected `main`.

## Production Deployment

Production occurs only after changes are merged to `main`.

### Frontend

Workflow: `.github/workflows/frontend-deploy.yml`

Path trigger:

```text
frontend/**
.github/workflows/frontend-deploy.yml
```

Deployment flow:

```text
checkout
-> Node.js 22
-> npm install
-> TypeScript typecheck
-> Vite build
-> verify dist/
-> upload dist/ to GitHub Pages
-> deploy
-> curl live Pages URL and verify expected document title
```

Deployment target: GitHub Pages.

The live-page verification means a successful artifact upload alone is not considered enough evidence of a successful frontend release.

### Backend

Workflow: `.github/workflows/backend-deploy.yml`

Path trigger:

```text
backend/**
.github/workflows/backend-deploy.yml
```

Deployment target: Azure Functions.

Azure authentication uses GitHub OIDC.

After package deployment, the workflow:

1. retries `GET /api/health` while the Function host starts;
2. validates the health JSON contract;
3. calls `GetVisitorCount`;
4. verifies that the response contains an integer count;
5. fails the deployment when runtime verification fails.

### Terraform

Workflow: `.github/workflows/terraform-deploy.yml`

Path trigger:

```text
terraform/**
.github/workflows/terraform-deploy.yml
```

The production Terraform workflow performs:

```text
Azure OIDC login
-> terraform fmt check
-> terraform init
-> terraform validate
-> terraform plan with TF_VAR_opencode_api_key
-> terraform apply saved plan
```

A fresh plan is generated on `main` even when the PR previously generated a plan, because remote infrastructure state may have changed between review and merge.

## Concurrency

Development and PR validation cancel obsolete runs when newer commits arrive.

Frontend production deployment also cancels an obsolete frontend run when a newer frontend commit supersedes it.

Production Terraform deployments do not cancel in-progress applies. Infrastructure deployment uses a dedicated concurrency group with cancellation disabled.

## Release Safety Model

```text
Feature / developer change
   |
   v
PR or push -> dev
   |
   v
Development CI
   |
   v
PR dev -> main
   |
   v
Production readiness + real Terraform plan
   |
   v
Production Ready gate
   |
   v
Merge to protected main
   |
   +--> React build -> GitHub Pages -> live smoke check
   +--> Azure Functions deploy -> health/API smoke checks
   +--> Terraform plan -> apply
```

The key rule is simple: validation can happen before merge, but production mutation happens only after merge to `main`, and deployment success is followed by runtime verification where practical.
