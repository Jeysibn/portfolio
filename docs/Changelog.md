# Changelog

All notable changes to the **Cloud-Backed Portfolio** project are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and the project uses semantic versioning for release history.

---

## [Unreleased]

### Added

- **Dedicated GitHub Pages deployment repository**: Frontend production publishing now targets `Jeysibn/jeysibn.github.io`, allowing the portfolio to use the root URL `https://jeysibn.github.io/` while keeping application source and CI/CD in `Jeysibn/portfolio`.
- **Pages publish credential**: Added the `PAGES_DEPLOY_TOKEN` workflow secret boundary for authenticated checkout/push to the dedicated Pages repository.
- **Optimized architecture previews**: Project cards and normal project-detail views now request resized WebP previews instead of immediately downloading the original multi-megabyte PNG diagrams.
- **Deferred full-resolution architecture loading**: Original architecture PNGs are loaded only after the visitor explicitly opens the architecture zoom.
- **Static frontend assets**: Added a generated resume PDF, favicon, and social-preview asset to the Vite public output.

### Changed

- **Hero information hierarchy**: The primary hero headline is now **Jerome Christian Ibon**. Cloud Support, DevOps, and Cloud Engineering are supporting positioning rather than replacing the portfolio owner’s identity.
- **Hero copy**: Removed the large “Aspiring Cloud & DevOps Engineer” headline and moved entry-level context into the opportunity/status copy instead of making seniority the dominant message.
- **Navigation order**: The page/navigation flow is now About → Projects → Experience → Skills → Certifications → Resume → Contact.
- **Navigation alignment**: Header navigation scrolls sections to the start of the viewport below the sticky header rather than centering section headings.
- **Active navigation behavior**: No navigation item is shown as active while the visitor is still inside the hero.
- **Theme control**: Replaced the visible theme dropdown treatment with a compact icon control while retaining saved theme behavior and initial system-preference fallback.
- **Project cards**: Refined the project showcase into larger architecture-first cards with a clear whole-card interaction cue and preserved project-detail dialogs.
- **Hero monitoring responsiveness**: Restored the original monitoring-card visual language and changed phone layouts to a single-column metric presentation for reliable separators and readable values.
- **About section composition**: Preserved the side-by-side desktop design while tightening heading/body spacing and aligning the terminal-style `cat philosophy.txt` principles card with the About copy.
- **Frontend deployment flow**: The production workflow now builds `frontend/app/dist/`, checks out `Jeysibn/jeysibn.github.io`, synchronizes the generated artifact with `rsync --delete`, commits the result, pushes to the Pages repository, and verifies the root production URL.
- **Frontend local-performance guidance**: Production-style local comparisons now use `npm run build` + `npm run preview` instead of judging request count from Vite development mode.

### Fixed

- **Hero refresh headline flash**: Removed the one-frame timing gap between the initial React render and the compatibility copy update so rapid refreshes no longer expose the stale “Aspiring Cloud & DevOps Engineer” headline before the current name-first hero appears.
- **Theme interaction scroll jump**: Theme-button interaction now prevents the unwanted page movement that could occur when opening/changing the theme control.
- **Certification navigation target**: Certification navigation resolves to the Education & Certifications section instead of an inconsistent anchor position.
- **Mobile monitoring separators**: Removed conflicting multi-column separator geometry on small screens.
- **About spacing regression**: Reduced excessive empty space between the About heading and its content.
- **Architecture asset mismatch**: Corrected project architecture references so existing image assets are used instead of requesting a missing file format.
- **Closed chatbot interaction boundary**: Retained pointer-event isolation so the hidden assistant cannot block underlying page controls.

### Removed

- **Obsolete `ui-adjustments.ts` module**: Consolidated its small runtime behavior into the active frontend entrypoint and removed the extra development module request.
- **Tracked TypeScript build cache**: Removed `frontend/app/tsconfig.tsbuildinfo` from source control and added `*.tsbuildinfo` to `.gitignore`.

### Security

