import Slugger from 'github-slugger';
import { visit } from 'unist-util-visit';

const STEP_REGEX = /^(\d+)\.\s*(.+)\s*\[step]$/;

export default function remarkSteps() {
  return (tree) => {
    const slugger = new Slugger();
    slugger.reset();

    const convertToSteps = (nodes) => {
      const children = [];
      let currentStep = null;

      for (const node of nodes) {
        if (node.type === 'heading') {
          const titleText = node.children
            .filter((child) => child.type === 'text')
            .map((child) => child.value)
            .join('');

          const match = STEP_REGEX.exec(titleText);
          const actualTitle = match ? match[2] : titleText;

          let anchor = node.data?.hProperties?.id;
          if (!anchor) {
            const basis = (actualTitle || titleText || '').trim();
            if (basis.length) {
              anchor = slugger.slug(basis);
            }
          }

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
                value: `h${node.depth}`,
              },
            ],
            children: [],
          };

          if (anchor) {
            currentStep.attributes.push({
              type: 'mdxJsxAttribute',
              name: 'anchor',
              value: anchor,
            });
          }

          children.push(currentStep);
          continue;
        }

        if (currentStep) {
          currentStep.children.push(node);
        }
      }

      return {
        type: 'mdxJsxFlowElement',
        name: 'Steps',
        attributes: [],
        children,
      };
    };

    visit(tree, (parent) => {
      if (!('children' in parent) || parent.type === 'heading') return;

      let startIdx = -1;
      let i = 0;

      const onEnd = () => {
        if (startIdx === -1) return;
        const item = {};
        const nodes = parent.children.splice(startIdx, i - startIdx, item);
        Object.assign(item, convertToSteps(nodes));
        i = startIdx + 1;
        startIdx = -1;
      };

      for (; i < parent.children.length; i++) {
        const node = parent.children[i];

        if (node.type !== 'heading') continue;
        if (startIdx !== -1) {
          const startDepth = parent.children[startIdx].depth;

          if (node.depth > startDepth) continue;
          if (node.depth < startDepth) onEnd();
        }

        const head = node.children.filter((child) => child.type === 'text').at(0);
        if (!head) {
          onEnd();
          continue;
        }

        const match = STEP_REGEX.exec(head.value);
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
