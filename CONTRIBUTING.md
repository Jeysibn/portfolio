# Contributing

This repository is primarily maintained as a personal Cloud and DevOps portfolio, but the development workflow is documented so changes remain consistent and reproducible.

## Branching Model

Use the two long-lived branches as follows:

- `dev` — development and integration
- `main` — protected production

Routine work is committed to `dev`. Production changes reach `main` through a pull request.

## Development Workflow

1. Update local `dev`.
2. Make the smallest coherent change.
3. Run relevant local validation.
4. Commit with a clear message.
5. Push to `dev` and allow Development CI to run.
6. Open a pull request from `dev` to `main`.
7. Review the authenticated Terraform plan when infrastructure is affected.
8. Merge only after the required `Production Ready` check passes.

## Local Validation

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

### Frontend

```bash
npx --yes htmlhint "frontend/**/*.html"
node --check frontend/js/chat.js
node --check frontend/js/counter.js
```

## Commit Messages

Use concise, intent-focused messages such as:

```text
feat: add visitor analytics panel
fix: handle Cosmos throttling response
test: cover visitor deduplication
docs: document Terraform state recovery
ci: add authenticated Terraform PR plan
chore: remove tracked development artifacts
```

## Infrastructure Changes

Do not run unreviewed `terraform apply` commands against production merely to bypass CI/CD.

Infrastructure changes should be represented in the Terraform configuration, reviewed through the PR plan, and applied by the `main` production workflow.

## Secrets

Never commit:

- Azure credentials or tokens;
- API keys;
- `local.settings.json`;
- `.env` files containing secrets;
- Terraform state files;
- downloaded cloud credential files.

Application secrets managed by Terraform must originate from a secure external source such as GitHub Actions Secrets. For example, `OPENCODE_API_KEY` is exposed to Terraform at workflow runtime through `TF_VAR_opencode_api_key` and then configured as a Function App application setting.

Do not place real secret values in `.tf` files, workflow YAML, committed `.tfvars` files, documentation, or CI logs.

Because Terraform-managed secrets can be represented in state, treat the remote Terraform backend as sensitive and do not expose state contents during troubleshooting.

Manual Azure Portal changes should not become the normal source of truth for application settings that Terraform owns. Prefer correcting the GitHub Secret, workflow input, or Terraform configuration and then allowing the normal pipeline to converge production.

## Documentation

Changes that materially alter architecture, deployment, authentication, application-secret handling, or operations should update the relevant document under `docs/` and the changelog when appropriate.
