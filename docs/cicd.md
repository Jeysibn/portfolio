# CI/CD

## Branch Model

The repository uses two long-lived branches:

```text
dev  -> development / integration
main -> protected production
```

Scoped feature branches may be used for larger changes before integration into `dev`. Production changes reach `main` only through a pull request.

## Development CI

Workflow: `.github/workflows/dev-ci.yml`

Triggers:

- push to `dev`;
- pull requests targeting `dev`;
- manual workflow dispatch.

### Frontend validation

Working directory: `frontend/app`

```text
npm ci
-> npm run validate:ci
   -> strict TypeScript typecheck
   -> ESLint
   -> Vitest unit tests
   -> Vite production build
   -> performance budget
   -> local Vite production preview
   -> Playwright browser + axe accessibility tests
-> dist artifact verification
```

Development CI, pull request validation, and frontend production release call
the same `validate:ci` npm script. The workflows still install Chromium and
verify the deployable artifact around that shared gate.

The generated build must contain `dist/index.html` plus JavaScript and CSS assets before frontend validation passes. Browser tests run against that build, not Vite development modules. The Playwright matrix covers desktop 1920×1080, desktop 1440×900, and the configured iPhone 13 mobile Chromium project. Accessibility scans cover the initial page, project and capability dialogs, mobile navigation, and the expanded assistant.

The performance check runs after the build and fails if the existing JavaScript gzip budget is exceeded. The current budget is 180 KiB; it is not raised automatically to accommodate regressions.

The current frontend toolchain requires a modern Node runtime. Local development should use Node.js 22.12+; CI uses Node 22.

Development-mode request count is not a production performance metric. Vite serves source modules separately during `npm run dev`. Use `npm run build` followed by `npm run preview` when reviewing the production bundle locally.

### Backend validation

- Python 3.11 setup;
- dependency installation and compatibility check;
- Python compilation;
- Ruff linting;
- pytest.

### Terraform validation

- formatting check;
- initialization without the remote backend;
- Terraform validation.

The final `Development CI Passed` job depends on all validation jobs.

## Pull Request Validation

Workflow: `.github/workflows/pr-main.yml`

Trigger:

- pull requests targeting `main`.

The pull request pipeline is the production-readiness gate.

### Frontend production readiness

The frontend job:

1. installs React application dependencies;
2. runs strict TypeScript validation, ESLint, and Vitest;
3. creates a Vite production build;
4. enforces the JavaScript performance budget;
5. installs Chromium and runs the Playwright/axe matrix against a local production preview;
6. verifies the generated `dist` output;
7. packages only the static production artifact;
8. uploads that artifact for review/debugging.

Source files and development dependencies are not part of the deployable frontend artifact.

The frontend artifact is presentation-only; backend liveness remains covered by the backend deployment smoke checks.

### Backend production readiness

Runs:

- dependency compatibility checks;
- Python compilation;
- Ruff linting;
- dependency security audit with `pip-audit`;
- backend tests.

### Backend production build

Builds the Azure Function deployment package using the same project dependencies required in production.

### Terraform production plan

For normal pull requests, the Terraform job:

1. requests a GitHub OIDC token;
2. authenticates to Azure through Microsoft Entra ID;
3. initializes the real Azure Blob remote backend;
4. validates Terraform configuration;
5. injects the AI provider key as `TF_VAR_opencode_api_key` from the GitHub Actions `OPENCODE_API_KEY` secret;
6. generates a real plan against current production state;
7. writes the plan to the GitHub Actions step summary.

The PR workflow never runs `terraform apply`.

AzureRM is constrained to the supported 5.x major (`~> 5.0`); the selected
provider build is recorded in `terraform/.terraform.lock.hcl`. The upgrade was
reviewed in sequence from 3.x to 4.x, then 4.x to 5.x. For 3.x to 4.x, resource
names remain unchanged; the configuration now uses Cosmos `free_tier_enabled`
and SQL container `partition_key_paths`, and supplies the subscription ID
required by 4.x. The 4.x to 5.x guide's removed properties are not used by the
current resources. The one relevant behavior change is Storage Account's
default `allow_nested_items_to_be_public = false`; the Function storage account
now sets this explicitly to deny public blob access. The production-state plan
must confirm any resulting update is in-place and contains no unexpected
storage drift. Authenticated jobs supply `TF_VAR_subscription_id` from
`AZURE_SUBSCRIPTION_ID`; Dependabot uses a non-deployed placeholder for static
validation only. Dependabot checks Terraform weekly against `dev`. Review
provider upgrades with the [AzureRM 4.0 upgrade guide](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/guides/4.0-upgrade-guide)
and the [AzureRM 5.0 upgrade guide](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/guides/5.0-upgrade-guide), then run a real-state plan before production apply. Dependabot does not automatically apply infrastructure.

### Dependabot Terraform validation

Dependabot pull requests intentionally do not receive repository secrets. For Dependabot, the PR workflow:

- skips Azure OIDC login;
- initializes Terraform with `-backend=false`;
- runs formatting and validation checks;
- skips authenticated remote-state planning.

### Final gate

