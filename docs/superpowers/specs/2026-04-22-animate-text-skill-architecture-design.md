# Animate Text Skill Architecture Design

Date: 2026-04-22
Status: Approved design, pending user review

## Summary

Turn the current text animation catalog into a publishable Agent Skill that can be installed from this same repository through the `skills.sh` ecosystem, while keeping the animation JSON files as the single source of truth.

The recommended architecture is:

- move canonical animation data into a repo-neutral catalog area
- generate both the website-facing data layer and the installable skill from that catalog
- keep the installable skill conventional and Markdown-first
- bundle exact JSON specs into the skill as assets
- include small read-only helper scripts in the skill so agents can query the bundled catalog deterministically without depending on the website codebase

This approach keeps the site and the public skill aligned without making either one the owner of the animation data.

## Context

- The repository already contains a website implementation plus a text animation catalog under `src/data/text-animations/`.
- There is also a draft standalone skill bundle in `tmp/` with `SKILL.md`, `schema.md`, and animation spec files.
- The project goal is larger than a single web page. The repository should become:
  - the authoring home for the animation specification library
  - the build source for the public installable skill
  - the website that showcases the catalog
- The user wants the JSON animation specs to remain the source of truth.
- The user also wants a generator workflow so skill output is derived from canonical specs instead of being edited by hand.

## External Ecosystem Findings

The current `skills.sh` model is distribution and discovery, not a separate package registry with an explicit publish step.

Key points verified from current documentation:

- Skills are hosted in git repositories and installed with `npx skills add`.
- Repositories are scanned for valid `SKILL.md` files in standard locations such as `skills/`.
- A skill can be just `SKILL.md`, but the Agent Skills specification also allows optional `scripts/`, `references/`, and `assets/`.
- `skills.sh` discoverability comes from installs and telemetry rather than a separate publish command.

Implications for this repository:

- there is no need for a separate package artifact just to publish on `skills.sh`
- the repository should expose a discoverable `skills/animate-text/` directory
- the public skill should be self-contained and should not depend on `src/` files at install time

Reference sources used during design:

- `https://github.com/vercel-labs/skills`
- `https://skills.sh/docs/cli`
- `https://skills.sh/docs/faq`
- `https://agentskills.io/specification`
- `https://agentskills.io/skill-creation/using-scripts`
- `https://agentskills.io/skill-creation/best-practices`

## Goals

- Preserve animation JSON files as the canonical source of truth.
- Publish an installable `animate-text` skill from this same repository.
- Embed the exact animation specs inside the skill so it is self-contained after installation.
- Keep the website and the skill synchronized through generation instead of manual duplication.
- Make the public skill conventional enough that it still looks like a normal skill folder.
- Provide helper tooling inside the skill for deterministic catalog lookup without making the skill dependent on the site build.
- Keep the architecture maintainable for ongoing addition and refinement of animation specs.

## Non-Goals

- Building a separate publish-only repository.
- Treating the Next.js app as the canonical source of animation data.
- Requiring the installed skill to run the site build or `pnpm` toolchain just to access a spec.
- Adding runtime mutation, remote fetches, or external services to public skill lookup.
- Designing a registry-specific package format beyond standard Agent Skills structure.

## Recommended Architecture

Use a repo-neutral catalog area as the canonical source, then generate both downstream outputs:

1. website-facing generated data under `src/`
2. installable skill output under `skills/animate-text/`

### Canonical Ownership

Humans should edit only the canonical catalog area:

```text
catalog/
└─ text-animations/
   ├─ specs/
   │  ├─ soft-blur-in.json
   │  └─ ...
   ├─ catalog.json
   ├─ samples.json
   ├─ runtime.json
   └─ schema.md
```

Ownership rules:

- `catalog/text-animations/specs/*.json` contains the exact effect contracts.
- `catalog/text-animations/catalog.json` defines the public catalog order and inclusion.
- `catalog/text-animations/samples.json` contains copy, phrases, and other content required to demo or loop the effects.
- `catalog/text-animations/runtime.json` contains catalog-level runtime defaults that are not intrinsic to one spec.
- `catalog/text-animations/schema.md` documents the spec format.

The site and the skill both consume this catalog. Neither of them owns the data.

### Generated Outputs

The canonical catalog generates two downstream surfaces:

```text
skills/
└─ animate-text/
   ├─ SKILL.md
   ├─ references/
   ├─ assets/
   └─ scripts/

src/
└─ data/
   └─ text-animations/
      └─ generated/
```

Ownership rules:

- `skills/animate-text/**` is generated output and must not be edited by hand.
- `src/data/text-animations/generated/**` is generated output and must not be edited by hand.
- If prose needs hand-authored framing, keep it in generator templates outside the generated directories.

