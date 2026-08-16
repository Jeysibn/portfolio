# Azure OIDC Authentication

## Purpose

GitHub Actions authenticates to Microsoft Azure using OpenID Connect (OIDC) workload identity federation instead of a stored Azure client secret.

This removes the need to keep a reusable service principal password in GitHub Secrets.

OIDC secures Azure workload authentication, but it does not eliminate unrelated application secrets. The portfolio still stores the AI provider API key as a GitHub Actions secret and injects it separately into Terraform.

## Trust Flow

```text
GitHub Actions job
    |
    | requests OIDC token
    v
GitHub OIDC provider
    |
    | signed short-lived token
    v
Microsoft Entra ID
    |
    | validates issuer, audience and subject
    v
Azure service principal
    |
    v
Azure RBAC
```

## GitHub Secrets

The Azure login workflows use identifiers rather than an Azure client secret:

```text
AZURE_CLIENT_ID
AZURE_TENANT_ID
AZURE_SUBSCRIPTION_ID
```

The application also uses:

```text
OPENCODE_API_KEY
```

`OPENCODE_API_KEY` is not used for Azure authentication. It is an application secret passed to Terraform as `TF_VAR_opencode_api_key` and then configured as an Azure Function App application setting.

The workflow requires:

```yaml
permissions:
  contents: read
  id-token: write
```

and authenticates with:

```yaml
- name: Login to Azure using OIDC
  uses: azure/login@v3
  with:
    client-id: ${{ secrets.AZURE_CLIENT_ID }}
    tenant-id: ${{ secrets.AZURE_TENANT_ID }}
    subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
```

## Federated Identity Subjects

The repository currently uses GitHub immutable OIDC subjects.

### Production

Production jobs reference the GitHub `production` environment.

```text
repo:Jeysibn@184398348/portfolio@1312957789:environment:production
```

This credential is used by deployment jobs that are allowed to operate in the protected production environment.

### Pull Request Terraform Plan

Pull-request Terraform planning uses:

```text
repo:Jeysibn@184398348/portfolio@1312957789:pull_request
```

This allows the PR workflow to authenticate and inspect real infrastructure state while keeping `terraform apply` out of the PR pipeline.

Dependabot pull requests do not use this Azure-authenticated path because repository secrets are not provided to Dependabot. They perform local Terraform validation with the backend disabled instead.

## Audience and Issuer

The federated credentials use:

```text
Issuer:   https://token.actions.githubusercontent.com
Audience: api://AzureADTokenExchange
```

The subject presented by GitHub must match the configured Entra federated identity credential exactly.

## Azure RBAC

The service principal must have enough Azure RBAC permissions for the operation being performed.

Terraform needs management-plane access for resources it manages and access to the Azure Blob container used for remote state. Production backend deployment also needs permission to deploy to the Azure Function App.

Permissions should be narrowed as the project matures rather than expanded to Owner unnecessarily. The current PR planning identity shares the production service principal, so a future hardening step is to separate or further restrict PR planning permissions.

## Application Secret Flow

The AI provider key is separate from OIDC and follows this path:

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

Because Terraform manages this application setting, the secret value is present in Terraform state. The remote state backend must therefore be protected as sensitive infrastructure data.

## Troubleshooting

### `AADSTS700213: No matching federated identity record found`

This almost always means the OIDC `subject`, `issuer`, or `audience` presented by GitHub does not exactly match an Entra federated credential.

The GitHub Actions `azure/login` logs display the token details, including the actual subject claim. Treat that value as the source of truth.

### Login succeeds but Terraform cannot access state

OIDC authentication and authorization are separate concerns. Successful login proves identity federation works, but the principal may still lack Azure RBAC permissions to the state storage account/container.

### Login succeeds but deployment is denied

Check the service principal's role assignments at the target subscription, resource group, or resource scope.

### Terraform reports a missing AI API key

Verify that `OPENCODE_API_KEY` exists as a GitHub Actions repository secret and that the workflow passes it as `TF_VAR_opencode_api_key`. Do not print the secret value into logs while troubleshooting.

## Security Notes

- Do not create a client secret merely to make CI easier; OIDC is the intended Azure authentication method.
- Do not confuse OIDC with application-secret management; third-party API keys still require a secure lifecycle.
- Do not commit Azure access tokens, API keys, local Azure CLI caches, or secret-bearing `.tfvars` files.
- Keep production GitHub Environment protections enabled.
- Treat Terraform remote state as sensitive because it can contain managed secret values.
- Review Azure role assignments when adding new Terraform-managed services.
