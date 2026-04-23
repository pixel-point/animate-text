# Animate Text Skill Fidelity Design

Date: 2026-04-23
Status: Draft, pending user review

## Summary

The current `animate-text` skill is good at exporting portable motion specs, but it is not sufficient for exact reproduction of the website examples.

The gap is structural:

- the public skill exports raw spec JSON plus light prose
- the website applies extra runtime normalization, renderer behavior, tokenization rules, stage styling, and sample choreography
- some of that behavior is undocumented, and some of it is not even represented in the public schema

This design introduces a dual-surface model:

1. a portable motion spec for translation into GSAP, Motion, WAAPI, CSS, and similar stacks
2. an exact showcase recipe for reproducing the website example as closely as possible

The recommended implementation is incremental:

1. enrich generated skill output with exact effect recipes
2. fix runtime and schema mismatches
3. then consolidate canonical authoring into per-effect records once the new contract is stable

## Problem Statement

Today the repository treats the JSON spec as the authoritative contract, but the final look depends on more than that.

Observed sources of drift:

- catalog-level runtime multipliers such as `tileSpeed`, `tileHoldMs`, `tileGapMs`, and `tileYTravel`
- renderer-specific algorithms such as `kinetic-center-build`, `kinetic-top-build`, and `shared-slide-opacity-stage`
- text splitting and spacing behavior in the runtime
- stage and typography CSS that materially affects the perceived motion
- renderer assignment logic that can live outside the spec file
- swap semantics that are documented in the skill but not fully implemented by the generic runtime

This creates three practical problems:

1. the skill overstates how exact the raw JSON spec is
2. agents cannot reliably reproduce the showcased examples from the exported skill alone
3. the source of truth is split across too many places for high-fidelity maintenance

## Goals

- Make exact website-example reproduction possible from generated skill assets.
- Preserve a portable, library-agnostic motion spec for use outside the website runtime.
- Remove hidden behavior from the contract.
- Ensure a named effect lookup returns everything needed for either:
  - portable translation
  - showcase-faithful reproduction
- Make runtime behavior match the documented contract.
- Strengthen validation so unsupported or undocumented fields cannot silently ship.
- Provide a migration path that improves fidelity quickly without forcing a brittle one-shot refactor.

## Non-Goals

- Guarantee pixel-perfect parity in every non-web stack.
- Turn the public skill into a full runtime package.
- Ship heavy preview binaries, browser automation, or rendering code inside the installable skill.
- Invent a generic animation DSL that abstracts every possible layout-aware effect.
- Rewrite the website presentation layer unless it is required to make the contract explicit.

## Current-State Findings

### 1. The raw spec is not the full recipe

The generic runtime scales and reshapes motion using catalog runtime values, especially:

- `tileSpeed`
- `tileHoldMs`
- `tileGapMs`
- `tileYTravel`

Those values materially change timing and distance, so the raw `enter` and `exit` blocks do not fully describe the visible result.

### 2. The generic runtime does not fully honor the exported `swap` contract

The skill currently tells consumers to preserve `swap.mode`, `swap.overlap_ms`, and `swap.micro_delay_ms`.

The runtime only uses `micro_delay_ms` in the generic loop. It does not implement true overlap behavior, and it does not branch on `swap.mode`.

That means the public skill and the website behavior disagree today.

### 3. Renderer behavior is partially hidden

Some effects require a custom renderer. That is a core part of the result, but it is not always discoverable by reading only `assets/specs/<id>.json`.

For exact reproduction, renderer assignment must be explicit in the effect artifact returned to the agent.

### 4. The schema documentation is behind the real data model

The runtime and generated types support behavior that the public schema does not describe clearly enough, including:

- `custom_renderer`
- `stagger_mode`
- renderer-specific `build` parameters
- frame properties already supported by runtime types

This makes the skill harder to trust as a true contract.

### 5. The final look depends on stage presentation

Typography sizing, weight, letter spacing, line height, max width, transform origin, perspective, and kinetic container dimensions all change how the motion reads.

These are currently implementation details rather than exported contract data.

