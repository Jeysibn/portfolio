# Redesign Decisions and Fact Evidence

Companion to [`MASTER_PLAN.md`](MASTER_PLAN.md). Record deviations from the plan and the status of every personal fact here, so the plan stays a stable reference.

## Decision log

| # | Date | Decision | Reason |
| --- | --- | --- | --- |
| D1 | 2026-10-26 | Work on `feat/portfolio-quiet-motion`, branched from `origin/dev` @ `757661c`; PRs target `dev`. | Per plan. `origin/main` only adds the merge commit of `dev`, so the two have identical content. |
| D2 | 2026-10-26 | P0 changes documentation only. No frontend source, styles, tests, content, backend, Terraform, or workflow files are modified. | P0 gate: no production-facing design change. |
| D3 | 2026-10-26 | `DESIGN.md`, `PRODUCT.md` and `.impeccable/design.json` keep their current content but are marked **legacy** and carry a short target-direction summary. Full reauthoring happens in P2 with the tokens. | Rewriting them now would describe a UI that does not exist yet. The shipped code still implements the Control-Plane Atlas. |
| D4 | 2026-10-26 | Baseline screenshots are kept outside the repo. | Avoids binary churn in the P0 PR; can be committed on request. |
| D5 | 2026-10-26 | The committed 1920px hero snapshot is left untouched despite failing locally. | The mismatch is a font-environment difference; regenerating it would hide that. It is replaced intentionally in P2. |
| D6 | 2026-10-26 | Backend/doc drift around `/api/health` metadata and managed-identity Cosmos auth is **out of scope** here. | Not part of the presentation redesign; would mix unrelated changes into the redesign PRs. |
| D7 | 2026-10-26 | `AGENTS.md` added at the repo root, pointing at this plan. | None existed. Kept short to avoid competing instructions. |
| D8 | 2026-10-26 | TrendAI role string is `DevOps Platform Engineer (technical support scope)`. | Official title shown, scope stated in every place the role string is rendered. |
| D9 | 2026-10-26 | `ExperienceItem.location` stays required; BB Wave is `Taguig City`. | An interim optional-location change was made and then reverted once the location was supplied, so no frontend code changes in P1. |
| D10 | 2026-10-26 | `metadata.last_updated`, the skills list and `resume.pdf` were left unchanged in P1. | `last_updated` is not bumped until the remaining Unverified rows are reviewed; no Jenkins proficiency was provided; the resume placeholder is tracked, not shipped. |
| D11 | 2026-10-26 | Semantic `--color-*` tokens are the source of truth; legacy token names are temporary aliases onto them. | Lets the project deck, capability map and dialogs turn monochrome in P2 without rewriting them, then be removed as P3/P4 replace those components. |
| D12 | 2026-10-26 | Header has five destinations (Work, Experience, Toolkit, About, Contact) plus Resume; Toolkit covers `#skills` and `#credentials`. Resume in header and hero links to `#resume`, not directly to the PDF. | Plan allows 4 to 5; keeps credentials reachable and every anchor ID intact. The PDF is stale (see evidence table), so it is not promoted to a one-click download yet. |
| D13 | 2026-10-26 | Removed the signal rail, cursor glow, hero topology SVG and `signalProgress` (module and its 2 tests). Hero and section reveal motion is deferred to P5; only the one-shot hairline reveal remains. | Plan P2 task. The deleted tests covered only the deleted feature; behavior coverage was added for the new header, hero and footer. |
| D14 | 2026-10-26 | Bodoni Moda removed from the Google Fonts request. The 1920px hero snapshot was regenerated after visual review. | Plan retires the display face. Removing it also let the font stylesheet load in the local test browser, so the snapshot now reflects real Manrope and IBM Plex Mono. CI parity of the new snapshot is unconfirmed. |
| D15 | 2026-10-26 | At Jerome's request, the editorial treatment is dropped everywhere: plain sentence-case labels, one typeface (Manrope; IBM Plex Mono removed, overriding the plan's "retain Plex Mono"), no numbering, no section bands, no heading rules, no uppercase tracking except the `JEYSIBN` wordmark. | Explicit instruction after reviewing the P2 result. The master plan's "editorial" wording is left verbatim in `MASTER_PLAN.md`; this entry supersedes it. |
| D16 | 2026-10-26 | P3 and P4 presentation work was done early in the same working tree: static project index (Homelab GitOps and Cloud-Backed Portfolio featured; MoniKey and NOC Report Builder under "Currently building") and grouped skills. Section headings renamed Work, Toolkit, About. Anchor IDs unchanged. | Instruction to remove the deck and orbit now. Case-study dialogs, `?project=<slug>` deep links, history and focus return are unchanged. |
| D17 | 2026-10-26 | Removed GSAP-driven motion (`MotionSystem.tsx`), the `SkillGlyph` icon set and the `simple-icons` dependency. `gsap` stays in `package.json` unused for now. | The deck, orbit and hairline reveal were the only users. Motion milestone P5 will decide whether to use GSAP or CSS. |
| D18 | 2026-10-26 | The four `docs/architecture/*/*-editorial.html` files were renamed to `<name>.html`. Historical Changelog entries and `MASTER_PLAN.md` still contain the word "editorial". | Nothing referenced the old names. Past release notes are a record and the plan is Jerome's document, so neither was rewritten. |
| D19 | 2026-10-26 | Visual direction changed to match grayscale-collective.com: near-black grainy dark theme, matching warm off-white light theme, Big Shoulders Display (700, uppercase) plus Barlow, tracked uppercase eyebrow labels, ghost section numerals, rounded charcoal cards, pill controls. Both themes follow the OS preference (dark is not forced). | Jerome asked for "the same vibes of monochrome" and chose "everything, including the type". This supersedes D15's plain-label and single-typeface decisions and reverses the "no editorial cues" instruction; the plan's own wording (editorial cues, Plex Mono) is no longer the reference for type. |
| D20 | 2026-10-26 | Grain is a fixed inline-SVG overlay and the hero light pool is a body pseudo-element; both static, `pointer-events: none`, no animation. Body background moved to `html` so the pool can sit behind content. | Keeps the no-continuous-animation rule and the 180 KiB budget; no image assets. |
| D21 | 2026-10-26 | The About section (`#about`, "Approach": principles text and four principle cards) was removed at Jerome's request. Header now has four destinations (Work, Experience, Toolkit, Contact) plus Resume; ghost numerals run 01 to 06; the `about` entry is gone from `content/portfolio.json` navigation; the assistant's `profile` source link now targets the top of the page. | Explicit instruction. Departs from the plan's rule to keep `#about`. Old `#about` links from past assistant replies no longer scroll anywhere. Assistant knowledge was regenerated (content hash changed). |

