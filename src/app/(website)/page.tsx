import type { Metadata } from 'next';

import InstallSkillButton from '@/components/pages/home/install-skill-button';
import TextAnimationCatalog from '@/components/pages/home/text-animation-catalog';
import { Badge } from '@/components/ui/badge';
import { Link } from '@/components/ui/link';
import { ThemeSwitcher } from '@/components/ui/theme-switcher';
import { getMetadata } from '@/lib/get-metadata';

const pageData = {
  pathname: '/',
  metadata: {
    title: 'Animate text skill for your AI agent.',
    description:
      'Get beautiful text animations in any stack by installing this skill to your AI agent. Use it with remotion, motion, gsap, waapi or any other libraries.',
    pathname: '/',
  },
};

export const metadata: Metadata = getMetadata({
  title: pageData.metadata?.title,
  description: pageData.metadata?.description,
  pathname: pageData.pathname,
});

export default function HomePage() {
  return (
    <main className="min-h-svh bg-background md:h-svh md:overflow-hidden">
      <div className="grid min-h-svh md:h-svh md:grid-cols-[400px_minmax(0,1fr)]">
        <aside className="border-b border-border md:sticky md:top-0 md:h-svh md:overflow-hidden md:border-r md:border-b-0">
          <div className="flex h-full flex-col justify-between px-5 py-8 md:px-8 lg:px-10 lg:py-10 xl:px-12">
            <div>
              <Badge className="mb-5 w-fit lg:mb-8">SKILLS.md</Badge>

              <div className="max-w-xs">
                <h1 className="font-heading text-3xl leading-tight font-semibold tracking-tight text-balance text-foreground md:text-4xl md:leading-tight lg:text-5xl lg:leading-[1.05]">
                  Crafted text animations for AI workflows
                </h1>

                <p className="mt-4 text-base leading-snug tracking-tight text-muted-foreground md:text-lg md:leading-snug">
                  Set of text animation skills with precise specs for polished results, fast. Every
                  skill defines the small things that matter: pace, curves, transitions, and visual
                  finish.
                </p>

                <div className="mt-8 space-y-5 text-base leading-snug tracking-tight text-muted-foreground md:text-lg md:leading-snug">
                  <p>
                    Pair them with `remotion-skill` for programmatic videos, or use them as
                    animation building blocks for your site.
                  </p>
                </div>

                <InstallSkillButton />
              </div>
            </div>

            <div className="mt-10 flex shrink-0 items-center justify-between gap-4 lg:mt-8">
              <p className="text-sm leading-none tracking-tight text-muted-foreground">
                Made by{' '}
                <Link
                  href="https://pixelpoint.io"
                  variant="muted"
                  size="sm"
                  className="inline-flex"
                  target="_blank"
                  rel="noreferrer"
                >
                  Pixel Point
                </Link>
                .
              </p>
              <ThemeSwitcher />
            </div>
          </div>
        </aside>

        <section className="min-h-0 md:h-svh md:overflow-y-auto">
          <TextAnimationCatalog />
        </section>
      </div>
    </main>
  );
}
