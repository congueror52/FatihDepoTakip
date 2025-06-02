// This feature (Global Ammunition Consumption Rates) has been removed.
// Consumption rates are now managed per Usage Scenario.
// This file is being replaced with an empty shell to prevent build errors.
'use client';
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react'; // Using a generic icon
import Link from 'next/link';

export default function AmmoConsumptionRatesPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="h-6 w-6 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Yönetim Paneli</span>
        <span className="text-sm text-muted-foreground">/</span>
        {/* Using a generic icon for the removed page */}
        <Settings className="h-6 w-6" /> 
        <h1 className="text-2xl font-semibold tracking-tight">Fişek Sarfiyat Standartları (Kaldırıldı)</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Özellik Kaldırıldı</CardTitle>
          <CardDescription>
            Genel Fişek Sarfiyat Standartları özelliği kaldırılmıştır. 
            Sarfiyat oranları artık <Link href="/admin/usage-scenarios" className="underline text-primary">Kullanım Senaryoları</Link> sayfasından her bir senaryo için özel olarak yönetilmektedir.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Bu sayfanın içeriği, özelliğin kaldırılması nedeniyle boşaltılmıştır.</p>
        </CardContent>
      </Card>
    </div>
  );
}
