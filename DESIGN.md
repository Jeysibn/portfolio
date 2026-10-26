---
name: Jerome Ibon Portfolio
description: Engineered Simplicity, Quiet Motion. A near-black, grainy, monochrome portfolio with condensed uppercase display type and credible engineering evidence.
colors:
  bg-dark: "#0a0a0a"
  surface-dark: "#171717"
  text-dark: "#f0ede8"
  muted-dark: "#9b9892"
  rule-dark: "#262626"
  bg-light: "#f2efe9"
  surface-light: "#faf8f4"
  text-light: "#0a0a0a"
  muted-light: "#55524d"
  rule-light: "#d9d4cb"
typography:
  display:
    fontFamily: "Big Shoulders Display, Arial Narrow, Impact, sans-serif"
    fontSize: "clamp(3.5rem, 11vw, 9rem)"
    fontWeight: 700
    lineHeight: 0.9
    letterSpacing: "-0.03em"
  body:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 500
    letterSpacing: "0.22em"
spacing:
  section: "clamp(72px, 8vw, 112px)"
components:
  button-primary:
    backgroundColor: "{colors.text-dark}"
    textColor: "{colors.bg-dark}"
    rounded: "999px"
    padding: "16px 28px"
---

# Design System: Jerome Ibon Portfolio

> The visual direction follows the monochrome look of grayscale-collective.com (checked 2026-10-26): near-black field, warm off-white text, film grain, a soft light pool in the hero, huge condensed uppercase headings, tiny tracked labels, ghost numerals, charcoal rounded cards and pill controls. The execution plan is [`docs/redesign/MASTER_PLAN.md`](docs/redesign/MASTER_PLAN.md); decisions that depart from it are in `docs/redesign/DECISIONS.md`.

## Overview

**Creative North Star: "Engineered Simplicity, Quiet Motion."**

A monochrome portfolio with poster-like type and a quiet, grainy atmosphere. A recruiter should identify who Jerome is, what roles he seeks and how to reach him within seconds; engineers can then inspect evidence-backed case studies.

## Colors

Strictly neutral, with both themes designed on purpose. Semantic tokens in `styles.css` (`--color-bg`, `--color-surface`, `--color-surface-hover`, `--color-text`, `--color-muted`, `--color-rule`, `--color-rule-strong`, `--color-strong`, `--color-focus`) are the source of truth. Dark is near-black (`#0a0a0a`) with warm off-white text (`#f0ede8`); light is a warm off-white (`#f2efe9`) with near-black text. The saved theme wins, then the operating-system preference; dark is not forced. Errors and states are always carried by text and shape, never by color alone. Legacy token names (`--ink`, `--paper`, `--signal`, ...) are aliases onto these tokens; delete one when nothing uses it.

## Atmosphere

Two static layers on `body`: a soft radial light pool behind the hero (`body::before`) and a fixed, non-interactive film-grain overlay (`body::after`, an inline SVG noise tile, `mix-blend-mode: overlay`, opacity from `--grain-opacity`). Neither animates or affects contrast checks.

## Typography

- **Display:** Big Shoulders Display 700, uppercase, tight negative tracking, very large. Used for the hero name, section headings, the contact email, dialog titles, and (mixed-case) card and role titles.
- **Body and labels:** Barlow. Labels are 11px, 500, uppercase, 0.22em tracked and muted; they sit above headings and on metadata.
- Ghost numerals (`01` to `06`) sit at the right of each section heading at about 9% opacity. They are CSS generated content and hidden from assistive technology.
- Body copy stays near 60 to 72 characters per line.

## Layout

Content sits in a 1200px maximum column with a fluid gutter; the header aligns to the same edges. Vertical rhythm is 8px based; sections use `--space-section` (72 to 112px). Everything stacks on narrow screens, and nothing depends on hover.

