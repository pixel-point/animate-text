export const defaultThemes = {
  light: 'github-light',
  dark: 'github-dark',
};

const highlighters = new Map();

export async function getHighlighter(engineType, options) {
  const { createHighlighter } = await import('shiki');
  let highlighter = highlighters.get(engineType);

  if (!highlighter) {
    let engine;

    if (engineType === 'js') {
      engine = import('shiki/engine/javascript').then((res) => res.createJavaScriptRegexEngine());
    } else if (engineType === 'oniguruma' || !options.engine) {
      engine = import('shiki/engine/oniguruma').then((res) =>
        res.createOnigurumaEngine(import('shiki/wasm')),
      );
    } else {
      engine = options.engine;
    }

    highlighter = createHighlighter({
      ...options,
      engine,
    });

    highlighters.set(engineType, highlighter);
    return highlighter;
  }

  return highlighter.then(async (instance) => {
    await Promise.all([
      instance.loadLanguage(...options.langs),
      instance.loadTheme(...options.themes),
    ]);
    return instance;
  });
}
