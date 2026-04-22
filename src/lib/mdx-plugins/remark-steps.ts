import type { BlockContent, Heading, Root, RootContent } from 'mdast';
import type { MdxJsxFlowElement } from 'mdast-util-mdx-jsx';
import type { Transformer } from 'unified';
import { visit } from 'unist-util-visit';

const StepRegex = /^(\d+)\.\s*(.+)\s*\[step\]$/;

/**
 * Convert headings in the format of `1. Hello World` into steps.
 */
export function remarkSteps(): Transformer<Root, Root> {
  function convertToSteps(nodes: RootContent[]): MdxJsxFlowElement {
    const children: MdxJsxFlowElement[] = [];
    let currentStep: MdxJsxFlowElement | null = null;

    for (const node of nodes) {
      if (node.type === 'heading') {
        const titleText = node.children
          .filter((c) => c.type === 'text')
          .map((c) => c.value)
          .join('');

        const match = StepRegex.exec(titleText);
        const actualTitle = match ? match[2] : titleText;

        currentStep = {
          type: 'mdxJsxFlowElement',
          name: 'Step',
          attributes: [
            {
              type: 'mdxJsxAttribute',
              name: 'title',
              value: actualTitle,
            },
            {
              type: 'mdxJsxAttribute',
              name: 'headingTag',
              value: `h${(node as Heading).depth}`,
            },
          ],
          children: [],
        };
        children.push(currentStep);
      } else {
        if (currentStep) {
          currentStep.children.push(node as BlockContent);
        }
      }
    }

    return {
      type: 'mdxJsxFlowElement',
      name: 'Steps',
      attributes: [],
      children,
    };
  }

  return (tree) => {
    visit(tree, (parent) => {
      if (!('children' in parent) || parent.type === 'heading') return;

      let startIdx = -1;
      let i = 0;

      const onEnd = () => {
        if (startIdx === -1) return;

        const item = {};
        const nodes = parent.children.splice(startIdx, i - startIdx, item as RootContent);
        Object.assign(item, convertToSteps(nodes));
        i = startIdx + 1;
        startIdx = -1;
      };

      for (; i < parent.children.length; i++) {
        const node = parent.children[i];

        if (node.type !== 'heading') continue;
        if (startIdx !== -1) {
          const startDepth = (parent.children[startIdx] as Heading).depth;

          if (node.depth > startDepth) continue;
          else if (node.depth < startDepth) onEnd();
        }

        const head = node.children.filter((c) => c.type === 'text').at(0);
        if (!head) {
          onEnd();
          continue;
        }

        const match = StepRegex.exec(head.value);
        if (!match) {
          onEnd();
          continue;
        }

        if (startIdx === -1) startIdx = i;
      }

      onEnd();
    });
  };
}
