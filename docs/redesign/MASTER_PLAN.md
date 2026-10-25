# JEYSIBN Portfolio — Redesign Master Plan

**Status:** Proposed implementation specification / planning-only baseline  
**Prepared:** 2026-10-25  
**Target source repository:** https://github.com/Jeysibn/portfolio  
**Published site:** https://jeysibn.github.io/  
**Generated deployment repository:** https://github.com/Jeysibn/jeysibn.github.io  
**Proposed in-repository location:** `docs/redesign/MASTER_PLAN.md`  
**Design direction:** **JEYSIBN / Engineered Simplicity — Quiet Motion**  
**Inspiration (not copying):** Rauno Freiberg (motion and interaction precision), Shipped (engineering work presentation), Will Medina (personal identity and monochrome editorial feel).

> **Document authority:** This plan proposes future changes. It does **not** represent completed work, approved personal claims, measured performance, or a live-site visual QA report. When applying it, the coding agent must first inspect the current branches and files again and reconcile any differences. Do not blindly replace newer work.

---

## Implementation status (updated 2026-10-26)

This table is the only part of the plan that tracks progress; the rest is the original specification. Decisions that depart from it are in [`DECISIONS.md`](DECISIONS.md), which wins on conflict. Everything below was verified locally only; nothing is deployed.

| Milestone | Status | Notes |
| --- | --- | --- |
| P0 Baseline and contract | Done | `BASELINE.md`, `DECISIONS.md`, `AGENTS.md`. |
| P1 Content integrity | Partly done | BB Wave and TrendAI facts confirmed and applied. Resume PDF, certifications, education, profile spelling, project status wording and `last_updated` still need Jerome (see the evidence table). |
| P2 Monochrome foundations and hero | Done | Visual direction later changed to the grayscale-collective look (D19). |
| P3 Selected work | Done | Static project index; case-study dialog and deep links preserved. |
| P4 Experience, toolkit, credentials, resume, contact | Done, with a deviation | About section removed at Jerome's request (D21); `#about` links redirect to `#top` (D22). |
| P5 Quiet Motion | Done except the portrait | Hero entrance, scroll reveal, card lift, case-study flow trace and nav/button/dialog transitions implemented (D23 to D25; "M1 to M5" in the 2026-10-26 refinement brief). Portrait interaction (M6 there) deferred: no approved portrait exists. |
| P6 QA and deployment readiness | Not started | Local gate passes; CI, live-site checks and the release blockers in `DECISIONS.md` remain. |
| P7 Production release | Not started | Needs explicit human approval. |

## 1. Executive decision

Redesign the **presentation layer**, not the cloud architecture. The result is a calm, distinctive, monochrome personal portfolio that helps a recruiter understand Jerome's professional background within seconds and allows an engineer to explore evidence-backed Cloud/DevOps case studies. Motion is purposeful, small, interruptible, and never required to read content.

**Success in one sentence:** A visitor can instantly identify who Jerome is, what roles he seeks, what technical work he has done, and how to contact him; project details then reveal credible infrastructure architecture without sacrificing accessibility, performance, or existing functionality.

### Non-negotiables

1. **Truthful career content:** Separate paid professional duties from personal project work. Do not inflate seniority, operational responsibilities, certifications, production use, or project maturity.
2. **Real engineering substance:** Preserve technical details, architecture text, project GitHub links, working case-study deep links, and backend/service capabilities.
3. **Monochrome, not generic:** No cyberpunk, terminal imitation, neon, colored gradient backgrounds, floating dashboards, orbiting tools, or continuous decorative motion.
4. **Quiet motion:** Brief entrance and interaction effects; no autoplay loop competing with reading; reduced-motion behavior must preserve information and operability.
5. **Mobile and keyboard first:** All content available without hover; visible focus and logical reading/tab order; no layout overflow or animation-dependent content.
6. **Safe iteration:** Small feature-focused PRs, tests updated for intentional UX changes, preserved production until quality gates pass, easy rollback.
7. **Maintainable code:** Continue React + TypeScript + Vite; reuse existing GSAP and CSS. No new animation framework without measured need.

### Explicitly out of scope

- Rewriting the Azure Functions API, Cosmos DB persistence, Terraform infrastructure, CI/CD architecture, or AI provider integration.
- Switching to Next.js, Framer, Webflow, or a different deployment platform.
- Adding a CMS, new database, paid animations, WebGL, three.js, or other unnecessary infrastructure.
- Inventing job history, metrics, certification dates, employer names, or personal photographs.
- Dropping project coverage solely to make the page look cleaner; *visually feature* selected projects while retaining discoverability for all verified projects.
- Publishing/merging to `main` without a human approval gate.

---

## 2. Verified repository baseline (2026-10-25)

Read-only GitHub inspection established:

