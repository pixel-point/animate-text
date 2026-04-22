import { type ICodeBlock } from '@/types/common';
import { TabsContent } from '@/components/ui/tabs';

import CodeBlock from './code-block';
import CodeTabsWrapper from './code-tabs-wrapper';

export interface ICodeTabsProps {
  className?: string;
  tabs?: ICodeBlock[] | string;
}

function CodeTabs({ tabs, className }: ICodeTabsProps) {
  let parsedTabs: ICodeBlock[] | undefined;
  if (typeof tabs === 'string') {
    try {
      parsedTabs = JSON.parse(tabs);
    } catch (e) {
      console.error('Failed to parse tabs JSON:', e);
      return null;
    }
  } else {
    parsedTabs = tabs;
  }

  if (!parsedTabs || parsedTabs.length === 0) return null;

  const resolvedLabels = parsedTabs.map((tab) => tab.label || tab.fileName || tab.language);
  const resolvedLanguages = parsedTabs.map((tab) => tab.language);

  return (
    <CodeTabsWrapper className={className} labels={resolvedLabels} languages={resolvedLanguages}>
      {parsedTabs.map((tab, index) => (
        <TabsContent className="my-0" key={index} value={resolvedLabels[index]}>
          <CodeBlock
            className="border-none"
            as="div"
            language={tab.language}
            code={tab.code}
            fileName={tab.fileName}
          />
        </TabsContent>
      ))}
    </CodeTabsWrapper>
  );
}

export default CodeTabs;
