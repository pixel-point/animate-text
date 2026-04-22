import React from 'react';
import { BundledLanguage } from 'shiki/langs';

import { ICodeBlock } from '@/types/common';
import { highlight } from '@/lib/shiki';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

import CodeBlockWrapper from './code-block-wrapper';

interface ISharedCodeBlockProps {
  className?: string;
  as?: 'figure' | 'div';
  fileName?: string;
}

interface IDirectCodeBlockProps
  extends ISharedCodeBlockProps, Omit<ICodeBlock, 'language' | 'fileName'> {
  code: string;
  language: BundledLanguage | string;
  children?: never;
}

interface IChildrenCodeBlockProps extends ISharedCodeBlockProps {
  children: React.ReactNode;
  code?: never;
  language?: never;
}

type TCodeBlockProps = IDirectCodeBlockProps | IChildrenCodeBlockProps;

async function CodeBlock(props: TCodeBlockProps) {
  const { as = 'figure', className, fileName, code, language, children } = props;

  let renderedCode: React.ReactNode = null;
  let resolvedFileName: string | undefined = fileName;

  if (code && language && !children) {
    const resolvedCode = code.trim();
    const lang = language.toLowerCase() as BundledLanguage;
    const html = await highlight(resolvedCode, {
      lang,
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    });
    renderedCode = html;
  }

  if (children && React.isValidElement<{ 'data-filename'?: string }>(children)) {
    const inheritedFileName = children.props?.['data-filename'];
    resolvedFileName = inheritedFileName ?? fileName;
    renderedCode = children;
  }

  return (
    <CodeBlockWrapper className={cn('max-w-full', className)} fileName={resolvedFileName} as={as}>
      <ScrollArea className="w-full">
        <div className="px-4 py-5 text-left font-mono text-sm">{renderedCode}</div>
        <ScrollBar className="invisible" orientation="horizontal" />
      </ScrollArea>
    </CodeBlockWrapper>
  );
}

export default CodeBlock;