| Area | Current implementation / location | Implication |
| --- | --- | --- |
| Source of truth | `Jeysibn/portfolio`, default and protected `main` | Do all design work here, not in compiled Pages assets |
| Branches | `dev` exists; `main` protected | Work on `feat/portfolio-quiet-motion` off a freshly synchronized `dev`; PR into `dev`, then reviewed `dev` → `main` |
| `main` observed SHA | `285711dc82876b69aabc8acc7a8d105058f3330e` | Snapshot identifier only; re-check before work |
| `dev` observed SHA | `757661cda55ca2e78294f91dedc0f9e4b445331d` | Snapshot identifier only; may advance |
| Frontend | `frontend/app/`, React 19 + TypeScript + Vite | Keep this stack and SPA/anchors |
| Styles | `frontend/app/src/styles.css`, ~2,572 lines | Refactor deliberately; do not indiscriminately overwrite |
| Existing visual direction | `DESIGN.md`, `.impeccable/design.json`, `PRODUCT.md` | Change design documentation deliberately; old "Control-Plane Atlas" conflicts with new direction |
| Component orchestration | `frontend/app/src/App.tsx` | Owns section order, dialogs, deep-link state |
| Sections | `frontend/app/src/sections/PortfolioSections.tsx` | Main re-layout target |
| Chrome | `frontend/app/src/components/SiteChrome.tsx` | Navigation, theme switch, footer |
| Motion | `MotionSystem.tsx`, `CursorGlow.tsx`, GSAP | Replace continuous complexity with accessible quiet motion |
| Project experience | `SystemDeck.tsx`, `SystemDossier.tsx`, `ProjectSelector.tsx`, `Dialogs.tsx` | Replace visual deck with scannable list/grid; preserve case-study behavior |
| Skills experience | `capabilities/CapabilityMap.tsx`, `SkillGlyph.tsx`, `skill-details.ts` | Replace orbital presentation with accessible categorized skills; preserve useful evidence/detail data |
| Shared data | `content/portfolio.json`, `frontend/app/src/portfolio.ts` | Do not introduce competing content objects |
| AI knowledge | `backend/tools/build_knowledge.py` → `backend/data/approved_knowledge.json` | Every factual content change may require regenerated projection + backend evaluations |
| Theme | `frontend/app/src/hooks.ts`, `index.html` theme bootstrapping | Preserve persisted/system fallback; update both meta/theme-color tokens |
| CI | `frontend/app/package.json` `validate:ci` | Preserve typecheck, ESLint, Vitest, build, JS budget, Playwright/axe |
| Performance | `frontend/app/scripts/check-performance.mjs` | Current JS gzip gate is 180 KiB; keep at or below unless explicitly justified |
| Browser QA | `frontend/app/tests/ui/portfolio.spec.ts` | Rework design-specific tests; keep behavioral and accessibility gates |
| Publish | `.github/workflows/frontend-deploy.yml` | `main` pushes publish `frontend/app/dist/` into `Jeysibn/jeysibn.github.io` and smoke-test it |
| Live site | `jeysibn.github.io` with compiled assets stored in the Pages repo | Deployment structure verified, **not** a live rendered-browser quality certification |

### Existing functionality to preserve or consciously replace

- Canonical hero/identity and professional evidence; React SPA static-host compatibility and anchor navigation.
- Saved light/dark theme, startup theme from stored value or system preference.
- All four canonical project slugs: `cloud-portfolio`, `homelab-gitops`, `monikey`, `noc-report`.
- `?project=<slug>` links, browser back/forward behavior, project dialogs, dialog closing, restore focus, accessible architecture descriptions.
- AI assistant session state, grounded responses and links, timeout, cancel, reset, errors, starter questions; assistant may be visually de-emphasized, not broken.
- Visitor count and backend `/api/health` request behavior; move API status out of hero if desired but do not silently delete working capability.
- Skill explanations, certification earned/in-progress distinctions, education, resume PDF, contact mailto/copy, GitHub/LinkedIn.
- Current backend, Terraform, and deployment workflow boundaries.

### Content discrepancies requiring correction, not assumptions

1. `content/portfolio.json` currently calls the TrendAI role `Technical Support Engineer, Endpoint Security SaaS`. User-provided correction: **official title was `DevOps Platform Engineer`**, while assigned duties involved enterprise technical support. Display official title and accurately explain scope; do not present unperformed DevOps platform duties.
2. The canonical experience currently includes TrendAI and an IT Helpdesk internship, but not the user's newer NOC role. Add the NOC experience **only from user-approved employer/title/dates/responsibilities**. The user has described operational monitoring/escalation and assisting UAT/production deployments by triggering existing Jenkins pipelines when on morning shift; do not imply ownership of pipeline design.
3. Profile, job-search availability, project state, certifications and `metadata.last_updated` need factual review. Do not treat `2026-09-15` canonical update date as current verification.
4. The public `frontend/app/public/resume.pdf` may be older than the user's current resume. Compare visually/content-wise against their approved latest resume before replacing; do not auto-generate an inaccurate PDF.
5. `PRODUCT.md` mentions an asset-generation script that was not in the inspected repository tree. Audit obsolete paths when updating documentation; do not pretend the script exists.
6. Do not remove a project from the canonical `projects` array merely to hide it in featured work: backend consistency/evaluation tests currently expect all four slugs. Use separate featured/other presentation state, not deletion.

