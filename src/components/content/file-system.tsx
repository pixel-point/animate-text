'use client';

import { KeyboardEvent, useState } from 'react';
import { ChevronDown, ChevronRight, FileText, Folder } from 'lucide-react';

import { cn } from '@/lib/utils';

type FileSystemNodeType = 'file' | 'folder' | 'ellipsis';

export interface FileSystemNode {
  type?: FileSystemNodeType;
  name: string;
  highlighted?: boolean;
  expanded?: boolean;
  children?: FileSystemNode[];
}

export interface FileSystemProps {
  data: FileSystemNode[];
  className?: string;
}

interface FileSystemItemProps {
  node: FileSystemNode;
  level?: number;
}

const FileSystemItem = ({ node, level = 0 }: FileSystemItemProps) => {
  const [isOpen, setIsOpen] = useState(node.expanded ?? true);
  const marginLeft = level * 1.75;

  const nodeType = node.type ?? (node.children ? 'folder' : 'file');

  const isFolder = nodeType === 'folder';
  const isEllipsis = nodeType === 'ellipsis';

  const handleToggle = () => {
    if (isFolder) {
      setIsOpen(!isOpen);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (isFolder && (event.key === 'Enter' || event.key === ' ')) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div
      className="relative"
      role="treeitem"
      aria-expanded={isFolder ? isOpen : undefined}
      aria-selected={false}
    >
      <div
        className={cn(
          'flex h-8 items-center rounded',
          isFolder ? 'cursor-pointer' : 'cursor-default',
          node.highlighted && 'bg-secondary',
        )}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        tabIndex={isFolder ? 0 : -1}
      >
        <span className="shrink-0" style={{ paddingLeft: `${marginLeft}rem` }} aria-hidden="true" />

        {isEllipsis && <span className="ml-0.5 font-medium">...</span>}
        {isFolder && (
          <>
            {isOpen ? (
              <ChevronDown className="mr-2.5 size-4 shrink-0" aria-hidden="true" />
            ) : (
              <ChevronRight className="mr-2.5 size-4 shrink-0" aria-hidden="true" />
            )}
            <Folder className="size-5 shrink-0" />
          </>
        )}
        {!isEllipsis && !isFolder && <FileText className="size-5 shrink-0" />}
        <span className="ml-2 font-medium">{node.name}</span>
      </div>
      {isFolder && isOpen && node.children && node.children.length > 0 && (
        <div className="relative">
          <span
            className="absolute top-0 left-2 z-10 h-full w-px bg-border"
            style={{
              marginLeft: `${marginLeft}rem`,
            }}
            aria-hidden
          />
          {node.children.map((child, index) => (
            <FileSystemItem key={index} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const FileSystem = ({ data, className }: FileSystemProps) => {
  return (
    <figure
      role="tree"
      className={cn(
        'not-prose my-6 rounded-lg border border-border bg-background p-4 font-mono text-[0.8125rem] md:my-8',
        className,
      )}
    >
      {data.map((node, index) => (
        <FileSystemItem key={index} node={node} />
      ))}
    </figure>
  );
};

export default FileSystem;
