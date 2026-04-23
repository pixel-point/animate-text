import blurOutUp from './blur-out-up.json';
import bottomUpLetters from './bottom-up-letters.json';
import fadeThrough from './fade-through.json';
import focusBlurResolve from './focus-blur-resolve.json';
import kineticCenterBuild from './kinetic-center-build.json';
import lineByLineSlide from './line-by-line-slide.json';
import maskRevealUp from './mask-reveal-up.json';
import microScaleFade from './micro-scale-fade.json';
import perCharacterRise from './per-character-rise.json';
import perWordCrossfade from './per-word-crossfade.json';
import scaleDownFade from './scale-down-fade.json';
import sharedAxisY from './shared-axis-y.json';
import sharedAxisZ from './shared-axis-z.json';
import shimmerSweep from './shimmer-sweep.json';
import shortSlideDown from './short-slide-down.json';
import shortSlideRight from './short-slide-right.json';
import softBlurIn from './soft-blur-in.json';
import springScaleIn from './spring-scale-in.json';
import topDownLetters from './top-down-letters.json';
import typewriter from './typewriter.json';

import type { TextAnimationSpec } from '../types';

export const TEXT_ANIMATION_SPECS = {
  'soft-blur-in': softBlurIn as TextAnimationSpec,
  'per-character-rise': perCharacterRise as TextAnimationSpec,
  'per-word-crossfade': perWordCrossfade as TextAnimationSpec,
  'spring-scale-in': springScaleIn as TextAnimationSpec,
  'mask-reveal-up': maskRevealUp as TextAnimationSpec,
  'line-by-line-slide': lineByLineSlide as TextAnimationSpec,
  typewriter: typewriter as TextAnimationSpec,
  'micro-scale-fade': microScaleFade as TextAnimationSpec,
  'shimmer-sweep': shimmerSweep as TextAnimationSpec,
  'fade-through': fadeThrough as TextAnimationSpec,
  'shared-axis-y': sharedAxisY as TextAnimationSpec,
  'shared-axis-z': sharedAxisZ as TextAnimationSpec,
  'blur-out-up': blurOutUp as TextAnimationSpec,
  'scale-down-fade': scaleDownFade as TextAnimationSpec,
  'focus-blur-resolve': focusBlurResolve as TextAnimationSpec,
  'bottom-up-letters': bottomUpLetters as TextAnimationSpec,
  'top-down-letters': topDownLetters as TextAnimationSpec,
  'kinetic-center-build': kineticCenterBuild as TextAnimationSpec,
  'short-slide-right': shortSlideRight as TextAnimationSpec,
  'short-slide-down': shortSlideDown as TextAnimationSpec,
} satisfies Record<string, TextAnimationSpec>;
