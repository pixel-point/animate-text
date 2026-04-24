import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

import { repoRoot } from './text-animation-catalog-shared.mjs';

const skillScriptsRoot = join(repoRoot, 'skills', 'animate-text', 'scripts');

function runJsonScript(scriptName, args = []) {
  const result = spawnSync(process.execPath, [join(skillScriptsRoot, scriptName), ...args], {
    encoding: 'utf8',
  });

  if (result.status !== 0) {
    throw new Error(result.stderr.trim() || `${scriptName} failed`);
  }

  return JSON.parse(result.stdout);
}

const list = runJsonScript('list-specs.mjs');

if (!Array.isArray(list) || list.length < 20) {
  throw new Error('list-specs.mjs did not return the expected spec list.');
}

const spec = runJsonScript('get-spec.mjs', ['soft-blur-in']);

if (
  spec.id !== 'soft-blur-in' ||
  spec.site_reference !== undefined ||
  spec.visibility !== undefined ||
  spec.preview !== undefined ||
  spec.enter?.easing !== 'cubic-bezier(0.22, 1, 0.36, 1)'
) {
  throw new Error('get-spec.mjs did not return the expected portable spec.');
}

const effect = runJsonScript('get-effect.mjs', ['soft-blur-in']);

if (
  effect.id !== 'soft-blur-in' ||
  effect.visibility !== 'visible' ||
  effect.portable_spec?.preview !== undefined ||
  effect.showcase?.renderer?.id !== 'generic-stagger' ||
  effect.showcase?.runtime?.initial_delay_ms?.max !== 400 ||
  effect.showcase?.timing?.enter?.scaled_duration_ms !== 648 ||
  effect.showcase?.stage?.preset !== 'default-text-host' ||
  effect.showcase?.stage?.title?.font_size !== undefined ||
  effect.showcase?.stage?.title?.display !== 'inline-block' ||
  !effect.showcase?.stage?.title?.layout_note?.includes('flex-direction') ||
  !effect.showcase?.content_usage?.default_policy?.includes('preserve the section text') ||
  effect.showcase?.library_selection?.aliases?.gsap !== 'gsap' ||
  !effect.showcase?.library_selection?.verification?.includes('not Element.animate/gsap') ||
  !effect.showcase?.library_adapters?.motion?.import_statement?.includes('motion/react') ||
  !effect.showcase?.library_adapters?.motion?.verification?.some((step) =>
    step.includes('times in the Motion options object'),
  ) ||
  !effect.showcase?.library_adapters?.motion?.verification?.some((step) =>
    step.includes('not only initial enter tweens'),
  ) ||
  !effect.showcase?.library_adapters?.gsap?.import_statement?.includes('gsap') ||
  effect.showcase?.library_adapters?.gsap?.start_animation?.includes(
    'duration: duration_ms / 1000',
  ) ||
  !effect.showcase?.library_adapters?.gsap?.verification?.some((step) =>
    step.includes('Do not pass both per-keyframe segment durations'),
  ) ||
  !effect.showcase?.renderer?.recipe?.loop_invariants?.some((step) => step.includes('not both')) ||
  !effect.showcase?.renderer?.recipe?.canonical_loop_pseudocode?.some((step) =>
    step.includes('Do not put await enter(current) at the top'),
  ) ||
  !effect.showcase?.library_adapters?.gsap?.renderer_notes?.some((step) =>
    step.includes('Reject the code shape'),
  )
) {
  throw new Error('get-effect.mjs did not return the expected exact effect recipe.');
}

const kineticEffect = runJsonScript('get-effect.mjs', ['kinetic-center-build']);

if (
  kineticEffect.id !== 'kinetic-center-build' ||
  kineticEffect.showcase?.renderer?.id !== 'kinetic-center-build' ||
  kineticEffect.showcase?.stage?.preset !== 'kinetic-line-host' ||
  kineticEffect.showcase?.stage?.kinetic_word?.font_size !== undefined ||
  kineticEffect.showcase?.rendering_contract?.y_travel_multiplier !== 1 ||
  !kineticEffect.showcase?.rendering_contract?.y_travel_multiplier_note?.includes(
    'not applied to kinetic build coordinates',
  ) ||
  !Array.isArray(kineticEffect.showcase?.renderer?.recipe?.algorithm) ||
  kineticEffect.showcase?.renderer?.recipe?.keyframe_recipe?.existing_word_push?.[1]?.x !==
    'mix(currentX, nextX, 0.58)' ||
  kineticEffect.showcase?.renderer?.recipe?.keyframe_recipe?.incoming_word_push?.[1]?.x !==
    'mix(targetX + build.entry_offset_px, targetX, 0.72)' ||
  !kineticEffect.showcase?.library_adapters?.motion?.renderer_notes?.some((note) =>
    note.includes('raw renderer-pixel'),
  ) ||
  !Array.isArray(kineticEffect.showcase?.reproduction_notes)
) {
  throw new Error('get-effect.mjs did not return the expected renderer metadata.');
}

const sharedSlideEffect = runJsonScript('get-effect.mjs', ['short-slide-right']);

if (
  sharedSlideEffect.showcase?.renderer?.id !== 'shared-slide-opacity-stage' ||
  !sharedSlideEffect.showcase?.renderer?.recipe?.algorithm?.some((step) =>
    step.includes('same tick'),
  ) ||
  !sharedSlideEffect.showcase?.renderer?.recipe?.verification?.some((step) =>
    step.includes('gsap.set(wordNodes'),
  ) ||
  !sharedSlideEffect.showcase?.library_adapters?.gsap?.renderer_notes?.some((note) =>
    note.includes('one batched gsap.to'),
  ) ||
  !sharedSlideEffect.showcase?.library_adapters?.motion?.renderer_notes?.some((note) =>
    note.includes('enter-only reveal'),
  )
) {
  throw new Error('shared-slide renderer recipe does not describe concurrent enter animations.');
}

const hiddenEffect = runJsonScript('get-effect.mjs', ['depth-parallax-words']);

if (hiddenEffect.visibility !== 'hidden' || hiddenEffect.showcase !== null) {
  throw new Error('get-effect.mjs did not return the expected hidden effect payload.');
}

const matches = runJsonScript('find-spec.mjs', ['typewriter']);

if (!Array.isArray(matches) || matches.length === 0 || matches[0].id !== 'typewriter') {
  throw new Error('find-spec.mjs did not return the expected top match.');
}

process.stdout.write('Animate-text skill helper scripts passed smoke tests.\n');