### 6. Content ownership is not clean enough

Showcase content is mostly external to specs, but there are already specs carrying `sample` or `phrases`.

That makes it unclear whether the spec is pure motion, or whether it is also a showcase payload.

## Design Principles

- Separate portable motion data from showcase-specific reproduction data.
- Make hidden behavior explicit before attempting to generalize it.
- Keep the public skill read-only and easy to query.
- Preserve backwards compatibility where reasonable, but prefer correct contracts over misleading ones.
- Use structured schema for behavior that affects output; avoid relying on prose notes for required implementation semantics.

## Decision

Adopt a dual-surface contract:

- `spec`: the portable motion contract
- `effect`: the exact showcase recipe

The portable spec remains the right asset for translation into another stack.

The exact effect recipe becomes the right asset for reproducing the website example.

## Target Architecture

### Contract Surfaces

Each effect should have two generated artifacts in the public skill:

1. `assets/specs/<id>.json`
2. `assets/effects/<id>.json`

Their responsibilities:

- `specs/<id>.json`
  - portable
  - library-agnostic
  - focused on motion semantics
  - valid for "translate this effect into another stack"

- `effects/<id>.json`
  - exact showcase recipe
  - includes the portable spec plus all reproduction-critical data
  - valid for "replicate the website example"

### Exact Effect Recipe Shape

Each generated `assets/effects/<id>.json` should contain:

```json
{
  "id": "spring-scale-in",
  "visibility": "visible",
  "portable_spec": {},
  "showcase": {
    "renderer": {
      "id": "generic-stagger"
    },
    "content": {
      "sample": "Fast. Crisp. Fluid.",
      "samples": ["Fast. Crisp. Fluid.", "Pop into place.", "Smooth by default."]
    },
    "runtime": {
      "speed_multiplier": 0.72,
      "hold_ms": 550,
      "gap_ms": 320,
      "y_travel_multiplier": 0.58,
      "initial_delay_ms": {
        "mode": "random-range",
        "min": 0,
        "max": 400
      }
    },
    "stage": {
      "preset": "default-title-card"
    }
  }
}
```

For layout-aware effects, `showcase.renderer` includes structured parameters instead of relying on prose:

```json
{
  "renderer": {
    "id": "kinetic-center-build",
    "params": {
      "first_word_duration_ms": 340,
      "push_duration_ms": 430,
      "entry_offset_px": 88,
      "word_gap_px": 10
    }
  }
}
```

### Renderer Families

Make renderer families explicit and schema-backed:

- `generic-stagger`
- `shared-slide-opacity-stage`
- `kinetic-center-build`
- `kinetic-top-build`

Rules:

- every visible effect must resolve to exactly one renderer
- renderer selection must be explicit in the effect recipe
- renderer params must be structured data, not hidden implementation defaults
- if a renderer is needed for website fidelity, it must be visible to the skill output

### Stage Presets

Exact reproduction requires stage data that is currently implicit in CSS.

Introduce generated stage presets, referenced by id from each effect recipe. A stage preset should carry structured presentation values such as:

- container padding
- perspective
- title font size strategy
- font weight
- letter spacing
- line height
- max width
- transform origin
- kinetic container width and height where applicable

This data can remain web-oriented. The exact showcase recipe does not need to stay library-agnostic.

Recommended public asset:

- `assets/stage-presets.json`

### Runtime Presets

Catalog-level runtime defaults should become an explicit preset surface rather than a generic bucket of hidden multipliers.

Recommended public asset:

- `assets/runtime-presets.json`

This should include:

- speed multiplier
- hold duration
- inter-sample gap
- y-travel multiplier
- initial delay policy

Effects can reference a shared preset and override only the fields that differ.

## Canonical Authoring Model

### End-State Recommendation

Move toward one canonical per-effect authoring record under:

```text
catalog/text-animations/effects/
  <id>.json
```

Each canonical effect record should own:

- portable motion spec
- showcase content
- showcase renderer selection
- renderer params
- stage preset reference
- runtime preset reference
- visibility metadata

