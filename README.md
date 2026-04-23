# Project Guide

This document explains how to run, build, and maintain the project locally.

## Technology Stack

- [Next.js](https://nextjs.org/) - application framework and routing
- [Tailwind CSS](https://tailwindcss.com/) - utility-first styling
- [shadcn/ui](https://ui.shadcn.com/) - reusable UI component patterns built on Radix primitives

## Requirements

- Node.js 20+
- pnpm 10+

## Getting Started

Run all commands from the project root (this folder):

```bash
pnpm install
pnpm dev
```

The app will be available at `http://localhost:3000`.

If environment variables are required for a specific setup:

```bash
cp .env.example .env
```

## Development Workflow

1. Start the dev server with `pnpm dev`.
2. Regenerate the skill and app data when changing the animation catalog:
   - `pnpm generate:animate-text-skill`
   - `pnpm validate:animate-text-catalog`
3. Add or update routes in `src/app`.
4. Build reusable UI in `src/components/ui`.
5. Build page-specific sections in `src/components/pages/<slug>`
6. Compose pages from those sections inside route files under `src/app`.
7. Run quality checks before committing:
   - `pnpm lint`
   - `pnpm format`
   - `pnpm typecheck` (`tsgo --noEmit`)
   - `pnpm build`

## Available Scripts

- `pnpm dev` - start Next.js in development mode
- `pnpm generate:animate-text-skill` - rebuild the installable skill and generated site data from `catalog/text-animations`
- `pnpm validate:animate-text-catalog` - validate canonical catalog inputs and ensure generated outputs are up to date
- `pnpm test:animate-text-skill` - smoke test the generated public skill helper scripts
- `pnpm build` - create a production build
- `pnpm start` - run the production server
- `pnpm lint` - run OXC lint checks
- `pnpm lint:fix` - run OXC lint with auto-fixes
- `pnpm format` - check formatting with Oxfmt
- `pnpm format:fix` - format files with Oxfmt
- `pnpm typecheck` - run TypeScript type checks with tsgo

## Project Structure

```text
.
├─ public/                    # static assets served as-is
├─ catalog/                   # canonical source-of-truth data for the text animation library
├─ skills/                    # installable generated skill output
├─ templates/                 # templates used to generate skill documents
├─ src/
│  ├─ app/                    # Next.js App Router (routes, layouts, not-found)
│  ├─ components/
│  │  ├─ ui/                  # shared UI primitives
│  │  └─ pages/
│  │     ├─ home/             # components used only by the Home page
│  │     └─ <slug>/           # components used only by one specific page
│  ├─ content/                # markdown content grouped by feature/page
│  ├─ configs/                # app and website configuration
│  ├─ constants/              # static constants
│  ├─ contexts/               # React providers/contexts
│  ├─ hooks/                  # reusable React hooks
│  ├─ lib/                    # utilities and framework helpers
│  ├─ styles/                 # global and feature styles
│  └─ types/                  # shared TypeScript types
├─ scripts/                   # repo-maintainer scripts including catalog generation/validation
├─ next.config.ts             # Next.js configuration
├─ postcss.config.mjs         # PostCSS configuration
├─ tailwind.plugins.mjs       # Tailwind plugin setup
├─ .oxlintrc.json             # OXC lint configuration
├─ .oxfmtrc.json              # OXC formatter configuration
└─ package.json
```

## Website Config

Website-level settings are defined in `src/configs/website-config.ts`.

Use this config for branding, metadata defaults, and repository links. Common fields:

- `projectName` - project name used in UI and metadata
- `metaThemeColors.light` / `metaThemeColors.dark` - browser theme colors
- `src/app/opengraph-image.tsx` - generated OG/social preview image used for Open Graph and Twitter
- `githubOrg` / `githubRepo` - repository metadata for links/integrations

Example:

```ts
const config = {
  projectName: '<YOUR_PROJECT_NAME>',
  metaThemeColors: {
    light: '#ffffff',
    dark: '#09090b',
  },
};
```

## Content Directory

Content lives in `src/content` and is organized by folders per section/page type.

Example structure:

```text
src/content/
├─ blog/
├─ docs/
└─ legal/
```

Rules for this project:

- Use Markdown only (`.md` files).
- Keep content grouped by folder (for example: `docs/`, `blog/`, `legal/`).
- Use nested folders when you need hierarchy inside a section.

### Documentation (`/docs`) Conventions

For the `/docs` section, this project follows the same page conventions as FumaDocs. Use the official [FumaDocs page conventions](https://www.fumadocs.dev/docs/page-conventions) as the primary reference when creating or editing docs pages.

## Build and Output

- Run `pnpm build` to generate the production build in `.next/`.
- Run `pnpm start` to serve the compiled build.
- `postbuild` can generate sitemap files and `robots.txt` via `next-sitemap`.
- Generated/runtime directories such as `.next/`, `.turbo/`, and `node_modules/` are not source files.

## Animate Text Skill

This repository now contains two downstream outputs generated from `catalog/text-animations/`:

- `skills/animate-text/` - the installable public skill for the `skills.sh` ecosystem
- `src/data/text-animations/generated/` - app-facing generated modules used by the website

Canonical editing rules:

- edit `catalog/text-animations/**` by hand
- do not hand-edit `skills/animate-text/**`
- do not hand-edit `src/data/text-animations/generated/**`

Typical maintainer flow:

```bash
pnpm generate:animate-text-skill
pnpm validate:animate-text-catalog
pnpm test:animate-text-skill
```

Install form for consumers:

```bash
npx skills add <owner>/<repo> --skill animate-text
```
