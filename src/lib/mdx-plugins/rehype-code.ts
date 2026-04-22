import type { RehypeShikiOptions } from '@shikijs/rehype';
import rehypeShikiFromHighlighter from '@shikijs/rehype/core';
import {
  transformerNotationDiff,
  transformerNotationFocus,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from '@shikijs/transformers';
import type { Root } from 'hast';
import { bundledLanguages, type BuiltinTheme } from 'shiki';
import type { Processor, Transformer } from 'unified';

import { defaultThemes, getHighlighter } from '@/lib/shiki';

type Meta = Record<string, unknown>;

function parseHighlightLines(meta: string): number[] {
  const highlights: number[] = [];

  meta.split(',').forEach((segment) => {
    segment = segment.trim();

    if (segment.includes('-')) {
      const [start, end] = segment.split('-').map(Number);
      for (let i = start; i <= end; i++) {
        highlights.push(i);
      }
    } else {
      highlights.push(Number(segment));
    }
  });

  return highlights;
}

export const rehypeCodeDefaultOptions: RehypeCodeOptions = {
  lazy: true,
  themes: defaultThemes,
  defaultColor: false,
  defaultLanguage: 'plaintext',
  experimentalJSEngine: false,
  transformers: [
    transformerNotationHighlight({
      matchAlgorithm: 'v3',
    }),
    transformerNotationWordHighlight({
      matchAlgorithm: 'v3',
    }),
    transformerNotationDiff({
      matchAlgorithm: 'v3',
    }),
    transformerNotationFocus({
      matchAlgorithm: 'v3',
    }),

    {
      name: 'rehype-code:highlight-lines',
      line(node, line) {
        const hl = this.options.meta?.highlightedLines;
        if (hl) {
          const highlights = parseHighlightLines(hl as string);
          if (highlights.includes(line)) {
            if (!node.properties.class) node.properties.class = '';
            (node.properties.class as string) += ' highlighted';
          }
        }
        return node;
      },
    },
  ],
  parseMetaString(meta) {
    const map: Meta = {};

    let currentMeta = meta;
    const filenameMatch = currentMeta.match(/^([^\s{]+)/);
    if (filenameMatch) {
      map.fileName = filenameMatch[1];
      currentMeta = currentMeta.slice(filenameMatch[0].length).trim();
    }
    const highlightMatch = currentMeta.match(/{([^}]+)}/);
    if (highlightMatch) {
      map.highlightedLines = highlightMatch[1];
      currentMeta = currentMeta.replace(highlightMatch[0], '').trim();
    }

    map.__parsed_raw = currentMeta;
    return map;
  },
};

export type RehypeCodeOptions = RehypeShikiOptions & {
  /**
   * Filter meta string before processing
   */
  filterMetaString?: (metaString: string) => string;

  /**
   * Wrap code blocks in `<Tab>` component when "tab" meta string presents
   *
   * @defaultValue true
   */
  tab?: false;

  /**
   * Enable Shiki's experimental JS engine
   *
   * @defaultValue false
   */
  experimentalJSEngine?: boolean;

  themes?: Record<string, string>;
  theme?: BuiltinTheme | string;
};

/**
 * Handle codeblocks
 */
export function rehypeCode(
  this: Processor,
  _options: Partial<RehypeCodeOptions> = {},
): Transformer<Root, Root> {
  const options: RehypeCodeOptions = {
    ...rehypeCodeDefaultOptions,
    ..._options,
  };

  const transformers = [...(options.transformers ?? [])];
  transformers.unshift({
    name: 'rehype-code:pre-process',
    preprocess(code, { meta }) {
      if (meta && '__parsed_raw' in meta) {
        meta.__raw = meta.__parsed_raw;
        delete meta.__parsed_raw;
      }

      if (meta && options.filterMetaString) {
        meta.__raw = options.filterMetaString(meta.__raw ?? '');
      }

      return code.replace(/\n$/, '');
    },
  });

  const highlighter = getHighlighter(options.experimentalJSEngine ? 'js' : 'oniguruma', {
    themes:
      options?.themes && typeof options?.themes === 'object'
        ? (Object.values(options.themes).filter(Boolean) as BuiltinTheme[])
        : [options.theme || defaultThemes.light],
    langs: options.langs ?? (options.lazy ? ['ts', 'tsx'] : Object.keys(bundledLanguages)),
  });

  const transformer = highlighter.then((loaded) =>
    rehypeShikiFromHighlighter(loaded, {
      ...options,
      transformers,
    }),
  );

  return async (tree, file) => {
    await (
      await transformer
    )(tree, file, () => {});
  };
}
