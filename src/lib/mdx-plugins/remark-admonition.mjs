import { visit } from 'unist-util-visit';

import { flattenNode } from './utils.mjs';

function replaceNodes(nodes, tag, typeMap) {
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
      });
      open = -1;
      hasIntercept = false;
      attributes = [];
      i = open;
    }
  }

  return nodes;
}

export default function remarkAdmonition(options = {}) {
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
