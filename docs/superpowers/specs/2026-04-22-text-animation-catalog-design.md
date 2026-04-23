# Text Animation Catalog Design

Date: 2026-04-22
Status: Approved design, pending spec review

## Summary

Port the validated text animation catalog into the existing home page layout. Keep the current split-screen composition: editorial content on the left, animation catalog on the right. The right panel becomes a 20-card looping gallery that uses the exact sample copy and timing contracts from the provided specs and reference previews.

The primary product goal is visual parity with the reference bundle in `tmp/`, not a stylistic rewrite. To preserve that fidelity, the animation engine inside React will use WAAPI (`element.animate(...)`) as the execution layer instead of re-expressing every animation in Motion primitives.

## Context

- The current home page in [src/app/(website)/page.tsx](</Users/alex/Projects/animate-text/src/app/(website)/page.tsx>) already has the correct macro layout: a fixed left panel and a right-side card grid.
- The reference bundle in `tmp/` contains 24 JSON specs, but the reference catalog in `tmp/index.html` intentionally exposes 20 ready effects.
- The user wants those animations brought into the app's layout rather than recreating the standalone catalog page.
- Each animation should live inside its own right-panel rectangle.
- The animated text should remain centered inside its card and scale relative to the rectangle size.
- The animation name should not be visible in the UI.
- On desktop hover, a copy affordance should appear and copy the stable effect identifier.
- Mobile-specific interaction handling is out of scope for this iteration.

## Goals

- Preserve the existing split layout and replace the placeholder right-panel tiles with real animation cards.
- Render exactly the 20 ready catalog effects from the reference catalog, in the same order.
- Use the raw spec JSON as the source of truth for motion parameters and use normalized catalog content extracted from the reference bundle for sample copy where the raw JSON omits it.
- Match the reference motion behavior as closely as practical inside the React app.
- Keep the implementation maintainable by centralizing generic animation logic and limiting custom code to the few effects that require it.

## Non-Goals

- Supporting the extra 4 non-catalog specs in the UI during this iteration.
- Designing a standalone catalog page that duplicates `tmp/index.html`.
- Solving mobile hover behavior.
- Introducing unrelated refactors to the existing site structure.

## Catalog Scope

The app catalog should render these 20 effects in this exact order:

1. `soft-blur-in`
2. `per-character-rise`
3. `per-word-crossfade`
4. `spring-scale-in`
5. `mask-reveal-up`
6. `line-by-line-slide`
7. `typewriter`
8. `micro-scale-fade`
9. `shimmer-sweep`
10. `fade-through`
11. `shared-axis-y`
12. `shared-axis-z`
13. `blur-out-up`
14. `scale-down-fade`
15. `focus-blur-resolve`
16. `bottom-up-letters`
17. `top-down-letters`
18. `kinetic-center-build`
19. `short-slide-right`
20. `short-slide-down`

This list should be defined explicitly in app-owned data rather than inferred from directory contents. That prevents accidental UI drift if more specs are added later.

## Architecture

### Data placement

Promote the relevant spec data from `tmp/specs/` into app-owned source files under a dedicated data area such as:

- `src/data/text-animations/catalog.ts`
- `src/data/text-animations/catalog-content.ts`
- `src/data/text-animations/specs/*.json`
- `src/data/text-animations/types.ts`

`catalog.ts` defines the 20 visible card IDs and their order. `catalog-content.ts` stores normalized per-card sample text, sample arrays, phrase arrays, and any reference runtime defaults that are only present in `tmp/index.html`. The raw JSON files remain the source of truth for the animation contracts themselves.

The imported data becomes part of the app bundle. The app should not depend on the `tmp/` directory at runtime.

### Runtime decision

Use WAAPI inside React client components for the text effects.

Rationale:

- The reference implementation already uses WAAPI directly.
- Exact motion matching matters more than using a specific React animation abstraction.
- WAAPI maps cleanly to the existing spec contract: durations, stagger, easing, transforms, opacity, blur, and staged loops.
- Rewriting all effects into Motion-specific variants would add translation risk without improving the user-facing result in this iteration.

Motion remains available for future app-level interactions if needed, but the text animation engine itself is WAAPI-driven for parity.

### High-level structure

- `HomePage` keeps the current two-column layout.
- A new right-panel catalog component owns the 20-card grid.
- Each card receives one catalog item plus its resolved spec.
- Each card mounts a client-only animation stage that starts its own loop when rendered and cleans itself up on unmount.

## Components

### `AnimationGrid`

Responsibilities:

- Render the 20 cards in catalog order.
- Own responsive grid layout in the right panel.
- Stay presentation-focused and avoid animation logic.

### `AnimationCard`

Responsibilities:

- Render the card frame used by one effect.
- Maintain hover state for the desktop copy affordance.
- Render the copy button without exposing the effect name as visible text.
- Pass the resolved spec into the animation stage.

Interaction contract:

- No visible title or footer label in the resting state.
- On desktop hover, show a copy control.
- The copy control copies the effect identifier such as `soft-blur-in`, not the human-readable display label. This is the stable programmatic name used by the specs and file naming convention.

### `AnimationStage`

Responsibilities:

- Render the stage container that keeps the animated text centered.
- Initialize the WAAPI loop after mount.
- Select the correct renderer for the current spec.
- Dispose animations and timers when the component unmounts.

### Runtime helpers

Responsibilities:

- Split text by `target`: `whole`, `per-character`, `per-word`, `per-line`.
- Convert spec frame data into executable keyframes.
- Calculate stagger order including `normal`, `center-out`, `edges-in`, and reverse ordering when needed.
- Apply enter, exit, swap, and loop scheduling.
- Desynchronize cards slightly with randomized initial offsets so the panel feels alive instead of synchronized.

