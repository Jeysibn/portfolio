# Security Policy

## Scope

This repository contains a public portfolio application, its Azure Functions backend, and Terraform infrastructure configuration.

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
- `backend/local.settings.json`;
- secret-bearing `.env` files;
- Terraform state files;
- local Azure CLI credential caches.

Production GitHub Actions authenticate to Azure using OIDC workload identity federation rather than a stored Azure client secret.

## Production Controls

- `main` is protected and accepts changes through pull requests.
- Production-readiness checks must pass before merge.
- Pull requests may authenticate to Azure for Terraform planning but do not apply infrastructure.
- Production infrastructure mutation occurs only from the post-merge `main` workflow.
- GitHub Environment and Entra federated identity subjects restrict eligible production workflows.

## Application Data

The visitor counter hashes client IP addresses before persistence. The application does not intentionally store raw visitor IP addresses in Cosmos DB.

Temporary visitor/rate-limit records use a Cosmos DB TTL to reduce retention.

## Dependency Security

Pull-request validation includes Python dependency auditing. Dependency updates should be reviewed and tested through the normal `dev -> main` workflow.

## Supported Version

The current production version on `main` is the supported version of this portfolio project.
