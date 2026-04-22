export default function remarkCodeTab() {
  return (tree) => {
    const newChildren = [];
    let i = 0;

    while (i < tree.children.length) {
      const node = tree.children[i];

      if (node.type === 'code' && node.meta && node.meta.includes('tab=')) {
        const tabGroup = [node];
        let j = i + 1;

        while (j < tree.children.length) {
          const nextNode = tree.children[j];
          if (nextNode.type === 'code' && nextNode.meta && nextNode.meta.includes('tab=')) {
            tabGroup.push(nextNode);
            j++;
          } else {
            break;
          }
        }

        if (tabGroup.length > 1) {
          const tabsData = tabGroup.map((codeNode) => {
            const tabMatch = codeNode.meta?.match(/tab="([^"]+)"/);
            const tabName = tabMatch ? tabMatch[1] : codeNode.lang || 'Code';
            const cleanMeta = codeNode.meta?.replace(/tab="[^"]*"\s*/, '').trim() || null;

            return {
              label: tabName,
              language: codeNode.lang || 'text',
              code: codeNode.value,
              meta: cleanMeta,
            };
          });

          newChildren.push({
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
          i = j;
        } else {
          newChildren.push(node);
          i++;
        }
      } else {
        newChildren.push(node);
        i++;
      }
    }

    tree.children = newChildren;
  };
}
