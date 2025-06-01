
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type ColorScheme = 'default' | 'ocean' | 'forest' | 'desert' | 'twilight';

interface ColorSchemeContextType {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
}

const ColorSchemeContext = createContext<ColorSchemeContextType | undefined>(undefined);

interface ColorSchemeProviderProps {
  children: ReactNode;
  defaultScheme?: ColorScheme;
  storageKey?: string;
}

export function ColorSchemeProvider({
  children,
  defaultScheme = 'default',
  storageKey = 'ui-color-scheme',
}: ColorSchemeProviderProps) {
  const [scheme, setScheme] = useState<ColorScheme>(() => {
    if (typeof window === 'undefined') {
      return defaultScheme;
    }
    try {
      const storedScheme = window.localStorage.getItem(storageKey) as ColorScheme | null;
      return storedScheme || defaultScheme;
    } catch (e) {
      console.error('Error reading color scheme from localStorage', e);
      return defaultScheme;
    }
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-color-scheme', scheme);
      try {
        window.localStorage.setItem(storageKey, scheme);
      } catch (e) {
        console.error('Error saving color scheme to localStorage', e);
      }
    }
  }, [scheme, storageKey]);

  const value = {
    colorScheme: scheme,
    setColorScheme: setScheme,
  };

  return (
    <ColorSchemeContext.Provider value={value}>
      {children}
    </ColorSchemeContext.Provider>
  );
}

export const useColorScheme = (): ColorSchemeContextType => {
  const context = useContext(ColorSchemeContext);
  if (context === undefined) {
    throw new Error('useColorScheme must be used within a ColorSchemeProvider');
  }
  return context;
};
