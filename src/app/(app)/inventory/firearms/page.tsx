
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Target, ShieldX, Wrench, ShieldCheck, Construction, ServerCrash } from "lucide-react"; // Added more icons
import Link from "next/link";
import { getFirearms } from "@/lib/actions/inventory.actions";
import { FirearmsTableClient } from "./_components/firearms-table-client";
import type { FirearmStatus } from "@/types/inventory";

export default async function FirearmsPage() {
  const firearms = await getFirearms();

  const statusCounts = firearms.reduce((acc, firearm) => {
    acc[firearm.status] = (acc[firearm.status] || 0) + 1;
    return acc;
  }, {} as Record<FirearmStatus, number>);

  const summaryCards: { title: string; count: number; icon: React.ElementType; statusKey: FirearmStatus, bgColor?: string, textColor?: string, borderColor?: string }[] = [
    { title: "Hizmetteki Silahlar", count: statusCounts['Hizmette'] || 0, icon: ShieldCheck, statusKey: 'Hizmette', bgColor: 'bg-green-50 dark:bg-green-900/30', textColor: 'text-green-700 dark:text-green-400', borderColor: 'border-green-200 dark:border-green-700' },
    { title: "Arızalı Silahlar", count: statusCounts['Arızalı'] || 0, icon: ShieldX, statusKey: 'Arızalı', bgColor: 'bg-red-50 dark:bg-red-900/30', textColor: 'text-red-700 dark:text-red-400', borderColor: 'border-red-200 dark:border-red-700' },
    { title: "Bakımdaki Silahlar", count: statusCounts['Bakımda'] || 0, icon: Wrench, statusKey: 'Bakımda', bgColor: 'bg-yellow-50 dark:bg-yellow-900/30', textColor: 'text-yellow-700 dark:text-yellow-400', borderColor: 'border-yellow-200 dark:border-yellow-700' },
    { title: "Onarım Bekleyenler", count: statusCounts['Onarım Bekliyor'] || 0, icon: Construction, statusKey: 'Onarım Bekliyor', bgColor: 'bg-orange-50 dark:bg-orange-900/30', textColor: 'text-orange-700 dark:text-orange-400', borderColor: 'border-orange-200 dark:border-orange-700' },
    { title: "Hizmet Dışı Silahlar", count: statusCounts['Hizmet Dışı'] || 0, icon: ServerCrash, statusKey: 'Hizmet Dışı', bgColor: 'bg-slate-50 dark:bg-slate-700/30', textColor: 'text-slate-700 dark:text-slate-400', borderColor: 'border-slate-200 dark:border-slate-600' },
  ];


  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-8 w-8" />
          <h1 className="text-3xl font-bold tracking-tight" suppressHydrationWarning>Silah Envanteri</h1>
        </div>
        <Link href="/inventory/firearms/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> <span suppressHydrationWarning>Silah Ekle</span>
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mb-6">
        {summaryCards.map((card) => (
          <Card key={card.statusKey} className={`${card.bgColor} ${card.borderColor}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={`text-sm font-medium ${card.textColor}`} suppressHydrationWarning>{card.title}</CardTitle>
              <card.icon className={`h-5 w-5 ${card.textColor} opacity-80`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${card.textColor}`}>{card.count}</div>
              {/* <p className="text-xs text-muted-foreground pt-1">Toplam envanterin %X'i</p> */}
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle suppressHydrationWarning>Tüm Silahlar</CardTitle>
          <CardDescription suppressHydrationWarning>Envanterdeki tüm silahları yönetin ve takip edin.</CardDescription>
        </CardHeader>
        <CardContent>
          <FirearmsTableClient firearms={firearms} />
        </CardContent>
      </Card>
    </div>
  );
}