This gives one place to inspect everything that affects a visible example.

### Transitional Recommendation

Do not make that source-layout change first.

First, generate enriched effect recipes from the current split sources:

- `specs/*.json`
- `catalog.json`
- `samples.json`
- `runtime.json`
- current renderer logic
- current stage presets derived from CSS/runtime

Once the new effect recipe contract is in place and validated, move canonical authoring into per-effect records.

This reduces risk and keeps the first improvement focused on fidelity rather than data migration.

## Required Runtime Changes

### 1. Implement `swap` semantics correctly

The generic runtime must support:

- `crossfade`
  - start enter at `exit_total - overlap_ms + micro_delay_ms`
  - keep outgoing and incoming layers mounted during the overlap window
- `sequential`
  - start enter after `exit_total + micro_delay_ms`
- `morph`
  - either implement it properly or mark it unsupported in validation for visible effects

After this change, the website should finally behave according to the documented skill contract.

### 2. Make renderer resolution explicit

The runtime should consume renderer identity from generated effect data rather than relying on out-of-band override logic that is invisible to raw spec readers.

### 3. Separate motion semantics from presentation semantics

Keep:

- motion semantics in the spec and renderer params
- presentation semantics in stage presets
- loop behavior in runtime presets

This prevents the current mixing of responsibilities across JSON, CSS, and runtime code.

## Required Generator Changes

The generator should now produce:

- existing generated app data needed by the website
- `skills/animate-text/assets/specs/*.json`
- `skills/animate-text/assets/effects/*.json`
- `skills/animate-text/assets/stage-presets.json`
- `skills/animate-text/assets/runtime-presets.json`
- updated references and helper scripts

### Helper Script Changes

Retain backwards compatibility:

- keep `list-specs.mjs`
- keep `get-spec.mjs`
- keep `find-spec.mjs`

Add exact-recipe helpers:

- `get-effect.mjs <id>`

Behavior:

- `get-spec.mjs` returns the portable motion contract
- `get-effect.mjs` returns the exact showcase recipe with renderer, runtime, stage, and content included

`SKILL.md` should instruct agents:

- use `get-spec` when the goal is translation into another stack
- use `get-effect` when the goal is exact reproduction of the showcase example

## Required Documentation Changes

### `SKILL.md`

Update the generated skill instructions so they no longer imply raw spec JSON alone is exact.

The new positioning should be:

- portable motion specs are exact for motion intent
- exact showcase reproduction requires the effect recipe

### `references/schema.md`

Split the schema docs into two sections:

1. portable spec schema
2. exact effect recipe schema

The public schema must explicitly document:

- `custom_renderer` or its replacement equivalent in the recipe layer
- `stagger_mode`
- supported frame keys
- renderer families
- renderer parameter shapes
- stage preset structure
- runtime preset structure

### `references/implementation-notes.md`

Add guidance on when to use each surface:

- portable translation
- exact showcase reproduction
- layout-aware renderer handling

## Validation Changes

Strengthen catalog validation to fail when:

- a visible effect resolves to no renderer
- a renderer param exists that is not documented by schema
- a visible effect depends on behavior not representable in the effect recipe
- `swap.mode` is used in a way unsupported by runtime
- a spec contains undocumented top-level fields
- showcase content is duplicated across incompatible sources
- stage presets referenced by an effect do not exist
- runtime presets referenced by an effect do not exist

Also add a parity check that compares generated effect recipes against the generated app data used by the website.

## Testing Strategy

### Contract Tests

Add unit tests for:

- stagger ordering modes
- swap timing calculations
- renderer resolution
- effect recipe generation
- helper script output shapes

### Fidelity Tests

Add visual or timeline-based regression tests for representative effects:

- one generic per-character effect
- one generic per-word effect
- one whole-phrase effect
- one layout-aware kinetic effect
- one shared-slide renderer effect

At minimum, snapshot:

- initial state
- mid-enter state
- steady state
- swap overlap or sequential handoff state
- exit state

### Documentation Tests

Add generation-time checks that the documented schema includes every supported key used by canonical data.

