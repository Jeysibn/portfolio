# CI/CD

## Branch Model

The repository uses two long-lived branches:

```text
dev  -> development / integration
main -> protected production
```

This model is intentionally simple because the project is maintained by one developer, but it still separates integration from production release.

## Development CI

Workflow: `.github/workflows/dev-ci.yml`

Trigger:

- push to `dev`
- manual workflow dispatch

The development pipeline validates all major project layers.

### Frontend

- HTML validation
- JavaScript syntax validation
- required-file checks

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

Validates frontend source files and creates a build artifact.

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

The Terraform PR job:

1. requests a GitHub OIDC token;
2. authenticates to Azure through Microsoft Entra ID;
3. initializes the real Azure Blob remote backend;
4. validates the Terraform configuration;
5. generates a real plan against current production state;
6. writes the plan to the GitHub Actions step summary.

The PR workflow never runs `terraform apply`.

### Final Gate

`Production Ready` depends on all production-readiness jobs and is configured as the required status check for the protected `main` branch.

## Production Deployment

Production occurs only after changes are merged to `main`.

### Frontend

Workflow: `.github/workflows/frontend-deploy.yml`

Path trigger:

```text
frontend/**
```

Deployment target: GitHub Pages.

### Backend

Workflow: `.github/workflows/backend-deploy.yml`

Path trigger:

```text
backend/**
```

Deployment target: Azure Functions.

Azure authentication uses GitHub OIDC.

### Terraform

Workflow: `.github/workflows/terraform-deploy.yml`

Path trigger:

```text
terraform/**
```

The production Terraform workflow performs:

```text
Azure OIDC login
-> terraform init
-> terraform validate
-> terraform plan
-> terraform apply
```

A fresh plan is generated on `main` even when the PR previously generated a plan, because remote infrastructure state may have changed between review and merge.

## Concurrency

Development and PR validation can cancel obsolete runs when newer commits arrive.

Production Terraform deployments should not be cancelled mid-apply. Infrastructure deployment uses a dedicated concurrency group with cancellation disabled.

## Release Safety Model

```text
Developer change
   |
   v
push to dev
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
Required Production Ready check
   |
   v
Merge to protected main
   |
   +--> frontend deployment
   +--> backend deployment
   +--> Terraform plan + apply
```

The key rule is simple: validation can happen before merge, but production mutation happens only after merge to `main`.
