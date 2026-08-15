# Operations Runbook

## Purpose

This runbook documents common operational checks and recovery steps for the Cloud-Backed Portfolio.

## Check Deployment Status

Start with GitHub Actions.

Expected production workflows:

- frontend deployment
- backend deployment
- Terraform deployment

A successful merge may trigger only the workflows whose path filters match the changed files.

## Frontend Incident

### Symptoms

- portfolio page does not load;
- latest frontend changes are missing;
- GitHub Pages deployment failed.

### Checks

1. Open the latest `Deploy Frontend to GitHub Pages` workflow run.
2. Confirm the Pages artifact upload completed.
3. Confirm the Pages deployment step completed.
4. Verify the repository Pages configuration still points to GitHub Actions.
5. Check browser developer tools for failed API calls separately from static-site loading errors.

## Backend Incident

### Symptoms

- visitor count request fails;
- AI assistant returns server errors;
- Azure Function deployment fails.

### Checks

1. Inspect the latest backend deployment workflow.
2. Confirm Azure OIDC login succeeded.
3. Confirm the Function package was built and deployed.
4. Check Azure Function application logs.
5. Confirm required application settings exist:
   - `CosmosDbConnectionString`
   - `OPENCODE_API_KEY`
6. Confirm Cosmos DB and the Function App are healthy.

Do not print secret values into GitHub Actions logs while troubleshooting.

## Terraform Incident

### Authentication Failure

If `azure/login` fails with `AADSTS700213`, compare the subject shown in the workflow log with the configured Entra federated identity credential.

Expected production subject:

```text
repo:Jeysibn@184398348/portfolio@1312957789:environment:production
```

Expected pull-request subject:

```text
repo:Jeysibn@184398348/portfolio@1312957789:pull_request
```

### Remote State Access Failure

If Azure login succeeds but `terraform init` fails when opening the backend:

1. verify the backend storage account exists;
2. verify the `tfstate` container exists;
3. verify the service principal has the required Blob data-plane access;
4. verify the configured backend resource group, account, container, and key have not changed.

### Plan Failure

Run locally without touching remote state first:

```bash
cd terraform
terraform fmt -check -recursive
terraform init -backend=false
terraform validate
```

If local validation passes but the authenticated CI plan fails, investigate Azure authorization, real-state drift, provider/API behavior, or an infrastructure constraint.

### Apply Failure

Do not immediately rerun repeated applies without reading the failure. Terraform may already have created or modified some resources before a later operation failed.

1. inspect the failed action in the workflow log;
2. inspect Azure resource state;
3. rerun `terraform plan` to determine the new desired diff;
4. correct configuration or permissions;
5. allow the production workflow to apply the corrected plan.

## Remote State

Backend location:

```text
Resource group:  rg-terraform-state
Storage account: sttfstatejeysibn
Container:       tfstate
Key:             portfolio.terraform.tfstate
```

Do not commit downloaded `.tfstate` files to Git.

## CI Failure

### Backend lint failure

Run:

```bash
cd backend
ruff check .
```

### Backend tests

Run:

```bash
cd backend
pytest -v
```

### Dependency audit

Run:

```bash
cd backend
pip-audit -r requirements.txt
```

### Terraform formatting

Run:

```bash
cd terraform
terraform fmt -recursive
```

Then commit the formatting changes.

## Rollback Strategy

### Frontend

Revert the offending commit through the normal `dev -> main` pull-request flow. A new merge to `main` redeploys the corrected static site.

### Backend

Prefer a Git revert through the normal pipeline rather than manually deploying an old package. This preserves deployment history and keeps repository state aligned with production.

### Terraform

Do not manually roll back Terraform state. Revert or correct the Terraform configuration, review the generated plan, and let Terraform converge infrastructure to the desired state.

## Operational Principle

The repository is the source of truth for application code and desired infrastructure configuration. Prefer corrective commits and automated delivery over untracked manual production changes.