## Repository Layout

Recommended top-level layout:

```text
.
├─ catalog/
│  └─ text-animations/
│     ├─ specs/
│     ├─ catalog.json
│     ├─ runtime.json
│     ├─ samples.json
│     └─ schema.md
├─ scripts/
│  ├─ generate-animate-text-skill.mts
│  └─ validate-text-animation-catalog.mts
├─ templates/
│  └─ animate-text-skill/
│     ├─ SKILL.md.tpl
│     ├─ catalog.md.tpl
│     ├─ selection-guide.md.tpl
│     └─ implementation-notes.md.tpl
├─ skills/
│  └─ animate-text/
├─ src/
│  └─ data/
│     └─ text-animations/
│        └─ generated/
└─ docs/
   └─ superpowers/
      └─ specs/
```

Notes:

- `scripts/` holds repo-maintainer tooling and can use TypeScript because it runs inside this repository.
- `templates/animate-text-skill/` holds any prose templates required to assemble generated skill docs.
- The installed public skill should not ship raw generator templates or repository-maintainer tooling.

## Public Skill Structure

The installable public skill should remain conventional and compact at the top level:

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
│  ├─ runtime.json
│  ├─ samples.json
│  └─ specs/
│     ├─ soft-blur-in.json
│     └─ ...
└─ scripts/
   ├─ list-specs.mjs
   ├─ get-spec.mjs
   └─ find-spec.mjs
