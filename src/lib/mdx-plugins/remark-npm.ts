import type { Root } from 'mdast';
import type { MdxJsxAttribute, MdxJsxFlowElement } from 'mdast-util-mdx-jsx';
import convert from 'npm-to-yarn';
import type { Transformer } from 'unified';
import { visit } from 'unist-util-visit';

interface PackageManager {
  name: string;
  /**
   * Convert from npm to another package manager
   */
  command: (command: string) => string;
}

export interface RemarkNpmOptions {
  packageManagers?: PackageManager[];
}

const aliases = ['npm', 'package-install'];

/**
 * It generates multiple tabs of codeblocks for different package managers from a npm command codeblock.
 */
export function remarkNpm({
  packageManagers = [
    { command: (cmd) => convert(cmd, 'npm'), name: 'npm' },
    { command: (cmd) => convert(cmd, 'pnpm'), name: 'pnpm' },
    { command: (cmd) => convert(cmd, 'yarn'), name: 'yarn' },
    { command: (cmd) => convert(cmd, 'bun'), name: 'bun' },
  ],
}: RemarkNpmOptions = {}): Transformer<Root, Root> {
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

      const tabsAttribute: MdxJsxAttribute = {
        type: 'mdxJsxAttribute',
        name: 'tabs',
        value: JSON.stringify(tabsData),
      };

      const codeTabsElement: MdxJsxFlowElement = {
        type: 'mdxJsxFlowElement',
        name: 'CodeTabs',
        attributes: [tabsAttribute],
        children: [],
      };

      Object.assign(node, codeTabsElement);
      return;
    });
  };
}