| D22 | 2026-10-26 | Old `#about` links redirect to `#top` (a small `useLegacyHashRedirect` hook rewrites the hash and scrolls); the assistant link resolver maps `#about` the same way. The About section stays removed. | Keeps old links and past assistant replies from becoming dead anchors without restoring content Jerome removed. `#top` is where identity content now lives. |
| D23 | 2026-10-26 | Quiet Motion is CSS plus one small IntersectionObserver hook, not GSAP. `gsap` was removed from `package.json`. Hero entrance: five children rise 16px over 650ms with an 80ms stagger, once (CSS keyframes). Scroll reveal: 10px and 480ms, once, on section headings, project groups and experience entries only. Every moving rule sits in `prefers-reduced-motion: no-preference`; the hook also stands down under reduced motion or without IntersectionObserver, so content is never hidden. Fill mode is `backwards`, so nothing is left transformed after an animation ends. | The plan allows CSS where simpler. Nothing here needs a timeline, and removing GSAP keeps the bundle at 81 KiB gzip. Proof that GSAP is unused: no import anywhere in `src`, `scripts` or `vite.config.ts`. A reveal hides content only after the hook has run, and anything on screen is revealed, even a sliver. |
| D24 | 2026-10-26 | Case studies open with a flow trace built from each project's canonical `architectureFlows` (an ordered list of steps with hairline connectors that trace in over about one second, once). The existing SVG diagrams and their text equivalents are unchanged. The trace is labelled "Steps in the order a request or change moves through the system." | The diagrams are standalone `<img>` SVGs, so their paths cannot be animated individually, and re-authoring them is out of scope. The flows already exist as verified content. Steps are a sequence, not a claim of a direct link between each pair (the runtime flow for the portfolio lists Cosmos DB then the AI provider because that is the order of a request, not because one calls the other), hence the caption and no arrowheads. |
| D25 | 2026-10-26 | Card lift (3px), directional link arrows, animated nav underline, theme glyph turn and dialog backdrop fade use 180 to 420ms transitions. Cards lift on `:hover` only where hover exists and on `:has(:focus-visible)` for keyboard users. The card text drops the "Flow" line (now in the case study) and shows the outcome as a separate ruled row. | M3 and M5 of the plan. Reduced motion removes the movement and keeps the colour and border feedback. |
| D26 | 2026-10-26 | M6 (portrait interaction) deferred. | No approved portrait image is in the repository. |
| D27 | 2026-10-26 | The TrendAI role renders its official title with `(technical support scope)` on its own muted line inside the same heading. | Keeps the official title and the real scope distinct but both visible, and the heading text unchanged for assistive technology and tests. |
| D28 | 2026-10-26 | `styles.css` consolidated: the plain and poster override layers were merged into their base rules, dead media-query declarations and unused legacy tokens and aliases removed. Rendering unchanged: 56 screenshots (home, dialogs, assistant, mobile menu, 320 to 1920px, light and dark) were pixel-identical before and after. Static grain lowered from 0.6/0.65 to 0.45/0.5 afterwards, as a separate visible change. | C3 and C4. Axe found 0 violations at 320, 390, 768, 1024, 1440 and 1920px in both themes, home and case-study dialog. |

