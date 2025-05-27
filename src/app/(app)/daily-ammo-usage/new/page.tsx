
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AmmunitionDailyUsageForm } from "../_components/usage-log-form";
import { ClipboardList, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getUsageScenarios } from "@/lib/actions/inventory.actions";

export default async function NewAmmunitionDailyUsagePage() {
  const usageScenarios = await getUsageScenarios();

  return (
    <div className="max-w-2xl mx-auto">
       <Link href="/daily-ammo-usage" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        <span suppressHydrationWarning>Günlük Kullanım Listesine Geri Dön</span>
      </Link>
      <div className="flex items-center gap-2 mb-6">
        <ClipboardList className="h-8 w-8" />
        <h1 className="text-3xl font-bold tracking-tight" suppressHydrationWarning>Yeni Günlük Fişek Kullanım Kaydı</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle suppressHydrationWarning>Kullanım Detayları</CardTitle>
          <CardDescription suppressHydrationWarning>Günlük fişek kullanım bilgilerini girin. Kişi sayısı girildiğinde ve senaryo seçildiğinde fişek miktarları otomatik olarak hesaplanacaktır.</CardDescription>
        </CardHeader>
        <CardContent>
          <AmmunitionDailyUsageForm usageScenarios={usageScenarios} />
        </CardContent>
      </Card>
    </div>
  );
}
