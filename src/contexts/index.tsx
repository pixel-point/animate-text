'use client';

import { ReactNode } from 'react';

import { ThemeProvider } from './theme-context';
import { CodeLanguageProvider } from './code-language-context';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        enableColorScheme
      >
        <CodeLanguageProvider>{children}</CodeLanguageProvider>
      </ThemeProvider>
    </>
  );
}