- **Separated Pages publishing from Azure authentication**: Azure deployments continue using OIDC; the dedicated Pages repository uses only the `PAGES_DEPLOY_TOKEN` GitHub Actions secret required for frontend publication.
- **Full-resolution diagrams remain source-controlled**: The preview service receives public diagram URLs only; no application secrets or Azure credentials are involved in image transformation.

### Operations

- **Root-domain smoke test**: Frontend deployment verification now checks `https://jeysibn.github.io/` after publishing the generated site to the dedicated Pages repository.
- **Preview/full-resolution asset split**: Normal browsing uses lightweight previews while explicit zoom remains the path to full-resolution diagrams, reducing ordinary page-transfer cost.
- **Documentation sync**: README, architecture, CI/CD, runbook, contribution, security, and changelog documentation were updated to match the current `dev` implementation.

---

## [1.5.0] - 2026-08-17

### Added

- **React + TypeScript single-page frontend**: Completed the Vite-powered React migration with strict TypeScript, typed content models, anchor navigation, and production-only `dist/` deployment to GitHub Pages.
- **Live production monitoring card**: Added a hero status panel backed by the real Azure Functions `/api/health` endpoint.
- **Release age metadata**: Added a Vite build timestamp used by the frontend to show release age. The value resets on every frontend release and is explicitly not presented as server uptime.
- **Live Manila time**: Added current Manila time to the monitoring panel as client-side context.
- **Interactive project details**: Entire project cards now open centered project-detail dialogs; architecture images zoom in-page instead of navigating to raw image URLs.
- **Detailed skill inspection**: Skill capability cards now open keyboard-accessible dialogs with category context and per-tool descriptions.
- **Certification cards**: Added individual provider-styled credential cards with hover/focus descriptions.
- **Full on-page resume**: The resume is visible directly in the portfolio while retaining print/save output.
- **Opportunity-focused contact experience**: Added an explicit Open to opportunities state and a direct hero Contact CTA.
- **Application Insights + Log Analytics**: Added workspace-based Application Insights and a dedicated Log Analytics workspace through Terraform.
- **Health endpoint**: Added `GET /api/health` as a dependency-independent Function App liveness endpoint.
- **Post-deployment verification**: Backend deployment validates health and visitor APIs after Azure Functions deployment; frontend deployment verifies the live GitHub Pages document.

### Changed

- **Frontend design system**: Reworked the deployed experience into a terminal-inspired Cloud/DevOps visual system while keeping content readable and portfolio-first.
- **Hero positioning**: Updated the headline to position Jerome as an aspiring Cloud & DevOps Engineer rather than implying senior-level production ownership.
- **Motion behavior**: Reduced persistent scroll-linked movement after usability review. Content uses restrained one-time reveals while the subtle background remains responsive to scrolling.
- **Theme accessibility**: Strengthened Light mode contrast and corrected native theme-selector option colors in Dark mode.
- **Project interaction**: Removed case-study wording and separate project CTA text; the whole project card is now the direct project-detail trigger.
- **AI assistant UI**: Migrated session history, request state, rate-limit responses, and errors to React while retaining provider-neutral branding.
- **Visitor counter UI**: Migrated the counter to React with explicit checking and unavailable states.
- **Frontend production build**: GitHub Pages now deploys only `frontend/app/dist/` rather than source frontend files.
- **Frontend CI/CD**: Development and production-readiness workflows install dependencies, run strict TypeScript checks, build with Vite, and verify the generated artifact.
- **Expanded AI knowledge base**: Added richer project, homelab, career, technical-skill, availability, and recruiter FAQ context.
- **Terraform-managed AI configuration**: Added the AI provider API key as a sensitive Terraform input populated from GitHub Actions `OPENCODE_API_KEY` through `TF_VAR_opencode_api_key`.
- **Runtime-safe AI initialization**: Changed AI client creation from import time to lazy request time so optional AI configuration failures cannot prevent unrelated Azure Function routes from indexing.

### Fixed

