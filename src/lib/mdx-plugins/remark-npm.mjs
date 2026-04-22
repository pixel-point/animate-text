import convert from 'npm-to-yarn';
import { visit } from 'unist-util-visit';

const aliases = ['npm', 'package-install'];

export default function remarkNpm({
  packageManagers = [
    { command: (cmd) => convert(cmd, 'npm'), name: 'npm' },
    { command: (cmd) => convert(cmd, 'pnpm'), name: 'pnpm' },
    { command: (cmd) => convert(cmd, 'yarn'), name: 'yarn' },
    { command: (cmd) => convert(cmd, 'bun'), name: 'bun' },
  ],
} = {}) {
  return (tree) => {
    visit(tree, 'code', (node) => {
      if (!node.lang || !aliases.includes(node.lang)) return 'skip';

      const value =
        node.value.startsWith('npm') || node.value.startsWith('npx')
          ? node.value
          : `npm install ${node.value}`;

      const tabsData = packageManagers.map((pm) => ({
        label: pm.name,
        language: 'bash',
        code: pm.command(value),
        meta: node.meta,
      }));

      Object.assign(node, {
        type: 'mdxJsxFlowElement',
        name: 'CodeTabs',
        attributes: [
          {
            type: 'mdxJsxAttribute',
            name: 'tabs',
            value: JSON.stringify(tabsData),
          },
        ],
        children: [],
      });
    });
  };
}
