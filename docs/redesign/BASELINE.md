# Redesign Baseline (P0)

Pre-redesign state, recorded before any UI change. Everything below was observed locally; nothing here is a live-site or CI result.

| Item | Value |
| --- | --- |
| Recorded | 2026-10-26 |
| Branch | `feat/portfolio-quiet-motion` |
| Base | `origin/dev` @ `757661cda55ca2e78294f91dedc0f9e4b445331d` |
| `origin/main` | `285711dc82876b69aabc8acc7a8d105058f3330e` (merge of `dev`, no extra content) |
| Environment | WSL2 Ubuntu, Node v24.22.1 (CI targets Node 22), Playwright Chromium headless shell 153.0.8010.12 |
| Deployment status | NOT DEPLOYED. No live-site QA was performed for this baseline. |

## Frontend validation (from `frontend/app`)

| Command | Result |
| --- | --- |
| `npm ci` | pass (260 packages) |
| `npm run typecheck` | pass |
| `npm run lint` | pass (`--max-warnings 0`) |
| `npm test -- --run` | pass, 10 files / 31 tests |
| `npm run build` | pass |
| `npm run perf:budget` | pass, **143.7 KiB gzip** JS (421.8 KiB raw) against the 180 KiB budget |
| `PLAYWRIGHT_SKIP_BUILD=1 npm run test:ui` | **1 failed, 20 passed, 12 skipped** (see below) |

Vite output sizes: `index.html` 3.87 kB, CSS 50.96 kB (11.17 kB gzip), JS 431.89 kB (148.68 kB gzip by Vite's own accounting; the budget script uses its own gzip level and reports 143.7 KiB). Use the `perf:budget` figure as the comparison number for later milestones.

### Pre-existing baseline failure

`desktop-1920 › captures the stable 1920px hero anchor` fails: 69,490 pixels (4%) differ from the committed `hero-1920-desktop-1920-linux.png`.

- The received image renders the hero in fallback fonts (DejaVu-style serif and sans). The page requests Manrope, Bodoni Moda and IBM Plex Mono from Google Fonts, and none of them are installed locally (`fc-list`). Why the headless browser did not apply the web fonts was not investigated; the committed snapshot was most likely generated with them applied (inferred, not confirmed).
- Later finding (during P2): Chromium here reported `net::ERR_BLOCKED_BY_ORB` for the combined Google Fonts stylesheet URL (Bodoni Moda + IBM Plex Mono + Manrope), so no web font loaded. Once Bodoni Moda was removed from that URL in P2, the stylesheet loaded. This baseline was recorded before that change.
- The most likely cause is this environment difference, not a code regression. It has **not** been confirmed against CI, so the committed snapshot was left unchanged and not regenerated.
- The snapshot will be replaced deliberately in P2, when the hero changes, after visual inspection.

The 12 skipped tests are project/viewport combinations the spec excludes with explicit `test.skip` guards (desktop-only, mobile-only, and the 1920px-only visual anchor).

## Backend

| Command | Result |
| --- | --- |
| `python3 backend/tools/build_knowledge.py --check` | pass |
| `python -m evals.run_evals` | pass (all cases reported `passed: true`) |
| `ruff check .`, `pytest` | **not run**: the host has no `pip`/`python3-venv`, so backend dependencies could not be installed. CI covers these. |

## Baseline screenshots

20 PNGs (fold and full page) at 320×700, 390×844, 768×1024, 1440×900 and 1920×1080, each in light and dark, with `reducedMotion: reduce`. Taken from a local `vite preview` of the unmodified build.

They are stored outside the repository to keep binaries out of the P0 PR (session scratchpad: `baseline/screenshots/`); the generating script is `baseline/shoot.mjs` in the same folder. Commit them under `docs/redesign/baseline/` only if you want them versioned.

Measured document overflow: none at any viewport (`scrollWidth <= clientWidth`).

Caveats when reading the images:

- Fonts are fallbacks (see above), so type metrics differ from production. At 390px the hero name and summary visibly clip at the right edge with the fallback fonts; recheck with real fonts before treating it as a defect.
- The hero shows `API UNAVAILABLE` because the page was served from `127.0.0.1`, which is outside the API's allowed CORS origin. This is expected locally and is not a backend fault.

## Observed risks for later milestones

- Existing browser tests are tied to the current design (`freezes the complete capability orbit on pointer hover`, `keeps the project deck keyboard-accessible`, `simplifies motion while preserving capability content`). They must be replaced with behavior-contract tests in P3/P4, not deleted.
- Theme colors are hardcoded in `hooks.ts` and `index.html` (`#10130f` / `#eee9de`) and must change together in P2.
- Backend, docs, and `frontend/app/src/api.ts` disagree about `/api/health` release metadata and managed-identity Cosmos auth after commit `757661c`. This is outside the redesign and should be a separate PR.