---

## 3. Design system — implementable contract

### Personality

**Quiet engineer; precise but approachable; personal, not enterprise marketing.** The site should feel editorial and intentional. The main brand motif is a small **JEYSIBN / JI** lettermark plus discreet engineering labels like `01 / WORK`, `02 / EXPERIENCE`, `03 / ABOUT`—not a terminal prompt.

### Color tokens (initial proposal; validate contrast before release)

| Token | Dark (preferred first view) | Light |
| --- | --- | --- |
| `--color-bg` | `#111111` | `#F7F7F5` |
| `--color-surface` | `#1B1B1B` | `#FFFFFF` |
| `--color-surface-hover` | `#262626` | `#ECECEA` |
| `--color-text` | `#F3F3F1` | `#171717` |
| `--color-muted` | `#B6B6B2` | `#555555` |
| `--color-rule` | `#3B3B3B` | `#D7D7D3` |
| `--color-strong` | `#FFFFFF` | `#111111` |
| `--color-focus` | `#F3F3F1` | `#111111` |

- Use only neutral hues for visual branding. Validation/errors must remain distinguishable using explicit text and iconography, not color alone.
- **Do not force dark mode as the default** in a way that overrides the user's OS preference or previously saved selection; dark is the preferred hero art direction, and both themes must be designed intentionally.
- Buttons: high-contrast square/soft-radius rectilinear controls; no glassy backgrounds, neon outlines, heavy shadows or decorative gradients.
- Hairline borders and typography provide structure. Avoid stacking multiple outlined boxes inside boxes.

### Type and layout

- Retain **Manrope** as the main UI/body font and **IBM Plex Mono** for small labels, tech metadata and section numbering. The current Bodoni Moda display styling can be retired if it no longer fits; do not add a third decorative family by default.
- Hero h1: exact accessible name `Jerome Christian Ibon` (preserve current visible spelling unless approved to change). Optional initial `JI` wordmark is supplemental.
- Desktop readable max content width: ~1120–1200px; body prose ~60–72 characters/line; generous whitespace with purposeful compactness.
- Spacing rhythm based on 8px; section top/bottom ~80–112px desktop, ~56–72px mobile (adjust through visual QA, not hardcoded absolute layout).
- Mobile: stack all two-column compositions, maintain minimum comfortable touch target sizes and unobstructed content.
- Do not gate readable content on a loading animation, animation library initialization, or hover.

### Target information architecture

```text
HEADER: JEYSIBN / Work · Experience · About · Contact [Resume] [theme]

HERO: Jerome Christian Ibon
      Personal one-line positioning
      2–3 lines of truthful context
      [View work] [Resume] [GitHub/LinkedIn]
      Optional black-and-white portrait if a real approved asset is supplied

01 / SELECTED WORK
      Homelab GitOps — visible project row/card
      Cloud-Backed Portfolio — visible project row/card
      Other verified projects in "Currently building" (MoniKey, NOC Report Builder)
      Each: category, status, 1-line outcome/technical proof, technologies,
            GitHub, inspect case study; no preview carousel/deck

02 / EXPERIENCE
      Compact chronological employer, role, period, truthful action/outcome bullets

03 / TOOLKIT
      Skills by domain (cloud, delivery, containers, observability, systems)
      Certifications with earned/in-progress labels

04 / ABOUT
      Personal engineering approach, career direction, practical learning

05 / CONTACT
      Email, GitHub, LinkedIn, resume
      Small optional assistant entry point (quiet; no intrusive pop-up)

FOOTER: JEYSIBN / concise technical signature; visitor count can live here
```

**Compatibility detail:** Internal section IDs `#projects`, `#experience`, `#skills`, `#credentials`, `#about`, `#resume`, `#contact` currently underpin tests, inbound links and assistant sources. Keep these anchor IDs even if headings combine into a smaller number of visual chapters. Preserve `#top`, `main-content`, active-section semantics and skip link. If a particular ID must change, explicitly add a compatible alias and tests instead of silently breaking it.

### Suggested project order

- Featured: **Homelab GitOps** (demonstrates Kubernetes operations/automation) and **Cloud-Backed Portfolio** (demonstrates Terraform-managed Azure delivery).
- "Currently building": **MoniKey** and **NOC Report Builder** with truthful current status, without claims of completed production use.
- Keep a way to inspect all four case studies and open their public repositories. Promote projects based on verified maturity/quality evidence, not claimed importance.
- Case studies expose **Problem → What I built → Architecture → Decisions/trade-offs → Evidence/outcomes → Limitations/next steps → Source**. Never fabricate scale, availability, user count, or incident-recovery metrics.

### Portrait strategy

- A portrait is **optional**, not a blocker. Do not invent an image or use stock photos to represent Jerome.
- When a real, approved source image is supplied, create a monochrome crop with responsive framing. Keep it small enough not to displace recruiter-critical text; use an appropriate alt text; offer a fully effective text-only hero.

---

## 4. Motion language — acceptance-level specification

