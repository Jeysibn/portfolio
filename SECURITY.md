# Security Policy

## Scope

This repository contains a public portfolio application, its Azure Functions backend, Terraform infrastructure configuration, and the CI/CD logic that publishes the generated frontend to the dedicated GitHub Pages repository `Jeysibn/jeysibn.github.io`.

## Reporting a Security Issue

If you discover a security issue, please avoid posting credentials, exploit details, or sensitive logs in a public GitHub issue.

For this personal project, contact the repository owner directly through the contact information published on the portfolio or LinkedIn profile and provide:

- a short description of the issue;
- affected component or endpoint;
- steps to reproduce;
- potential impact;
- any suggested mitigation.

## Secrets and Credentials

The repository must not contain reusable credentials or local secret files.

Examples that must remain outside Git include:

- Azure access tokens;
- service principal client secrets;
- API keys;
- GitHub cross-repository deployment tokens;
- `backend/local.settings.json`;
- secret-bearing `.env` files;
- Terraform state files;
- local Azure CLI credential caches.

Production GitHub Actions authenticate to Azure using OIDC workload identity federation rather than a stored Azure client secret.

### Frontend publication credential

Frontend publication is a separate trust boundary from Azure deployment.

The `frontend-deploy.yml` workflow builds the Vite artifact in `Jeysibn/portfolio`, then uses the repository secret `PAGES_DEPLOY_TOKEN` to check out and push generated output to `Jeysibn/jeysibn.github.io`.

`PAGES_DEPLOY_TOKEN`:

- must remain only in GitHub Actions Secrets;
- must never be committed or printed in logs;
- is not used for Azure authentication;
- exists only to enable the cross-repository publication step;
- should be replaced/revoked if exposure is suspected.

The source repository remains authoritative. The publication repository should contain generated site output rather than independently maintained application source.

### Application secret flow

Application secrets are handled separately from both Azure workload identity and Pages publication. The AI provider key follows this runtime path:

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
Azure Function App application setting
```

The API key must never be committed to Terraform source, workflow YAML, documentation, or committed `.tfvars` files.

Because Terraform manages the Function App application setting, the secret value is also represented in Terraform state. The remote Terraform backend must therefore be treated as sensitive infrastructure data and access should be restricted accordingly.

Terraform's `sensitive = true` marking reduces accidental CLI/output disclosure but does not remove the value from state.

## Production Controls

- `main` is protected and accepts changes through pull requests.
- Production-readiness checks must pass before merge.
- Pull requests may authenticate to Azure for Terraform planning but do not apply infrastructure.
- Dependabot pull requests perform Terraform validation without Azure authentication or remote-state planning because repository secrets are intentionally unavailable to Dependabot.
- Production infrastructure mutation occurs only from the post-merge `main` workflow.
- GitHub Environment and Entra federated identity subjects restrict eligible Azure production workflows.
- Frontend production output is generated from `main` and published to `Jeysibn/jeysibn.github.io` by workflow rather than maintained manually in two repositories.
- Frontend publication and Azure deployment use separate credentials and trust paths.

## Frontend Asset Security

Large architecture diagrams are public portfolio assets. Normal project browsing uses resized WebP previews from `wsrv.nl`, while the original public GitHub-hosted PNG is used for explicit full-resolution zoom.

Only public image URLs are sent to the image-resize service. No API keys, Azure tokens, connection strings, visitor identifiers, prompts, or other private application data should be included in preview URLs.

If the preview service becomes unavailable or untrusted, the application should be able to move to locally generated previews without changing backend security boundaries.

## Application Data

The visitor counter hashes client IP addresses before persistence. The application does not intentionally store raw visitor IP addresses in Cosmos DB.

Temporary visitor/rate-limit records use a Cosmos DB TTL to reduce retention.

## Dependency Security

Pull-request validation includes Python dependency auditing. Dependency updates should be reviewed and tested through the normal `dev -> main` workflow.

Generated frontend build artifacts and TypeScript build cache files are not source and should remain excluded from this repository except for the intentionally generated publication output written to `Jeysibn/jeysibn.github.io` by CI/CD.

## Supported Version

The current production version on `main` is the supported version of this portfolio project.
