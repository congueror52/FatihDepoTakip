
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type ColorScheme = 'default' | 'ocean' | 'forest' | 'desert' | 'twilight' | 'ruby' | 'emerald' | 'sapphire' | 'amethyst' | 'matrix' | 'neon-sari';

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
      // For themes that are inherently dark (including default/Fenerbahçe), force dark mode in next-themes
      if (scheme === 'neon-sari' || scheme === 'matrix' || scheme === 'default') {
        document.documentElement.classList.add('dark');
        // Also, ensure next-themes is aware if it's being used
        const nextTheme = localStorage.getItem('theme');
        if (nextTheme !== 'dark') {
            localStorage.setItem('theme', 'dark'); // Force next-themes to dark
            // Dispatch event to notify next-themes of change if it doesn't pick up automatically
            window.dispatchEvent(new StorageEvent('storage', { key: 'theme', newValue: 'dark' }));
        }
      } else {
         // If another theme is selected, remove the forced dark class
         // to allow next-themes to control light/dark mode normally.
         // However, don't remove 'dark' if next-themes itself set it.
         const nextThemePreference = localStorage.getItem('theme');
         if (nextThemePreference !== 'dark') {
            document.documentElement.classList.remove('dark');
         }
      }
      try {
        window.localStorage.setItem(storageKey, scheme);
      } catch (e) {
        console.error('Error saving color scheme to localStorage', e);
      }
    }
  }, [scheme, storageKey]);

  const value = {
    colorScheme: scheme,
    setColorScheme: (newScheme: ColorScheme) => {
      setScheme(newScheme);
      // If switching to a theme that is inherently dark (including default/Fenerbahçe), also update next-themes
      if (newScheme === 'neon-sari' || newScheme === 'matrix' || newScheme === 'default') {
        if (typeof window !== 'undefined') {
            localStorage.setItem('theme', 'dark');
             // This might be needed if next-themes doesn't react to localStorage changes directly
            window.dispatchEvent(new Event('storage'));
            // Force a class update if next-themes is slow
            document.documentElement.classList.add('dark');
        }
      }
    },
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

