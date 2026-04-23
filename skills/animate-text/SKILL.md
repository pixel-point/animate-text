---
name: animate-text
description: Curated text animation catalog with exact JSON specs for headings, labels, counters, and text swaps. Use when an agent needs to pick or translate named effects like soft blur in, typewriter, shared axis, line reveal, stagger, crossfade, or kinetic builds into WAAPI, Motion, Framer Motion, GSAP, CSS, Lottie, Rive, or similar stacks.
---

# Animate Text

Use this skill as a tech-agnostic text animation catalog backed by exact JSON specs.

This skill ships 24 specs in total. The website currently showcases 20 of them.

## When To Use

Use this skill when the request involves:

- animating headings, labels, counters, editorial copy, or text swaps
- matching a named effect id such as `soft-blur-in`, `typewriter`, `shared-axis-y`, or `kinetic-center-build`
- choosing a motion pattern from a curated catalog and translating it into a target stack
- reproducing exact timing, easing, stagger, and swap behavior from a JSON motion contract

## Workflow

1. Determine the text type, animation goal, and target implementation stack.
2. If the user names an effect id, read `assets/specs/<id>.json` directly.
3. Otherwise use `references/catalog.md` or optionally run:
   - `node scripts/list-specs.mjs`
   - `node scripts/find-spec.mjs "<query>"`
4. Read the chosen JSON contract from `assets/specs/`.
5. Translate the spec fields into the requested stack.
6. If the request includes text replacement, honor the `swap` contract, including `mode`, `overlap_ms`, and `micro_delay_ms`.

## Bundled Resources

- `references/catalog.md`: compact summary of the bundled spec library
- `references/schema.md`: field-level schema for the JSON contract
- `references/selection-guide.md`: heuristics for picking the right effect family
- `references/implementation-notes.md`: translation notes for common animation stacks
- `assets/specs/*.json`: exact bundled animation specs
- `assets/catalog.json`: visible website catalog order and renderer overrides
- `assets/samples.json`: sample copy used by the website showcase
- `assets/runtime.json`: catalog-level website runtime defaults

## Optional Helper Scripts

The helper scripts are optional deterministic shortcuts. They require Node.js 20+.

- `node scripts/list-specs.mjs` prints bundled spec metadata as JSON
- `node scripts/get-spec.mjs <id>` prints one exact bundled spec as JSON
- `node scripts/find-spec.mjs "<query>"` returns likely matches ranked by metadata

If Node is unavailable, the core skill still works through the Markdown references and JSON assets alone.

## Translation Rules

- Preserve `target` exactly: `whole`, `per-character`, `per-word`, or `per-line`.
- Map `enter` and `exit` durations, easing, and stagger directly into the target stack.
- Preserve transform, opacity, blur, scale, rotation, and spacing fields when the target stack supports them.
- For layout-aware effects such as `kinetic-center-build` or `short-slide-down`, use the `build` block and notes in `usage_notes` to preserve the choreography rather than flattening them into a generic stagger.

## Notes

- The public website uses a curated subset of the bundled library. The skill can still use additional bundled specs that are not currently visible on the website.
- The JSON files are the authoritative contracts. If a prose note conflicts with a JSON field, prefer the JSON.
