---
name: Jerome Ibon — Control Plane
description: An interaction-led technical portfolio where systems move from source to operation.
colors:
  signal-red: "#DF3F22"
  signal-red-dark: "#FF6845"
  mineral: "#EDF0EB"
  mineral-bright: "#FAFBF7"
  ink: "#101411"
  ink-soft: "#4D5750"
  line: "#B9C0BA"
  control-black: "#0B0F0D"
  control-raised: "#151B17"
  control-soft: "#AAB6AD"
typography:
  display:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "clamp(3.25rem, 8vw, 7rem)"
    fontWeight: 400
    lineHeight: 0.92
    letterSpacing: "-0.045em"
  headline:
    fontFamily: "IBM Plex Sans, Arial, sans-serif"
    fontSize: "clamp(2rem, 4vw, 4rem)"
    fontWeight: 600
    lineHeight: 0.98
    letterSpacing: "-0.035em"
  title:
    fontFamily: "IBM Plex Sans, Arial, sans-serif"
    fontSize: "clamp(1.25rem, 2vw, 1.75rem)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  body:
    fontFamily: "IBM Plex Sans, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "IBM Plex Mono, monospace"
    fontSize: "0.72rem"
    fontWeight: 500
    lineHeight: 1.35
    letterSpacing: "0.08em"
rounded:
  sm: "4px"
  md: "10px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "40px"
  xl: "72px"
  section: "clamp(96px, 13vw, 184px)"
components:
  button-primary:
    backgroundColor: "{colors.signal-rust}"
    textColor: "{colors.paper-bright}"
    rounded: "{rounded.sm}"
    padding: "13px 18px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "12px 18px"
---

# Design System: Control Plane

## Overview

**Creative North Star: “Systems in motion.”**

This portfolio treats engineering work as a connected control plane. Identity sits on a quiet mineral surface; real projects and capabilities move into dark technical zones where signal red traces source, delivery, runtime, and observability. Typography, rules, architecture, and motion carry the identity before containers or ornament.

The experience serves two reading modes. Recruiters should understand Jerome’s direction, experience, projects, resume, and contact path quickly. Technical readers should be able to move from a concise project summary into architecture, delivery, observability, tradeoffs, and source material. The visual world must remain confident without suggesting seniority beyond the supplied experience.

**Key Characteristics:**

- editorial engineering documentation, not a dashboard
- asymmetrical grid with clear reading paths
- one scarce signal color, used as annotation and action
- real diagrams and screenshots as proof
- restrained motion with one meaningful system-flow interaction
- intentional light and dark themes, not an inverted afterthought

## First-screen contract

At 1440 × 900, the first screen must show Jerome's name, Cloud/DevOps role direction, the operating statement, availability, and actions for selected work, contact, résumé, and GitHub. It should also reveal the beginning of Selected Work so the visitor understands that projects are the primary evidence. The hero contains no decorative cloud illustration, terminal, metric dashboard, or oversized portrait.

The working positioning line is: “I build cloud systems that are automated, observable, and meant to be operated.” Supporting copy identifies Jerome as a Computer Engineering graduate and states his entry-level direction without making seniority the headline.

## Colors

The palette moves from warm paper and ink in light mode to graphite and soft mineral text in dark mode. Rust is the only expressive signal; it marks action, focus, and meaningful system state rather than decoration.

### Primary

