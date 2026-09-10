# Interaction Direction: System Relay

## Directions considered

### 1. System Relay — recommended

- **Layout:** One infrastructure route begins in the asymmetric hero, becomes the axis of a pinned two-project stage, and resolves into the Experience chronology.
- **Hero:** Jerome’s three-part name occupies the left two-thirds; an operable network diagram occupies the right and intersects the last name without covering actions.
- **Projects:** A sticky visual stage and scrolling narrative share the viewport. Cloud Portfolio architecture compresses and slides left while the Homelab topology is uncovered from the right.
- **Scroll:** Native vertical scroll controls name separation, diagram handoff, project masks, architecture routes, and the Experience rail.
- **Signature:** Infrastructure Pulse becomes a relay: request/deploy signals travel through the hero; its route visually hands off to the project stage.
- **Type motion:** Each name line enters through a different horizontal/vertical mask and separates at different rates on scroll.
- **Experience:** A sticky date rail changes as roles cross the reading line while one chronology rule grows.
- **Mobile:** Natural vertical flow, short SVG entrance, large type, full project artifacts, no pinning or pointer tilt.
- **Complexity:** Medium-high; one GSAP system, bounded ScrollTriggers, CSS masks and SVG strokes.
- **Risk:** Low-medium; transforms, clip-path and SVG strokes only.
- **Fit:** The page behaves like the delivery and observability paths Jerome documents while the content stays fast to scan.

### 2. Deployment Strip — ambitious

- **Layout:** A viewport-wide horizontal technical strip advanced by vertical scroll.
- **Hero:** The name collapses into a left identity rail as the infrastructure diagram expands full width.
- **Projects:** Each real delivery stage receives a panel; the cloud system collapses into the Git node that seeds the homelab.
- **Scroll:** A long pinned sequence maps vertical input to horizontal travel.
- **Signature:** A deployment token persists across panels and changes state at each architecture layer.
- **Type motion:** Titles roll vertically while stage labels travel horizontally.
- **Experience:** Sticky year column with roles overtaking one another.
- **Mobile:** Separate vertical step narrative.
- **Complexity:** High.
- **Risk:** Medium-high due to pin spacing, image sizing, and viewport changes.
- **Fit:** It makes delivery mechanics the literal path, but asks recruiters to spend longer in one sequence.

### 3. Operational Ledger — conservative

- **Layout:** Editorial split screens with sticky metadata rails and expandable capability rows.
- **Hero:** Kinetic name and contained diagram, without a cross-section handoff.
- **Projects:** Each project receives a full-height spread with image-mask parallax and sticky captions.
- **Scroll:** Short sticky regions; no long pin.
- **Signature:** Architecture routes build as each spread becomes active.
- **Type motion:** Masked line changes and shifting column widths.
- **Experience:** Sticky date rail and progressive rule.
- **Mobile:** Same editorial order with masks removed.
- **Complexity:** Medium.
- **Risk:** Low.
- **Fit:** Highly legible and restrained, but less memorable as an interactive systems portfolio.

## Motion thesis

- **Focal moment:** The System Relay from kinetic identity through the transforming project stage.
- **Continuity:** Hero route → project axis; project axis → Experience chronology; one navigation indicator follows section state.
- **Feedback:** Project depth, directional arrows, expanding capability rows, anchored assistant, and radial theme transition.
- **Budget:** One pinned desktop region, native scroll, transforms/clip-path/SVG strokes, no perpetual loop, and no animation library beyond GSAP.

## Motion map

| Element | State A | State B | Trigger / range | Transform | Mask / clip | Pointer | Runtime | Mobile | Reduced motion |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Hero name | lines outside distinct masks | locked asymmetric name grid | load, 0–720ms | line-specific x/y/tracking | overflow masks | none | GSAP | shorter entrance | final state |
| Hero network | unbuilt paths/inactive nodes | complete request/deploy system | load, 240–1100ms | node scale, packet path | SVG stroke dash | max 6px | GSAP | short draw | static complete |
| Hero handoff | identity/network share hero | name separates; diagram meets project axis | hero top → bottom | x/y/scale by layer | hero overflow | none | ScrollTrigger scrub | disabled | readable hero |
| Project stage | cloud fills frame | cloud compresses; homelab uncovers right-to-left | story 20% → 78% | x/scale/route drawing | opposing inset clips | ±2° tilt | ScrollTrigger | stacked artifacts | stacked artifacts |
| Project metadata | Project 01 in slot | Project 02 rolls into slot | midpoint | vertical roll | overflow clip | none | GSAP/CSS | static per project | static per project |
| Case-study link | project stage context | case masthead context | navigation | shared title/media names | browser capture | arrow travel | View Transitions/CSS | fallback navigation | instant |
| Approach | statement and principles offset | columns align | section travel | opposing x shifts | rule expansion | none | ScrollTrigger | static stack | static |
| Experience rail | first date active | current date replaces it | role at 42–62% viewport | date roll/content side shift | sticky date viewport | none | ScrollTrigger | inline dates | all visible |
| Experience rule | zero length | full chronology | section top → bottom | scaleY | clipped rail | none | ScrollTrigger | grows without pin | complete |
| Capability row | compact index row | focused row opens detail | hover/focus | grid shift/label x | row overflow | selected depth | CSS | tap/focus | no spatial shift |
| Navigation marker | under active link | under next active link | section change | x/width | nav track | link feedback | CSS/measured vars | conventional menu | instant |
| Theme | current theme | new theme expands from control | click, 360ms | none | radial root clip | control feedback | View Transitions | supported | instant |
| Assistant | compact trigger | anchored expanded panel | click, 240ms | scale/translate | panel overflow | none | CSS | anchored panel | instant |

## Originality guardrails

- Borrow scroll-linked stage progression and reduced-motion discipline as common interaction principles.
- Do not borrow Motionfolio’s horizontal gallery, HamishMW’s signature 3D object, Craftzdog’s voxel identity, Kolonatalie’s cursor/magnetic system, or any reference’s copy, palette, navigation silhouette, loader, or visual anchor.
- System Relay comes from Jerome’s real cloud delivery and GitOps architecture and retains the paper/graphite/rust identity.
