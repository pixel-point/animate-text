'use client';

import { useEffect, useRef, useState } from 'react';
import { CheckIcon, CopyIcon } from '@phosphor-icons/react/ssr';

import useCopyToClipboard from '@/hooks/use-copy-to-clipboard';
import { cn } from '@/lib/utils';
import { startTextAnimationLoop } from '@/lib/text-animation-runtime';
import { textAnimationCatalog } from '@/data/text-animations/generated/catalog';
import type { TextAnimationCatalogItem } from '@/data/text-animations/generated/types';

export default function TextAnimationCatalog() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 [&>*]:border-border dark:[&>*]:border-border/60 [&>*+*]:border-t xl:[&>*:nth-child(-n+2)]:border-t-0 xl:[&>*:nth-child(2n)]:border-l">
      {textAnimationCatalog.map((item) => (
        <TextAnimationCard key={item.id} item={item} />
      ))}
    </div>
  );
}

function TextAnimationCard({ item }: { item: TextAnimationCatalogItem }) {
  const { isCopied, handleCopy } = useCopyToClipboard(1600);

  return (
    <article
      className="group relative aspect-video overflow-hidden bg-background text-foreground"
      aria-label={item.spec.display_name}
    >
      <div className="pointer-events-none absolute inset-0 z-0 bg-card/50 opacity-0 transition-opacity duration-500 ease-out group-focus-within:opacity-100 group-hover:opacity-100" />

      <button
        type="button"
        onClick={() => handleCopy(item.id)}
        aria-label={isCopied ? `Copied ${item.id}` : `Copy ${item.id}`}
        title="Copy"
        className={cn(
          'absolute top-3 right-3 z-10 inline-flex size-8 items-center justify-center text-foreground/50',
          'transition-[color,transform,opacity] duration-200 ease-out hover:text-foreground',
          isCopied
            ? 'translate-y-0 opacity-100'
            : 'pointer-events-none translate-y-1 opacity-0 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100',
        )}
      >
        {isCopied ? (
          <CheckIcon className="size-[20px]" weight="light" />
        ) : (
          <CopyIcon className="size-[20px]" weight="light" />
        )}
      </button>

      <TextAnimationStage item={item} />
    </article>
  );
}

function TextAnimationStage({ item }: { item: TextAnimationCatalogItem }) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const stage = stageRef.current;

    if (!stage) {
      return;
    }

    setFailed(false);
    stage.dataset.animationId = item.id;

    return startTextAnimationLoop(stage, item, (error) => {
      console.error(`Failed to run text animation "${item.id}"`, error);
      setFailed(true);
    });
  }, [item]);

  return (
    <div ref={stageRef} className="text-animation-stage pointer-events-none absolute inset-0 z-[1]">
      {failed ? (
        <h3 className="text-animation-title text-animation-fallback">{item.content.sample}</h3>
      ) : null}
    </div>
  );
}
