/**
 * Removes markdown symbols, HTML tags, emojis, and other special characters from text.
 */
export function removeMarkdownSymbols(text: string): string {
  const emojiRegex =
    /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g;

  return text
    .replace(/\\_/g, '{{UNDERSCORE}}')
    .replace(/```([\s\S]*?)```/g, '')
    .replace(/<[^>]*>/g, '')
    .replace(emojiRegex, '')
    .replace(/[\r\n]+/gm, ' ')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/--+/g, '')
    .replace(/\|/g, '')
    .replace(/\s+/g, ' ')
    .replace(/(\*|(?<=\s|^)_(?=\s|$)|~|`|#)/g, '')
    .replace(/{{UNDERSCORE}}/g, '_')
    .trim();
}