- **Signal Rust** (#A9472B): primary actions, active navigation, diagram trace, selected project state. This deeper value preserves readable white text in light mode.
- **Deep Rust** (#8F3D26): dark-mode action state and high-contrast hover treatment.

### Neutral

- **Paper** (#F4F1EA): light-mode page background.
- **Paper Bright** (#FBFAF6): light surfaces, inverse text, and diagram backing.
- **Ink** (#1C211D): light-mode primary text.
- **Ink Soft** (#4F5850): secondary text and technical summaries.
- **Line** (#C9C7BE): rules, dividers, and quiet boundaries.
- **Graphite** (#141815): dark-mode page background.
- **Graphite Raised** (#1D241F): dark-mode surfaces and image frames.
- **Graphite Soft** (#AAB2A8): dark-mode secondary text and metadata.

### Named Rules

**The Signal Scarcity Rule.** The rust accent should occupy a small fraction of any viewport. If a whole section is colorful, the hierarchy has failed.

**The Rule Before the Card Rule.** Use alignment, whitespace, and a 1px rule before reaching for a rounded container.

## Typography

**Display Font:** Newsreader (with Georgia, serif fallback)

**Body Font:** IBM Plex Sans (with Arial, sans-serif fallback)

**Label/Mono Font:** IBM Plex Mono (with system monospace fallback)

Newsreader gives the identity a human editorial voice without becoming literary or ornate. IBM Plex Sans keeps technical copy readable and grounded. IBM Plex Mono is limited to paths, commands, timestamps, repository metadata, and system-flow labels.

### Hierarchy

- **Display** (400, `clamp(3.25rem, 8vw, 7rem)`, 0.92): owner name and one major statement per surface.
- **Headline** (600, `clamp(2rem, 4vw, 4rem)`, 0.98): section titles and case-study leads.
- **Title** (600, `clamp(1.25rem, 2vw, 1.75rem)`, 1.1): project, role, and subsection titles.
- **Body** (400, 1rem, 1.6): explanatory copy with a 65–75ch maximum measure.
- **Label** (500, 0.72rem, 1.35, 0.08em tracking): metadata, categories, states, repository paths, and system-flow stages.

Avoid all-caps paragraphs, gradient text, and monospace body copy. Headlines should wrap intentionally; do not use forced line breaks when the responsive layout can balance naturally.

## Layout

- Max content width: 1280px, with 20px minimum inline padding on small screens, 32px on tablets, and 48px on wide screens.
- Desktop grid: 12 columns with 24px gutters. Hero and project features may span 7/5 or 8/4 splits.
- Tablet grid: 8 columns with 20px gutters.
- Mobile grid: one column; preserve editorial alignment and rules rather than compressing into cards.
- Section rhythm: `clamp(80px, 10vw, 144px)` between major sections; 20–40px within a section.
- Sticky header: compact, opaque enough to preserve focus visibility; never cover anchored headings without scroll-margin compensation.
- Homepage order: hero → selected work → engineering approach/about → experience → skills → credentials/education → resume → contact.
- Projects appear as evidence-led rows or feature spreads. Avoid a repeated 3-card grid.
- Case studies use a readable article column with a wider artifact rail where the viewport allows it.
- Long technical copy stays between 65–75ch. Metadata may use narrower measure and columns.

### Spacing scale

Use 4, 8, 12, 16, 24, 32, 48, 72, 96, and 144px. Adjacent label/title pairs use 8–12px; title/body groups use 16–24px; related blocks use 32–48px; major sections use 80–144px.

Responsive behavior:

- At widths below 960px, navigation becomes a disclosure menu and project feature splits stack.
- At widths below 680px, metadata columns become ordered rows; diagrams use a contained frame with explicit open-original action.
- At widths below 480px, display type reduces before horizontal padding is reduced; no content may require horizontal scrolling.
- Touch targets are at least 44px. Hover-only information is never required.

## Theme tokens

Light mode uses Paper (`#F4F1EA`) as the page, Paper Bright (`#FBFAF6`) for functional raised surfaces, Ink (`#1C211D`) for primary text, Ink Soft (`#4F5850`) for secondary text, Line (`#C9C7BE`) for rules, and Signal Rust (`#B65332`) for action and focus.

Dark mode is independently tuned: Graphite (`#141815`) page, Graphite Raised (`#1D241F`) functional surface, warm white (`#F2EFE7`) primary text, mineral (`#B8C0B6`) secondary text, a translucent warm line, and light copper (`#E58664`) for action. Success states use forest green in light mode and pale sage in dark mode. All small text combinations must reach 4.5:1.

## Elevation & Depth

The system is primarily flat and layered. Depth comes from tonal surfaces, rules, image frames, and spacing. Shadows are reserved for dialogs and the assistant panel, where separation is functional. No glass blur, neon halo, colored glow, or decorative soft card stack.

Image and diagram frames use a quiet border, not a heavy card treatment. Full-resolution artifacts open only on explicit action and should not block the main reading flow.

## Shapes

- Default radius: 4px for buttons, controls, and image frames.
- 10px radius is reserved for dialogs or larger utility panels.
- Pills are limited to compact status or filter controls; they are not the default shape for buttons or content.
- Rules are 1px and use the theme line token.
- Focus rings use a 2px signal-rust outline with a 3px contrasting offset.
- No colored left rails, oversized rounded cards, or nested card surfaces.

## Components

- **Header:** wordmark, anchor navigation, theme control, and mobile disclosure. Active state is an underline/rule plus text color, never color alone.
- **Hero:** name, role direction, value statement, availability context, primary work/contact actions, résumé/GitHub links, and one restrained site-as-project proof line.
- **Project feature:** category label, title, purpose, 2–3 engineering signals, artifact, technologies as plain supporting text, repository and case-study links.
- **Field note:** small label, clear heading, body copy, and optional rule. It is a content pattern, not a bordered card.
- **Experience row:** role, organization, date, location, then 2–4 bullets. Dates and organizations remain visible without interaction.
- **Skills group:** visible group heading and text list. Dialogs may expose detail but cannot be required for discovery.
- **Case study:** context, goal/constraints, architecture, implementation, delivery, observability, tradeoffs, outcomes, learning, technologies, repository.
- **Assistant:** fixed utility button labeled “Ask about my work”; panel is non-blocking, keyboard reachable, dismissible with Escape, and never obscures primary actions on mobile. When closed, its contents are removed from keyboard navigation.
- **Dialog:** native `dialog` semantics where interruption is justified; initial focus, Escape close, backdrop close, and focus return are required.

Motion:

- The signature system is Infrastructure Pulse: a brief hero network sequence plus project evidence that changes with the reader’s position.
- Experience draws chronologically; About, capabilities, and credentials use distinct reveal patterns tied to their content.
- Microinteractions use 150–250ms transitions for focus, navigation, theme, and state feedback.
- No continuous ambient loop, typing headline, scroll hijacking, cursor effects, or repeated identical section reveals.
- `prefers-reduced-motion: reduce` renders completed diagrams and visible content while disabling scroll scrub, parallax, tilt, packets, and entrance transforms.

## Project and case-study behavior

Homepage projects alternate image/text emphasis instead of repeating identical cards. Each shows category, purpose, three engineering signals, a short technology line, repository, and case-study link. Real diagrams are cropped only for legibility and always retain an open-original path.

Case studies use a project masthead, an evidence artifact, a sticky local index on desktop, and a 65–75ch article. The Cloud Portfolio story covers the static frontend/serverless split, API contracts, Terraform/OIDC delivery, liveness boundaries, persistence/rate limiting, observability, and cost guardrails. The Homelab story covers the current single-node topology, historical two-node experiment, bootstrap order, GitOps reconciliation, DNS/networking incident, observability, and single-node tradeoffs.

The signature interaction belongs to the Cloud Portfolio case study: four buttons—Request, Persist, Deliver, Observe—select real paths through one SVG system diagram. Selection changes the drawn path and an adjacent plain-language explanation. All states work by keyboard and tap; the complete architecture remains understandable with JavaScript or motion disabled.

## State rules

- Loading, success, and unavailable states for live APIs use text and shape as well as color.
- Mobile navigation and assistant use real disclosure state; Escape closes them and focus returns to the trigger.
- Dialogs use native `dialog`, close on Escape and backdrop interaction, and return focus.
- External links disclose their destination in accessible text where context is otherwise ambiguous.
- Anchor targets use `scroll-margin-top` and programmatic smooth scrolling is disabled for reduced-motion users.

## Do's and Don'ts

### Do

- Lead with Jerome’s name, direction, and believable operating mindset.
- Put real project artifacts early.
- Use architecture, delivery, and observability language as evidence.
- Keep entry-level positioning honest and natural.
- Preserve direct resume, GitHub, LinkedIn, and email access.
- Make light and dark modes feel authored independently.
- Use the site’s own engineering implementation as a case study.

### Don't

- Do not use terminal cosplay, giant dashboards, floating technology logos, or fake infrastructure screenshots.
- Do not introduce purple/blue SaaS gradients, glassmorphism, bento grids, neon borders, or decorative metrics.
- Do not turn every content group into a card.
- Do not make monospace the default voice.
- Do not invent outcomes, users, scale, uptime, savings, or seniority.
- Do not add a router or dependency unless the static deployment constraint requires it.