## Spec Interpretation

The raw JSON specs remain the source of truth for motion behavior. Catalog content used for display loops is normalized into app-owned source from the reference bundle where the raw JSON does not include it.

### Generic fields handled directly by the shared runtime

- `target`
- `enter.duration_ms`
- `enter.stagger_ms`
- `enter.easing`
- `enter.from`
- `enter.to`
- `exit.duration_ms`
- `exit.stagger_ms`
- `exit.easing`
- `exit.from`
- `exit.to`
- `swap.mode`
- `swap.overlap_ms`
- `swap.micro_delay_ms`
- `stagger_mode`

### Catalog content fields carried alongside the specs

Because not every raw JSON file includes display copy, the app also needs normalized catalog content extracted from the reference implementation:

- `sample`
- `samples`
- `phrases`
- default loop hold and gap values when those are defined by the reference runtime rather than the raw JSON

### Renderer-specific fields

Three catalog effects require layout-aware choreography and cannot be expressed by the generic split-and-stagger runtime alone:

- `kinetic-center-build`
- `short-slide-right`
- `short-slide-down`

These specs still drive the behavior, but they are interpreted by renderer-specific adapters that understand:

- `custom_renderer`
- `build`

Those adapters must continue to read timing and measurement parameters from the spec rather than introducing parallel hardcoded behavior.

## Renderer Strategy

### Generic renderer

Use one shared renderer for the 17 standard effects. It should:

- create animated text units from the current sample text
- apply `enter` and `exit` frames through WAAPI
- support staggered ordering per spec
- honor `swap.mode`, overlap, and micro delay
- loop through `sample` or `samples` arrays from normalized catalog content exactly as provided by the reference bundle

### `kinetic-center-build` renderer

This effect must:

- measure word widths
- compute centered line positions
- animate incoming words from the right
- push existing words left as the line re-centers
- end with the completed phrase centered as a single constructed line

### `short-slide-right` renderer

This effect must:

- move the whole phrase as one shared horizontal translation
- reveal individual words only through opacity timing
- avoid per-word positional drift

### `short-slide-down` renderer

This effect must:

- build stacked phrases vertically
- use phrase arrays from the spec
- preserve the layout-aware staggered top-down motion from the reference runtime

## Layout And Visual Rules

- Keep the current left-panel/right-panel structure already present in the app.
- The right panel remains a grid of rectangles.
- Each card should preserve a stable aspect ratio comparable to the current placeholders.
- The animated text is centered horizontally and vertically within the stage.
- Typography sizing should respond to card bounds in the same spirit as the reference stage sizing so the text remains readable and proportionate.
- The card body should stay visually quiet so the animation remains the focal point.
- The app should use its own layout shell instead of recreating the full `tmp/index.html` chrome.

## Interaction Design

### Default state

- Cards auto-loop immediately after mount.
- Cards do not expose effect labels in the resting state.
- The animation itself is the visible content.

### Hover state

- On desktop hover, reveal a compact copy button.
- Clicking the button copies the stable effect identifier.
- The hover control should feel integrated with the current app, but it must not obstruct the centered text.

### Loop timing

- Use the same timing logic as the reference runtime.
- Start cards with slight random offsets so the grid does not animate in lockstep.
- Respect reference hold, gap, overlap, stagger, and sample sequencing behavior, using raw specs for motion values and normalized catalog content for card copy and runtime defaults.

## Error Handling

- If a catalog entry points to a missing spec, render a quiet fallback card rather than breaking the grid.
- If a spec cannot be parsed or interpreted, fail only that card and render a minimal fallback state.
- Keep all WAAPI and timer logic inside client-only lifecycle code so server rendering remains safe.
- Cancel timers and release animation state on unmount to avoid orphaned loops during navigation or hot reload.

## Testing And Verification

### Automated coverage

Add focused tests for pure runtime helpers:

- text splitting by target
- stagger rank calculation
- frame conversion from spec data
- catalog lookup and renderer selection

### Manual verification

Compare the app output against the reference bundle in `tmp/index.html` and the per-effect preview files with special attention to:

- timing and easing
- stagger direction and sequence
- vertical and horizontal centering
- line and word reflow behavior in the 3 custom renderers
- hover copy behavior
- desynchronized card starts

### Project checks

Before implementation is considered complete, run the project-required commands:

- `pnpm format`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`

## Implementation Boundaries

This spec covers the first integrated catalog pass only. It does not authorize broader UI redesign work beyond what is necessary to:

- wire the right panel to the 20 validated effects
- import the approved spec data into app-owned source
- add the hover copy affordance
- preserve the existing split-page structure

## Acceptance Criteria

The implementation is successful when:

- the home page keeps its current split layout
- the right panel shows 20 cards in the approved catalog order
- every card auto-loops using the sample text or phrase sequence defined by the normalized app data extracted from the reference bundle
- the animation behavior matches the reference closely enough to be visually equivalent
- no visible effect names are shown in the resting UI
- hovering a card reveals a copy control that copies the stable effect identifier
- a malformed or missing spec degrades one card safely without breaking the page

## Open Decisions Resolved In This Spec

- Use the app's existing layout rather than reproducing the standalone `tmp/index.html` page.
- Implement the text effects with WAAPI inside React for fidelity.
- Treat the JSON specs as the authoritative animation contract.
- Use explicit catalog ordering instead of scanning all spec files.
- Copy the stable effect identifier on hover.
- Leave mobile interaction behavior for a later iteration.
