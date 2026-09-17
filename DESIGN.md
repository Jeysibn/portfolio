---
name: Jerome Ibon Portfolio
description: An editorial control-plane atlas for infrastructure engineering in motion.
colors:
  paper: "#eee9de"
  ink: "#171912"
  panel: "#ded8ca"
  copper-signal: "#e0522d"
  copper-text: "#a93618"
  petrol: "#275d57"
  paper-dark: "#010100"
  ink-dark: "#f4f1ef"
  dark-section: "#0a0a0a"
  dark-raised: "#0d0c0b"
  dark-muted: "#918f8d"
  dark-line: "#1a1a18"
typography:
  display:
    fontFamily: "Bodoni Moda, Georgia, serif"
    fontSize: "clamp(3.25rem, 6.6vw, 6.25rem)"
    fontWeight: 400
    lineHeight: 0.82
    letterSpacing: "-0.03em"
  body:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
  data:
    fontFamily: "IBM Plex Mono, monospace"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.5
spacing:
  xs: "0.5rem"
  sm: "1rem"
  md: "1.5rem"
  lg: "2.5rem"
  xl: "4rem"
  section: "clamp(110px, 6.5vw, 130px)"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    padding: "16px 20px"
---

# Design System: Jerome Ibon Portfolio

## Overview

**Creative North Star: “The Editorial Control-Plane Atlas”**

Infrastructure in Motion combines magazine-scale typography with precise system notation. One copper signal travels through the page as an ambient infrastructure lifecycle—signal, provision, deploy, run, observe, improve—while the portfolio chapters remain ordered for recruiter comprehension. Quiet paper sections alternate with dense ink and petrol system chapters.

Key characteristics: asymmetric composition, hairline rules, open whitespace, explicit architecture flows, restrained operational color, and motion that communicates relationships.

## Colors

Warm Paper and Infrastructure Ink form the light reading surface. Copper Signal marks live state and Petrol marks systems depth. Dark mode is the default cinematic surface: near-black tonal layers, warm off-white type, quiet hairlines, and desaturated technical diagrams. The reference direction is translated into the portfolio's infrastructure language rather than copied literally.

## Typography

Bodoni Moda carries identity and chapter scale; Manrope carries readable detail; IBM Plex Mono is reserved for state, counts, periods, and technical metadata. Display tracking never exceeds `-0.04em`; body copy stays near 65–75 characters where layout permits.

## Layout

Content uses a fluid maximum-width atlas with strongly asymmetric offsets. Projects are represented as stacked system dossiers rather than generic cards. The active dossier becomes the current inspection plane while background dossiers retain visible technical identity. The capability map is a topology-inspired Control Plane: supported desktop layouts use a slow outer domain orbit whose visible guide is tied to the same radius as the moving domains, plus independently paced inner technology orbits. Wrappers counter-rotate content so labels remain upright. Domain cards stay quiet; hovering or keyboard-focusing an individual technology pauses its local orbit and reveals only that technology's name. Constrained widths use a structured static domain list. At 900px, wide structures collapse; at 600px, the narrative becomes a vertical stack, architecture becomes a two-column sequence, and interactive topology becomes a one-column domain list.

Desktop density is height-aware as well as width-aware. On wide displays with limited vertical space, display type, section padding, and project dossier geometry use a compact treatment so a 1920×1080 workstation remains scanable. Dark mode is the first-visit atmosphere, while the explicit light theme remains a complete reading surface. The Control Plane is the portfolio's one intentional ambient motion system: CSS transforms run only while it is near the viewport, pause during interaction, and stop completely under reduced motion. Hero, signal, and dialog transitions remain restrained.

The fixed Signal Rail is not a second navigation menu and does not map one lifecycle stage to one portfolio section. Its progress line and active/completed nodes derive from one monotonic document-scroll progress model, so the infrastructure metaphor never moves backward when the content order changes. Full labels are reserved for wide gutters; medium desktop uses marker-only presentation.

## Elevation & Depth

The system is flat by default. Hairline rules, surface shifts, and scale create hierarchy. Ambient shadows are reserved for protected-focus layers: dialogs and the assistant.

## Shapes

Rectilinear editorial frames dominate. Circular forms belong only to topology or state. Pills are not a container pattern. Signal states use circle, square, chevron, core, aperture, and handoff geometries.

## Components

Buttons are square-edged, text-forward, and high contrast. Project dossiers use hairline overlap, controlled translation, scale, and surface shifts to create physical paper depth. Native dialogs provide focus protection. Navigation uses a restrained active underline, while the mobile navigation becomes a compact two-column sheet.

### System Deck

The Projects chapter uses one interactive System Deck. A circular logical order keeps the active dossier at depth zero and exposes the remaining dossiers behind it with useful system number, title, and category labels. Selecting a dossier is a deliberate reorder: the active sheet lifts and moves toward the back while the selected sheet settles into the front plane. GSAP owns this state-change motion; idle dossiers remain still.

The deck preview uses a compact repository-derived topology, short summary, and primary technology line. Full outcomes and architecture evidence stay in the native inspection dialog, with a text equivalent beside every SVG. Reduced-motion users receive immediate deck reordering without translation, rotation, parallax, or dramatic scaling. On phones, exposed dossiers become top-edge sheets and the preview flow becomes a readable two-column sequence rather than a shrunken desktop diagram.

## Do's and Don'ts

### Do:

- **Do** use copper sparingly to mark state and transfer.
- **Do** keep essential content visible before motion initializes.
- **Do** vary quiet and dense chapters within the same rule system.

### Don't:

- **Don't** introduce terminal chrome, generic dashboards, glass cards, or decorative gradients.
- **Don't** use monospace as a general display voice.
- **Don't** hide technical proof behind hover or animation.
