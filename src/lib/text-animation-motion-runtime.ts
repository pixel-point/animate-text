import { animate, cubicBezier, steps } from 'motion/react';

import { TEXT_ANIMATION_RUNTIME } from '@/data/text-animations/generated/catalog';
import type {
  TextAnimationCatalogItem,
  TextAnimationRenderer,
  TextAnimationSpec,
} from '@/data/text-animations/generated/types';
import {
  buildKineticFrame,
  getPhraseSamples,
  getStaggerRanks,
  getTextSamples,
  makeTitle,
  materializeTileFrame,
  mix,
  setKineticPose,
  titleFrame,
  toAnimationFrame,
} from '@/lib/text-animation-shared';

type MotionPlaybackControls = ReturnType<typeof animate>;

type LoopController = {
  animations: Set<MotionPlaybackControls>;
  cancelled: boolean;
  stage: HTMLElement;
  timers: Set<number>;
};

type MotionFrameValue = number | string;

type MotionAnimationOptions = {
  delay?: number;
  duration: number;
  easing: string;
};

function resolveMotionEasing(easing: string) {
  const normalized = easing.trim();
  const bezierMatch = normalized.match(/^cubic-bezier\(([^)]+)\)$/i);

  if (bezierMatch) {
    const values = bezierMatch[1]
      .split(',')
      .map((value) => Number.parseFloat(value.trim()))
      .filter((value) => Number.isFinite(value));

    if (values.length === 4) {
      return cubicBezier(values[0], values[1], values[2], values[3]);
    }
  }

  const stepsMatch = normalized.match(/^steps\(\s*(\d+)\s*,\s*(start|end)\s*\)$/i);

  if (stepsMatch) {
    return steps(
      Number.parseInt(stepsMatch[1], 10),
      stepsMatch[2].toLowerCase() as 'start' | 'end',
    );
  }

  if (normalized === 'ease-in') {
    return 'easeIn';
  }

  if (normalized === 'ease-out') {
    return 'easeOut';
  }

  if (normalized === 'ease-in-out') {
    return 'easeInOut';
  }

  return normalized;
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
    try {
      animation.stop?.();
      animation.cancel?.();
    } catch {
      // A failed Motion start can leave a playback control that throws during cleanup.
    }
  });

  controller.animations.clear();
  clearStage(controller.stage);
}

function registerAnimation(
  controller: LoopController,
  animation: MotionPlaybackControls,
): MotionPlaybackControls {
  controller.animations.add(animation);

  void Promise.resolve(animation).finally(() => {
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

function waitForAnimations(animations: MotionPlaybackControls[]) {
  return Promise.all(
    animations.map((animation) => Promise.resolve(animation).catch(() => undefined)),
  );
}

function clearStage(stage: HTMLElement) {
  while (stage.firstChild) {
    stage.removeChild(stage.firstChild);
  }
}

function getFrameValue(frame: Keyframe, key: string): MotionFrameValue | undefined {
  const value = (frame as Record<string, unknown>)[key];

  if (typeof value === 'number' || typeof value === 'string') {
    return value;
  }

  return undefined;
}

function createMotionKeyframes(frames: Keyframe[]) {
  const keys = new Set<string>();

  frames.forEach((frame) => {
    Object.entries(frame as Record<string, unknown>).forEach(([key, value]) => {
      if (key !== 'offset' && (typeof value === 'number' || typeof value === 'string')) {
        keys.add(key);
      }
    });
  });

  const keyframes: Record<string, MotionFrameValue[]> = {};

  keys.forEach((key) => {
    const fallback = frames
      .map((frame) => getFrameValue(frame, key))
      .find((value): value is MotionFrameValue => value !== undefined);

    if (fallback === undefined) {
      return;
    }

    let currentValue = fallback;
    keyframes[key] = frames.map((frame) => {
      const nextValue = getFrameValue(frame, key);

      if (nextValue !== undefined) {
        currentValue = nextValue;
      }

      return currentValue;
    });
  });

  const hasExplicitOffsets = frames.some((frame) => typeof frame.offset === 'number');
  const times = hasExplicitOffsets
    ? frames.map((frame, index) => {
        if (typeof frame.offset === 'number') {
          return frame.offset;
        }

        if (index === 0) {
          return 0;
        }

        if (index === frames.length - 1) {
          return 1;
        }

        return index / (frames.length - 1);
      })
    : undefined;

  return { keyframes, times };
}

function startAnimation(
  controller: LoopController,
  element: Element,
  frames: Keyframe[],
  { delay = 0, duration, easing }: MotionAnimationOptions,
) {
  const { keyframes, times } = createMotionKeyframes(frames);

  return registerAnimation(
    controller,
    animate(element, keyframes, {
      delay: delay / 1000,
      duration: duration / 1000,
      ease: resolveMotionEasing(easing),
      times,
    } as never),
  );
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

    startAnimation(controller, unit, [fromKeyframe, toKeyframe], {
      delay: ranks[index] * delayStep,
      duration,
      easing: currentPhase.easing,
    });
  });

  return duration + Math.max(0, units.length - 1) * delayStep;
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
      startAnimation(controller, title, [fromFrame, toFrame], {
        duration: titleDuration,
        easing: enter.easing,
      }),
      ...units.map((unit, index) =>
        startAnimation(
          controller,
          unit,
          [{ opacity: wordOpacityFrom }, { opacity: wordOpacityTo }],
          {
            delay: index * wordStaggerMs,
            duration: wordOpacityDuration,
            easing: enter.easing,
          },
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
      startAnimation(controller, title, [fromFrame, toFrame], {
        duration: exitDuration,
        easing: exit.easing,
      }),
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
      const animations: MotionPlaybackControls[] = [];

      if (index === 0) {
        const startFrame = buildKineticFrame(0, firstWordLiftPx, entryScale, entryBlurPx, 0);
        setKineticPose(word, startFrame);
        animations.push(
          startAnimation(
            controller,
            word,
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
            },
          ),
        );
      } else {
        words.forEach((currentWord, wordIndex) => {
          const currentX = positions[wordIndex];
          const nextX = nextPositions[wordIndex];

          animations.push(
            startAnimation(
              controller,
              currentWord,
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
              },
            ),
          );
        });

        const targetX = nextPositions[index];
        const startX = targetX + entryOffsetPx;
        setKineticPose(word, buildKineticFrame(startX, 0, entryScale, entryBlurPx, 0));
        animations.push(
          startAnimation(
            controller,
            word,
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
            },
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

      return startAnimation(
        controller,
        word,
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
        },
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
      const animations: MotionPlaybackControls[] = [];

      if (index === 0) {
        const startFrame = buildKineticFrame(0, firstWordLiftPx, entryScale, entryBlurPx, 0);
        setKineticPose(word, startFrame);
        animations.push(
          startAnimation(
            controller,
            word,
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
            },
          ),
        );
      } else {
        words.forEach((currentWord, wordIndex) => {
          const currentY = positions[wordIndex];
          const nextY = nextPositions[wordIndex];

          animations.push(
            startAnimation(
              controller,
              currentWord,
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
              },
            ),
          );
        });

        const targetY = nextPositions[index];
        setKineticPose(
          word,
          buildKineticFrame(0, targetY + entryOffsetYPx, entryScale, entryBlurPx, 0),
        );
        animations.push(
          startAnimation(
            controller,
            word,
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
            },
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

      return startAnimation(
        controller,
        word,
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
        },
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

export function startTextAnimationMotionLoop(
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
