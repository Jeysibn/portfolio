---
name: Jerome Ibon Portfolio
description: Infrastructure Editorial — a monochrome, cinematic portfolio about systems and reliability.
colors:
  paper: "#eeebe4"
  ink: "#11110f"
  paper-dark: "#080807"
  ink-dark: "#f1eee8"
  accent: "#7b2638"
  dark-accent: "#d0909b"
typography:
  display:
    fontFamily: "Bodoni Moda, Georgia, serif"
    fontSize: "clamp(4.5rem, 16.5vw, 15.8rem)"
    fontWeight: 500
    lineHeight: 0.72
  body:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "1rem"
    lineHeight: 1.6
  data:
    fontFamily: "IBM Plex Mono, monospace"
    fontSize: "0.625rem"
spacing:
  gutter: "clamp(20px, 5vw, 84px)"
  section: "clamp(116px, 15vw, 240px)"
---

# Design System: Jerome Ibon Portfolio

## Direction

**Infrastructure Editorial** treats the website as the gallery and the projects
as the systems. Identity comes first, followed by content, atmosphere, and
technical evidence. The result uses editorial pacing, monochrome surfaces,
large type, asymmetry, hairline rules, and real repository diagrams without
turning the page into a console or SaaS dashboard.

## Visual language

The default light surface is warm paper; dark mode is near-black paper with
warm off-white type. Oxblood is a small interaction accent for active states,
links, and numbered cues. There are no permanent status widgets, neon effects,
or lifecycle rail. Monospace is reserved for periods, counts, paths, and other
genuinely technical metadata.

## Layout

The fixed header is deliberately quiet: JI, a short primary navigation, and a
compact theme control. The hero is an oversized two-line name with minimal role
and location context. Sections alternate between full-width project media,
asymmetric text, editorial timelines, and open whitespace rather than repeating
card grids.

Projects are the visual centerpiece. Each selected work spread pairs its large
title with a repository-derived architecture sheet, a typed delivery flow,
outcome/stack notes, and links to a native inspection dialog. The dialog holds
the full architecture set and text summaries for accessibility.

Capabilities retain the distinctive spatial idea as an ambient field of domains
and tools. Desktop uses slow, low-amplitude drift; focus pauses the field. Small
screens use a static list so every capability remains readable and reachable.

Experience is an editorial timeline. About is a concise explanation of how
operations, automation, and failure inform Jerome's direction toward DevOps and
Cloud engineering. Contact closes with a substantial, recruiter-focused
invitation and direct email, LinkedIn, GitHub, and resume paths.

## Motion and access

Motion is opt-in and sparse: clipped hero reveals, section-rule reveals, a
barely perceptible capability drift, and a very slow image scale on project
media. Essential content is in the DOM before animation. `prefers-reduced-motion`
removes drift, scale, smooth scrolling, and reveal timing. Focused capability
controls remain stable and all project/skill details use semantic buttons and
native dialogs with focus return.

## Do / don't

- Do use real architecture diagrams and operational detail as visual material.
- Do allow large black or paper fields to breathe.
- Do keep recruiter context truthful and immediately scannable.
- Don't introduce terminal chrome, generic dashboards, decorative gradients, or
  a persistent progress metaphor.
- Don't use monospace as the general display voice.
- Don't hide technical proof behind hover or animation.
