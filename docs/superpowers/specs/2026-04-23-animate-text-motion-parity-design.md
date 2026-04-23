# Animate Text Motion Parity Design

Date: 2026-04-23
Status: Approved design, pending written spec review

## Summary

Create an internal comparison route that duplicates the current `/skills/animate-text` page exactly, but drives the catalog animations with the `motion` React library instead of WAAPI. The existing WAAPI page remains unchanged and continues to act as the visual reference.

The goal is strict visual parity, not a stylistic reinterpretation. The Motion route should preserve the same layout, typography, copy behavior, timing, easing, staging, sample content, and loop choreography that the current page already ships.

## Context

- The current public page at [src/app/(website)/skills/animate-text/page.tsx](</Users/alex/Projects/animate-text/src/app/(website)/skills/animate-text/page.tsx>) renders the split-screen shell and the animation catalog.
- The current catalog stage at [src/components/pages/home/text-animation-catalog.tsx](</Users/alex/Projects/animate-text/src/components/pages/home/text-animation-catalog.tsx>) starts a WAAPI-based loop through [src/lib/text-animation-runtime.ts](</Users/alex/Projects/animate-text/src/lib/text-animation-runtime.ts>).
- The canonical motion contracts live in the generated catalog/spec data and in the bundled `site_reference` blocks for the visible website versions.
- The project already depends on `motion`, so the new work is an engine migration for a cloned route rather than a dependency introduction.

## Goals

- Keep the current `/skills/animate-text` page intact.
- Add an internal comparison route that is a full visual clone of the current page.
- Reproduce the existing visible animations with Motion as closely as possible, including the current site-specific playback behavior.
- Reuse the existing catalog/spec/sample/runtime data rather than defining a Motion-only animation format.
- Preserve the current card grid, copy interaction, centered stage layout, and typography treatment.

## Non-Goals

- Replacing the current WAAPI page.
- Adding navigation links, labels, badges, or other visible hints that distinguish the Motion page.
- Redesigning the catalog cards or changing sample copy.
- Simplifying layout-aware effects into approximate generic variants.
- Introducing a second source of truth for effect timing or choreography.

## Chosen Approach

Implement a Motion-backed compatibility layer behind a cloned route.

This is the best fit because it preserves the existing surface area while minimizing parity risk:

- the page shell can be duplicated without touching the production WAAPI experience
- the same generated spec data can continue to drive both implementations
- generic effects can share one Motion renderer
- layout-aware effects can still use measured DOM choreography through Motion's imperative APIs where declarative variants would lose fidelity

## Route And Surface

Add a new internal route at:

- [src/app/(website)/skills/animate-text-motion/page.tsx](</Users/alex/Projects/animate-text/src/app/(website)/skills/animate-text-motion/page.tsx>)

This route should:

- duplicate the markup structure from the current animate-text page
- preserve the same metadata shape unless implementation constraints require the route to be excluded from discoverability concerns
- render the same left-side editorial panel and the same right-side catalog grid
- avoid adding any visible marker that this is the Motion version

The current page remains the baseline reference.

## Architecture

### Data Source

The Motion route must reuse the existing app-owned animation data:

- `src/data/text-animations/generated/catalog.ts`
- `src/data/text-animations/generated/specs.ts`
- `src/data/text-animations/generated/types.ts`
- the underlying catalog JSON and spec JSON files

No Motion-specific mirror of the catalog should be created. The same `TextAnimationCatalogItem` contract should drive both the WAAPI and Motion implementations.

### Component Boundary

Create Motion-specific page and catalog components instead of adding engine conditionals to the existing WAAPI components.

Expected structure:

- a cloned route component for the internal page
- a Motion-specific catalog component parallel to the existing `TextAnimationCatalog`
- a Motion-specific stage component that owns the animation lifecycle for one card
- a Motion runtime module parallel to the existing WAAPI runtime

This keeps the existing WAAPI reference implementation readable and makes parity debugging simpler.

### Shared Pure Helpers

Engine-agnostic helpers may be shared or extracted if needed:

- text splitting by target
- stagger rank calculation
- sample and phrase selection
- frame normalization from spec data

Helpers that assume a specific animation engine should remain isolated inside their respective runtime modules.

## Runtime Design

### Generic Effects

The 17 non-layout-aware effects should use one shared Motion renderer that reproduces the same site behavior as the current generic WAAPI loop.

It must preserve:

- `target` splitting behavior: `whole`, `per-character`, `per-word`, `per-line`
- `enter` and `exit` durations
- `stagger_ms`
- easing strings
- `swap.micro_delay_ms`
- site runtime multipliers such as speed and y-travel scaling
- hold and gap timing from the current site runtime
- random initial desynchronization across cards

The Motion runtime should translate the existing frame specs into Motion-driven transforms, opacity, filter blur, and spacing changes without changing the visible choreography.

### Layout-aware Effects

The following effects require dedicated Motion renderers because their choreography depends on DOM measurement and reflow:

- `kinetic-center-build`
- `short-slide-right`
- `short-slide-down`

These renderers must preserve the current website behavior, including:

- live measurement of word widths or line heights where needed
- centered or stacked phrase positioning
- incoming word offsets
- push and reflow motion for already-rendered words
- hold and gap sequencing
- exit timing and blur/lift treatment

Motion's imperative APIs are acceptable for these cases because the user requirement is library usage plus exact parity, not declarative purity.

## Styling And Markup Parity

The Motion route should preserve the current stage and typography classes from [src/styles/text-animations.css](</Users/alex/Projects/animate-text/src/styles/text-animations.css>) wherever possible:

- `.text-animation-stage`
- `.text-animation-title`
- `.text-animation-unit`
- `.text-animation-kinetic-line`
- `.text-animation-kinetic-stack`
- `.text-animation-kinetic-word`

Any Motion-specific wrapper element should only be introduced when required by the library API and must not alter the rendered layout, sizing, or alignment.

## File Plan

Expected new files:

- `src/app/(website)/skills/animate-text-motion/page.tsx`
- a Motion catalog component parallel to `src/components/pages/home/text-animation-catalog.tsx`
- a Motion runtime module parallel to `src/lib/text-animation-runtime.ts`

Possible edits:

- shared helper extraction if that reduces duplication without entangling the WAAPI and Motion runtimes
- route metadata or indexing adjustments if needed for the internal comparison page

The current WAAPI page and runtime should not change unless a small shared-helper extraction is necessary and behavior remains unchanged.

## Validation

Validation for implementation should focus on parity first:

- compare the Motion route visually against the existing WAAPI route
- verify all visible catalog effects loop and swap correctly
- verify copy-to-clipboard behavior still copies the stable effect id
- verify the internal route remains visually identical at the page-shell level
- verify layout-aware effects still read as measured choreographies rather than generic staggers

Required repo checks before finishing implementation:

- `pnpm format`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`

## Risks And Mitigations

- Motion timing may not match WAAPI exactly.
  Mitigation: preserve the existing site multipliers and playback ordering, and use imperative Motion APIs when finer control is required.

- Layout-aware effects may drift if measurement and reflow are simplified.
  Mitigation: keep dedicated measured renderers for those effects and port the current choreography directly.

- Duplicate components may diverge over time.
  Mitigation: share only pure spec/data helpers and keep the route-specific runtime boundary explicit.