`Production Ready` depends on frontend readiness, backend validation/build, and Terraform validation/plan. It is the final merge gate for protected `main`.

## Production Deployment

Production occurs only after merge into `main`.

### Frontend

Workflow: `.github/workflows/frontend-deploy.yml`

Path trigger:

```text
frontend/**
content/**
.github/workflows/frontend-deploy.yml
```

The source application and the published Pages site are intentionally separated:

- source/build repository: `Jeysibn/portfolio`;
- publication repository: `Jeysibn/jeysibn.github.io`;
- live URL: `https://jeysibn.github.io/`.

Deployment flow:

```text
checkout Jeysibn/portfolio
-> Node.js 22
-> canonical content is bundled from content/portfolio.json
-> npm ci
-> TypeScript typecheck
-> lint
-> unit tests
-> Vite build
-> verify frontend/app/dist/
-> performance budget
-> local production preview
-> Playwright + axe browser gate
-> checkout Jeysibn/jeysibn.github.io@main using PAGES_DEPLOY_TOKEN
-> rsync --delete dist/ into publication repository root
-> create .nojekyll
-> commit generated site if changed
-> push publication repository main
-> curl https://jeysibn.github.io/
-> verify expected Jerome Ibon page content
-> deployed Chromium smoke test
```

The local browser and accessibility gate completes before the Pages repository is checked out or mutated. The deployed smoke test remains as a second-layer verification after publication.

The Pages repository is treated as generated deployment output. Source edits belong in `Jeysibn/portfolio`, not directly in `Jeysibn/jeysibn.github.io`.

`PAGES_DEPLOY_TOKEN` is a GitHub Actions secret used only to authenticate the cross-repository checkout/push. It is separate from Azure authentication and must not be exposed in source, logs, or documentation.

The live-page verification means a successful push to the publication repository alone is not considered sufficient evidence of a successful frontend release.

### Backend

Workflow: `.github/workflows/backend-deploy.yml`

Path trigger:

```text
backend/**
content/**
.github/workflows/backend-deploy.yml
```

Deployment target: Azure Functions.

Azure authentication uses GitHub OIDC.

After package deployment, the workflow:

1. injects the current `github.sha` as `APP_REVISION` without printing existing
   application settings;
2. retries `GET /api/health` while the Function host starts;
3. verifies liveness, version, environment, service, and the exact deployed
   revision;
4. fails the deployment if runtime verification fails.

The health route does not mutate Cosmos data. Deployment verification never
calls `GetVisitorCount`, which remains reserved for actual portfolio traffic.

The deployment package includes the generated allow-listed assistant projection.
The workflow checks it with `python backend/tools/build_knowledge.py --check`
before installing the Function dependencies, so a content change cannot deploy
an out-of-date assistant artifact.

### Terraform

Workflow: `.github/workflows/terraform-deploy.yml`

Path trigger:

```text
terraform/**
.github/workflows/terraform-deploy.yml
```

Production flow:

```text
Azure OIDC login
-> terraform fmt check
-> terraform init
-> terraform validate
-> terraform plan with TF_VAR_opencode_api_key
-> terraform apply saved plan
```

A fresh plan is generated on `main` even when PR validation previously generated one because remote state may change between review and merge.

## Frontend Asset Delivery

The Vite build contains the application JavaScript/CSS and static public assets. The System Deck displays typed delivery-flow previews, while the inspection dialog exposes the complete repository-derived SVG architecture set.

Normal project rendering loads only the active project's first architecture sheet. The remaining sheets are requested when the user explicitly opens system inspection, while the adjacent text summaries keep the interaction understandable without image rendering.

This behavior is application-level optimization rather than a separate deployment job. CI still validates the frontend through the normal TypeScript and Vite build pipeline.

## Frontend source maps

Vite production source-map publication is disabled. The repository has no source-map upload step or private monitoring consumer, and the Pages artifact is public. Application Insights continues to receive runtime request and exception telemetry; if source-level browser diagnostics become necessary, add a private upload path before re-enabling maps.

## Documentation-Only Releases

Markdown-only changes do not match the frontend, backend, or Terraform deployment path filters, so synchronizing documentation after a successful release does not redeploy the application or mutate Azure infrastructure.

Documentation still follows the normal branch model so `dev` and `main` remain aligned with the deployed system description.

## Concurrency

Development and PR validation cancel obsolete runs when newer commits arrive.

Frontend production deployment also cancels an obsolete frontend run when a newer frontend commit supersedes it.

Production Terraform deployments do not cancel in-progress applies. Infrastructure deployment uses a dedicated concurrency group with cancellation disabled.

## Release Safety Model

```text
Feature / developer change
   |
   v
dev
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
   +--> React build
   |      -> performance budget
   |      -> local preview + Playwright/axe gate
   |      -> Jeysibn/jeysibn.github.io
   |      -> https://jeysibn.github.io/ smoke check
   |
   +--> Azure Functions deploy
   |      -> health/API smoke checks
   |
   +--> Terraform plan -> apply
```

The core rule is simple: validation happens before merge, production mutation happens only after merge to `main`, generated frontend output is published to the dedicated Pages repository, and deployment success is followed by runtime verification where practical.
