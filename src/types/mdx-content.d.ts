declare module '*.md' {
  import type { ComponentType } from 'react';
  import type { MDXComponents } from 'mdx/types';

  const MDXContent: ComponentType<{ components?: MDXComponents }>;
  export const metadata: Record<string, unknown>;

  export default MDXContent;
}

declare module '*.mdx' {
  import type { ComponentType } from 'react';
  import type { MDXComponents } from 'mdx/types';

  const MDXContent: ComponentType<{ components?: MDXComponents }>;
  export const metadata: Record<string, unknown>;

  export default MDXContent;
}
