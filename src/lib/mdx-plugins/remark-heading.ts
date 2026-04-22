import Slugger from 'github-slugger';
import type { Heading, Root } from 'mdast';
import type { Transformer } from 'unified';
import { visit } from 'unist-util-visit';

import { ITableOfContentsItem } from '@/types/common';

import { flattenNode } from './utils';

const slugger = new Slugger();

const regex = /\s*\[#([^]+?)]\s*$/;
const tocExcludeRegex = /\s*\[!toc]\s*$/;

type HeadingWithData = Heading & { data?: { hProperties?: { id?: string } } };

export interface RemarkHeadingOptions {
  slug?: (root: Root, heading: Heading, text: string) => string;

  /**
   * Allow custom headings ids
   *
   * @defaultValue true
   */
  customId?: boolean;

  /**
   * Attach an array of `ITableOfContentsItem` to `file.data.toc`
   *
   * @defaultValue true
   */
  generateToc?: boolean;
  tocRef?: ITableOfContentsItem[];
}

/**
 * Add heading ids and extract TOC
 */
export function remarkHeading(opts: RemarkHeadingOptions = {}): Transformer {
  const { slug: defaultSlug, customId = true, generateToc = true, tocRef } = opts;
  return (root, file) => {
    const local: ITableOfContentsItem[] = [];
    slugger.reset();

    visit(root, 'heading', (heading: HeadingWithData) => {
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
        const match = regex.exec(lastNode.value);

        if (match?.[1]) {
          id = match[1];
          lastNode.value = lastNode.value.slice(0, match.index);
        }
      }

      let flattened: string | null = null;
      if (!id) {
        flattened = flattenNode(heading);

        id =
          defaultSlug && flattened
            ? defaultSlug(root as Root, heading, flattened)
            : slugger.slug(flattened || '');
      }

      heading.data.hProperties.id = id;

      if (generateToc && !excludeFromToc) {
        const title = flattened ?? flattenNode(heading);
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
