// This feature (Global Ammunition Consumption Rates) has been removed.
// Consumption rates are now managed per Usage Scenario.
// This file is being replaced with an empty shell to prevent build errors.
'use client';
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function ConsumptionRatesForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Özellik Kaldırıldı</CardTitle>
        <CardDescription>
          Genel Fişek Sarfiyat Standartları özelliği kaldırılmıştır. 
          Sarfiyat oranları artık her bir Kullanım Senaryosu içinde yönetilmektedir.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>Lütfen Kullanım Senaryoları yönetim sayfasını kullanın.</p>
      </CardContent>
    </Card>
  );
}
