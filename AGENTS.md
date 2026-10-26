# Agent Instructions

Cloud-backed portfolio: React + TypeScript + Vite frontend (`frontend/app/`), Azure Functions backend (`backend/`), Terraform (`terraform/`), GitHub Actions CI/CD. `README.md` is the project overview.

## Active work

A visual/UX redesign is in progress. The single execution reference is [`docs/redesign/MASTER_PLAN.md`](docs/redesign/MASTER_PLAN.md); deviations and fact status live in [`docs/redesign/DECISIONS.md`](docs/redesign/DECISIONS.md); the pre-redesign baseline is in [`docs/redesign/BASELINE.md`](docs/redesign/BASELINE.md). Work one milestone (P0–P7) at a time, one small PR each, and stop for human review between milestones.

## Rules

- Branch from `dev`, PR into `dev`. `main` is production: never push to it or to `Jeysibn/jeysibn.github.io`, and never merge without explicit human approval.
- Never run `git reset --hard`, `git clean`, or force-push without approval.
- Personal facts (titles, dates, employers, duties, certifications, metrics) come only from `content/portfolio.json` and Jerome's verified answers in `DECISIONS.md`. Do not invent or infer them. Do not blur paid work and personal projects.
- Keep `content/portfolio.json` as the single content source. After editing it run, from the repo root, `python backend/tools/build_knowledge.py --write` and `--check`, then `cd backend && python -m evals.run_evals`.
- Preserve: the four project slugs, `?project=<slug>` deep links and history, anchor IDs, dialog focus behavior, assistant timeout/cancel, theme persistence, resume and contact links.
- Motion must respect `prefers-reduced-motion`, and content must be readable without it. Never use continuous decorative animation.
- Never disable or delete a test to get CI green; replace it with an equivalent behavior check.
- Do not change `backend/`, `terraform/` or `.github/workflows/` as part of UI work.

## Validation

From `frontend/app` (Node 22): `npm ci`, then `npm run validate:ci` (typecheck, lint, Vitest, build, bundle budget, Playwright + axe). The JS bundle budget is 180 KiB gzip; do not raise it. Backend: `cd backend && ruff check . && python -m pytest -v`.

Report what was actually run and what was not. Distinguish local results, CI results and live-site checks.
