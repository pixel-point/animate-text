import {
  buildArtifacts,
  formatArtifacts,
  loadCatalogData,
  validateCatalogData,
  writeArtifacts,
} from './text-animation-catalog-shared.mjs';

const data = loadCatalogData();
validateCatalogData(data);

const artifacts = formatArtifacts(buildArtifacts(data));
writeArtifacts(artifacts);

process.stdout.write('Generated animate-text skill and website data.\n');