**Rule:** Animate only when it communicates entrance, relationship, focus or user action. A visitor who does not hover, scroll far, or open a case study must still understand the site. Times below are starting ranges, not reasons to add motion everywhere.

| ID | Interaction | Trigger | Proposed implementation | Reduced motion |
| --- | --- | --- | --- | --- |
| M1 | Hero reveal | Initial mount only | Stagger headline/support/actions with `opacity` + `translateY(12–16px)`, 550–750ms total; no typewriter | Render immediately, no translation |
| M2 | Section reveal | Enters viewport once | `opacity` + `translateY(8–12px)`, 350–550ms, avoid animating every bullet; retain readable fallback | Static visible content |
| M3 | Project hover/focus | Pointer/keyboard interaction | Border/contrast shift and arrow `translate(2–4px,-2–4px)`, 140–220ms; card itself minimally moves or remains fixed | No movement; underline/contrast/focus remains |
| M4 | Architecture flow | Case study opens / diagram becomes visible | Optional *one-shot* diagram connector/path draw, 700–1200ms, monochrome, small spatial scope; actual topology only | Complete diagram immediately, text alternative unchanged |
| M5 | Portrait | Hover on fine-pointer devices | Only if actual photo exists; image `scale(1.01–1.02)`/crop shift, 200–320ms | Static photo |
| M6 | Dialog/nav/button transitions | Explicit interactions | Underline/dismiss/opacity transitions 140–250ms; dialogs must keep native focus semantics | Instant or near-instant state switch |

**Prohibited by default:** continuously rotating orbits, indefinite particle loops, giant parallax, horizontal scroll trapping, custom-cursor trails, scroll-jacking, pinning full sections, elaborate page loaders, hover-dependent case-study information.

### Engineering rules

1. Use **CSS transitions** for hover/focus/button/nav effects and GSAP only for coordinated entrance/scroll/diagram effects where CSS is less maintainable. Avoid new motion dependencies.
2. Prefer `transform`/`opacity` and tightly scoped SVG path effects; avoid animating layout properties like `height`, `top`, or `left` during scroll.
3. Define tokens such as `--motion-fast: 180ms`, `--motion-medium: 420ms`, `--motion-enter: 650ms`, `--ease-out: cubic-bezier(.22,1,.36,1)`; keep them consistent.
4. Use `gsap.matchMedia()` / responsive conditions and `prefers-reduced-motion` in both CSS and JS; ensure GSAP contexts, triggers and listeners clean up when unmounted. Existing `MotionSystem.tsx` is the natural refactoring location.
5. Reveal components must be **visible by default** if JS fails, is delayed, or media queries change. Never initialize critical prose at `opacity:0` indefinitely.
6. Do not animate opening case studies from a `display:none` to complex layout. Preserve dialog focus restoration and Escape/backdrop dismissal.
7. **Architecture implementation warning:** Current case studies show SVG documents through `<img src={diagram.svg}>`. GSAP cannot directly animate internal SVG paths inside a separate `<img>` document. If M4 is selected, use either a transparent presentation overlay tied to the factual topology or a reviewed, locally trusted inline SVG component. Do not inject arbitrary SVG markup with `dangerouslySetInnerHTML`, and do not compromise the existing text alternatives. Consider deferring M4 until the rest is stable.
8. Animations should pause/settle when the document is hidden; avoid per-frame work on idle pages. Avoid unnecessary listeners and `will-change` on many nodes.
9. No reduced-motion test may fail because required information is hidden. Test keyboard and touch states independently.

**Authoritative technical reading:** GSAP `matchMedia` https://gsap.com/docs/v3/GSAP/gsap.matchMedia%28%29/ ; MDN reduced motion https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion ; web.dev animation performance https://web.dev/articles/animations-and-performance .

---

## 5. Implementation roadmap: small, reviewable milestones

All milestones should be completed in order unless a dependency is explicitly documented. **Each milestone:** inspect → implement limited scope → run relevant tests → verify responsive/reduced-motion states → update tests/docs → summarize changes, screenshots, risks → PR/review. Do not bundle P0–P7 in one unreviewed commit.

### P0 — Baseline, branch, contract, and design handoff (first PR)

**Goal:** Create a defensible starting point and version the redesign specification.

**Tasks**

- [ ] `git status`, `git fetch --all --prune`; identify uncommitted work and do **not** reset/clean it.
- [ ] Verify `dev`, `main`, open PRs and differences; branch from updated `dev` (or project-agreed base) as `feat/portfolio-quiet-motion`.
- [ ] Record source/deployed baseline and take desktop/mobile/light/dark screenshots locally with Playwright (do not claim live screenshot unless run).
- [ ] Record initial bundle gzip and Playwright/axe/test results before changes; distinguish baseline failures.
- [ ] Copy this master plan to `docs/redesign/MASTER_PLAN.md`. Add a short `docs/redesign/DECISIONS.md` for design decisions/deviations and an evidence checklist for user-approved personal facts.
- [ ] Update proposed direction in `DESIGN.md`, `PRODUCT.md`, and `.impeccable/design.json` **without accidentally retaining contradictory current-brand requirements**. If reauthoring all in one PR is risky, explicitly mark old design as legacy until P2.
- [ ] Establish a project-specific `AGENTS.md` for coding agent only if not already present; keep concise and point it at this plan, verified facts, CI, and rollout rules. Do not create competing instructions in numerous locations.

