# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The primary users are recruiters and HR reviewers who need to understand Jerome Christian Ibon's role direction, experience, work, availability, and contact details within seconds. Technical hiring managers in Cloud, DevOps, Platform, Infrastructure, SRE, and support engineering are the secondary audience; they need inspectable evidence of what Jerome implemented and how he approaches operations.

## Product Purpose

The portfolio presents Jerome for entry-level Cloud Support, DevOps, Cloud Engineering, Platform, and Infrastructure roles. It must communicate capability and trajectory through real projects, employment history, credentials, source repositories, and the engineering of the site itself. It succeeds when a recruiter can scan it quickly and a technical reviewer can continue into credible project detail.

## Positioning

Jerome is a Computer Engineering graduate who learns cloud and operations work by shipping and operating real personal systems. The portfolio demonstrates infrastructure provisioning, automated delivery, observability, serverless APIs, GitOps, Kubernetes, troubleshooting, and operational documentation without presenting him as a senior engineer.

## Operating Context

The site is both a candidate portfolio and a running engineering project. Its frontend is published through GitHub Pages; its dynamic features use Azure Functions and Cosmos DB; infrastructure is managed with Terraform; delivery uses GitHub Actions and Azure OIDC; telemetry uses Application Insights and Log Analytics. A separate homelab repository documents a current single-node K3s environment on Proxmox, with Argo CD, infrastructure automation, networking, storage, DNS, and observability.

## Capabilities and Constraints

- Preserve React, TypeScript, Vite, GitHub Pages, current API contracts, and CI/CD compatibility.
- Preserve direct resume access, contact links, visitor functionality, health functionality where presented accurately, and the AI portfolio assistant.
- Dedicated project pages must work through static output and direct navigation on GitHub Pages without requiring a client-side router.
- Keep runtime dependencies minimal and do not rewrite unrelated backend or cloud infrastructure.
- Use only facts supported by the repositories or explicitly supplied by Jerome. Flag contradictions instead of inventing replacements.
- The current homelab is single-node; the Raspberry Pi is currently a Tailscale access device. The earlier mixed-architecture two-node experiment may be described as historical experience.

## Brand Commitments

Use the owner name Jerome Christian Ibon. The voice is professional, thoughtful, technical, restrained, and human. Seniority should remain natural and honest. Avoid generic career claims, inflated titles, terminal cosplay, dashboard-first presentation, generic AI/SaaS visual language, stock imagery, and fabricated engineering artifacts.

## Evidence on Hand

- Typed candidate, experience, project, education, and credential content in `frontend/app/src/portfolio.ts`.
- Capability context in `frontend/app/src/skill-details.ts`.
- Cloud architecture, CI/CD, observability, runbook, OIDC, and assistant documentation in `docs/`.
- Azure Function implementation and assistant knowledge in `backend/`.
- Deployment and validation workflows in `.github/workflows/`.
- Cloud architecture assets in `frontend/assets/`; these contain outdated details and require correction before reuse.
- Homelab source, architecture image, service catalog, troubleshooting notes, and September 2026 bootstrap incident in `Jeysibn/homelab-gitops`.
- No suitable owner portrait was found. Do not generate or substitute one.

## Product Principles

1. Put real engineering work before biography and decoration.
2. Serve a fast recruiter scan and a deeper technical inspection from the same truthful content.
3. Show automation, observability, recovery, and operational reasoning through evidence.
4. Keep the interface readable, calm, and deployment-safe.
5. Make personal learning visible without overstating professional tenure or outcomes.

## Accessibility & Inclusion

Accessibility is a release requirement informed by WCAG 2.2. Preserve semantic landmarks and heading order, full keyboard access, visible focus, accessible dialogs and disclosures, Escape dismissal and focus return, reduced-motion behavior, readable contrast, 44px touch targets, meaningful alternatives for diagrams, zoom/reflow, and theme parity. No required information may depend on hover, pointer precision, motion, or color alone.
