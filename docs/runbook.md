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

A successful deployment job is not the same as runtime readiness. After deployment, verify the affected endpoint or application behavior whenever possible.

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
- Azure Function deployment fails;
- Azure Portal shows no indexed functions after an apparently successful deployment.

### Checks

1. Inspect the latest backend deployment workflow.
2. Confirm Azure OIDC login succeeded.
3. Confirm the Function package was built and deployed.
4. Check Azure Function application logs.
5. Confirm required application settings exist:
   - `CosmosDbConnectionString`
   - `AzureWebJobsFeatureFlags=EnableWorkerIndexing`
   - `OPENCODE_API_KEY`
6. Confirm Cosmos DB and the Function App are healthy.
7. Confirm the expected routes are indexed in Azure Functions.

Do not print secret values into GitHub Actions logs while troubleshooting.

### AI Assistant Returns 503 but Visitor Counter Works

If `AiChatAssistant` returns HTTP 503 while `GetVisitorCount` still works, the Function App is indexed and the AI integration is likely missing or misconfigured.

The normal configuration source is:

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

Recovery steps:

1. Confirm the GitHub Actions repository secret named `OPENCODE_API_KEY` exists.
2. Do not reveal or print the secret value.
3. Confirm the Terraform PR/production workflows pass the secret as `TF_VAR_opencode_api_key` during `terraform plan`.
4. Confirm Terraform configuration owns `app_settings["OPENCODE_API_KEY"]`.
5. Review the Terraform plan to ensure the Function App application settings will be corrected.
6. Apply the change through the normal `dev -> main` workflow rather than relying on an untracked manual portal edit.
7. Retest the AI assistant after the Terraform production deployment completes.

### No Functions Are Indexed

A package deployment can succeed even when the Python worker cannot import the application module and therefore cannot discover routes.

Previous incident lesson:

- optional AI client initialization at module import time caused route discovery to fail when AI configuration was unavailable;
- the AI client is now created lazily at request time;
- optional integration failures should return a controlled route-level error rather than preventing unrelated routes from being indexed.

If no functions are indexed:

1. inspect Azure Function startup/import logs;
2. verify `AzureWebJobsFeatureFlags=EnableWorkerIndexing` exists;
3. look for module import exceptions and missing required package/configuration errors;
4. verify optional integrations are not being initialized in a way that can fail at import time;
5. redeploy only after the import/indexing failure is understood.

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

Treat remote state as sensitive because Terraform-managed secret values, including Function App settings, can be represented in state.

### Plan Failure

Run locally without touching remote state first:

```bash
cd terraform
terraform fmt -check -recursive
terraform init -backend=false
terraform validate
```

If local validation passes but the authenticated CI plan fails, investigate Azure authorization, real-state drift, provider/API behavior, missing workflow inputs such as `TF_VAR_opencode_api_key`, or an infrastructure constraint.

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

Do not commit downloaded `.tfstate` files to Git and do not expose state contents in logs or public troubleshooting output.

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