**Gate:** Baseline is reproducible; no production-facing design code changed; original platform still operates.

### P1 — Content integrity and portfolio copy (separate PR)

**Goal:** Make every recruiter-facing claim accurate before polishing UI.

**Likely files:** `content/portfolio.json`, `frontend/app/src/portfolio.ts` (only if model fields actually need additions), `backend/data/approved_knowledge.json`, `backend/evals/*`, backend tests, public resume asset, `frontend/app/index.html` metadata if role language changes.

**Tasks**

- [ ] Create a *source-of-truth verification table* for each experience entry: official role, employer, month/year range, actual scope, evidence-backed results.
- [ ] Correct TrendAI job title to `DevOps Platform Engineer`, with accurate technical-support responsibilities.
- [ ] Add the newer NOC role **after verifying official employer/title/period and actual duties**. User has described monitoring/escalation plus triggering already-existing Jenkins deployment pipelines on morning shifts; do not extrapolate.
- [ ] Recheck summary, open-to-work wording, certification earned/in-progress status, and project maturity.
- [ ] Keep `metadata.last_updated` honest, reflecting an actual approved content review.
- [ ] Regenerate approved assistant knowledge: from repository root, `python backend/tools/build_knowledge.py --write`, then `python backend/tools/build_knowledge.py --check` and `cd backend && python -m evals.run_evals`.
- [ ] Update any assistant prompts/grounding evaluations that depend on old job titles/experience; ensure no false DevOps employment claims.
- [ ] Check `frontend/app/public/resume.pdf` against a user-approved current resume and replace only with an accurate verified artifact.
- [ ] Update site metadata and skill links if changed; confirm their public paths remain correct.

**Gate:** Visible page, AI assistant, canonical JSON, public resume, and metadata tell the **same factual story**. New job facts awaiting verification remain clearly marked as blocked rather than invented.

### P2 — Monochrome foundations and hero (separate PR)

**Goal:** Establish the new design personality without touching backend behavior.

**Likely files:** `frontend/app/src/styles.css` (or well-scoped CSS modules), `SiteChrome.tsx`, `PortfolioSections.tsx`, `hooks.ts`, `frontend/app/index.html`, `frontend/app/public/favicon.svg`, `social-preview.*` if approved.

**Tasks**

- [ ] Implement semantic design tokens for dark/light, spacing, type scale, borders, focus, and motion.
- [ ] Replace warm paper/copper/petrol surface identity with grayscale. Audit hardcoded colors in headings, diagrams, hover, dialogs, buttons, errors, and theme-color meta.
- [ ] Redesign header and wordmark with 4–5 primary navigation destinations; preserve old anchors and valid selected-section behavior.
- [ ] Recompose hero for concise professional copy, meaningful CTA, and optionally approved portrait.
- [ ] Move health status away from hero if it competes with career story, but preserve its access and request behavior (e.g., unobtrusive technical footer/details area).
- [ ] Remove always-visible Signal Rail and CursorGlow if no longer warranted; ensure no orphan listeners/GSAP controllers.
- [ ] Preserve initial light/dark theme behavior, skip navigation, accessible menus, and mobile sizing.
- [ ] Replace snapshot(s) intentionally and document image changes. Avoid golden-screenshot updates without visual inspection.

**Gate:** Hero communicates identity/role immediately at 320px through 1920px; no continuous distracting animation; both themes meet contrast and usability review.

### P3 — Selected work and case-study UX (separate PR)

**Goal:** Make engineering accomplishments discoverable without deck interaction.

**Likely files:** `frontend/app/src/components/projects/*`, `frontend/app/src/sections/PortfolioSections.tsx`, `frontend/app/src/components/Dialogs.tsx`, `App.tsx`, `projectNavigation.ts`, project tests, styles.

**Tasks**

- [ ] Build `ProjectIndex` / `ProjectCard` or project rows from canonical `projects` data; all four titles accessible on page without clicking a selector.
- [ ] Distinguish `Selected Work` from `Currently Building` by presentation only; preserve canonical records and stable slugs.
- [ ] Display technical stack, honest maturity/status, concise problem/what-built/outcome, plus GitHub and case-study actions.
- [ ] Reuse current `ProjectDialog` and architecture text, or refactor carefully with parity; preserve `?project=` deep-link support, history, Escape, focus restore and Back behavior.
- [ ] Keep architecture images visible, responsive and with textual equivalents; avoid heavy imagery loading until necessary.
- [ ] Remove System Deck-specific gesture/reorder code and associated tests **only after** replacement tests pass. Do not delete tests to get green CI; replace with behavior-contract coverage.
- [ ] Make each card hover/focus graceful; no crucial information appears only during hover.

