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
  paper-dark: "#10130f"
  ink-dark: "#e8e6da"
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
  section: "clamp(90px, 12vw, 180px)"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    padding: "16px 20px"
---

# Design System: Jerome Ibon Portfolio

## Overview

**Creative North Star: “The Editorial Control-Plane Atlas”**

Infrastructure in Motion combines magazine-scale typography with precise system notation. One copper signal travels through every chapter and changes state from signal to provision, deploy, run, observe, and improve. Quiet paper sections alternate with dense ink and petrol system chapters.

Key characteristics: asymmetric composition, hairline rules, open whitespace, explicit architecture flows, restrained operational color, and motion that communicates relationships.

## Colors

Warm Paper and Infrastructure Ink form the reading surface. Copper Signal marks live state and Petrol marks systems depth. Dark mode uses a green-black field and warm off-white ink rather than simple inversion.

## Typography

Bodoni Moda carries identity and chapter scale; Manrope carries readable detail; IBM Plex Mono is reserved for state, counts, periods, and technical metadata. Display tracking never exceeds `-0.04em`; body copy stays near 65–75 characters where layout permits.

## Layout

Content uses a fluid maximum-width atlas with strongly asymmetric offsets. Projects are represented as stacked system dossiers rather than generic cards. The active dossier becomes the current inspection plane while background dossiers retain visible technical identity. The capability map is an orbital control plane on large screens and becomes a complete static grouped system on tablets and phones. At 900px, wide structures collapse; at 600px, the narrative becomes a vertical stack, architecture becomes a two-column sequence, and interactive topology becomes a one-column domain list.

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
