
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, ClipboardList, BarChart3, Users, Info } from "lucide-react";
import Link from "next/link";
import { getAmmunitionDailyUsageLogs } from "@/lib/actions/inventory.actions";
import { AmmunitionDailyUsageTableClient } from "./_components/usage-log-table-client";

export default async function AmmunitionDailyUsagePage() {
  const logs = await getAmmunitionDailyUsageLogs();

  // Calculate total usage for summary (simple sum for now)
  const totalUsage = {
    '9x19mm': logs.reduce((sum, log) => sum + log.used_9x19mm, 0),
    '5.56x45mm': logs.reduce((sum, log) => sum + log.used_5_56x45mm, 0),
    '7.62x39mm': logs.reduce((sum, log) => sum + log.used_7_62x39mm, 0),
    '7.62x51mm': logs.reduce((sum, log) => sum + log.used_7_62x51mm, 0),
    '12 Kalibre': logs.reduce((sum, log) => sum + (log["used_12 Kalibre"] || 0), 0),
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            <span suppressHydrationWarning>Kullanım Özeti</span>
          </CardTitle>
          <CardDescription suppressHydrationWarning>Kaydedilen günlük kullanımlara dayalı özet bilgiler.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium" suppressHydrationWarning>Toplam 12 Kalibre</CardTitle></CardHeader>
                    <CardContent><p className="text-2xl font-bold">{totalUsage['12 Kalibre'].toLocaleString()}</p></CardContent>
                </Card>
            </div>
            <Card className="bg-amber-50 border border-amber-200 dark:bg-amber-900/30 dark:border-amber-700">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2 text-amber-700 dark:text-amber-400">
                        <Info className="h-5 w-5"/>
                        <span suppressHydrationWarning>Gelişmiş Özet Bilgileri</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-amber-600 dark:text-amber-300" suppressHydrationWarning>
                        Kalan fişek miktarları ve tahmini yeterlilik süresi gibi daha detaylı özetler için, sistemin toplam mühimmat stoklarını bilmesi gerekmektedir. Bu özellikler sonraki aşamalarda eklenecektir.
                    </p>
                </CardContent>
            </Card>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle suppressHydrationWarning>Tüm Kullanım Kayıtları</CardTitle>
          <CardDescription suppressHydrationWarning>Geçmiş günlük fişek kullanım kayıtlarını inceleyin.</CardDescription>
        </CardHeader>
        <CardContent>
          <AmmunitionDailyUsageTableClient logs={logs} />
        </CardContent>
      </Card>
    </div>
  );
}
