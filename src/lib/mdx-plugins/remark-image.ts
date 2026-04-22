import * as path from 'node:path';
import process from 'node:process';
import { URL } from 'node:url';

import { imageSize } from 'image-size';
import { imageSizeFromFile } from 'image-size/fromFile';
import type { ISizeCalculationResult } from 'image-size/types/interface';
import type { Root } from 'mdast';
import type { MdxjsEsm } from 'mdast-util-mdxjs-esm';
import type { Transformer } from 'unified';
import { visit } from 'unist-util-visit';

import { joinPath, slash } from './utils';

const EXTERNAL_URL_REGEX = /^https?:\/\//;

export interface RemarkImageOptions {
  /**
   * Directory or base URL to resolve absolute image paths
   */
  publicDir?: string;

  /**
   * Import images in the file, and let bundlers handle it.
   *
   * ```tsx
   * import MyImage from "./public/img.png";
   *
   * <img src={MyImage} />
   * ```
   *
   * When disabled, `placeholder` will be ignored.
   *
   * @defaultValue true
   */
  useImport?: boolean;

  /**
   * Fetch image size of external URLs
   *
   * @defaultValue true
   */
  external?: boolean;
}

/**
 * Turn images into Next.js Image compatible usage.
 */
export function remarkImage({
  external = true,
  useImport = true,
  publicDir = path.join(process.cwd(), 'public'),
}: RemarkImageOptions = {}): Transformer<Root, Root> {
  return async (tree, file) => {
    const importsToInject: { variableName: string; importPath: string }[] = [];
    const promises: Promise<void>[] = [];

    function getImportPath(src: string): string {
      if (!src.startsWith('/')) return src;
      const to = path.join(publicDir, src);

      if (file.dirname) {
        const relative = slash(path.relative(file.dirname, to));

        return relative.startsWith('./') ? relative : `./${relative}`;
      }

      return slash(to);
    }

    visit(tree, 'image', (node) => {
      const url = decodeURI(node.url);
      if (!url) return;
      const isExternal = EXTERNAL_URL_REGEX.test(url);

      if ((isExternal && external) || !useImport) {
        const task = getImageSize(url, publicDir)
          .then((size) => {
            if (!size.width || !size.height) return;

            Object.assign(node, {
              type: 'mdxJsxFlowElement',
              name: 'img',
              attributes: [
                {
                  type: 'mdxJsxAttribute',
                  name: 'alt',
                  value: node.alt ?? 'image',
                },
                {
                  type: 'mdxJsxAttribute',
                  name: 'src',
                  value: url,
                },
                {
                  type: 'mdxJsxAttribute',
                  name: 'width',
                  value: size.width.toString(),
                },
                {
                  type: 'mdxJsxAttribute',
                  name: 'height',
                  value: size.height.toString(),
                },
              ],
            });
          })
          .catch((e) => {
            throw new Error(
              `[Remark Image] Failed obtain image size for ${url} (public directory configured as ${publicDir})`,
              {
                cause: e,
              },
            );
          });

        promises.push(task);
      } else if (!isExternal) {
        const variableName = `__img${importsToInject.length.toString()}`;

        importsToInject.push({
          variableName,
          importPath: getImportPath(url),
        });

        Object.assign(node, {
          type: 'mdxJsxFlowElement',
          name: 'img',
          attributes: [
            {
              type: 'mdxJsxAttribute',
              name: 'alt',
              value: node.alt ?? 'image',
            },
            {
              type: 'mdxJsxAttribute',
              name: 'src',
              value: {
                type: 'mdxJsxAttributeValueExpression',
                value: variableName,
                data: {
                  estree: {
                    body: [
                      {
                        type: 'ExpressionStatement',
                        expression: { type: 'Identifier', name: variableName },
                      },
                    ],
                  },
                },
              },
            },
          ].filter(Boolean),
        });
      }
    });

    await Promise.all(promises);
    if (importsToInject.length === 0) return;

    const imports = importsToInject.map(
      ({ variableName, importPath }) =>
        ({
          type: 'mdxjsEsm',
          data: {
            estree: {
              body: [
                {
                  type: 'ImportDeclaration',
                  source: { type: 'Literal', value: importPath },
                  specifiers: [
                    {
                      type: 'ImportDefaultSpecifier',
                      local: { type: 'Identifier', name: variableName },
                    },
                  ],
                },
              ],
            },
          },
        }) as MdxjsEsm,
    );

    tree.children.unshift(...imports);
  };
}

async function getImageSize(src: string, dir: string): Promise<ISizeCalculationResult> {
  const isRelative = src.startsWith('/') || !path.isAbsolute(src);
  let url: string;

  if (EXTERNAL_URL_REGEX.test(src)) {
    url = src;
  } else if (EXTERNAL_URL_REGEX.test(dir) && isRelative) {
    const base = new URL(dir);
    base.pathname = joinPath(base.pathname, src);
    url = base.toString();
  } else {
    return imageSizeFromFile(isRelative ? path.join(dir, src) : src);
  }

  const res = await globalThis.fetch(url);
  if (!res.ok) {
    throw new Error(`[Remark Image] Failed to fetch ${url} (${res.status}): ${await res.text()}`);
  }

  return imageSize(new Uint8Array(await res.arrayBuffer()));
}
