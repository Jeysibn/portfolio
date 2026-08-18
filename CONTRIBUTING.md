# Contributing

This repository is primarily maintained as a personal Cloud and DevOps portfolio, but the development workflow is documented so changes remain consistent and reproducible.

## Branching Model

Use the two long-lived branches as follows:

- `dev` — development and integration
- `main` — protected production

Use a scoped feature branch for larger or review-heavy work when needed, then merge it into `dev`. Production changes reach `main` through a `dev -> main` pull request.

Do not make experimental UI, backend, or infrastructure changes directly on `main`.

## Development Workflow

1. Update local `dev`.
2. Create a focused feature branch when the change benefits from isolated review.
3. Make the smallest coherent change.
4. Run relevant local validation.
5. Commit with a clear message.
6. Open a pull request targeting `dev` when using a feature branch.
7. Allow Development CI to validate frontend, backend, and Terraform surfaces.
8. Merge into `dev` after the change is reviewed and green.
9. Open a `dev -> main` pull request for production release.
10. Review the authenticated Terraform plan when infrastructure is affected.
11. Merge only after the required `Production Ready` check passes.

## Local Validation

### Frontend

Use Node.js **22.12+**. Node 18 is unsupported by the current Vite toolchain.

```bash
cd frontend/app
npm install
npm run typecheck
npm run build
```

For interactive local review:

```bash
npm run dev
```

For production-style bundle/network review:

```bash
npm run build
npm run preview
```

Vite development mode intentionally serves source modules separately and uses hot-module-reload traffic. Do not compare `npm run dev` request count directly with the deployed production site.

The frontend is a React + TypeScript single-page application. The old standalone HTML/JavaScript validation commands are no longer applicable.

Generated build files such as `frontend/app/dist/` and `*.tsbuildinfo` are not source files and must remain untracked.

### Backend

```bash
cd backend
ruff check .
pytest -v
```

### Terraform

```bash
cd terraform
terraform fmt -check -recursive
terraform init -backend=false
terraform validate
```

Use the real remote backend only when intentionally reviewing production state.

## Frontend Review Expectations

UI changes should be checked in both Dark and Light themes and at desktop/mobile breakpoints.

For interactive changes, verify where relevant:

- the name-first hero remains readable and keeps `Jerome Christian Ibon` as the primary identity;
- navigation order and section-start scrolling remain correct;
- no navigation item is active while the visitor is still in the hero;
- keyboard focus is visible;
- `prefers-reduced-motion` remains respected;
- closed overlays do not block page interaction;
- project and skill dialogs open and close correctly;
- project cards use lightweight architecture previews during ordinary browsing;
- full-resolution architecture images load only when the explicit architecture zoom is opened;
- the visitor counter and AI assistant still function;
- the health panel does not imply dependency health that `/api/health` does not test;
- Release age is described as build/release metadata, not server uptime;
- the monitoring card remains readable on phone widths;
- About heading/body spacing and the engineering-principles card remain balanced across breakpoints;
- the compact theme control does not cause scroll jumps or focus-related page movement.

When measuring frontend network behavior, test `npm run preview` with browser cache disabled. Treat architecture preview traffic separately from Azure API traffic.

## Frontend Publication

Frontend source is maintained in this repository, but production static output is published to the dedicated repository:

```text
Source repository:      Jeysibn/portfolio
Publication repository: Jeysibn/jeysibn.github.io
Live URL:               https://jeysibn.github.io/
```

Do not manually maintain a second copy of application source in `Jeysibn/jeysibn.github.io`. The production workflow builds `frontend/app/dist/`, synchronizes it into the publication repository, commits generated output, and verifies the live root URL.

The cross-repository publish credential is stored as the GitHub Actions secret `PAGES_DEPLOY_TOKEN`. Never place its value in source, documentation, screenshots, or logs.

## Commit Messages

Use concise, intent-focused messages such as:

```text
feat: add project interaction
fix: preserve theme selector contrast
perf: defer full architecture images
test: cover visitor deduplication
docs: sync deployed architecture
ci: publish frontend to dedicated Pages repo
chore: remove obsolete frontend artifacts
```

## Infrastructure Changes

Do not run unreviewed `terraform apply` commands against production merely to bypass CI/CD.

Infrastructure changes should be represented in Terraform configuration, reviewed through the PR plan, and applied by the `main` production workflow.

## Secrets

Never commit:

- Azure credentials or tokens;
- API keys;
- GitHub cross-repository deployment tokens;
- `local.settings.json`;
- `.env` files containing secrets;
- Terraform state files;
- downloaded cloud credential files.

Application secrets managed by Terraform must originate from a secure external source such as GitHub Actions Secrets. `OPENCODE_API_KEY`, for example, is exposed to Terraform at workflow runtime through `TF_VAR_opencode_api_key` and then configured as a Function App application setting.

Do not place real secret values in `.tf` files, workflow YAML, committed `.tfvars` files, documentation, or CI logs.

Because Terraform-managed secrets can be represented in state, treat the remote Terraform backend as sensitive and do not expose state contents during troubleshooting.

Manual Azure Portal changes should not become the normal source of truth for settings Terraform owns. Prefer correcting the GitHub Secret, workflow input, or Terraform configuration and allowing the normal pipeline to converge production.

## Documentation

Changes that materially alter architecture, deployment, authentication, application-secret handling, observability, frontend behavior, performance strategy, or operations should update the relevant document under `docs/`, the root README when appropriate, and `docs/Changelog.md` for release-visible changes.

After a production release, documentation should describe the deployed behavior rather than an earlier preview or milestone state.
