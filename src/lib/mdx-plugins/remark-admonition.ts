import type { Root, RootContent } from 'mdast';
import { type Transformer } from 'unified';
import { visit } from 'unist-util-visit';

import { flattenNode } from '@/lib/mdx-plugins/utils';

export interface RemarkAdmonitionOptions {
  tag?: string;

  /**
   * Map type to another type
   */
  typeMap?: Record<string, string>;
}

function replaceNodes(nodes: RootContent[], tag: string, typeMap: Record<string, string>) {
  if (nodes.length === 0) return;

  let open = -1;
  let attributes = [];

  let hasIntercept = false;

  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].type !== 'paragraph') continue;

    const text = flattenNode(nodes[i]);
    const typeName = Object.keys(typeMap).find((type) => text.startsWith(`${tag}${type}`));

    if (typeName) {
      if (open !== -1) {
        hasIntercept = true;
        continue;
      }

      open = i;

      const titleText = text.slice(`${tag}${typeName}`.length).trim();

      attributes.push({
        type: 'mdxJsxAttribute',
        name: 'title',
        value: titleText || typeMap[typeName],
      });
    }

    if (open !== -1 && text === tag) {
      const children = nodes.slice(open + 1, i);

      nodes.splice(open, i - open + 1, {
        type: 'mdxJsxFlowElement',
        name: 'Admonition',
        attributes,
        children: hasIntercept ? replaceNodes(children, tag, typeMap) : children,
      } as RootContent);
      open = -1;
      hasIntercept = false;
      attributes = [];
      i = open;
    }
  }
}

/**
 * Remark Plugin to support Admonition syntax
 *
 * Useful when Migrating from Docusaurus
 */
export function remarkAdmonition(options: RemarkAdmonitionOptions = {}): Transformer<Root, Root> {
  const tag = options.tag ?? ':::';

  const typeMap = options.typeMap ?? {
    info: 'Info',
    warn: 'Warning',

    note: 'Note',
    tip: 'Tip',
    warning: 'Warning',
    danger: 'Danger',
  };

  return (tree) => {
    visit(tree, (node) => {
      if (!('children' in node)) return;

      replaceNodes(node.children, tag, typeMap);
    });
  };
}
