import { TEXT_ANIMATION_RUNTIME } from '@/data/text-animations/generated/catalog';
import type {
  TextAnimationBuildSpec,
  TextAnimationCatalogItem,
  TextAnimationFrameSpec,
  TextAnimationPhaseSpec,
  TextAnimationRenderer,
  TextAnimationSpec,
  TextAnimationTarget,
} from '@/data/text-animations/generated/types';

type TextAnimationPart = {
  text: string;
  animate: boolean;
  block?: boolean;
};

type TileFrame = {
  color?: string;
  filter: string;
  letterSpacingEm: number | null;
  opacity: number;
  transform: string;
};

type LoopController = {
  animations: Set<Animation>;
  cancelled: boolean;
  stage: HTMLElement;
  timers: Set<number>;
};

type TitleParts = {
  title: HTMLHeadingElement;
  units: HTMLSpanElement[];
};

type KineticStageFrame = {
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

function createLoopController(stage: HTMLElement): LoopController {
  return {
    animations: new Set(),
    cancelled: false,
    stage,
    timers: new Set(),
  };
}

function cleanupLoop(controller: LoopController) {
  controller.cancelled = true;

  controller.timers.forEach((timer) => {
    window.clearTimeout(timer);
  });

  controller.timers.clear();

  controller.animations.forEach((animation) => {
    animation.cancel();
  });

  controller.animations.clear();
  clearStage(controller.stage);
}

function registerAnimation(controller: LoopController, animation: Animation): Animation {
  controller.animations.add(animation);

  void animation.finished.finally(() => {
    controller.animations.delete(animation);
  });

  return animation;
}

function schedule(controller: LoopController, callback: () => void, delay: number) {
  if (controller.cancelled) {
    return;
  }

  const timer = window.setTimeout(() => {
    controller.timers.delete(timer);

    if (!controller.cancelled) {
      callback();
    }
  }, delay);

  controller.timers.add(timer);
}

function sleep(controller: LoopController, delay: number): Promise<void> {
  if (controller.cancelled || delay <= 0) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    schedule(controller, resolve, delay);
  });
}

function waitForAnimations(animations: Animation[]) {
  return Promise.all(animations.map((animation) => animation.finished.catch(() => undefined)));
}

function clearStage(stage: HTMLElement) {
  while (stage.firstChild) {
    stage.removeChild(stage.firstChild);
  }
}

