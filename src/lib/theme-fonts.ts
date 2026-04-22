import type { CSSProperties } from 'react';
import { Inter } from 'next/font/google';

type FontVariablesStyle = CSSProperties & {
  '--font-body-family': string;
  '--font-heading-family': string;
  '--font-sans': string;
  '--font-heading': string;
};

const bodyFont = Inter({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  subsets: ['cyrillic', 'cyrillic-ext', 'greek', 'greek-ext', 'latin', 'latin-ext', 'vietnamese'],
  variable: '--font-body-family',
  display: 'swap',
});

const headingFont = Inter({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  subsets: ['cyrillic', 'cyrillic-ext', 'greek', 'greek-ext', 'latin', 'latin-ext', 'vietnamese'],
  variable: '--font-heading-family',
  display: 'swap',
});

export const fontVariablesClassName = `${bodyFont.variable} ${headingFont.variable}`;

export const fontVariablesStyle: FontVariablesStyle = {
  '--font-body-family': bodyFont.style.fontFamily,
  '--font-heading-family': headingFont.style.fontFamily,
  '--font-sans': `${bodyFont.style.fontFamily}, ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'`,
  '--font-heading': `${headingFont.style.fontFamily}, ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'`,
};
