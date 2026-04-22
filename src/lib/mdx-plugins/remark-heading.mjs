import Slugger from 'github-slugger';
import { visit } from 'unist-util-visit';

import { flattenNode } from './utils.mjs';

const slugger = new Slugger();
const customIdRegex = /\s*\[#([^]+?)]\s*$/;
const tocExcludeRegex = /\s*\[!toc]\s*$/;
const stepTagRegex = /\s*\[step]\s*$/i;

function stripStepTag(value) {
  if (!value) return '';
  return value.replace(stepTagRegex, '').trim();
}

export default function remarkHeading(opts = {}) {
  const { slug: defaultSlug, customId = true, generateToc = true, tocRef } = opts;

  return (root, file) => {
    const local = [];
    slugger.reset();

    visit(root, 'heading', (heading) => {
      heading.data ||= {};
      heading.data.hProperties ||= {};

      let id = heading.data.hProperties.id;
      const lastNode = heading.children.at(-1);
      let excludeFromToc = false;

      if (lastNode?.type === 'text') {
        const tocExcludeMatch = tocExcludeRegex.exec(lastNode.value);
        if (tocExcludeMatch) {
          excludeFromToc = true;
          lastNode.value = lastNode.value.slice(0, tocExcludeMatch.index);
        }
      }

      if (!id && lastNode?.type === 'text' && customId) {
        const match = customIdRegex.exec(lastNode.value);
        if (match?.[1]) {
          id = match[1];
          lastNode.value = lastNode.value.slice(0, match.index);
        }
      }

      let flattened = null;
      if (!id) {
        flattened = flattenNode(heading);
        const sanitized = stripStepTag(flattened);
        const slugSource = sanitized.length ? sanitized : flattened;
        id =
          defaultSlug && slugSource
            ? defaultSlug(root, heading, slugSource)
            : slugger.slug(sanitized || slugSource || '');
      }

      heading.data.hProperties.id = id;

      if (generateToc && !excludeFromToc) {
        const title = stripStepTag(flattened ?? flattenNode(heading));
        local.push({ title, anchor: String(id), depth: heading.depth });
      }

      return 'skip';
    });

    if (generateToc) {
      if (tocRef) tocRef.push(...local);
      else file.data.toc = local;
    }
  };
}
