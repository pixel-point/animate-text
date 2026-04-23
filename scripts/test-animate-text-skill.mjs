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
  spec.visibility !== 'visible' ||
  spec.site_reference?.renderer?.id !== 'generic-stagger' ||
  spec.site_reference?.runtime?.initial_delay_ms?.max !== 400
) {
  throw new Error('get-spec.mjs did not return the expected spec.');
}

const kineticSpec = runJsonScript('get-spec.mjs', ['kinetic-center-build']);

if (
  kineticSpec.id !== 'kinetic-center-build' ||
  kineticSpec.site_reference?.renderer?.id !== 'kinetic-center-build' ||
  kineticSpec.site_reference?.stage?.preset !== 'kinetic-line-card' ||
  !Array.isArray(kineticSpec.site_reference?.reproduction_notes)
) {
  throw new Error('get-spec.mjs did not return the expected site-reference metadata.');
}

const hiddenSpec = runJsonScript('get-spec.mjs', ['depth-parallax-words']);

if (hiddenSpec.visibility !== 'hidden' || hiddenSpec.site_reference !== null) {
  throw new Error('get-spec.mjs did not return the expected hidden spec payload.');
}

const matches = runJsonScript('find-spec.mjs', ['typewriter']);

if (!Array.isArray(matches) || matches.length === 0 || matches[0].id !== 'typewriter') {
  throw new Error('find-spec.mjs did not return the expected top match.');
}

process.stdout.write('Animate-text skill helper scripts passed smoke tests.\n');
