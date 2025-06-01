
'use client';

import { ThemeSwitcher } from '@/components/theme/ThemeSwitcher';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette } from 'lucide-react';

export default function ThemeSettingsPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Palette className="h-8 w-8" />
        <h1 className="text-3xl font-bold tracking-tight" suppressHydrationWarning>Tema Ayarları</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle suppressHydrationWarning>Görünüm ve Renk Şeması</CardTitle>
          <CardDescription suppressHydrationWarning>
            Uygulamanın genel renk paletini ve açık/koyu görünüm modunu buradan ayarlayabilirsiniz.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ThemeSwitcher />
        </CardContent>
      </Card>
    </div>
  );
}
