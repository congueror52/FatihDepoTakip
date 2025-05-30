
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, ClipboardList, BarChart3, Users, Info, ListTree } from "lucide-react";
import Link from "next/link";
import { getAmmunitionDailyUsageLogs, getGroupedAmmunitionDailyUsageLogs, getUsageScenarios, type GroupedDailyUsageLog } from "@/lib/actions/inventory.actions";
import { AmmunitionDailyUsageTableClient } from "./_components/usage-log-table-client";

export default async function AmmunitionDailyUsagePage() {
  const allLogs = await getAmmunitionDailyUsageLogs(); 
  const groupedLogs = await getGroupedAmmunitionDailyUsageLogs();
  const usageScenarios = await getUsageScenarios(); // Fetch scenarios to pass to table client

  const totalUsage = {
    '9x19mm': allLogs.reduce((sum, log) => sum + log.used_9x19mm, 0),
    '5.56x45mm': allLogs.reduce((sum, log) => sum + log.used_5_56x45mm, 0),
    '7.62x39mm': allLogs.reduce((sum, log) => sum + log.used_7_62x39mm, 0),
    '7.62x51mm': allLogs.reduce((sum, log) => sum + log.used_7_62x51mm, 0),
  };


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
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium" suppressHydrationWarning>Toplam 9x19mm</CardTitle></CardHeader>
                    <CardContent><p className="text-2xl font-bold">{totalUsage['9x19mm'].toLocaleString()}</p></CardContent>
                </Card>
                 <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium" suppressHydrationWarning>Toplam 5.56x45mm</CardTitle></CardHeader>
                    <CardContent><p className="text-2xl font-bold">{totalUsage['5.56x45mm'].toLocaleString()}</p></CardContent>
                </Card>
                 <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium" suppressHydrationWarning>Toplam 7.62x39mm</CardTitle></CardHeader>
                    <CardContent><p className="text-2xl font-bold">{totalUsage['7.62x39mm'].toLocaleString()}</p></CardContent>
                </Card>
                 <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium" suppressHydrationWarning>Toplam 7.62x51mm</CardTitle></CardHeader>
                    <CardContent><p className="text-2xl font-bold">{totalUsage['7.62x51mm'].toLocaleString()}</p></CardContent>
                </Card>
            </div>
            <Card className="bg-blue-100/70 border border-blue-200/80 dark:bg-blue-800/40 dark:border-blue-600/70">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2 text-blue-700 dark:text-blue-300">
                        <Info className="h-5 w-5"/>
                        <span suppressHydrationWarning>Gelişmiş Özet Bilgileri</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-blue-600 dark:text-blue-300" suppressHydrationWarning>
                        Kalan fişek miktarları ve tahmini yeterlilik süresi gibi daha detaylı özetler için, sistemin toplam mühimmat stoklarını bilmesi gerekmektedir. Bu özellikler sonraki aşamalarda eklenecektir.
                    </p>
                </CardContent>
            </Card>
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
