import { fileURLToPath } from 'node:url';

import type { NextConfig } from 'next';
import createMDX from '@next/mdx';

const resolveLocalPlugin = (relativePath: string) =>
  fileURLToPath(new URL(relativePath, import.meta.url));
const resolveMdxPlugin = (file: string) => resolveLocalPlugin(`./src/lib/mdx-plugins/${file}`);
const normalizeOrigin = (value: string | undefined) => value?.replace(/\/+$/, '');
const assetOrigin = normalizeOrigin(process.env.NEXT_PUBLIC_ASSET_ORIGIN);

const nextConfig: NextConfig = {
  assetPrefix: assetOrigin,
  experimental: {
    optimizePackageImports: ['@phosphor-icons/react', 'date-fns'],
  },
  serverExternalPackages: ['eslint', 'postcss', 'prettier', 'shiki', 'typescript'],
  images: {
    formats: ['image/webp'],
    qualities: [75, 95, 100],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

const withMDX = createMDX({
  extension: /\.(md|mdx)$/,
  options: {
    remarkPlugins: [
      'remark-gfm',
      'remark-frontmatter',
      'remark-mdx',
      ['remark-mdx-frontmatter', { name: 'metadata' }],
      resolveMdxPlugin('remark-heading.mjs'),
      [resolveMdxPlugin('remark-image.mjs'), { useImport: false }],
      resolveMdxPlugin('remark-admonition.mjs'),
      resolveMdxPlugin('remark-steps.mjs'),
      resolveMdxPlugin('remark-npm.mjs'),
      resolveMdxPlugin('remark-code-tab.mjs'),
    ],
    rehypePlugins: [resolveMdxPlugin('rehype-code.mjs')],
  },
});

export default withMDX(nextConfig);
