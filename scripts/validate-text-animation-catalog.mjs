import {
  assertGeneratedOutputsMatch,
  buildArtifacts,
  formatArtifacts,
  loadCatalogData,
  validateCatalogData,
} from './text-animation-catalog-shared.mjs';

const data = loadCatalogData();
validateCatalogData(data);

const artifacts = formatArtifacts(buildArtifacts(data));
assertGeneratedOutputsMatch(artifacts);

process.stdout.write('Catalog inputs and generated outputs are valid.\n');
