
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Box, Warehouse, List, TrendingUp, TrendingDown, PackageSearch } from "lucide-react";
import Link from "next/link";
import { AmmunitionTableClient } from "./_components/ammunition-table-client"; 
import { getAmmunition, getDepots, getAmmunitionDailyUsageLogs } from "@/lib/actions/inventory.actions"; 
import type { Ammunition, Depot, SupportedCaliber } from "@/types/inventory"; 
import { SUPPORTED_CALIBERS } from "@/types/inventory";

interface DepotAmmunitionSummary {
  depotId: string;
  depotName: string;
  calibers: Array<{
    caliber: string;
    quantity: number;
  }>;
}

interface CaliberOverallStatus {
  caliber: SupportedCaliber;
  totalStock: number;
  totalUsed: number;
  remaining: number;
}

export default async function AmmunitionPage() {
  const ammunitionList = await getAmmunition(); 
  const depots = await getDepots(); 
  const dailyUsageLogs = await getAmmunitionDailyUsageLogs();

  const depotSummaries: DepotAmmunitionSummary[] = depots.map(depot => {
    const depotAmmunition = ammunitionList.filter(ammo => ammo.depotId === depot.id);
    const calibersInDepot = depotAmmunition.reduce((acc, ammo) => {
      if (!acc[ammo.caliber]) {
        acc[ammo.caliber] = 0;
      }
      acc[ammo.caliber] += ammo.quantity;
      return acc;
    }, {} as Record<string, number>);

    return {
      depotId: depot.id,
      depotName: depot.name,
      calibers: Object.entries(calibersInDepot)
        .map(([caliber, quantity]) => ({ caliber, quantity }))
        .sort((a, b) => a.caliber.localeCompare(b.caliber)),
    };
  }).filter(summary => summary.calibers.length > 0);


  const caliberOverallStatus: CaliberOverallStatus[] = SUPPORTED_CALIBERS.map(caliber => {
    const totalStock = ammunitionList
      .filter(ammo => ammo.caliber === caliber)
      .reduce((sum, ammo) => sum + ammo.quantity, 0);

    let totalUsed = 0;
    switch (caliber) {
      case "9x19mm":
        totalUsed = dailyUsageLogs.reduce((sum, log) => sum + log.used_9x19mm, 0);
        break;
      case "5.56x45mm":
        totalUsed = dailyUsageLogs.reduce((sum, log) => sum + log.used_5_56x45mm, 0);
        break;
      case "7.62x39mm":
        totalUsed = dailyUsageLogs.reduce((sum, log) => sum + log.used_7_62x39mm, 0);
        break;
      case "7.62x51mm":
        totalUsed = dailyUsageLogs.reduce((sum, log) => sum + log.used_7_62x51mm, 0);
        break;
    }
    
    return {
      caliber,
      totalStock,
      totalUsed,
      remaining: totalStock - totalUsed,
    };
  });


  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Box className="h-8 w-8" />
          <h1 className="text-3xl font-bold tracking-tight" suppressHydrationWarning>Mühimmat Envanteri</h1>
        </div>
         <Link href="/inventory/ammunition/new">
          <Button> 
            <PlusCircle className="mr-2 h-4 w-4" /> <span suppressHydrationWarning>Mühimmat Ekle</span>
          </Button>
        </Link> 
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PackageSearch className="h-6 w-6 text-violet-600 dark:text-violet-400" />
            <span suppressHydrationWarning>Genel Kalibre Durumu</span>
          </CardTitle>
          <CardDescription suppressHydrationWarning>Her bir fişek kalibresi için toplam stok, kullanılan ve kalan miktarlar.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
          {caliberOverallStatus.map((status) => (
            <Card key={status.caliber} className="shadow-sm bg-violet-50 dark:bg-violet-900/40 border-violet-200 dark:border-violet-700/60">
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-lg flex items-center gap-2 text-violet-800 dark:text-violet-300">
                  <Box className="h-5 w-5 text-muted-foreground" /> 
                  <span suppressHydrationWarning>{status.caliber} Durumu</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm text-violet-700 dark:text-violet-300">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1"><List className="h-4 w-4 text-blue-500" /> <span suppressHydrationWarning>Toplam Stok:</span></span>
                  <span className="font-semibold">{status.totalStock.toLocaleString()} <span className="text-xs text-muted-foreground" suppressHydrationWarning>adet</span></span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1"><TrendingDown className="h-4 w-4 text-red-500" /> <span suppressHydrationWarning>Toplam Kullanılan:</span></span>
                  <span className="font-semibold">{status.totalUsed.toLocaleString()} <span className="text-xs text-muted-foreground" suppressHydrationWarning>adet</span></span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1"><TrendingUp className="h-4 w-4 text-green-500" /> <span suppressHydrationWarning>Kalan Miktar:</span></span>
                  <span className="font-semibold">{status.remaining.toLocaleString()} <span className="text-xs text-muted-foreground" suppressHydrationWarning>adet</span></span>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>


      {depotSummaries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Warehouse className="h-6 w-6 text-primary" />
              <span suppressHydrationWarning>Depo Bazlı Mühimmat Özeti</span>
            </CardTitle>
            <CardDescription suppressHydrationWarning>Her bir depodaki mühimmat miktarlarını kalibre bazında görüntüleyin.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {depotSummaries.map((summary) => (
              <Card key={summary.depotId} className="shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Warehouse className="h-5 w-5 text-muted-foreground" /> 
                    <span suppressHydrationWarning>{summary.depotName}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  {summary.calibers.length > 0 ? (
                    summary.calibers.map(item => (
                      <div key={item.caliber} className="flex justify-between items-center">
                        <span>{item.caliber}:</span>
                        <span className="font-semibold">{item.quantity.toLocaleString()} <span className="text-xs text-muted-foreground" suppressHydrationWarning>adet</span></span>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-xs" suppressHydrationWarning>Bu depoda kayıtlı mühimmat bulunmamaktadır.</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle suppressHydrationWarning>Tüm Mühimmat Kayıtları</CardTitle>
          <CardDescription suppressHydrationWarning>Tüm mühimmat türlerini, miktarlarını ve bulundukları depoları detaylı olarak yönetin ve takip edin.</CardDescription>
        </CardHeader>
        <CardContent>
          <AmmunitionTableClient ammunition={ammunitionList} depots={depots} />
        </CardContent>
      </Card>
    </div>
  );
}