```

### Why this structure

- `SKILL.md` stays concise and focuses on trigger conditions, workflow, and how to use bundled resources.
- `references/` holds content that is useful to load selectively.
- `assets/specs/*.json` embeds the exact spec contracts inside the skill.
- `scripts/` gives agents deterministic catalog lookup when reading raw Markdown is not enough.

### Public Skill Script Requirements

The helper scripts inside the public skill should be:

- read-only
- zero-dependency
- directly runnable without a build step
- stable in output shape

To satisfy those constraints, the public skill scripts should be plain Node `.mjs` files rather than TypeScript source.

That keeps the public skill lightweight and avoids requiring `pnpm`, transpilation, or repo-specific tooling for simple catalog lookup.

If Node is unavailable, the skill should still remain usable through Markdown and JSON assets alone.

## Skill Behavior Design

### `SKILL.md`

`SKILL.md` should:

- clearly describe when to use the skill
- explain that the skill is a catalog of reusable text animation specs
- optionally declare that helper scripts require Node.js 20+ while the core skill remains usable through Markdown and JSON assets alone
- instruct the agent to:
  - determine the user’s requested text type, animation goal, and implementation target
  - select the most suitable spec by id or by semantic match
  - read the exact JSON contract from `assets/specs/`
  - translate the contract into the requested animation stack
- point to `references/` files only when needed
- mention helper scripts as optional deterministic shortcuts rather than mandatory entry points

The skill remains valid even if an agent chooses not to run the scripts.

### `references/catalog.md`

Generated summary of every visible effect, including:

- id
- display name
- description
- target
- inspiration
- short usage note
- indication of any custom renderer behavior

This gives the agent a compact searchable view before opening raw JSON files.

### `references/selection-guide.md`

Generated or templated guidance for mapping user intent to effect families, such as:

- per-character emphasis
- whole-phrase state change
- line-by-line copy reveal
- shared-axis transitions
- layout-aware choreography

This file should focus on selection heuristics rather than repeating raw spec fields.

### `references/implementation-notes.md`

Guidance for translating spec fields into implementation targets such as:

- WAAPI
- Motion
- Framer Motion
- GSAP
- CSS animation or transition layers

This should stay concise and rely on raw JSON for the actual contract values.

### Helper scripts

The public skill scripts should be read-only query helpers:

- `scripts/list-specs.mjs`
  - returns a compact machine-readable list of ids and core metadata
- `scripts/get-spec.mjs <id>`
  - returns the exact JSON contract for one effect
- `scripts/find-spec.mjs <query>`
  - returns candidate specs by id, target, description, inspiration, and usage notes

These scripts must not:

- regenerate the skill
- mutate any files
- depend on the website source tree
- depend on npm-installed libraries

## Website Integration Design

The website should consume generated app data rather than reading from the skill directory directly.

Recommended generated app surface:

```text
src/data/text-animations/generated/
├─ catalog.ts
├─ content.ts
├─ runtime.ts
├─ specs.ts
└─ types.ts
```

Behavior:

- generated app modules provide the shapes the website already expects
- the site imports stable app-facing modules from `src/data/text-animations/generated/`
- the site does not read from `tmp/`
- the site does not treat `skills/animate-text/` as a runtime dependency

This keeps app imports ergonomic while preserving the catalog directory as the only editable source.

## Generator Design

One repo-maintainer generator should own all downstream output.

Recommended entry point:

- `scripts/generate-animate-text-skill.mts`

Recommended command:

- `pnpm generate:animate-text-skill`

Generator responsibilities:

1. load and validate canonical catalog inputs
2. normalize paths and ids
3. emit website-facing generated modules
4. emit public skill docs, assets, and helper scripts
5. write a generated-file header where appropriate
6. preserve deterministic output ordering for clean diffs

The generator should be the only authority for:

- `skills/animate-text/**`
- `src/data/text-animations/generated/**`

## Validation Design

Add a dedicated validator:

- `scripts/validate-text-animation-catalog.mts`

Recommended command:

- `pnpm validate:animate-text-catalog`

Validation checks should include:

- every spec filename matches its internal `id`
- every `id` is unique
- every catalog entry references an existing spec
- every visible effect has required sample content
- every referenced preview or custom-renderer field is consistent with expected schema rules
- all generated output is reproducible from canonical source

The generator should fail fast on invalid catalog input.

Optional but recommended follow-up validation:

- `pnpm test:animate-text-skill`

That smoke test can verify that:

- `list-specs.mjs` returns valid JSON
- `get-spec.mjs` returns a known spec
- `find-spec.mjs` returns deterministic matches for seeded queries

## Publishing And Install Model

Publishing is repository-based.

Expected install forms:

- `npx skills add <owner>/<repo> --skill animate-text`
- `npx skills add https://github.com/<owner>/<repo> --skill animate-text`

Because this repository will contain a valid `skills/animate-text/SKILL.md`, it is compatible with current `skills` CLI discovery behavior.

There is no separate publish command required for `skills.sh`. The repository becomes publishable once:

- the skill directory exists in a discoverable location
- the repository is public or otherwise reachable to intended installers
- users install it via `npx skills add`

## Maintenance Rules

To prevent drift, the repository should follow these rules:

- edit only `catalog/text-animations/**` by hand
- never hand-edit `skills/animate-text/**`
- never hand-edit `src/data/text-animations/generated/**`
- regenerate outputs whenever catalog inputs change
- commit canonical inputs and generated outputs together

Recommended README and website messaging:

- explain that the repository contains both the showcase website and the installable skill
- document the install command for the public skill
- document the generator and validation commands for maintainers

## Versioning And Evolution

The catalog should be treated as the product surface. The public skill and the website are both generated views of that product.

When adding or changing effects:

1. update canonical catalog files
2. regenerate outputs
3. verify website behavior
4. verify public skill helper scripts
5. commit all related changes together

If future scope grows substantially, the repository can later evolve into a fuller workspace split. That should be deferred until there is a concrete need such as:

- publishing the spec library as an npm package
- supporting multiple apps that consume the same animation catalog
- adding substantially more generator targets

That is not required for the current goal.

## Recommended Implementation Order

1. Create `catalog/text-animations/` and move canonical inputs there.
2. Normalize catalog ownership across `specs/`, `catalog.json`, `samples.json`, `runtime.json`, and `schema.md`.
3. Implement catalog validation.
4. Implement generator templates and skill emission.
5. Generate `skills/animate-text/`.
6. Generate `src/data/text-animations/generated/`.
7. Update the website to consume generated app data.
8. Add maintainer scripts to `package.json`.
9. Add README and website install documentation.
10. Run formatting, lint, typecheck, and build checks.

## Risks And Mitigations

### Risk: duplicated logic between generator and site

Mitigation:

- generate app-facing modules from canonical inputs rather than maintaining parallel manual mappings

### Risk: public skill scripts become too environment-dependent

Mitigation:

- keep public helper scripts zero-dependency and read-only
- keep the core skill usable through Markdown and JSON even without script execution

### Risk: generated files drift from canonical source

Mitigation:

- make generation deterministic
- add validation for stale output
- treat generated directories as no-edit zones

### Risk: site-specific needs leak into canonical catalog

Mitigation:

- keep site presentation data derived in generated app modules whenever possible
- reserve canonical catalog for reusable animation-spec concerns

## Decision

Proceed with a repo-neutral canonical catalog and a single generator that emits both:

- the public `skills/animate-text/` installable skill
- the app-facing `src/data/text-animations/generated/` modules

This architecture best satisfies the requirements for:

- one source of truth
- same-repository `skills.sh` publishing
- ongoing maintainability
- minimal coupling between the website and the installable skill