## Migration Plan

### Phase 1. Export the missing truth

Goal: improve the public skill immediately without changing canonical source layout.

Tasks:

1. generate `assets/effects/*.json`
2. generate runtime and stage preset assets
3. add `get-effect.mjs`
4. update `SKILL.md` and references to explain dual surfaces
5. update validation so exact effect recipes are complete for visible effects

Outcome:

- the public skill can describe the website examples faithfully
- the current source layout remains intact

### Phase 2. Fix runtime contract mismatches

Goal: make the website behavior match the exported contract.

Tasks:

1. implement real `swap.mode` handling in generic runtime
2. implement `overlap_ms`
3. move renderer selection to explicit generated data
4. remove hidden fallback assumptions where possible
5. codify stage presets from current CSS

Outcome:

- website behavior and generated skill contracts stop disagreeing

### Phase 3. Consolidate canonical authoring

Goal: reduce long-term drift and make maintenance simpler.

Tasks:

1. introduce canonical `effects/<id>.json` authoring format
2. migrate existing split sources into those records
3. derive `specs/`, catalog metadata, samples, and generated outputs from the effect records
4. keep backwards-compatible generated skill assets

Outcome:

- one canonical effect record per id
- fewer hidden joins across files

## Repository Layout After Phase 1

```text
skills/animate-text/
├─ SKILL.md
├─ references/
│  ├─ catalog.md
│  ├─ schema.md
│  ├─ selection-guide.md
│  └─ implementation-notes.md
├─ assets/
│  ├─ catalog.json
│  ├─ specs/
│  ├─ effects/
│  ├─ runtime-presets.json
│  ├─ stage-presets.json
│  └─ samples.json
└─ scripts/
   ├─ list-specs.mjs
   ├─ get-spec.mjs
   ├─ find-spec.mjs
   └─ get-effect.mjs
```

## Repository Layout After Phase 3

```text
catalog/text-animations/
├─ effects/
│  ├─ soft-blur-in.json
│  └─ ...
├─ presets/
│  ├─ runtime.json
│  └─ stage.json
├─ schema/
│  ├─ portable-spec.md
│  └─ effect-recipe.md
└─ catalog.json
```

The generator should continue to emit the current public-skill layout so consumers are not broken.

## Risks

### Risk: the design becomes too web-specific

Mitigation:

- keep portable specs clean and library-agnostic
- allow the exact effect recipe to be explicitly showcase-oriented

### Risk: migration churn across many files

Mitigation:

- use the phased rollout above
- do not move canonical source layout in phase 1

### Risk: the runtime cannot support some documented swap semantics cleanly

Mitigation:

- reduce supported modes before shipping misleading docs
- make validation fail on unsupported combinations

## Alternatives Considered

### Alternative A: only improve docs

Rejected because:

- it does not make the skill materially better
- hidden behavior remains hidden
- runtime and docs would still disagree

### Alternative B: keep current source layout forever and only add effect recipes

Viable short-term, but weaker long-term.

It improves the public skill quickly, but it leaves canonical ownership split across too many files.

### Alternative C: big-bang migration to canonical per-effect records first

Rejected because it combines:

- contract redesign
- runtime fixes
- schema expansion
- source migration

That is more risk than necessary for the first improvement.

## Recommended Implementation Order

1. Generate exact effect recipes from current sources.
2. Update skill docs and helper scripts to expose them.
3. Expand schema and validation.
4. Fix generic runtime swap semantics.
5. Make renderer resolution explicit in generated app data and skill assets.
6. Codify stage presets.
7. Add fidelity tests.
8. Migrate canonical authoring to per-effect records.

## Success Criteria

This design is successful when all of the following are true:

- an agent can retrieve one effect artifact and understand everything required to reproduce the website example
- an agent can still retrieve a clean portable spec without showcase-only noise
- website behavior matches the documented `swap` contract
- renderer-specific logic is no longer hidden from generated skill consumers
- schema docs match the real supported data model
- validation fails on contract drift before it reaches generated outputs
