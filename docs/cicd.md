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
npm install
-> strict TypeScript typecheck
-> Vite production build
-> dist artifact verification
```

The generated build must contain `dist/index.html` plus JavaScript and CSS assets before frontend validation passes.

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
2. runs strict TypeScript validation;
3. creates a Vite production build;
4. verifies the generated `dist` output;
5. packages only the static production artifact;
6. uploads that artifact for review/debugging.

Source files and development dependencies are not part of the deployable frontend artifact.

The Vite configuration also injects a build timestamp used by the deployed UI to calculate **Release age**. This timestamp is release metadata, not infrastructure uptime.

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
-> npm install
-> TypeScript typecheck
-> Vite build
-> verify frontend/app/dist/
-> checkout Jeysibn/jeysibn.github.io@main using PAGES_DEPLOY_TOKEN
-> rsync --delete dist/ into publication repository root
-> create .nojekyll
-> commit generated site if changed
-> push publication repository main
-> curl https://jeysibn.github.io/
-> verify expected Jerome Ibon page content
```

The Pages repository is treated as generated deployment output. Source edits belong in `Jeysibn/portfolio`, not directly in `Jeysibn/jeysibn.github.io`.

`PAGES_DEPLOY_TOKEN` is a GitHub Actions secret used only to authenticate the cross-repository checkout/push. It is separate from Azure authentication and must not be exposed in source, logs, or documentation.

Every new frontend build receives a fresh build timestamp, so the visible Release age counter resets with each release.

The live-page verification means a successful push to the publication repository alone is not considered sufficient evidence of a successful frontend release.

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
5. fails the deployment if runtime verification fails.

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

The Vite build contains the application JavaScript/CSS and static public assets. Large project architecture PNGs are not bundled into the application artifact because they are referenced as public external assets.

Normal project rendering uses resized WebP preview URLs so users do not download the full-resolution PNGs during ordinary browsing. The original PNG is requested only when the user explicitly opens architecture zoom.

This behavior is application-level optimization rather than a separate deployment job. CI still validates the frontend through the normal TypeScript and Vite build pipeline.

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
   |      -> Jeysibn/jeysibn.github.io
   |      -> https://jeysibn.github.io/ smoke check
   |
   +--> Azure Functions deploy
   |      -> health/API smoke checks
   |
   +--> Terraform plan -> apply
```

The core rule is simple: validation happens before merge, production mutation happens only after merge to `main`, generated frontend output is published to the dedicated Pages repository, and deployment success is followed by runtime verification where practical.
