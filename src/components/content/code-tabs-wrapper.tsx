'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useCodeLanguage } from '@/contexts/code-language-context';
import { BundledLanguage } from 'shiki/langs';

import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ICodeTabsWrapperProps {
  labels?: string[];
  languages?: string[];
  className?: string;
  children: ReactNode;
}

const labelsMap: Partial<Record<BundledLanguage, string>> = {
  js: 'JavaScript',
  ts: 'TypeScript',
  go: 'Go',
  python: 'Python',
  java: 'Java',
  csharp: 'C#',
  ruby: 'Ruby',
  php: 'PHP',
  swift: 'Swift',
  bash: 'Bash',
  sql: 'SQL',
  html: 'HTML',
  css: 'CSS',
  json: 'JSON',
  yaml: 'YAML',
  markdown: 'Markdown',
};

const packageManagers = ['npm', 'pnpm', 'yarn', 'bun'] as const;
type PackageManager = (typeof packageManagers)[number];

function CodeTabsWrapper({
  labels = [],
  languages = [],
  className,
  children,
}: ICodeTabsWrapperProps) {
  const {
    defaultCodeLanguage,
    setDefaultCodeLanguage,
    defaultPackageManager,
    setDefaultPackageManager,
  } = useCodeLanguage();
  const [activeTab, setActiveTab] = useState<string>(labels.length > 0 ? labels[0] : '');

  const isPackageManagerGroup = labels.every((label) =>
    packageManagers.includes(label.toString().toLowerCase() as PackageManager),
  );

  useEffect(() => {
    if (labels.length > 0) {
      if (isPackageManagerGroup) {
        const packageManagerIndex = labels.findIndex(
          (label) => label.toLowerCase() === defaultPackageManager,
        );
        if (packageManagerIndex !== -1) {
          setActiveTab(labels[packageManagerIndex]);
        } else {
          setActiveTab(labels[0]);
        }
      } else if (languages.length > 0) {
        const languageIndex = languages.findIndex((lang) => lang === defaultCodeLanguage);
        if (languageIndex !== -1) {
          setActiveTab(labels[languageIndex]);
        } else {
          setActiveTab(labels[0]);
        }
      } else {
        setActiveTab(labels[0]);
      }
    }
  }, [defaultCodeLanguage, defaultPackageManager, labels, languages, isPackageManagerGroup]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);

    if (isPackageManagerGroup) {
      const packageManager = value.toLowerCase() as PackageManager;
      if (packageManagers.includes(packageManager)) {
        setDefaultPackageManager(packageManager);
      }
    } else {
      const tabIndex = labels.indexOf(value);
      if (tabIndex !== -1 && languages[tabIndex]) {
        const language = languages[tabIndex] as BundledLanguage;
        const validLanguages = Object.keys(labelsMap) as BundledLanguage[];
        if (validLanguages.includes(language)) {
          setDefaultCodeLanguage(language);
        }
      }
    }
  };

  return (
    <div
      className={cn(
        'code-tabs w-full overflow-hidden rounded-[min(var(--radius-md,0.5rem),1rem)] border',
        className,
      )}
    >
      <Tabs className="w-full" value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="h-11 w-full rounded-none border-b border-border bg-muted/50 p-0">
          <ScrollArea className="w-full">
            <div className="mx-4 flex w-fit gap-x-5">
              {labels.map((label) => (
                <TabsTrigger
                  key={label}
                  value={label}
                  className={cn(
                    'group relative h-11 rounded-2xl px-0 pt-3.5 pb-4 leading-none font-semibold tracking-tight text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:transition-none',
                    'hover:text-foreground hover:after:opacity-20',
                    "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-foreground after:opacity-0 after:transition-opacity after:duration-300 after:ease-in-out after:content-['']",
                    'data-[state=active]:after:opacity-100',
                  )}
                >
                  <span className="rounded group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-background">
                    {labelsMap[label as BundledLanguage] || label}
                  </span>
                </TabsTrigger>
              ))}
            </div>
            <ScrollBar className="invisible" orientation="horizontal" />
          </ScrollArea>
        </TabsList>
        {children}
      </Tabs>
    </div>
  );
}

export default CodeTabsWrapper;