function materializeTileFrame(
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

function makeTitle(document: Document, text: string, target: TextAnimationTarget): TitleParts {
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

function applyPhaseStart(
  units: HTMLElement[],
  phase: 'enter' | 'exit',
  spec: TextAnimationSpec,
  stage: HTMLElement,
) {
  const baseFrame = toAnimationFrame(spec[phase].from);

  units.forEach((unit, index) => {
    const keyframe = materializeTileFrame(
      baseFrame,
      unit,
      index,
      units.length,
      spec.target ?? 'per-character',
    );

    Object.assign(unit.style, keyframe);
  });

  stage.dataset.animationPhase = phase;
}

function animatePhase(
  controller: LoopController,
  units: HTMLElement[],
  phase: 'enter' | 'exit',
  spec: TextAnimationSpec,
): number {
  const currentPhase = spec[phase];
  const fromFrame = toAnimationFrame(currentPhase.from);
  const toFrame = toAnimationFrame(currentPhase.to);
  const duration = Math.max(
    140,
    Math.round(currentPhase.duration_ms * TEXT_ANIMATION_RUNTIME.tileSpeed),
  );
  const delayStep = Math.max(
    0,
    Math.round(currentPhase.stagger_ms * TEXT_ANIMATION_RUNTIME.tileSpeed),
  );
  const staggerMode = spec.stagger_mode ?? 'normal';
  const ranks = getStaggerRanks(units.length, staggerMode);

  units.forEach((unit, index) => {
    const fromKeyframe = materializeTileFrame(
      fromFrame,
      unit,
      index,
      units.length,
      spec.target ?? 'per-character',
    );
    const toKeyframe = materializeTileFrame(
      toFrame,
      unit,
      index,
      units.length,
      spec.target ?? 'per-character',
    );

    registerAnimation(
      controller,
      unit.animate([fromKeyframe, toKeyframe], {
        delay: ranks[index] * delayStep,
        duration,
        easing: currentPhase.easing,
        fill: 'forwards',
      }),
    );
  });

  return duration + Math.max(0, units.length - 1) * delayStep;
}

function getTextSamples(item: TextAnimationCatalogItem): string[] {
  return item.content.samples?.length ? item.content.samples : [item.content.sample];
}

function getPhraseSamples(
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

function setKineticPose(element: HTMLElement, frame: KineticStageFrame) {
  element.style.filter = frame.filter;
  element.style.opacity = `${frame.opacity}`;
  element.style.transform = frame.transform;
}

function buildKineticFrame(
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

function mix(start: number, end: number, progress: number): number {
  return start + (end - start) * progress;
}

function titleFrame(values: TextAnimationFrameSpec | undefined): Keyframe {
  const frame = values ?? {};

  return {
    filter: `blur(${frame.blur_px ?? 0}px)`,
    opacity: frame.opacity ?? 1,
    transform: `translate3d(${frame.x_px ?? 0}px, ${(frame.y_px ?? 0) * TEXT_ANIMATION_RUNTIME.tileYTravel}px, 0) scale(${frame.scale ?? 1})`,
  };
}

async function runGenericLoop(controller: LoopController, item: TextAnimationCatalogItem) {
  const { stage } = controller;
  const samples = getTextSamples(item);
  const target = item.spec.target ?? 'per-character';
  const microDelay = item.spec.swap?.micro_delay_ms ?? 0;
  let currentIndex = 0;
  let currentUnits: HTMLSpanElement[] = [];

  const enterCurrentSample = (text: string): number => {
    const { title, units } = makeTitle(stage.ownerDocument, text, target);
    applyPhaseStart(units, 'enter', item.spec, stage);
    clearStage(stage);
    stage.appendChild(title);
    currentUnits = units;

    return animatePhase(controller, units, 'enter', item.spec);
  };

  const firstEnter = enterCurrentSample(samples[currentIndex] ?? item.content.sample);

  await sleep(controller, firstEnter + TEXT_ANIMATION_RUNTIME.tileHoldMs);

  while (!controller.cancelled) {
    const exitTotal = currentUnits.length
      ? animatePhase(controller, currentUnits, 'exit', item.spec)
      : 0;

    currentIndex = (currentIndex + 1) % samples.length;

    const nextParts = makeTitle(
      stage.ownerDocument,
      samples[currentIndex] ?? item.content.sample,
      target,
    );
    applyPhaseStart(nextParts.units, 'enter', item.spec, stage);

    await sleep(controller, exitTotal + microDelay);

    if (controller.cancelled) {
      break;
    }

    clearStage(stage);
    stage.appendChild(nextParts.title);
    currentUnits = nextParts.units;

    const nextEnter = animatePhase(controller, nextParts.units, 'enter', item.spec);
    await sleep(controller, nextEnter + TEXT_ANIMATION_RUNTIME.tileGapMs);
  }
}

async function runSharedSlideOpacityLoop(
  controller: LoopController,
  item: TextAnimationCatalogItem,
) {
  const { stage } = controller;
  const samples = getTextSamples(item);
  const enter = item.spec.enter;
  const exit = item.spec.exit;
  const build = item.spec.build ?? {};
  const titleDuration = Math.max(
    180,
    Math.round((enter.duration_ms || 460) * TEXT_ANIMATION_RUNTIME.tileSpeed),
  );
  const wordOpacityDuration = Math.max(
    90,
    Math.round(
      ((build.word_opacity_duration_ms as number) || 170) * TEXT_ANIMATION_RUNTIME.tileSpeed,
    ),
  );
  const wordStaggerMs = Math.max(
    0,
    Math.round((enter.stagger_ms || 72) * TEXT_ANIMATION_RUNTIME.tileSpeed),
  );
  const exitDuration = Math.max(
    140,
    Math.round((exit.duration_ms || 300) * TEXT_ANIMATION_RUNTIME.tileSpeed),
  );
  const holdMs = Math.max(380, TEXT_ANIMATION_RUNTIME.tileHoldMs);
  const gapMs = Math.max(180, TEXT_ANIMATION_RUNTIME.tileGapMs);
  const wordOpacityFrom = (build.word_opacity_from as number | undefined) ?? 0;
  const wordOpacityTo = (build.word_opacity_to as number | undefined) ?? 1;
  let currentIndex = 0;

  const enterPhrase = async (text: string): Promise<HTMLHeadingElement> => {
    const { title, units } = makeTitle(stage.ownerDocument, text, item.spec.target ?? 'per-word');
    const fromFrame = titleFrame(enter.from);
    const toFrame = titleFrame(enter.to);

    Object.assign(title.style, fromFrame);
    title.style.willChange = 'transform, opacity, filter';

    units.forEach((unit) => {
      unit.style.opacity = `${wordOpacityFrom}`;
      unit.style.willChange = 'opacity';
    });

    clearStage(stage);
    stage.appendChild(title);

    const animations = [
      registerAnimation(
        controller,
        title.animate([fromFrame, toFrame], {
          duration: titleDuration,
          easing: enter.easing,
          fill: 'forwards',
        }),
      ),
      ...units.map((unit, index) =>
        registerAnimation(
          controller,
          unit.animate([{ opacity: wordOpacityFrom }, { opacity: wordOpacityTo }], {
            delay: index * wordStaggerMs,
            duration: wordOpacityDuration,
            easing: enter.easing,
            fill: 'forwards',
          }),
        ),
      ),
    ];

    await waitForAnimations(animations);

    Object.assign(title.style, toFrame);
    units.forEach((unit) => {
      unit.style.opacity = `${wordOpacityTo}`;
    });

    return title;
  };

  const exitPhrase = async (title: HTMLHeadingElement | null) => {
    if (!title || controller.cancelled) {
      return;
    }

    const fromFrame = titleFrame(exit.from);
    const toFrame = titleFrame(exit.to);

    Object.assign(title.style, fromFrame);

    await waitForAnimations([
      registerAnimation(
        controller,
        title.animate([fromFrame, toFrame], {
          duration: exitDuration,
          easing: exit.easing,
          fill: 'forwards',
        }),
      ),
    ]);

    clearStage(stage);
  };

  while (!controller.cancelled) {
    const title = await enterPhrase(samples[currentIndex] ?? item.content.sample);
    await sleep(controller, holdMs);

    if (controller.cancelled) {
      break;
    }

    await exitPhrase(title);
    await sleep(controller, gapMs);
    currentIndex = (currentIndex + 1) % samples.length;
  }
}

async function runKineticCenterBuildLoop(
  controller: LoopController,
  item: TextAnimationCatalogItem,
) {
  const { stage } = controller;
  const build = item.spec.build ?? {};
  const phrases = getPhraseSamples(item.content.phrases, build, [['Words', 'push', 'left']]);
  const line = stage.ownerDocument.createElement('div');
  const firstWordDuration = Math.max(
    180,
    Math.round(
      ((build.first_word_duration_ms as number) || 360) * TEXT_ANIMATION_RUNTIME.tileSpeed,
    ),
  );
  const pushDuration = Math.max(
    180,
    Math.round(((build.push_duration_ms as number) || 480) * TEXT_ANIMATION_RUNTIME.tileSpeed),
  );
  const exitDuration = Math.max(
    140,
    Math.round(((build.exit_duration_ms as number) || 260) * TEXT_ANIMATION_RUNTIME.tileSpeed),
  );
  const holdMs = Math.max(
    380,
    Math.round(((build.hold_ms as number) || 980) * TEXT_ANIMATION_RUNTIME.tileSpeed),
  );
  const betweenPhrasesMs = Math.max(
    120,
    Math.round(((build.between_phrases_ms as number) || 220) * TEXT_ANIMATION_RUNTIME.tileSpeed),
  );
  const entryOffsetPx = (build.entry_offset_px as number | undefined) || 96;
  const wordGapPx = (build.word_gap_px as number | undefined) || 16;
  const firstWordLiftPx = (build.first_word_y_px as number | undefined) ?? 6;
  const entryScale = (build.entry_scale as number | undefined) ?? 0.992;
  const entryBlurPx = (build.entry_blur_px as number | undefined) ?? 3.5;
  const reflowBlurPx = (build.reflow_blur_px as number | undefined) ?? 0.8;
  const exitLiftPx = (build.exit_y_px as number | undefined) ?? -6;
  const exitBlurPx = (build.exit_blur_px as number | undefined) ?? 2.5;
  const easing = (build.easing as string | undefined) ?? 'cubic-bezier(0.2, 0.8, 0.2, 1)';
  const exitEasing = (build.exit_easing as string | undefined) ?? 'cubic-bezier(0.4, 0, 0.2, 1)';
  let phraseIndex = 0;
  let words: HTMLSpanElement[] = [];
  let positions: number[] = [];

  clearStage(stage);
  line.className = 'text-animation-kinetic-line';
  stage.appendChild(line);

  const computePositions = (widths: number[]) => {
    const totalWidth =
      widths.reduce((sum, width) => sum + width, 0) + wordGapPx * Math.max(0, widths.length - 1);
    let cursor = -totalWidth / 2;

    return widths.map((width) => {
      const position = cursor + width / 2;
      cursor += width + wordGapPx;
      return position;
    });
  };

  const buildPhrase = async (phraseWords: string[]) => {
    line.innerHTML = '';
    words = [];
    positions = [];

    for (const [index, wordText] of phraseWords.entries()) {
      if (controller.cancelled) {
        return;
      }

      const word = stage.ownerDocument.createElement('span');
      word.className = 'text-animation-kinetic-word';
      word.textContent = wordText;
      line.appendChild(word);

      const widths = Array.from(line.children, (node) => (node as HTMLElement).offsetWidth);
      const nextPositions = computePositions(widths);
      const animations: Animation[] = [];

      if (index === 0) {
        const startFrame = buildKineticFrame(0, firstWordLiftPx, entryScale, entryBlurPx, 0);
        setKineticPose(word, startFrame);
        animations.push(
          registerAnimation(
            controller,
            word.animate(
              [
                startFrame,
                {
                  ...buildKineticFrame(0, firstWordLiftPx * 0.35, 0.998, entryBlurPx * 0.45, 0.78),
                  offset: 0.58,
                },
                buildKineticFrame(0, 0, 1, 0, 1),
              ],
              {
                duration: firstWordDuration,
                easing,
                fill: 'forwards',
              },
            ),
          ),
        );
      } else {
        words.forEach((currentWord, wordIndex) => {
          const currentX = positions[wordIndex];
          const nextX = nextPositions[wordIndex];

          animations.push(
            registerAnimation(
              controller,
              currentWord.animate(
                [
                  buildKineticFrame(currentX, 0, 1, 0, 1),
                  {
                    ...buildKineticFrame(mix(currentX, nextX, 0.58), 0, 1, reflowBlurPx, 1),
                    offset: 0.52,
                  },
                  buildKineticFrame(nextX, 0, 1, 0, 1),
                ],
                {
                  duration: pushDuration,
                  easing,
                  fill: 'forwards',
                },
              ),
            ),
          );
        });

        const targetX = nextPositions[index];
        const startX = targetX + entryOffsetPx;
        setKineticPose(word, buildKineticFrame(startX, 0, entryScale, entryBlurPx, 0));
        animations.push(
          registerAnimation(
            controller,
            word.animate(
              [
                buildKineticFrame(startX, 0, entryScale, entryBlurPx, 0),
                {
                  ...buildKineticFrame(
                    mix(startX, targetX, 0.72),
                    0,
                    0.998,
                    entryBlurPx * 0.38,
                    0.84,
                  ),
                  offset: 0.6,
                },
                buildKineticFrame(targetX, 0, 1, 0, 1),
              ],
              {
                duration: pushDuration,
                easing,
                fill: 'forwards',
              },
            ),
          ),
        );
      }

      await waitForAnimations(animations);

      nextPositions.forEach((position, wordIndex) => {
        const currentWord = wordIndex === words.length ? word : words[wordIndex];
        setKineticPose(currentWord, buildKineticFrame(position, 0, 1, 0, 1));
      });

      if (!words.includes(word)) {
        words.push(word);
      }

      positions = nextPositions;
    }
  };

  const exitPhrase = async () => {
    if (!words.length || controller.cancelled) {
      return;
    }

    const animations = words.map((word, index) => {
      const position = positions[index];

      return registerAnimation(
        controller,
        word.animate(
          [
            buildKineticFrame(position, 0, 1, 0, 1),
            {
              ...buildKineticFrame(position, exitLiftPx * 0.45, 1, exitBlurPx * 0.55, 0.62),
              offset: 0.52,
            },
            buildKineticFrame(position, exitLiftPx, 1, exitBlurPx, 0),
          ],
          {
            duration: exitDuration,
            easing: exitEasing,
            fill: 'forwards',
          },
        ),
      );
    });

    await waitForAnimations(animations);
    line.innerHTML = '';
    words = [];
    positions = [];
  };

  while (!controller.cancelled) {
    await buildPhrase(phrases[phraseIndex] ?? phrases[0]);
    await sleep(controller, holdMs);

    if (controller.cancelled) {
      break;
    }

    await exitPhrase();
    await sleep(controller, betweenPhrasesMs);
    phraseIndex = (phraseIndex + 1) % phrases.length;
  }
}

async function runKineticTopBuildLoop(controller: LoopController, item: TextAnimationCatalogItem) {
  const { stage } = controller;
  const build = item.spec.build ?? {};
  const phrases = getPhraseSamples(item.content.phrases, build, [['Drop', 'into', 'place']]);
  const line = stage.ownerDocument.createElement('div');
  const firstWordDuration = Math.max(
    180,
    Math.round(
      ((build.first_word_duration_ms as number) || 360) * TEXT_ANIMATION_RUNTIME.tileSpeed,
    ),
  );
  const pushDuration = Math.max(
    180,
    Math.round(((build.push_duration_ms as number) || 500) * TEXT_ANIMATION_RUNTIME.tileSpeed),
  );
  const exitDuration = Math.max(
    140,
    Math.round(((build.exit_duration_ms as number) || 320) * TEXT_ANIMATION_RUNTIME.tileSpeed),
  );
  const holdMs = Math.max(
    380,
    Math.round(((build.hold_ms as number) || 1100) * TEXT_ANIMATION_RUNTIME.tileSpeed),
  );
  const betweenPhrasesMs = Math.max(
    120,
    Math.round(((build.between_phrases_ms as number) || 220) * TEXT_ANIMATION_RUNTIME.tileSpeed),
  );
  const entryOffsetYPx = (build.entry_offset_y_px as number | undefined) ?? -28;
  const lineGapPx =
    (build.line_gap_px as number | undefined) ?? (build.word_gap_px as number | undefined) ?? 12;
  const firstWordLiftPx = (build.first_word_y_px as number | undefined) ?? -14;
  const entryScale = (build.entry_scale as number | undefined) ?? 0.992;
  const entryBlurPx = (build.entry_blur_px as number | undefined) ?? 2.4;
  const reflowBlurPx = (build.reflow_blur_px as number | undefined) ?? 0.7;
  const exitLiftPx = (build.exit_y_px as number | undefined) ?? 10;
  const exitBlurPx = (build.exit_blur_px as number | undefined) ?? 1.2;
  const easing = (build.easing as string | undefined) ?? 'cubic-bezier(0.2, 0.8, 0.2, 1)';
  const exitEasing = (build.exit_easing as string | undefined) ?? 'cubic-bezier(0.4, 0, 0.2, 1)';
  let phraseIndex = 0;
  let words: HTMLSpanElement[] = [];
  let positions: number[] = [];

  clearStage(stage);
  line.className = 'text-animation-kinetic-stack';
  stage.appendChild(line);

  const computePositions = (heights: number[]) => {
    const totalHeight =
      heights.reduce((sum, height) => sum + height, 0) +
      lineGapPx * Math.max(0, heights.length - 1);
    let cursor = -totalHeight / 2;

    return heights.map((height) => {
      const position = cursor + height / 2;
      cursor += height + lineGapPx;
      return position;
    });
  };

  const buildPhrase = async (phraseWords: string[]) => {
    line.innerHTML = '';
    words = [];
    positions = [];

    for (const [index, wordText] of phraseWords.entries()) {
      if (controller.cancelled) {
        return;
      }

      const word = stage.ownerDocument.createElement('span');
      word.className = 'text-animation-kinetic-word';
      word.textContent = wordText;
      line.appendChild(word);

      const heights = Array.from(line.children, (node) => (node as HTMLElement).offsetHeight);
      const nextPositions = computePositions(heights);
      const animations: Animation[] = [];

      if (index === 0) {
        const startFrame = buildKineticFrame(0, firstWordLiftPx, entryScale, entryBlurPx, 0);
        setKineticPose(word, startFrame);
        animations.push(
          registerAnimation(
            controller,
            word.animate(
              [
                startFrame,
                {
                  ...buildKineticFrame(0, firstWordLiftPx * 0.35, 0.998, entryBlurPx * 0.45, 0.78),
                  offset: 0.58,
                },
                buildKineticFrame(0, 0, 1, 0, 1),
              ],
              {
                duration: firstWordDuration,
                easing,
                fill: 'forwards',
              },
            ),
          ),
        );
      } else {
        words.forEach((currentWord, wordIndex) => {
          const currentY = positions[wordIndex];
          const nextY = nextPositions[wordIndex];

          animations.push(
            registerAnimation(
              controller,
              currentWord.animate(
                [
                  buildKineticFrame(0, currentY, 1, 0, 1),
                  {
                    ...buildKineticFrame(0, mix(currentY, nextY, 0.58), 1, reflowBlurPx, 1),
                    offset: 0.52,
                  },
                  buildKineticFrame(0, nextY, 1, 0, 1),
                ],
                {
                  duration: pushDuration,
                  easing,
                  fill: 'forwards',
                },
              ),
            ),
          );
        });

        const targetY = nextPositions[index];
        setKineticPose(
          word,
          buildKineticFrame(0, targetY + entryOffsetYPx, entryScale, entryBlurPx, 0),
        );
        animations.push(
          registerAnimation(
            controller,
            word.animate(
              [
                buildKineticFrame(0, targetY + entryOffsetYPx, entryScale, entryBlurPx, 0),
                {
                  ...buildKineticFrame(
                    0,
                    mix(targetY + entryOffsetYPx, targetY, 0.72),
                    0.998,
                    entryBlurPx * 0.38,
                    0.84,
                  ),
                  offset: 0.6,
                },
                buildKineticFrame(0, targetY, 1, 0, 1),
              ],
              {
                duration: pushDuration,
                easing,
                fill: 'forwards',
              },
            ),
          ),
        );
      }

      await waitForAnimations(animations);

      nextPositions.forEach((position, wordIndex) => {
        const currentWord = wordIndex === words.length ? word : words[wordIndex];
        setKineticPose(currentWord, buildKineticFrame(0, position, 1, 0, 1));
      });

      if (!words.includes(word)) {
        words.push(word);
      }

      positions = nextPositions;
    }
  };

  const exitPhrase = async () => {
    if (!words.length || controller.cancelled) {
      return;
    }

    const animations = words.map((word, index) => {
      const position = positions[index];

      return registerAnimation(
        controller,
        word.animate(
          [
            buildKineticFrame(0, position, 1, 0, 1),
            {
              ...buildKineticFrame(0, position + exitLiftPx * 0.45, 1, exitBlurPx * 0.55, 0.62),
              offset: 0.52,
            },
            buildKineticFrame(0, position + exitLiftPx, 1, exitBlurPx, 0),
          ],
          {
            duration: exitDuration,
            easing: exitEasing,
            fill: 'forwards',
          },
        ),
      );
    });

    await waitForAnimations(animations);
    line.innerHTML = '';
    words = [];
    positions = [];
  };

  while (!controller.cancelled) {
    await buildPhrase(phrases[phraseIndex] ?? phrases[0]);
    await sleep(controller, holdMs);

    if (controller.cancelled) {
      break;
    }

    await exitPhrase();
    await sleep(controller, betweenPhrasesMs);
    phraseIndex = (phraseIndex + 1) % phrases.length;
  }
}

function resolveRenderer(
  renderer: TextAnimationRenderer | undefined,
): ((controller: LoopController, item: TextAnimationCatalogItem) => Promise<void>) | undefined {
  if (renderer === 'kinetic-center-build') {
    return runKineticCenterBuildLoop;
  }

  if (renderer === 'kinetic-top-build') {
    return runKineticTopBuildLoop;
  }

  if (renderer === 'shared-slide-opacity-stage') {
    return runSharedSlideOpacityLoop;
  }

  return undefined;
}

export function startTextAnimationLoop(
  stage: HTMLElement,
  item: TextAnimationCatalogItem,
  onError?: (error: unknown) => void,
): () => void {
  const controller = createLoopController(stage);
  const renderer = resolveRenderer(item.spec.custom_renderer);

  schedule(
    controller,
    () => {
      const loop = renderer ? renderer(controller, item) : runGenericLoop(controller, item);

      void loop.catch((error) => {
        if (!controller.cancelled) {
          onError?.(error);
          cleanupLoop(controller);
        }
      });
    },
    Math.random() * 400,
  );

  return () => {
    cleanupLoop(controller);
  };
}
