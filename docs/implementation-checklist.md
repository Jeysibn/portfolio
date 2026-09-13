# Portfolio hardening checklist

Tracked baseline and implementation record for the production portfolio improvement mission.

## Completed in this pass

- [x] Validate AI JSON, shape, message, history, and size before Cosmos quota work.
- [x] Prevent AI provider calls when the Cosmos rate-limit commit exhausts concurrency retries.
- [x] Use keyed HMAC pseudonyms for visitor and rate-limit identities.
- [x] Claim visitor identities atomically before incrementing the shared counter.
- [x] Correct visitor terminology to approximately 24-hour unique visits.
- [x] Reorder the recruiter path so projects and operational evidence precede principles.
- [x] Replace internal milestone wording in recruiter-facing project content.
- [x] Add canonical, robots, Open Graph PNG, Twitter alt text, and ProfilePage/Person JSON-LD metadata.
- [x] Reduce project chapter minimum height without removing architecture detail.
- [x] Record the implementation and verification status in the Obsidian engineering note.

## Remaining / intentionally deferred

- [ ] Replace Cosmos and Function storage access keys with managed identity/RBAC after provider-version validation.
- [ ] Move the third-party AI key from Terraform-managed app settings to Key Vault reference.
- [ ] Add frontend ESLint, Vitest/RTL, Playwright, axe, and a lightweight performance budget.
- [x] Add a 1200×630 PNG social preview to the Vite public artifact.
- [ ] Add a legitimate homelab failure/recovery case study once measured evidence exists.
- [ ] Run browser, accessibility, responsive, and live production visual QA in CI or an interactive browser environment.

## Baseline notes

- The inspected worktree was clean on branch `dev`; the requested `main` branch is not the checked-out branch.
- Live-site browser inspection was unavailable from the connector and direct HTTP access did not provide a usable page response during the audit.
- Existing strengths retained: OIDC deployment, Terraform-managed Azure resources, Application Insights/Log Analytics, native dialogs, reduced-motion handling, textual architecture alternatives, and deployment smoke verification.
