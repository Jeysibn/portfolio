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

- [x] Add a Cosmos `DefaultAzureCredential` path and a database-scoped custom data role while preserving connection-string rollback.
- [ ] Complete the Cosmos production identity cutover after the production plan, RBAC propagation, and live read/write verification; remove the fallback only after stability is confirmed.
- [ ] Replace the Function Consumption host storage key only through a separately validated Azure Files/hosting-plan migration.
- [ ] Move the third-party AI key from Terraform-managed app settings to Key Vault reference.
- [x] Add frontend ESLint, Vitest/RTL, Playwright, axe, and a lightweight performance budget.
- [x] Add a 1200×630 PNG social preview to the Vite public artifact.
- [ ] Add a legitimate homelab failure/recovery case study once measured evidence exists.
- [x] Run browser, accessibility, responsive, and targeted visual QA in CI or an interactive browser environment.

## Baseline notes

- The repository default branch is `main`; the production hardening review was based on its fetched current state.
- Direct HTTP inspection of `https://jeysibn.github.io/` returned the current Pages document. Interactive browser checks were run against the local production preview; the connector itself could not open the live page.
- Existing strengths retained: OIDC deployment, Terraform-managed Azure resources, Application Insights/Log Analytics, native dialogs, reduced-motion handling, textual architecture alternatives, and deployment smoke verification.
