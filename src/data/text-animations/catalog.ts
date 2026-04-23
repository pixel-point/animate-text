import { TEXT_ANIMATION_CONTENT, TEXT_ANIMATION_RUNTIME } from './catalog-content';
import { TEXT_ANIMATION_SPECS } from './specs';
import type { TextAnimationCatalogItem } from './types';

export const TEXT_ANIMATION_CATALOG = [
  'soft-blur-in',
  'per-character-rise',
  'per-word-crossfade',
  'spring-scale-in',
  'mask-reveal-up',
  'line-by-line-slide',
  'typewriter',
  'micro-scale-fade',
  'shimmer-sweep',
  'fade-through',
  'shared-axis-y',
  'shared-axis-z',
  'blur-out-up',
  'scale-down-fade',
  'focus-blur-resolve',
  'bottom-up-letters',
  'top-down-letters',
  'kinetic-center-build',
  'short-slide-right',
  'short-slide-down',
] as const;

export type TextAnimationId = (typeof TEXT_ANIMATION_CATALOG)[number];

export const textAnimationCatalog: readonly TextAnimationCatalogItem[] = TEXT_ANIMATION_CATALOG.map(
  (id) => ({
    id,
    spec:
      id === 'kinetic-center-build'
        ? { ...TEXT_ANIMATION_SPECS[id], custom_renderer: 'kinetic-center-build' }
        : TEXT_ANIMATION_SPECS[id],
    content: TEXT_ANIMATION_CONTENT[id],
  }),
);

export { TEXT_ANIMATION_RUNTIME };