- **Header:** `JI` lettermark and `JEYSIBN`, four uppercase tracked destinations (Work, Experience, Toolkit, Contact), a pill Resume link that downloads the PDF, and the theme switch. Below 900px the destinations collapse into a menu that also lists Resume. Toolkit is current for both `#skills` and `#credentials`; every section keeps its own anchor ID.
- **Hero:** tracked eyebrow (Cloud Support, DevOps, Cloud Engineering), the name in display type, one statement, pill actions (View work, Resume download, GitHub, LinkedIn) and a two-fact row (Based in, Status).
- **Sections:** tracked eyebrow, uppercase display heading, ghost numeral. Work, Experience, Toolkit, Credentials, Contact (ghost numerals 01 to 05). There is no Resume section: the PDF downloads from the header, the hero and Contact.
- **Contact:** no headline or lead-in copy. The email address in display type, one availability line, Send email and Copy email pills, and a ruled row of LinkedIn, GitHub and Resume links.
- **Work:** all four projects at once as rounded charcoal cards: Homelab GitOps Environment and Cloud-Backed Portfolio under "Selected work", MoniKey and NOC Report Builder under "Currently building". Each card shows category and status, summary, outcome, a one-line flow, pill technology tags, a "View case study" pill and public links. The case study opens the native dialog with the full architecture diagrams and their text equivalents.
- **Toolkit:** six skill groups of pill buttons; each skill opens a detail dialog, and each group has a "Group details" button.
- **Footer:** brand line, technical signature, API status and visitor count.

## Elevation & Depth

Flat. Borders and surface shifts only. One soft shadow is reserved for dialogs and the assistant.

## Shapes

Pills (999px) for buttons, tags and chips; 16px radius on cards and dialogs; 8px on the lettermark. Circles only for status and the theme glyph.

## Motion

Quiet and optional; nothing loops. Tokens: `--motion-fast` 180ms, `--motion-medium` 420ms, `--motion-enter` 650ms, `--ease-out` `cubic-bezier(.22,1,.36,1)`. Animate `transform` and `opacity` only.

- **Hero entrance:** eyebrow, name, statement, actions and facts rise 16px and fade in over 650ms with an 80ms stagger, once per load (CSS keyframes, `backwards` fill).
- **Scroll reveal:** section headings, project groups and experience entries rise 10px over 480ms the first time they appear (`data-reveal`, `useScrollReveal` in `hooks.ts`). Hidden only after the hook has confirmed IntersectionObserver and no reduced-motion preference; anything on screen is revealed.
- **Project cards:** lift 3px with a brighter border in 180ms on hover (pointer devices) and on keyboard focus (`:has(:focus-visible)`). Link arrows (`Arrow` component) nudge in their own direction.
- **Navigation and controls:** the active underline scales in; the theme glyph turns; buttons press 1px; the dialog and its backdrop fade in over 220ms.
- **Case-study flow:** an ordered list of steps from the project's `architectureFlows` with hairline connectors that trace in over about one second, once, when the dialog opens.
- **Reduced motion:** every rule that moves lives in `prefers-reduced-motion: no-preference`; with reduced motion all content is in its final state and only colour and border feedback remains.

Prohibited: continuous animation of any kind, particles, parallax, cursor effects, scroll-jacking, pinned sections and loaders. Content must be readable with JavaScript delayed or absent and with reduced motion.

## Components

Primary button: strong fill, inverse text, uppercase tracked 12px, pill. Secondary: outlined pill. Native dialogs provide focus protection. Navigation uses a one-pixel active underline.

## Do's and Don'ts

### Do:

- **Do** keep essential content visible before motion initializes.
- **Do** keep every claim traceable to `content/portfolio.json`.
- **Do** keep text at AA contrast; labels use `--color-muted`, never lighter.

### Don't:

- **Don't** add color accents, glass, gradients or terminal chrome.
- **Don't** hide technical proof behind hover or animation.
- **Don't** animate the grain or the light pool.
