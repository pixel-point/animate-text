import { TEXT_ANIMATION_RUNTIME } from '@/data/text-animations/generated/catalog';
import type {
  TextAnimationBuildSpec,
  TextAnimationCatalogItem,
  TextAnimationFrameSpec,
  TextAnimationPhaseSpec,
  TextAnimationTarget,
} from '@/data/text-animations/generated/types';

export type TextAnimationPart = {
  text: string;
  animate: boolean;
  block?: boolean;
};

export type TileFrame = {
  color?: string;
  filter: string;
  letterSpacingEm: number | null;
  opacity: number;
  transform: string;
};

export type TitleParts = {
  title: HTMLHeadingElement;
  units: HTMLSpanElement[];
};

export type KineticStageFrame = {
  filter: string;
  opacity: number;
  transform: string;
};

export function splitTextByTarget(text: string, target: TextAnimationTarget): TextAnimationPart[] {
  if (target === 'whole') {
    return [{ text, animate: true }];
  }

  if (target === 'per-word') {
    const parts: TextAnimationPart[] = [];
    const matcher = /(\S+|\s+)/g;

    for (const match of text.matchAll(matcher)) {
      parts.push({ text: match[0], animate: /\S/.test(match[0]) });
    }

    return parts;
  }

  if (target === 'per-line') {
    return text.split('\n').map((line) => ({ text: line, animate: true, block: true }));
  }

  return [...text].map((character) => ({ text: character, animate: true }));
}

export function getStaggerRanks(count: number, mode: string = 'normal'): number[] {
  const order: number[] = [];

  if (mode === 'center-out') {
    const center = (count - 1) / 2;

    for (let index = 0; index < count; index += 1) {
      order.push(index);
    }

    order.sort((left, right) => {
      return Math.abs(left - center) - Math.abs(right - center) || left - right;
    });
  } else if (mode === 'edges-in') {
    let left = 0;
    let right = count - 1;

    while (left <= right) {
      order.push(left);

      if (right !== left) {
        order.push(right);
      }

      left += 1;
      right -= 1;
    }
  } else if (mode === 'reverse') {
    for (let index = count - 1; index >= 0; index -= 1) {
      order.push(index);
    }
  } else {
    for (let index = 0; index < count; index += 1) {
      order.push(index);
    }
  }

  const ranks = Array.from({ length: count }, () => 0);

  order.forEach((index, rank) => {
    ranks[index] = rank;
  });

  return ranks;
}

export function toAnimationFrame(
  values: TextAnimationFrameSpec | undefined,
  yTravel: number = TEXT_ANIMATION_RUNTIME.tileYTravel,
): TileFrame {
  const frame = values ?? {};
  const next: TileFrame = {
    filter: `blur(${frame.blur_px ?? 0}px)`,
    letterSpacingEm: frame.letter_spacing_em ?? null,
    opacity: frame.opacity ?? 1,
    transform: `translate3d(${frame.x_px ?? 0}px, ${(frame.y_px ?? 0) * yTravel}px, ${
      frame.z_px ?? 0
    }px) rotateX(${frame.rotate_x_deg ?? 0}deg) rotateY(${frame.rotate_y_deg ?? 0}deg) rotate(${
      frame.rotate_deg ?? 0
    }deg) scale(${frame.scale ?? 1})`,
  };

  if (frame.color) {
    next.color = frame.color;
  }

  return next;
}

export function getPhaseTotal(
  unitCount: number,
  phase: TextAnimationPhaseSpec,
  speed: number = TEXT_ANIMATION_RUNTIME.tileSpeed,
): number {
  const duration = Math.max(140, Math.round(phase.duration_ms * speed));
  const delayStep = Math.max(0, Math.round(phase.stagger_ms * speed));

  return duration + Math.max(0, unitCount - 1) * delayStep;
}

export function materializeTileFrame(
  frame: TileFrame,
  unit: HTMLElement,
  index: number,
  count: number,
  target: TextAnimationTarget,
): Keyframe {
  const keyframe: Keyframe = {
    filter: frame.filter,
    letterSpacing: '0em',
    marginLeft: '0em',
    marginRight: '0em',
    opacity: frame.opacity,
    transform: frame.transform,
  };

  if (frame.color) {
    keyframe.color = frame.color;
  }

  if (frame.letterSpacingEm == null) {
    return keyframe;
  }

  if (target === 'per-character') {
    const text = unit.textContent ?? '';
    const isGlyph = /\S/.test(text);
    const halfGap = `${frame.letterSpacingEm / 2}em`;

    keyframe.marginLeft = isGlyph && index > 0 ? halfGap : '0em';
    keyframe.marginRight = isGlyph && index < count - 1 ? halfGap : '0em';

    return keyframe;
  }

  keyframe.letterSpacing = `${frame.letterSpacingEm}em`;

  return keyframe;
}

export function makeTitle(
  document: Document,
  text: string,
  target: TextAnimationTarget,
): TitleParts {
  const title = document.createElement('h3');
  const units: HTMLSpanElement[] = [];

  title.className = 'text-animation-title';

  splitTextByTarget(text, target).forEach((part) => {
    const unit = document.createElement('span');
    unit.className = `text-animation-unit${part.block ? ' line' : ''}`;
    unit.textContent = part.text;
    title.appendChild(unit);

    if (part.animate) {
      units.push(unit);
    }
  });

  return { title, units };
}

export function getTextSamples(item: TextAnimationCatalogItem): string[] {
  return item.content.samples?.length ? item.content.samples : [item.content.sample];
}

export function getPhraseSamples(
  contentPhrases: string[][] | undefined,
  build: TextAnimationBuildSpec | undefined,
  fallback: string[][],
): string[][] {
  if (contentPhrases?.length) {
    return contentPhrases;
  }

  const buildPhraseSamples = build?.phrase_samples;

  if (Array.isArray(buildPhraseSamples) && buildPhraseSamples.length) {
    return buildPhraseSamples as string[][];
  }

  return fallback;
}

export function setKineticPose(element: HTMLElement, frame: KineticStageFrame) {
  element.style.filter = frame.filter;
  element.style.opacity = `${frame.opacity}`;
  element.style.transform = frame.transform;
}

export function buildKineticFrame(
  x: number,
  y: number,
  scale: number,
  blur: number,
  opacity: number,
): KineticStageFrame {
  return {
    filter: `blur(${blur}px)`,
    opacity,
    transform: `translate(-50%, -50%) translate3d(${x}px, ${y}px, 0) scale(${scale})`,
  };
}

export function mix(start: number, end: number, progress: number): number {
  return start + (end - start) * progress;
}

export function titleFrame(values: TextAnimationFrameSpec | undefined): Keyframe {
  const frame = values ?? {};

  return {
    filter: `blur(${frame.blur_px ?? 0}px)`,
    opacity: frame.opacity ?? 1,
    transform: `translate3d(${frame.x_px ?? 0}px, ${(frame.y_px ?? 0) * TEXT_ANIMATION_RUNTIME.tileYTravel}px, 0) scale(${frame.scale ?? 1})`,
  };
}
