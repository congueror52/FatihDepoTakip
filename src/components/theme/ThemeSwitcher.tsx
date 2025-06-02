
'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { useColorScheme } from '@/components/theme/color-scheme-provider';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Moon, Sun, Laptop, Palette } from 'lucide-react';

type ColorSchemeOption = {
  value: 'default' | 'ocean' | 'forest' | 'desert' | 'twilight' | 'ruby' | 'emerald' | 'sapphire' | 'amethyst' | 'matrix' | 'neon-sari';
  label: string;
};

const colorSchemes: ColorSchemeOption[] = [
  { value: 'default', label: 'Fenerbahçe' },
  { value: 'neon-sari', label: 'Neon Sarı' },
  { value: 'ocean', label: 'Okyanus' },
  { value: 'forest', label: 'Orman' },
  { value: 'desert', label: 'Çöl' },
  { value: 'twilight', label: 'Alacakaranlık' },
  { value: 'ruby', label: 'Yakut' },
  { value: 'emerald', label: 'Zümrüt' },
  { value: 'sapphire', label: 'Safir' },
  { value: 'amethyst', label: 'Ametist' },
  { value: 'matrix', label: 'Matrix' },
];

export function ThemeSwitcher() {
  const { setTheme, theme: currentMode } = useTheme();
  const { colorScheme, setColorScheme } = useColorScheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="p-4 space-y-6">
      <div className="space-y-2">
        <Label htmlFor="color-scheme-select" className="flex items-center gap-2 text-sm font-medium">
          <Palette className="h-4 w-4" />
          <span suppressHydrationWarning>Renk Paleti</span>
        </Label>
        <Select
          value={isMounted ? colorScheme : 'default'} // Use default or resolved value
          onValueChange={(value) => setColorScheme(value as ColorSchemeOption['value'])}
          disabled={!isMounted}
        >
          <SelectTrigger id="color-scheme-select">
            <SelectValue placeholder="Palet Seçin" />
          </SelectTrigger>
          <SelectContent>
            {colorSchemes.map((scheme) => (
              <SelectItem key={scheme.value} value={scheme.value}>
                <span suppressHydrationWarning>{scheme.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-medium">
          {!isMounted ? (
            <div className="h-4 w-4" /> // Render a placeholder div matching icon size
          ) : currentMode === 'light' ? (
            <Sun className="h-4 w-4" />
          ) : currentMode === 'dark' ? (
            <Moon className="h-4 w-4" />
          ) : currentMode === 'system' ? (
            <Laptop className="h-4 w-4" />
          ) : (
            <div className="h-4 w-4" /> // Fallback placeholder
          )}
          <span suppressHydrationWarning>Görünüm Modu</span>
        </Label>
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant={!isMounted ? 'outline' : currentMode === 'light' ? 'default' : 'outline'}
            size="sm"
            onClick={() => { if (isMounted) setTheme('light'); }}
            disabled={!isMounted || colorScheme === 'neon-sari' || colorScheme === 'matrix'} // Disable light/system for neon-sari & matrix
            className="flex flex-col h-auto py-2 items-center gap-1"
          >
            <Sun className="h-5 w-5" />
            <span className="text-xs" suppressHydrationWarning>Açık</span>
          </Button>
          <Button
            variant={!isMounted ? 'outline' : currentMode === 'dark' ? 'default' : 'outline'}
            size="sm"
            onClick={() => { if (isMounted) setTheme('dark'); }}
            disabled={!isMounted}
            className="flex flex-col h-auto py-2 items-center gap-1"
          >
            <Moon className="h-5 w-5" />
            <span className="text-xs" suppressHydrationWarning>Koyu</span>
          </Button>
          <Button
            variant={!isMounted ? 'outline' : currentMode === 'system' ? 'default' : 'outline'}
            size="sm"
            onClick={() => { if (isMounted) setTheme('system'); }}
            disabled={!isMounted || colorScheme === 'neon-sari' || colorScheme === 'matrix'} // Disable light/system for neon-sari & matrix
            className="flex flex-col h-auto py-2 items-center gap-1"
          >
            <Laptop className="h-5 w-5" />
            <span className="text-xs" suppressHydrationWarning>Sistem</span>
          </Button>
        </div>
         {(colorScheme === 'neon-sari' || colorScheme === 'matrix') && isMounted && (
          <p className="text-xs text-muted-foreground pt-1">
            Bu tema yalnızca koyu modda en iyi şekilde görüntülenir. Görünüm modu "Koyu" olarak ayarlandı.
          </p>
        )}
      </div>
    </div>
  );
}