**Gate:** All four cases discoverable; direct URLs and assistant links work; keyboard users can inspect and close every project; no deck dependence.

### P4 — Experience, toolkit, credentials, about, resume, contact (separate PR)

**Goal:** Make the entire recruiter path scannable and human.

**Likely files:** `PortfolioSections.tsx`, `CapabilityMap.tsx` (replace with `SkillGroups.tsx` or similar), `skill-details.ts`, `Dialogs.tsx`, `SiteChrome.tsx`, styles, related tests.

**Tasks**

- [ ] Present employment chronologically with official titles, concise responsibilities and appropriate projects vs paid-role separation.
- [ ] Replace orbiting capability control plane with static categorized skills. Preserve optional click-to-explain details if they genuinely help; remove obscure navigation steps.
- [ ] Keep explicit certification `Earned` / `In progress` distinctions, reputable supporting links, accurate education data.
- [ ] Add concise first-person personal/about story based on approved facts; don't assert unverified hobbies, beliefs, or photos.
- [ ] Make resume download visible in header/hero and a compatible `#resume` target; verify asset downloads correctly.
- [ ] Keep contact email/copy action, GitHub, LinkedIn; retain accessible feedback announcements.
- [ ] Keep assistant present but unobtrusive, no auto-popups, and retain user-initiated functionality.

**Gate:** A recruiter can scan identity → projects → experience → skills/certifications → contact without opening any dialogs; detail remains available for technically curious visitors.

### P5 — Quiet Motion (separate PR, only after static design is right)

**Goal:** Add enough movement to feel crafted, never enough to disrupt reading.

**Likely files:** `MotionSystem.tsx`, affected sections/components, scoped styles, new motion tests and Playwright UI assertions.

**Tasks**

- [ ] Implement M1 hero reveal, M2 section reveal and M3 project hover/focus. Prove that content is visible when JS fails or reduced motion is on.
- [ ] Implement M6 minimal nav/dialog transitions without altering native dialog focus behavior.
- [ ] Add M5 only if an approved portrait exists; otherwise keep hero text-only.
- [ ] Prototype M4 architecture path animation on **one** technically verified diagram first. If this needs risky SVG injection, expensive renders, or inaccurate visual paths, defer rather than compromise quality.
- [ ] Build a single reduced-motion/cleanup strategy; no competing GSAP registrations or perpetual timers.
- [ ] Check touch users do not receive fake hover, mobile reduced movement is comfortable, tab/focus states remain visible.

**Gate:** No looping decorative effects; animation starts and settles cleanly, doesn't cause overflow, and doesn't obscure content or worsen interaction latency.

### P6 — QA, performance, content consistency, deployment readiness (release candidate PR)

**Goal:** Prove the redesign is at least as robust as the old implementation.

**Tasks**

- [ ] Re-run complete local frontend validation (`npm run validate:ci`) and backend assistant content/evaluation checks when content was modified.
- [ ] Update old `SystemDeck` and orbit-oriented UI tests to validate new discovery/skill UX. Retain all existing assistant, deep-link, theme, navigation, contact and accessibility coverage.
- [ ] Capture and inspect representative desktop/mobile and dark/light screenshots. Check no horizontal overflow, content cutoffs or unreadable low-contrast gray.
- [ ] Verify keyboard-only journey and native dialog focus return; screen reader accessible names/section heading order; axe accessibility checks.
- [ ] Test initial/no JS-delayed state, reduced motion (including runtime preference change where feasible), low bandwidth, API failure, slow assistant, and absent portrait image.
- [ ] Confirm the JS gzip gate remains ≤180 KiB; examine bundle changes if larger, rather than raising the budget automatically.
- [ ] Confirm canonical facts ↔ assistant approved knowledge ↔ resume ↔ public metadata consistency.
- [ ] Update `README.md`, `DESIGN.md`, `PRODUCT.md`, docs architecture/Changelog if their current presentation descriptions become obsolete.
- [ ] Confirm no unrelated backend/Terraform/deployment changes and no secrets or personal phone numbers were added.

**Gate:** All functional, accessibility, accuracy and CI requirements pass; actual screenshots reviewed and deviations documented.

### P7 — Human-approved production release and observation

**Goal:** Ship safely and confirm source/deployed parity.

**Tasks**

- [ ] Merge feature PRs into `dev` after review; verify `dev` CI. Open/review `dev` → protected `main`; never bypass main protections.
- [ ] Require explicit human approval before production merge. Preserve recent known-good commit SHA for rollback.
- [ ] `main` push triggers existing `.github/workflows/frontend-deploy.yml`; **do not edit compiled Pages repo manually**.
- [ ] Confirm build artifact, GitHub Actions publish run and deployed smoke tests actually pass. Check live browser visually at desktop/mobile and dark/light.
- [ ] Verify deployed `?project=homelab-gitops` and `?project=monikey`, project GitHub links, PDF download, mailto, AI assistant, count/health UI, no console runtime errors.
- [ ] Verify assistant factual replies after any canonical data rebuild/deploy: frontend deploy alone does not magically update a separately deployed backend approved-knowledge artifact. Coordinate backend publication only if generated knowledge differs; follow existing backend workflow and review.
- [ ] If production regression occurs, revert the source change on the proper branch or redeploy last known-good static artifact using established release process. Avoid force-push or manual Pages edits.

