---
name: Jerome Ibon Portfolio
description: Monochrome Control Plane — an editorial infrastructure portfolio built around live state, system evidence, and restrained signal color.
colors:
  deep-black: "#0b0b0a"
  charcoal: "#121211"
  mid-gray: "#777269"
  muted-gray: "#aaa59a"
  off-white: "#f3f0e8"
  warm-white: "#faf8f1"
  signal-copper: "#c6532f"
typography:
  display:
    fontFamily: "Bodoni Moda, Georgia, serif"
    role: "identity, chapter statements, project names, editorial moments"
  body:
    fontFamily: "Manrope, Arial, sans-serif"
    role: "reading copy, outcomes, experience, and handoff details"
  utility:
    fontFamily: "IBM Plex Mono, monospace"
    role: "state, metadata, labels, dates, counts, and system notation"
motion:
  fast: "150–220ms"
  normal: "350–550ms"
  ambient: "27–104s, capabilities only"
---

# Design System: Monochrome Control Plane

## Overview

**Monochrome Control Plane** is the visual evolution of Jerome Ibon's editorial control-plane atlas. The portfolio stays unmistakably infrastructure-focused: the lifecycle Signal Rail, System Deck, architecture evidence, orbital Capabilities map, and recruiter-oriented System Handoff remain the organizing systems.

The design is mostly neutral. Copper is a state signal, not a decoration. The page moves through intentional environments—deep black for identity, operations, capability inspection, and handoff; warm off-white for projects, documentation, credentials, principles, and resume reading. The contrast between chapters creates pacing without relying on theatrical transition effects.

## Color system

The neutral palette is the default:

- **Deep black** `#0b0b0a` — hero, Experience, Control Plane, Contact, and footer environments.
- **Charcoal** `#121211` — dark panels and the Control Plane core.
- **Mid gray** `#777269` — topology lines, inactive glyphs, and structural rules.
- **Muted gray** `#aaa59a` — secondary copy and quiet metadata on dark chapters.
- **Off-white** `#f3f0e8` — primary light reading surface.
- **Warm white** `#faf8f1` — active dossier and raised editorial surfaces.
- **Signal copper** `#c6532f` / `#d7663d` in dark preference — active, focused, selected, or primary handoff state.

Color is allowed to indicate an operating state: active project, focused capability, selected system, important topology edge, or meaningful action. Inactive project dossiers and capability glyphs are desaturated and quieter. State is never communicated by color alone; it is paired with focus, border, weight, placement, or a visible label.

The global Light/Dark preference remains available for user preference and browser surfaces. The page itself also uses semantic light and dark chapters, so the visual composition does not collapse into a single global wash when the preference changes.

## Typography

Bodoni Moda, Manrope, and IBM Plex Mono remain the identity system. The refinement is in role discipline rather than a wholesale font swap:

- **Display** — Bodoni Moda carries the name, chapter scale, project names, and selected editorial statements. Large type is reserved for identity and hierarchy.
- **Body** — Manrope carries explanation, outcomes, experience, and recruiter-readable copy at comfortable line lengths.
- **Utility** — IBM Plex Mono is reserved for lifecycle states, labels, metadata, dates, counts, technology lines, and system notation.

Display type establishes mood; utility type proves engineering depth. Monospace is not used as a general display voice.

## Section environments

The sequence remains:

```text
Hero → Projects → Experience → Capabilities → Credentials → Principles → Resume → Contact
```

The tonal rhythm is intentional rather than zebra-like:

```text
Hero          deep black       identity / signal
Projects      warm off-white   inspected systems
Experience    deep black       operational history
Capabilities  deep black       control-plane map
Credentials   warm neutral     editorial documentation
Principles    warm off-white   operating philosophy
Resume        warm off-white   recruiter handoff material
Contact       deep black       system handoff
```

Navigation is a stable dark control strip so links remain readable while the document changes environment. The Signal Rail adapts through inherited neutral variables and remains a progress instrument, not a second menu.

## System Deck