### Plan reconciliations found during P0

- `PRODUCT.md` cites `frontend/app/scripts/generate-static-assets.mjs` as the resume/asset generator. That file does not exist; only `check-performance.mjs` is in `scripts/`. The reference was corrected.
- The plan lists anchor IDs `#top`, `#projects`, `#experience`, `#skills`, `#credentials`, `#about`, `#resume`, `#contact`. Current navigation uses `projects`, `experience`, `skills`, `credentials`, `about` (labelled "Principles"), `resume`, `contact`. Keep all of them in P2 and P4 (P2 renames labels, not IDs).
- `docs/redesign/MASTER_PLAN.md` is a verbatim copy of the supplied plan; edit only through this log or a reviewed PR.

## Evidence checklist for personal facts (blocks P1)

Nothing below is to be changed in `content/portfolio.json` until the row is marked **Verified**. "Current site value" is what is shipped now.

| Fact | Current site value | Status | Evidence needed from Jerome |
| --- | --- | --- | --- |
| TrendAI official title | `DevOps Platform Engineer (technical support scope)` | **Verified 2026-10-26** (Jerome) | Official title is DevOps Platform Engineer; the role's scope was technical support. The parenthetical keeps the scope visible in every rendering (heading, resume list, print resume); reword if preferred. |
| TrendAI period | August 2025 – February 2026 | **Verified 2026-10-26** (Jerome) | "Currently correct." |
| TrendAI bullets | 80+ cases, AWS reproduction environments, 640 h training, customer-facing resolutions | **Verified 2026-10-26** (Jerome) | "Currently correct." |
| NOC role | `NOC Engineer`, BB Wave Inc., Taguig City, July 2026 – Present | **Verified 2026-10-26** (Jerome) | Employer, title, location, start date and duties confirmed. Duties used: operational monitoring and escalation; on morning shifts, assisting UAT/production deployments by triggering existing Jenkins pipelines. No pipeline design or ownership is claimed. "NOC" is not expanded anywhere on the site because the expansion was not given. |
| IT Helpdesk Intern | Philippine Transmarine Carriers, March – May 2025 | Unverified | Confirm employer, dates, duties. |
| Availability | "Available to start immediately." / "Actively job hunting" / hero "Open to opportunities" | **Verified 2026-10-26** (Jerome) | Jerome confirmed he is available to start immediately and actively searching, alongside the current BB Wave role. Wording left unchanged. |
| Target roles | Cloud Support, Junior DevOps, Junior SRE, Entry-Level Cloud | Unverified | Confirm list still reflects the search. |
| Certifications | OCI Foundations Associate, Trend Vision One Server and Workload Protection Professional, GitHub Foundations (earned); Terraform Associate 004 (in progress) | Unverified | Confirm each earned status; confirm Terraform is still in progress. |
| Education | BS Computer Engineering, National University Baliwag, Aug 2021 – Aug 2025 | Unverified | Confirm dates and thesis title. |
| Profile name and location | Jerome Christian V. Ibon, Malolos, Bulacan | Unverified | Confirm the preferred public spelling (`Jerome Christian Ibon` is the current hero name). |
| Project maturity statements | Four projects with per-project status strings | Unverified | Confirm each status wording is still true. |
| `metadata.last_updated` | `2026-09-15` | Stale | Deliberately **not** bumped in P1: only the experience rows were reviewed. Update after the remaining Unverified rows are confirmed. |
| Resume PDF | `frontend/app/public/resume.pdf` | **Placeholder: pending replacement** | Jerome asked for a placeholder for now. The live file was **not** overwritten, because a blank or stand-in PDF would break the site's resume download. It very likely still shows the old TrendAI title and lacks the BB Wave role. Replace only with Jerome's approved latest resume; do not regenerate. |
| Portrait | None | Optional | A real, approved photo, if one is wanted. |

