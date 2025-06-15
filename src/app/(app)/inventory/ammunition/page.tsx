
'use client'; // This page uses client-side state and effects for loading

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Box, Warehouse, List, TrendingUp, TrendingDown, PackageSearch, UsersRound, Box as BoxIcon, Loader2 } from "lucide-react";
import Link from "next/link";
import { getAmmunition, getDepots, getAmmunitionDailyUsageLogs, getUsageScenarios } from "@/lib/actions/inventory.actions"; 
import type { Ammunition, Depot, SupportedCaliber, UsageScenario, CaliberOverallStatus as CaliberOverallStatusType } from "@/types/inventory"; 
import { SUPPORTED_CALIBERS } from "@/types/inventory";
import { useEffect, useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";

interface DepotAmmunitionSummary {
  depotId: string;
  depotName: string;
  calibers: Array<{
    caliber: string;
    quantity: number;
  }>;
}

export default function AmmunitionPage() {
  const [ammunitionList, setAmmunitionList] = useState<Ammunition[]>([]);
  const [depots, setDepots] = useState<Depot[]>([]);
  const [dailyUsageLogs, setDailyUsageLogs] = useState<AmmunitionDailyUsageLog[]>([]);
  const [usageScenarios, setUsageScenarios] = useState<UsageScenario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [ammoData, depotsData, usageLogsData, scenariosData] = await Promise.all([
          getAmmunition(),
          getDepots(),
          getAmmunitionDailyUsageLogs(),
          getUsageScenarios()
        ]);
        setAmmunitionList(ammoData);
        setDepots(depotsData);
        setDailyUsageLogs(usageLogsData);
        setUsageScenarios(scenariosData);
      } catch (error) {
        console.error("Mühimmat envanteri verileri yüklenirken hata:", error);
        toast({ variant: "destructive", title: "Hata", description: "Mühimmat envanteri verileri yüklenirken bir sorun oluştu." });
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [toast]);


  const depotSummaries: DepotAmmunitionSummary[] = useMemo(() => depots.map(depot => {
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
  }).filter(summary => summary.calibers.length > 0), [depots, ammunitionList]);


  const caliberOverallStatus: CaliberOverallStatusType[] = useMemo(() => SUPPORTED_CALIBERS.map(caliber => {
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
  }), [ammunitionList, dailyUsageLogs]);

  if (isLoading) {
    return (
        <div className="flex flex-col gap-6 items-center justify-center h-full">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground" suppressHydrationWarning>Mühimmat verileri yükleniyor...</p>
        </div>
    );
  }


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
                  <BoxIcon className="h-5 w-5 text-muted-foreground" /> 
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
              <Warehouse className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              <span suppressHydrationWarning>Depo Bazlı Mühimmat Özeti</span>
            </CardTitle>
            <CardDescription suppressHydrationWarning>Her bir depodaki mühimmat miktarlarını, genel kullanımı ve senaryo bazlı yeterliliklerini görüntüleyin.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2">
            {depotSummaries.map((summary) => (
              <Card key={summary.depotId} className="shadow-md bg-amber-50 dark:bg-amber-900/40 border-amber-200 dark:border-amber-700/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2 text-amber-800 dark:text-amber-300">
                    <Warehouse className="h-5 w-5 text-muted-foreground" /> 
                    <span suppressHydrationWarning>{summary.depotName}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-amber-700 dark:text-amber-300">
                  {summary.calibers.length > 0 ? (
                    summary.calibers.map(caliberItem => {
                      const overallStatus = caliberOverallStatus.find(s => s.caliber === caliberItem.caliber);
                      const relevantScenarios = usageScenarios.filter(sc =>
                        sc.consumptionRatesPerCaliber.some(rate => rate.caliber === caliberItem.caliber && rate.roundsPerPerson > 0)
                      );
                      return (
                        <div key={caliberItem.caliber} className="p-3 border-b border-amber-300/50 dark:border-amber-600/50 last:border-b-0">
                          <div className="flex justify-between items-center font-semibold text-md text-amber-800 dark:text-amber-200 mb-1.5">
                            <span className="flex items-center gap-2"><BoxIcon className="h-4 w-4 text-muted-foreground" /> {caliberItem.caliber}</span>
                          </div>
                          <div className="pl-1 space-y-1 text-xs">
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground flex items-center gap-1"><List className="h-3.5 w-3.5" />Depodaki Miktar:</span>
                              <span className="font-medium">{caliberItem.quantity.toLocaleString()} adet</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground flex items-center gap-1"><TrendingDown className="h-3.5 w-3.5 text-red-500" />Genel Kullanılan:</span>
                              <span className="font-medium text-red-600 dark:text-red-400">{(overallStatus?.totalUsed || 0).toLocaleString()} adet</span>
                            </div>
                            {relevantScenarios.length > 0 && (
                              <div className="pt-2 mt-2 border-t border-amber-300/30 dark:border-amber-600/30">
                                <h4 className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                                  <UsersRound className="h-3.5 w-3.5" /> Bu Depo Stoğu ile Senaryo Yeterlilikleri:
                                </h4>
                                <ul className="space-y-1 pl-2">
                                  {relevantScenarios.map(scenario => {
                                    const rate = scenario.consumptionRatesPerCaliber.find(r => r.caliber === caliberItem.caliber);
                                    if (rate && rate.roundsPerPerson > 0) {
                                      const engagements = Math.floor(caliberItem.quantity / rate.roundsPerPerson);
                                      return (
                                        <li key={scenario.id} className="flex justify-between items-center text-muted-foreground hover:text-foreground transition-colors">
                                          <span className="truncate flex-1 mr-2" title={scenario.name}>- {scenario.name}</span>
                                          <span className="font-medium text-sky-600 dark:text-sky-400 whitespace-nowrap">{engagements.toLocaleString()} kişilik</span>
                                        </li>
                                      );
                                    }
                                    return null;
                                  })}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
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
