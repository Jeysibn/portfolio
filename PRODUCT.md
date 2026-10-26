# Product

<!-- impeccable:product-schema 1 -->

> **Status:** the visual concept is now **JEYSIBN / Engineered Simplicity, Quiet Motion** ([`docs/redesign/MASTER_PLAN.md`](docs/redesign/MASTER_PLAN.md), `DESIGN.md`). The earlier "Infrastructure in Motion" concept, signal path, Signal Rail, project deck and orbital capability map have been removed.

## Platform

web

## Users

Recruiters, hiring managers, Cloud/DevOps engineers, and engineering managers evaluating Jerome Christian Ibon for entry-level Cloud Engineering, Cloud Support, DevOps, and related infrastructure/platform roles.

## Product Purpose

Present Jerome's factual experience, projects, capabilities, credentials, resume, and contact paths in a memorable portfolio that itself demonstrates frontend craft and engineering quality. A visitor should quickly understand that Jerome works with infrastructure and operations, builds real systems, and is pursuing entry-level—not senior—roles.

## Positioning

The portfolio is also a functioning cloud engineering case study: a React and TypeScript frontend connected to Azure Functions, Cosmos DB, an AI portfolio assistant, Azure observability, Terraform-managed infrastructure, and GitHub Actions delivery using OIDC.

## Operating Context

The experience is a single-page portfolio deployed at `jeysibn.github.io`. Recruiters may scan quickly, while technical visitors may inspect project architecture, detailed skills, production metadata, the resume, and the assistant.

## Capabilities and Constraints

- Preserve GitHub Pages deployment, Azure Functions API contracts, visitor counter, assistant history/error behavior including bounded timeout and cancellation, explicit light/dark theme behavior, active-section navigation, project and skill details, resume download, direct external contact links, accessibility behavior, and real health metadata.
- Keep frontend content data-driven and derived from repository facts.
- Do not fabricate experience, scale, metrics, employment, certifications, technologies, customers, or achievements.
- Do not change backend, Terraform, or deployment workflows unless the frontend architecture genuinely requires it.
- Node 22 is the CI/runtime target. The Vite build artifact remains `frontend/app/dist/` and is synchronized to the separate GitHub Pages repository.

## Brand Commitments

- Name: Jerome Christian Ibon / Jeysibn.
- Visual concept: “Engineered Simplicity, Quiet Motion.”
- Signature: a small `JI` lettermark and `JEYSIBN` wordmark, condensed uppercase display type, near-black grain and a soft light pool.
- Monochrome, poster-like and personal, not terminal-themed, cyberpunk, generic SaaS, or template-like.
- Both light and dark modes must be intentionally designed.

## Evidence on Hand

- Portfolio facts and structured content: `frontend/app/src/portfolio.ts` and `frontend/app/src/skill-details.ts`.
- API behavior: `frontend/app/src/api.ts`, `frontend/app/src/hooks.ts`, and backend routes.
- Cloud portfolio architecture diagram: `frontend/assets/architectural-diagram-cloudbacked-portfolio.svg` and `.png`.
- Published resume PDF: `frontend/app/public/resume.pdf` (a static file; no generation script exists in the repository, and its content was compared on 2026-10-26 and conflicts with the page on role titles; it awaits Jerome's approved replacement, see `docs/redesign/DECISIONS.md`).
- Deployment and infrastructure evidence: `.github/workflows/`, `docs/`, `backend/`, and `terraform/`.

## Product Principles

- Prove engineering judgment through real systems and truthful detail.
- Make essential information immediately scannable, then provide progressive depth.
- Use motion sparingly to support entrance, focus and user action, never to gate facts.
- Treat performance, accessibility, and graceful degradation as part of the portfolio's engineering message.
- Preserve one factual source of truth for portfolio content.
- Keep the recruiter scan path readable from 320px to 1920×1080: identity, work, experience, toolkit, then contact, without opening any dialog.

## Accessibility & Inclusion

Semantic structure, logical headings, keyboard operability, visible focus, accessible dialogs/panels, sufficient contrast, touch-friendly controls, non-hover alternatives, and thoughtfully designed `prefers-reduced-motion` behavior are required.
