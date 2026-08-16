# Operations Runbook

## Purpose

This runbook documents common operational checks and recovery steps for the Cloud-Backed Portfolio.

## Check Deployment Status

Start with GitHub Actions.

Expected production workflows:

- frontend deployment;
- backend deployment;
- Terraform deployment.

A successful merge may trigger only the workflows whose path filters match the changed files. Markdown-only documentation updates normally do not redeploy the application or infrastructure.

A successful deployment job is not the same as runtime readiness. Verify the affected application behavior after deployment whenever possible.

## Frontend Incident

### Symptoms

- portfolio page does not load;
- latest frontend changes are missing;
- GitHub Pages deployment failed;
- theme controls are unreadable;
- project/skill dialogs do not open;
- the closed chatbot blocks clicks underneath it;
- the health monitor or Release age presentation looks incorrect.

### Checks

1. Open the latest `Deploy Frontend to GitHub Pages` workflow run.
2. Confirm the Vite build and `dist/` artifact verification passed.
3. Confirm the Pages artifact upload completed.
4. Confirm the Pages deployment step completed.
5. Confirm the live-page verification passed.
6. Verify the repository Pages configuration still points to GitHub Actions.
7. Check browser developer tools for static asset failures and API failures separately.

### Frontend smoke checklist

After a frontend release, verify:

- the page loads in Dark, Light, and System themes;
- the theme selector remains readable in each theme;
- the hero health monitor transitions from Checking to the appropriate state;
- Release age is displayed as release metadata rather than uptime;
- project cards open centered project-detail dialogs;
- architecture diagrams zoom in-page rather than navigating to raw image URLs;
- skill cards open their detail dialogs;
- certification descriptions are readable through hover/focus behavior;
- the resume is visible without requiring a download;
- the Contact CTA is reachable from the hero;
- closing the chatbot leaves underlying page elements clickable;
- keyboard focus remains visible on interactive cards and controls.

### Local Vite startup failure

The current Vite toolchain requires Node.js 22.12+ for the recommended local environment.

If local development fails with an error similar to:

```text
node:util does not provide an export named 'styleText'
```

check the active Node version:

```bash
node -v
```

If Node 18 is active, switch to a current Node 22 runtime before reinstalling/running dependencies. With `nvm`:

```bash
nvm install 22
nvm use 22
```

Then run:

```bash
cd frontend/app
npm install
npm run typecheck
npm run build
npm run dev
```

## Monitoring Panel Interpretation

The hero monitor combines liveness and release metadata.

- `GET /api/health` is a Function App liveness check only.
- An Operational result does not prove Cosmos DB or the AI provider is healthy.
- **Release age** is calculated from the frontend Vite build timestamp.
- Release age resets on a new frontend release.
- Release age is not Azure Function uptime and must not be used as an availability SLI.
- Manila time is client-side presentation context, not an infrastructure signal.

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
6. Confirm Cosmos DB and the Function App are available.
7. Confirm the expected routes are indexed in Azure Functions.

Do not print secret values into GitHub Actions logs while troubleshooting.

### AI Assistant Returns 503 but Visitor Counter Works

If `AiChatAssistant` returns HTTP 503 while `GetVisitorCount` still works, the Function App is indexed and the AI integration is likely missing or misconfigured.

Normal configuration flow:

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
3. Confirm Terraform PR/production workflows pass the secret as `TF_VAR_opencode_api_key` during `terraform plan`.
4. Confirm Terraform configuration owns `app_settings["OPENCODE_API_KEY"]`.
5. Review the Terraform plan to ensure the Function App application settings will be corrected.
6. Apply the change through the normal `dev -> main` workflow rather than relying on an untracked manual portal edit.
7. Retest the AI assistant after Terraform production deployment completes.

### No Functions Are Indexed

A package deployment can succeed even when the Python worker cannot import the application module and therefore cannot discover routes.

Previous incident lesson:

- optional AI client initialization at module import time caused route discovery to fail when AI configuration was unavailable;
- the AI client is now created lazily at request time;
- optional integration failures should return a controlled route-level error rather than preventing unrelated routes from being indexed.

If no functions are indexed:

1. inspect Azure Function startup/import logs;
2. verify `AzureWebJobsFeatureFlags=EnableWorkerIndexing` exists;
3. look for module import exceptions and missing package/configuration errors;
4. verify optional integrations are not initialized in a way that can fail at import time;
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

Treat remote state as sensitive because Terraform-managed secret values can be represented in state.

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

Do not immediately rerun repeated applies without reading the failure. Terraform may already have created or modified resources before a later operation failed.

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

Do not commit downloaded `.tfstate` files and do not expose state contents in logs or public troubleshooting output.

## CI Failure

### Frontend

```bash
cd frontend/app
npm install
npm run typecheck
npm run build
```

### Backend lint and tests

```bash
cd backend
ruff check .
pytest -v
```

### Dependency audit

```bash
cd backend
pip-audit -r requirements.txt
```

### Terraform formatting and validation

```bash
cd terraform
terraform fmt -recursive
terraform fmt -check -recursive
terraform init -backend=false
terraform validate
```

## Rollback Strategy

### Frontend

Revert the offending commit through the normal `dev -> main` pull-request flow. A new merge to `main` rebuilds the Vite artifact, generates a fresh release timestamp, and deploys the corrected static site.

### Backend

Prefer a Git revert through the normal pipeline rather than manually deploying an old package. This preserves deployment history and keeps repository state aligned with production.

### Terraform

Do not manually roll back Terraform state. Revert or correct the Terraform configuration, review the generated plan, and let Terraform converge infrastructure to the desired state.

## Operational Principle

The repository is the source of truth for application code and desired infrastructure configuration. Prefer corrective commits and automated delivery over untracked manual production changes.
