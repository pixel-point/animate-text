import type { Metadata } from 'next';

import { AnimatedIcon } from '@/components/pages/home/animated-icon';
import InstallSkillButton from '@/components/pages/home/install-skill-button';
import TextAnimationCatalog from '@/components/pages/home/text-animation-catalog';
import { Badge } from '@/components/ui/badge';
import { CodexSkillIcon } from '@/components/ui/codex-skill-icon';
import { Link } from '@/components/ui/link';
import { ThemeSwitcher } from '@/components/ui/theme-switcher';
import { getMetadata } from '@/lib/get-metadata';
import { geistMono } from '@/lib/mono-font';

const pageData = {
  pathname: '/skills/animate-text',
  metadata: {
    title: 'Animate text skill for your AI agent.',
    description:
      'Get beautiful text animations in any stack by installing this skill to your AI agent. Use it with remotion, motion, gsap, waapi or any other libraries.',
    imagePath: 'https://animate-text-orcin.vercel.app/og.jpg',
    pathname: '/skills/animate-text',
  },
};

export const metadata: Metadata = getMetadata({
  title: pageData.metadata?.title,
  description: pageData.metadata?.description,
  imagePath: pageData.metadata?.imagePath,
  pathname: pageData.pathname,
});

export default function AnimateTextSkillPage() {
  return (
    <main className="min-h-svh bg-background md:h-svh md:overflow-hidden">
      <div className="grid min-h-svh grid-cols-[minmax(0,1fr)] md:h-svh md:grid-cols-[400px_minmax(0,1fr)] lg:grid-cols-[544px_minmax(0,1fr)]">
        <aside className="border-b border-border md:sticky md:top-0 md:h-svh md:overflow-hidden md:border-r md:border-b-0 md:dark:[border-right-color:hsl(var(--border)/0.6)]">
          <div className="flex h-full flex-col justify-between px-5 pt-12 pb-4 sm:pt-8 md:px-9 md:pt-16 lg:px-9 lg:pb-6">
            <div>
              <Badge className={`${geistMono.className} mb-3 w-fit gap-[6px] font-normal lg:mb-6`}>
                <CodexSkillIcon className="relative top-[2px] size-[18px] shrink-0" />
                <span className="relative top-px">SKILLS.md</span>
              </Badge>

              <div>
                <h1 className="font-heading text-3xl leading-tight font-semibold tracking-tight text-foreground sm:text-balance md:text-4xl md:leading-tight lg:text-[48px] lg:leading-[1.05]">
                  Crafted{' '}
                  <span className="sm:whitespace-nowrap">
                    <AnimatedIcon className="relative top-[4px] mr-[10px] ml-[2px] inline-block h-[42.4px] w-auto shrink-0 -rotate-[4deg] align-[-0.16em] md:h-[1.28em] lg:ml-0 lg:h-[66px]" />
                    text
                  </span>{' '}
                  animations for AI workflows
                </h1>

                <div className="mt-[28px] flex flex-col gap-4 text-base leading-snug tracking-tight text-muted-foreground md:text-lg md:leading-snug">
                  <p>
                    Beautiful text animations, ready for any stack. Add this skill to your AI agent
                    and use it with remotion, motion, gsap, waapi, or any other animation library.
                  </p>

                  <p>
                    The skill gives your agent clear animation specs, including pacing, curves,
                    transitions, and styling details that usually get lost in vague prompts.
                  </p>
                </div>

                <InstallSkillButton />
              </div>
            </div>

            <div className="mt-10 flex shrink-0 items-center justify-between gap-4 lg:mt-8">
              <p className="text-sm leading-none tracking-tight text-foreground/40">
                Made by{' '}
                <Link
                  href="https://pixelpoint.io"
                  variant="ghost"
                  size="sm"
                  className="inline-flex text-foreground/70 decoration-foreground decoration-[0.5px] underline-offset-[5px] hover:text-foreground hover:underline"
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