**Gate:** Deployed site and source agree; live visual, functional and AI knowledge checks pass; release note recorded.

---

## 6. Detailed regression and acceptance checklist

### Usability / design

- [ ] Hero identity, role direction, one-line value, and CTA understandable within a normal laptop viewport.
- [ ] All four projects scannable without a carousel; selected work gets strongest visual hierarchy.
- [ ] Real experience not overstated; project statuses honest; no invented quantified outcomes.
- [ ] Dark and light modes distinct but harmonized; typography sharp; no accidental colorful accent from old theme.
- [ ] Professional portrait optional; missing image leaves no blank placeholder.
- [ ] Mobile header usable, menu closes, no clipping at 320/375/390px.

### Behavior

- [ ] `#top`, `#projects`, `#experience`, `#skills`, `#credentials`, `#about`, `#resume`, `#contact` resolve properly.
- [ ] `?project=` loads modal directly; unknown slug fails gracefully; Back/Forward works.
- [ ] Native dialog closes via Escape, close and backdrop; returns focus to relevant opener.
- [ ] Assistant opens/closes, retains session and source links, cancels correctly, shows safe failure state.
- [ ] Theme persists and honors system preference first time.
- [ ] Resume downloads (verified correct current version); all external contact links work.
- [ ] API health and visitor count errors do not block static content.

### Motion / accessibility

- [ ] No infinite ambient animations in the default page.
- [ ] All information visible in reduced-motion mode, with JS slow/disabled where testable.
- [ ] Transform-based micro-interactions do not shift page layout or create horizontal overflow.
- [ ] Fully operable by keyboard/touch; focus states visible; contrast checked manually + axe.
- [ ] Section reveals play once, settle, and do not run on every scroll back.
- [ ] Semantic headings, link names, image alt/decorative treatment, diagram textual alternatives preserved.

### Viewports to inspect

| Target | Viewport/test mode | Primary checks |
| --- | --- | --- |
| Narrow mobile | 320×~700 | No overflow, readable nav, contacts and project rows |
| Common mobile | 375–390×~800 | Menu, dialogs, skill list, card density |
| Tablet | ~768×1024 | Grid collapse, line lengths, dialog scrolling |
| Small laptop | ~1024×768 | Header fit, hero fold, compact project layout |
| Laptop | 1440×900 | Balanced whitespace and hierarchy |
| Large desktop | 1920×1080 | Does not feel empty/over-scaled; stable screenshot |
| Settings matrix | Each representative viewport in light/dark + reduced motion | Contrast, legibility, animation off/static state |

### Required commands (inspect package scripts first if branches changed)

```bash
# Development workspace setup (do NOT run destructive cleanup)
git status --short --branch
git fetch --all --prune
git branch -vv

# Frontend (Node 22 target)
cd frontend/app
npm ci
npx playwright install chromium
npm run typecheck
npm run lint
npm test -- --run
npm run build
npm run perf:budget
npm run test:ui
# Or the established one-command gate:
npm run validate:ci

# If canonical content was edited (run from repo root):
python backend/tools/build_knowledge.py --write
python backend/tools/build_knowledge.py --check
cd backend
python -m evals.run_evals
python -m pytest -v
```

The backend tests require the documented Python environment/dependencies; `pip-audit`, authenticated Terraform plans, and production deploy are handled by CI. A lack of credentials is **not** permission to disable those gates.

---

## 7. File-level implementation map

| File / area | Planned change | Preservation requirement |
| --- | --- | --- |
| `docs/redesign/MASTER_PLAN.md` | Store this specification | Be the single execution reference |
| `DESIGN.md` / `.impeccable/design.json` | New monochrome tokens, typography, motion rules | Avoid conflicting design mandates |
| `PRODUCT.md` | Update user experience, purpose and invariants | Architecture/product scope remains true |
| `content/portfolio.json` | User-verified career, project visibility metadata as needed | Canonical one-source-of-truth; maintain slugs |
| `backend/data/approved_knowledge.json` | Regenerated artifact when factual canonical data changes | No manual drift; guardrails/evals |
| `frontend/app/src/App.tsx` | Simplify page composition; preserve state | Deep links, dialogs, assistant |
| `frontend/app/src/sections/PortfolioSections.tsx` | Hero, work, experience, skills/credentials, about/contact redesign | Reuse canonical facts and anchors |
| `frontend/app/src/components/SiteChrome.tsx` | Brand/nav/footer refactor | Theme/nav/accessibility/visitor count |
| `frontend/app/src/components/projects/*` | Static project index, lightweight cards | Four slugs, GitHub links, case studies |
| `frontend/app/src/components/capabilities/*` | Simple skill groups / optional detail | Every skill still discoverable |
| `frontend/app/src/components/Dialogs.tsx` | Visual polish; optional diagram motion | Native dialog, focus, accessible text |
| `frontend/app/src/components/MotionSystem.tsx` | Quiet motion manager / cleanup | Reduced motion and no animation gate |
| `frontend/app/src/components/CursorGlow.tsx` | Remove from app if not part of art direction | No left-behind listeners/styles |
| `frontend/app/src/styles.css` | New theme and component styles; delete obsolete selectors carefully | Mobile/print/reduced motion |
| `frontend/app/src/hooks.ts` / `index.html` | Theme meta color values/semantics | Persistent/system theme contract |
| `frontend/app/public/resume.pdf` | Replace only with user-approved latest PDF | Accurate download and filename |
| `frontend/app/tests/ui/portfolio.spec.ts` | New project/skill behaviors + visual anchors | Keep axe, links, history, assistant tests |
| `frontend/app/src/*test*`, `backend/tests/*` | Update contracts tied to obsolete UI | Never delete functional coverage as workaround |
| `README.md`, `docs/architecture.md`, `docs/Changelog.md` | Update when implementation actually changes | Do not document future feature as shipped |
| `.github/workflows/*`, `terraform/*`, `backend/function_app.py` | Normally **no changes** | Any edits need a separate justified review |

