export type TextAnimationTarget = 'whole' | 'per-character' | 'per-word' | 'per-line';

export type TextAnimationRenderer =
  | 'kinetic-center-build'
  | 'kinetic-top-build'
  | 'shared-slide-opacity-stage';

export type TextAnimationStaggerMode = 'normal' | 'center-out' | 'edges-in' | 'reverse';

export type TextAnimationSwapMode = 'crossfade' | 'sequential' | 'morph';

export interface TextAnimationFrameSpec {
  opacity?: number;
  x_px?: number;
  y_px?: number;
  z_px?: number;
  scale?: number;
  rotate_deg?: number;
  rotate_x_deg?: number;
  rotate_y_deg?: number;
  blur_px?: number;
  letter_spacing_em?: number;
  color?: string;
}

export interface TextAnimationPhaseSpec {
  duration_ms: number;
  stagger_ms: number;
  easing: string;
  from: TextAnimationFrameSpec;
  to: TextAnimationFrameSpec;
}

export interface TextAnimationSwapSpec {
  mode?: TextAnimationSwapMode;
  overlap_ms?: number;
  micro_delay_ms?: number;
}

export type TextAnimationBuildValue = number | string | string[][] | undefined;

export interface TextAnimationBuildSpec {
  [key: string]: TextAnimationBuildValue;
}

export interface TextAnimationSpec {
  id: string;
  display_name: string;
  description: string;
  inspiration: string;
  target: TextAnimationTarget;
  signature_easing: string;
  enter: TextAnimationPhaseSpec;
  exit: TextAnimationPhaseSpec;
  swap?: TextAnimationSwapSpec;
  usage_notes: string;
  preview: string;
  custom_renderer?: TextAnimationRenderer;
  stagger_mode?: TextAnimationStaggerMode;
  build?: TextAnimationBuildSpec;
}

export interface TextAnimationContent {
  sample: string;
  samples?: string[];
  phrases?: string[][];
}

export interface TextAnimationRuntimeConfig {
  tileSpeed: number;
  tileHoldMs: number;
  tileGapMs: number;
  tileYTravel: number;
}

export interface TextAnimationCatalogItem {
  id: string;
  spec: TextAnimationSpec;
  content: TextAnimationContent;
}
