'use client';

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { BundledLanguage } from 'shiki/langs';

type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun';

interface CodeLanguageContextType {
  defaultCodeLanguage: BundledLanguage;
  setDefaultCodeLanguage: (defaultCodeLanguage: BundledLanguage) => void;
  defaultPackageManager: PackageManager;
  setDefaultPackageManager: (packageManager: PackageManager) => void;
}

const CodeLanguageContext = createContext<CodeLanguageContextType | undefined>(undefined);

export function useCodeLanguage() {
  const context = useContext(CodeLanguageContext);
  if (!context) {
    throw new Error('useCodeLanguage must be used within a CodeLanguageProvider');
  }
  return context;
}

interface CodeLanguageProviderProps {
  children: ReactNode;
}

export function CodeLanguageProvider({ children }: CodeLanguageProviderProps) {
  const [defaultCodeLanguage, setDefaultCodeLanguage] = useState<BundledLanguage>('bash');
  const [defaultPackageManager, setDefaultPackageManager] = useState<PackageManager>('npm');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('defaultCodeLanguage');
      if (savedLanguage) {
        setDefaultCodeLanguage(savedLanguage as BundledLanguage);
      }

      const savedPackageManager = localStorage.getItem('defaultPackageManager');
      if (savedPackageManager) {
        setDefaultPackageManager(savedPackageManager as PackageManager);
      }
    }
  }, []);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('defaultCodeLanguage', defaultCodeLanguage);
    }
  }, [defaultCodeLanguage, isHydrated]);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('defaultPackageManager', defaultPackageManager);
    }
  }, [defaultPackageManager, isHydrated]);

  return (
    <CodeLanguageContext.Provider
      value={{
        defaultCodeLanguage,
        setDefaultCodeLanguage,
        defaultPackageManager,
        setDefaultPackageManager,
      }}
    >
      {children}
    </CodeLanguageContext.Provider>
  );
}

export const useDefaultCodeLanguage = () => useCodeLanguage();