---

## 8. AI coding agent operating protocol

The coding agent must:

1. **Inspect first:** re-read `README.md`, `DESIGN.md`, `PRODUCT.md`, `content/portfolio.json`, docs, app components, tests, and workflow files; do not assume this plan describes HEAD forever.
2. **Protect existing work:** inspect `git status`, current branch and open PRs before creating/merging branches. Never run `git reset --hard`, `git clean -fd`, or force-push without explicit approval.
3. **Follow milestones:** implement **one milestone at a time**, preferably one PR per milestone. Do not optimize for maximal code churn.
4. **Explain changes before executing:** for each milestone provide impact, proposed file edits, behavior kept, tests and risks. Work within scope.
5. **Treat facts as data, not creative writing:** verify user-specific role titles, dates, project maturity and certification state. Request missing factual evidence or leave blocked—not fabricated.
6. **Keep source contracts:** canonical JSON, AI knowledge generation, assistant evals, project slugs, anchor IDs and resume download.
7. **Prove, don't assert:** run tests and display commands/outcomes; distinguish local tests, CI status, live deployment and unverified steps.
8. **Show visual proof:** provide changed desktop/mobile + dark/light screenshots when the environment permits; no design acceptance from code diff alone.
9. **Do not change production deployment/infrastructure during UI work:** `main` stays stable until explicitly authorized.
10. **Update roadmap checkboxes and commit summaries:** mark only observed completions; identify blocked steps and next smallest milestone.

### Required milestone report template

```text
Milestone: P# — <name>
Source branch / SHA:
Files changed:
Behavior added/changed:
Critical behavior preserved:
Tests run and results:
Desktop/mobile visual QA evidence:
Accessibility and reduced-motion result:
Performance/bundle comparison:
Known issues/blockers:
Recommended next step:
Deployment status: NOT DEPLOYED / DEPLOYED & VERIFIED (with evidence)
```

### Definition of Done for the entire redesign

**Done** only when: the new monochrome UX is present in production; the page is easy to scan; the motion is subtle and opt-out compatible; all four project records and case studies function; official job title and verified role history are accurate; canonical AI knowledge is synchronized; light/dark/mobile accessibility and performance gates pass; the public resume and links are correct; deployment smoke and manual visual QA are documented.

---

## 9. Proposed first action for the coding agent

**Start with P0 only.** Inspect and capture the baseline, create a feature branch, version this document and a concise agent instruction file, reconcile existing `DESIGN.md` / `PRODUCT.md` contradictions without introducing breaking UI changes, then run baseline tests. Return a short report and prepare the P1 factual content verification checklist. Do **not** merge to `main` or touch the Pages deployment repository.

## 10. Decisions and outstanding facts (keep visible)

| Item | Current decision |
| --- | --- |
| Design | Rauno precision + Shipped engineering layouts + Will Medina human editorial cues |
| Palette | Monochrome dark/light; preserve OS/saved theme semantics |
| Motion | Quiet motion M1/M2/M3/M6 core; M4 architecture later after feasibility; M5 portrait optional |
| Project display | 2 featured + 2 "Currently building" presentation, all 4 deep-linkable |
| Agent | Codex or equivalent coding agent; no new framework required |
| Visual review | Human approves hero, card and mobile screenshots before major scope expansion |
| Portrait | Pending a real approved photo, not required |
| Current NOC facts | Official employer/title/dates and exact approved bullets pending verification |
| TrendAI | Official role DevOps Platform Engineer; actual assigned work technical support |
| Resume replacement | Pending comparison to user-approved latest resume |
| Release authority | Human approval required for `main` / production |

**Reference links:** [Rauno](https://rauno.me/) · [Shipped](https://www.framer.com/marketplace/templates/shipped/) · [Will Medina](https://willmedina.com/) · [GSAP Docs](https://gsap.com/docs/v3/GSAP/gsap.matchMedia%28%29/).