Projects remain a stacked System Deck, not generic cards. The active dossier is the current inspection plane: it has full contrast, a copper edge, readable architecture flow, technology evidence, and direct case-study/source actions. Background dossiers remain selectable and semantically labelled, but their surfaces and topology previews are desaturated and reduced in contrast.

The deck keeps its existing keyboard arrows, pointer swipe, numbered selector, native inspection dialog, repository-derived diagrams, and reduced-motion reordering. Engineering artifacts are treated as figures with rules, captions, and architecture-sheet framing rather than simulated device mockups.

## Control Plane capabilities

The orbital architecture remains the portfolio's primary ambient motion system. The center stays a dark Control Plane; domains orbit on quiet guide paths; technology glyphs are neutral by default. Hovering or keyboard-focusing a domain increases its contrast, introduces a copper boundary, and suppresses unrelated domains. Hovering or focusing a technology reveals its name and copper state while keeping the complete capability set inspectable.

The orbital system pauses during local interaction and stops under `prefers-reduced-motion: reduce`. Constrained layouts use the existing structured static domain list, preserving the same content and keyboard controls without forcing desktop geometry onto mobile.

## Signal Rail

`SIGNAL → PROVISION → DEPLOY → RUN → OBSERVE → IMPROVE` remains a signature. Its progress line and active/completed states still derive from document scroll progress. The rail is visually subordinate: gray structure, one copper active marker, and reduced labels at narrower desktop widths.

## Shapes, rules, and elevation

The system is flat by default. Hairline rules, environmental shifts, typography, and scale create hierarchy. Rectilinear frames dominate. Circular geometry belongs to topology or state. Rounded containers are limited to functional browser controls; there is no pill-based card language, glassmorphism, decorative dashboard chrome, gradient background, particle field, or 3D ornament.

The assistant follows the same principle: a compact neutral instrument panel with a restrained border, not a floating SaaS chatbot bubble. It gains copper only on interaction or meaningful status.

## Motion and performance

Motion is limited to a small number of authored systems:

- one-time hero/path and section-rule entrance motion;
- System Deck selection and reorder motion;
- slow in-view capability orbits;
- small hover/focus and dialog transitions.

The removed cursor glow avoided a continuous mouse-following layer that did not add engineering meaning. No WebGL, canvas loop, parallax field, or heavy visual dependency is introduced. CSS transforms, opacity, filters, GSAP's existing deck transition, and IntersectionObserver remain the performance tools.

## Accessibility

The redesign preserves the existing skip link, semantic sections, native buttons and dialogs, live status regions, accessible architecture summaries, keyboard project selection, keyboard capability inspection, visible focus outlines, image text equivalents, and reduced-motion support. Focus and border changes accompany copper state changes so active content is not dependent on color perception.

Contrast is checked per chapter because dark and light surfaces coexist. Essential content is available before motion initializes, hover is not required for project or capability access, and mobile layouts replace orbital complexity with a readable static sequence.

## Responsive art direction

Desktop uses large display type, asymmetric project composition, and the orbital map. Tablet reduces the density of wide structures while retaining chapter rhythm and the System Deck. Mobile becomes a clear reading document: the deck becomes a simple exposed-sheet sequence, capabilities use a static domain list, imagery/architecture stays scrollable, and decorative topology is kept subordinate to content.

The layout is validated against the portfolio's target widths: 2560, 1920, 1536, 1440, 1366, 1024, 768, 430, 390, and 375 CSS pixels.

## Do's and don'ts

### Do

- Use neutral surfaces as the default state.
- Use copper to answer “what is live, selected, focused, or important?”
- Keep system evidence visible and recruiter-readable.
- Let whitespace, rules, and tonal chapters provide pacing.
- Keep orbital motion and the System Deck as the main authored interaction systems.

### Don't

- Don't turn the portfolio into a Grayscale Collective clone or a generic visual portfolio.
- Don't distribute copper across every icon, label, or border.
- Don't introduce SaaS cards, glass panels, neon gradients, fake metrics, particles, or cyberpunk decoration.
- Don't hide technical proof behind hover or motion.
- Don't increase animation simply to make the page feel “modern.”
