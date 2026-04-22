import path from 'node:path';
import process from 'node:process';
import { URL } from 'node:url';

import { imageSize } from 'image-size';
import { imageSizeFromFile } from 'image-size/fromFile';
import { visit } from 'unist-util-visit';

import { joinPath, slash } from './utils.mjs';

const EXTERNAL_URL_REGEX = /^https?:\/\//;

export default function remarkImage({
  external = true,
  useImport = true,
  publicDir = path.join(process.cwd(), 'public'),
} = {}) {
  return async (tree, file) => {
    const importsToInject = [];
    const promises = [];

    function getImportPath(src) {
      if (!src.startsWith('/')) return src;
      const target = path.join(publicDir, src);

      if (file.dirname) {
        const relative = slash(path.relative(file.dirname, target));
        return relative.startsWith('./') ? relative : `./${relative}`;
      }

      return slash(target);
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
                { type: 'mdxJsxAttribute', name: 'alt', value: node.alt ?? 'image' },
                { type: 'mdxJsxAttribute', name: 'src', value: url },
                { type: 'mdxJsxAttribute', name: 'width', value: size.width.toString() },
                { type: 'mdxJsxAttribute', name: 'height', value: size.height.toString() },
              ],
            });
          })
          .catch((error) => {
            throw new Error(
              `[Remark Image] Failed obtain image size for ${url} (public directory configured as ${publicDir})`,
              { cause: error },
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
            { type: 'mdxJsxAttribute', name: 'alt', value: node.alt ?? 'image' },
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
          ],
        });
      }
    });

    await Promise.all(promises);
    if (importsToInject.length === 0) return;

    const imports = importsToInject.map(({ variableName, importPath }) => ({
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
    }));

    tree.children.unshift(...imports);
  };
}

async function getImageSize(src, dir) {
  const isRelative = src.startsWith('/') || !path.isAbsolute(src);
  let url;

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