- **Closed chatbot click shield**: Fixed the hidden chat container so it no longer blocks interaction with content underneath when closed.
- **Theme selector readability**: Fixed unreadable white-on-white native select options in Dark mode.
- **Project architecture preview**: Removed the forced white preview surface and kept architecture viewing inside the application.
- **Motion comfort**: Removed continuous card/text drift that could cause visual discomfort while scrolling.
- **Azure Function route discovery**: Preserved route indexing when optional AI configuration is unavailable by avoiding import-time AI client initialization.
- **Frontend counter error handling**: HTTP failures now surface as service failures instead of misleading JSON parsing errors.

### Removed

- **Legacy multi-page frontend**: Removed the old `frontend/index.html`, `frontend/projects.html`, `frontend/resume.html`, standalone chat/counter scripts, and legacy stylesheet after React reached parity.
- **Decorative project architecture artwork**: Removed the hero/project artwork that competed with the portfolio content.
- **Scroll progress bar**: Removed the top-of-page progress indicator after design review.
- **Visible case-study labels**: Removed case-study wording from project cards and accessible card labels because the project content is presented as project details rather than a formal case study.

### Security

- **GitHub-managed application secret**: `OPENCODE_API_KEY` remains stored in GitHub Actions Secrets and injected into Terraform at workflow runtime rather than committed to the repository.
- **Sensitive Terraform state**: Terraform-managed Function App settings can be represented in remote state, so backend access remains restricted.
- **Secret-free frontend bundle**: AI provider keys and Azure connection strings remain server-side.

### Operations

- **Telemetry cost guardrails**: Log Analytics uses 30-day retention and a `0.1 GB/day` ingestion cap with Application Insights sampling controls.
- **Structured runtime events**: Correlation IDs and structured operational logging cover health, visitor, AI, rate-limit, and failure events without logging sensitive request content.
- **Post-release documentation sync**: Updated README, architecture, CI/CD, observability, runbook, contribution guidance, and changelog to describe the deployed 1.5.0 state.

---

## [1.4.0] - 2026-08-16

### Added

- Professional root README covering architecture, repository structure, CI/CD, security, local development, Terraform bootstrap, and operations.
- `docs/architecture.md`, `docs/cicd.md`, `docs/azure-oidc.md`, `docs/runbook.md`, governance documents, Dependabot configuration, and backend unit tests.
- Explicit Terraform CLI version constraints.

### Changed

- Backend tests became mandatory in Development CI and production-readiness validation.
- Production backend dependencies were pinned to the versions proven by successful Azure Function deployment.
- Git ignore coverage was expanded for environments, secrets, caches, Terraform artifacts, editor files, and build output.

### Removed

- Tracked Python virtual environment.
- Local package-installer artifact.
- Temporary OIDC validation workflow after production federation was proven.

---

## [1.3.0] - 2026-08-16

### Added

- `dev` / `main` two-branch CI/CD model.
- Development CI for frontend, backend, and Terraform validation.
- Production-readiness pull request workflow.
- Authenticated Terraform planning against remote state using Azure OIDC.
- Protected `main` branch release gate.

### Changed

- Split frontend, backend, and Terraform production deployment into path-specific workflows.
- Migrated Azure deployment authentication from reusable credentials to short-lived GitHub OIDC federation.

### Security

- Removed the need for a reusable Azure service-principal client secret in deployment workflows.
- Constrained production changes through protected pull requests and required checks.

---

## [1.2.0] - 2026-08-14

### Added

- Expanded portfolio project showcase with a second project and architecture details.

---

## [1.1.0] - 2026-08-10

### Changed

- Upgraded visitor counting to track unique visitors by hashed IP-derived identity.

### Added

- 24-hour TTL-based visitor deduplication to reduce counter inflation and spam requests.

---

## [1.0.0] - 2026-08-01

### Added

- Initial Cloud-Backed Portfolio release.
- Static responsive frontend hosted on GitHub Pages.
- Dark/Light theme support.
- Python Azure Functions backend.
- Azure Cosmos DB visitor counter.
- Terraform infrastructure as code.
- GitHub Actions build and deployment automation.
