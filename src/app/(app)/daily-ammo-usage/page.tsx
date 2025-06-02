
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { PlusCircle, ClipboardList, BarChart3, Users, Info, ListTree, Box as BoxIcon, Layers, UsersRound, ThermometerSnowflake, HelpCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { getAmmunitionDailyUsageLogs, getGroupedAmmunitionDailyUsageLogs, getUsageScenarios, getAmmunition, type GroupedDailyUsageLog, type SupportedCaliber, type UsageScenario, type Ammunition } from "@/lib/actions/inventory.actions";
import { AmmunitionDailyUsageTableClient } from "./_components/usage-log-table-client";
import { SUPPORTED_CALIBERS } from '@/types/inventory';

interface CaliberSufficiencyInfo {
  caliber: SupportedCaliber;
  currentStock: number;
  roundsPerPerson: number;
  engagementsSupported: number | 'N/A' | 'Sınırsız';
}
interface ScenarioDetailedSufficiencyInfo {
  scenarioId: string;
  scenarioName: string;
  scenarioDescription?: string;
  calibers: CaliberSufficiencyInfo[];
}


export default async function AmmunitionDailyUsagePage() {
  const allLogs = await getAmmunitionDailyUsageLogs(); 
  const groupedLogs = await getGroupedAmmunitionDailyUsageLogs();
  const usageScenarios = await getUsageScenarios(); 
  const ammunitionStock = await getAmmunition();

  const totalUsage = {
    '9x19mm': allLogs.reduce((sum, log) => sum + log.used_9x19mm, 0),
    '5.56x45mm': allLogs.reduce((sum, log) => sum + log.used_5_56x45mm, 0),
    '7.62x39mm': allLogs.reduce((sum, log) => sum + log.used_7_62x39mm, 0),
    '7.62x51mm': allLogs.reduce((sum, log) => sum + log.used_7_62x51mm, 0),
  };

  const stockByCaliber = ammunitionStock.reduce((acc, ammo) => {
    acc[ammo.caliber] = (acc[ammo.caliber] || 0) + ammo.quantity;
    return acc;
  }, {} as Record<SupportedCaliber, number>);

  const scenarioDetailedSufficiencyData: ScenarioDetailedSufficiencyInfo[] = usageScenarios.map(scenario => {
    const caliberDetails: CaliberSufficiencyInfo[] = scenario.consumptionRatesPerCaliber
      .filter(rate => rate.roundsPerPerson > 0) 
      .map(rate => {
        const currentStockForCaliber = stockByCaliber[rate.caliber] || 0;
        let engagements: number | 'Sınırsız' | 'N/A' = 'N/A';

        if (rate.roundsPerPerson > 0) {
          engagements = Math.floor(currentStockForCaliber / rate.roundsPerPerson);
        } else {
          engagements = 'Sınırsız'; 
        }

        return {
          caliber: rate.caliber,
          currentStock: currentStockForCaliber,
          roundsPerPerson: rate.roundsPerPerson,
          engagementsSupported: engagements,
        };
      });
  
    return {
      scenarioId: scenario.id,
      scenarioName: scenario.name,
      scenarioDescription: scenario.description,
      calibers: caliberDetails.sort((a,b) => a.caliber.localeCompare(b.caliber)),
    };
  }).sort((a,b) => a.scenarioName.localeCompare(b.scenarioName));


  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-8 w-8" />
          <h1 className="text-3xl font-bold tracking-tight" suppressHydrationWarning>Günlük Fişek Kullanım Takibi</h1>
        </div>
        <Link href="/daily-ammo-usage/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> <span suppressHydrationWarning>Yeni Kullanım Kaydı Ekle</span>
          </Button>
        </Link>
      </div>

      <Card className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-300">
            <BarChart3 className="h-6 w-6" />
            <span suppressHydrationWarning>Kullanım Özeti (Tüm Kayıtlar)</span>
          </CardTitle>
          <CardDescription className="text-blue-700 dark:text-blue-400" suppressHydrationWarning>Kaydedilen tüm günlük kullanımlara dayalı özet bilgiler.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700/60">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400" suppressHydrationWarning>Toplam 9x19mm</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-green-700 dark:text-green-400">{totalUsage['9x19mm'].toLocaleString()}</p>
                    </CardContent>
                </Card>
                 <Card className="bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-700/60">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-400" suppressHydrationWarning>Toplam 5.56x45mm</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">{totalUsage['5.56x45mm'].toLocaleString()}</p>
                    </CardContent>
                </Card>
                 <Card className="bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-700/60">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-400" suppressHydrationWarning>Toplam 7.62x39mm</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">{totalUsage['7.62x39mm'].toLocaleString()}</p>
                    </CardContent>
                </Card>
                 <Card className="bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700/60">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-red-700 dark:text-red-400" suppressHydrationWarning>Toplam 7.62x51mm</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-red-700 dark:text-red-400">{totalUsage['7.62x51mm'].toLocaleString()}</p>
                    </CardContent>
                </Card>
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            <span suppressHydrationWarning>Mühimmat Yeterlilik (Senaryo ve Kalibre Bazlı)</span>
          </CardTitle>
          <CardDescription suppressHydrationWarning>
            Her bir kullanım senaryosu için, o senaryoda tanımlı her bir kalibrenin mevcut mühimmat stoğu ile tahmini kaç kişilik angajmana yeteceğini gösterir.
            Sarfiyat oranlarını <Link href="/admin/usage-scenarios" className="text-primary hover:underline">Kullanım Senaryoları</Link> sayfasından yönetebilirsiniz.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {usageScenarios.length === 0 ? (
             <p className="text-muted-foreground text-center py-4" suppressHydrationWarning>Henüz tanımlanmış kullanım senaryosu bulunmamaktadır. Lütfen <Link href="/admin/usage-scenarios" className="text-primary hover:underline">Kullanım Senaryoları</Link> sayfasından senaryo ekleyin.</p>
          ) : (
            scenarioDetailedSufficiencyData.map(scenarioInfo => (
              <div key={scenarioInfo.scenarioId} className="space-y-4 p-4 border rounded-lg shadow">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-semibold text-primary" suppressHydrationWarning>{scenarioInfo.scenarioName}</h3>
                        {scenarioInfo.scenarioDescription && <p className="text-xs text-muted-foreground" suppressHydrationWarning>{scenarioInfo.scenarioDescription}</p>}
                    </div>
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/usage-scenarios/${scenarioInfo.scenarioId}/edit`}>
                            <span suppressHydrationWarning>Senaryoyu Yapılandır</span>
                        </Link>
                    </Button>
                </div>

                {scenarioInfo.calibers.length === 0 ? (
                     <p className="text-sm text-muted-foreground italic py-2" suppressHydrationWarning>Bu senaryo için aktif (sıfırdan büyük) fişek sarfiyatı tanımlanmamış.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {scenarioInfo.calibers.map(caliberInfo => (
                        <Card key={caliberInfo.caliber} className="flex flex-col">
                        <CardHeader className="pb-2 pt-3 bg-muted/20 dark:bg-muted/10">
                            <CardTitle className="text-sm font-medium flex items-center gap-1.5">
                                <BoxIcon className="h-4 w-4 text-muted-foreground" />
                                <span suppressHydrationWarning>{caliberInfo.caliber}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-1.5 text-xs pt-3">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground" suppressHydrationWarning>Mevcut Stok:</span>
                                <span className="font-semibold" suppressHydrationWarning>{caliberInfo.currentStock.toLocaleString()} adet</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground" suppressHydrationWarning>Kişi Başı Sarfiyat:</span>
                                <span className="font-semibold" suppressHydrationWarning>{caliberInfo.roundsPerPerson} adet</span>
                            </div>
                            <div className="flex justify-between items-center pt-1 mt-1 border-t">
                                <span className="text-muted-foreground flex items-center gap-1"><UsersRound className="h-3.5 w-3.5"/> <span suppressHydrationWarning>Tahmini Kapasite:</span></span>
                                <span className="font-bold text-sm">
                                {caliberInfo.engagementsSupported === 'Sınırsız' ? <ThermometerSnowflake className="inline h-4 w-4" title="Sınırsız (Sarfiyat Tanımlanmamış/Sıfır)" /> :
                                 caliberInfo.engagementsSupported === 'N/A' ? <HelpCircle className="inline h-4 w-4" title="Hesaplanamadı (Sarfiyat 0)" /> :
                                 <span suppressHydrationWarning>{`${(caliberInfo.engagementsSupported as number).toLocaleString()} Kişi`}</span>}
                                </span>
                            </div>
                        </CardContent>
                        </Card>
                    ))}
                    </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListTree className="h-6 w-6" />
            <span suppressHydrationWarning>Tüm Kullanım Kayıtları (Senaryo Bazlı)</span>
          </CardTitle>
          <CardDescription suppressHydrationWarning>Geçmiş günlük fişek kullanım kayıtlarını senaryolara göre gruplanmış olarak inceleyin.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {groupedLogs.length === 0 ? (
            <p className="text-muted-foreground text-center py-4" suppressHydrationWarning>Henüz günlük fişek kullanım kaydı bulunmamaktadır.</p>
          ) : (
            groupedLogs.map((group) => (
              <Card key={group.scenarioId || 'no-scenario'} className="shadow-md">
                <CardHeader className="bg-muted/50">
                  <CardTitle className="text-xl" suppressHydrationWarning>{group.scenarioName}</CardTitle>
                  {group.logs.length === 0 && <CardDescription suppressHydrationWarning>Bu senaryo için kayıt bulunmamaktadır.</CardDescription>}
                </CardHeader>
                {group.logs.length > 0 && (
                  <CardContent className="p-0">
                    <AmmunitionDailyUsageTableClient logs={group.logs} usageScenarios={usageScenarios} />
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