Rules: do not infer missing values; leave a row Blocked rather than guess; after any canonical change run `python backend/tools/build_knowledge.py --write`, `--check`, and `cd backend && python -m evals.run_evals`.

## P2 status (2026-10-26)

Implemented in the working tree, uncommitted: neutral tokens and dark/light themes, new header, name-first hero, footer with API status, removal of signal rail and cursor glow, spacing and column tightening, docs (`DESIGN.md`, `design.json`, `PRODUCT.md`, README, Changelog) rewritten to match. Known leftovers by design: the System Deck (P3), the orbiting capability map, the only perpetual animation (P4), the Contact kicker `IMPROVE / SYSTEM HANDOFF` and section headings still using the old titles (P4), and the fixed assistant button overlapping content on small screens (P4).

## P1 status (2026-10-26)

Done in the working tree, uncommitted: TrendAI title corrected, BB Wave NOC Engineer role added (Taguig City), `experience_boundary` and professional summary updated, assistant prompt and guardrails updated, three evals added, retrieval keywords added for `bb wave` / `bbwave` / `noc engineer`, `approved_knowledge.json` regenerated. No frontend source changes.

Still open before P1 can pass its gate: replace `resume.pdf` with the approved latest resume; confirm the remaining Unverified rows (profile name spelling, certifications, education, project status wording, target roles); decide whether to add `Jenkins` to the skills list; then bump `metadata.last_updated` to reflect the completed review.

## Release blockers and open items (2026-10-26)

Nothing below is solved by this work. The first two block a production release.

1. **Resume PDF is not verified current.** `frontend/app/public/resume.pdf` was left untouched. It very likely shows the old TrendAI title and lacks the BB Wave role (not confirmed: the file was not read). Replace it only with Jerome's approved latest resume; do not regenerate it. Until then the Resume buttons download a possibly outdated file.
2. **Unverified fact rows** in the evidence table above (IT Helpdesk Intern, target roles, certifications, education, profile spelling, project status wording) and the stale `metadata.last_updated`.
3. **Architecture SVGs use the old palette.** The four diagrams in `frontend/app/public/architecture/` still use the paper, copper and Bodoni styling; they sit in a light "sheet" frame in the dark theme. Re-authoring them from the `.mmd` sources is a separate task.
4. **Hero snapshot** `hero-1920-desktop-1920-linux.png` was generated locally; if CI fonts differ, regenerate it in CI rather than loosening the test.
5. **Backend and docs drift** on `/api/health` metadata and managed-identity Cosmos auth (D6), and three backend test files that could not be run locally.
6. **CI and live-site checks** have not run for this branch.

