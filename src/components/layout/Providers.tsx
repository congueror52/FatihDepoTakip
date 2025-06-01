
'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ThemeProviderProps } from 'next-themes/dist/types';
import type { ReactNode } from 'react';
import { ColorSchemeProvider } from '@/components/theme/color-scheme-provider';

export function Providers({ children, ...props }: {children: ReactNode} & Partial<ThemeProviderProps>) {
  return (
    <ColorSchemeProvider storageKey="app-color-scheme" defaultScheme="default">
      <NextThemesProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        {...props}
      >
        {children}
      </NextThemesProvider>
    </ColorSchemeProvider>
  );
}
