
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, ListChecks, CheckCircle, XCircle, Wrench, AlertTriangle, ServerCrash } from "lucide-react"; 
import Link from "next/link";
import { MagazinesTableClient } from "./_components/magazines-table-client"; 
import { getMagazines, getDepots } from "@/lib/actions/inventory.actions"; // Added getDepots
import type { MagazineStatus } from "@/types/inventory";

export default async function MagazinesPage() {
  const magazines = await getMagazines(); 
  const depots = await getDepots(); // Fetch depots

  const statusCounts = magazines.reduce((acc, magazine) => {
    acc[magazine.status] = (acc[magazine.status] || 0) + 1;
    return acc;
  }, {} as Record<MagazineStatus, number>);

  const summaryCards: { title: string; count: number; icon: React.ElementType; statusKey: MagazineStatus, bgColor?: string, textColor?: string, borderColor?: string }[] = [
    { title: "Hizmetteki Şarjörler", count: statusCounts['Hizmette'] || 0, icon: CheckCircle, statusKey: 'Hizmette', bgColor: 'bg-green-50 dark:bg-green-900/30', textColor: 'text-green-700 dark:text-green-400', borderColor: 'border-green-200 dark:border-green-700' },
    { title: "Arızalı Şarjörler", count: statusCounts['Arızalı'] || 0, icon: XCircle, statusKey: 'Arızalı', bgColor: 'bg-red-50 dark:bg-red-900/30', textColor: 'text-red-700 dark:text-red-400', borderColor: 'border-red-200 dark:border-red-700' },
    { title: "Bakımdaki Şarjörler", count: statusCounts['Bakımda'] || 0, icon: Wrench, statusKey: 'Bakımda', bgColor: 'bg-yellow-50 dark:bg-yellow-900/30', textColor: 'text-yellow-700 dark:text-yellow-400', borderColor: 'border-yellow-200 dark:border-yellow-700' },
    { title: "Kayıp Şarjörler", count: statusCounts['Kayıp'] || 0, icon: AlertTriangle, statusKey: 'Kayıp', bgColor: 'bg-purple-50 dark:bg-purple-900/30', textColor: 'text-purple-700 dark:text-purple-400', borderColor: 'border-purple-200 dark:border-purple-700' },
    { title: "Hizmet Dışı Şarjörler", count: statusCounts['Hizmet Dışı'] || 0, icon: ServerCrash, statusKey: 'Hizmet Dışı', bgColor: 'bg-slate-50 dark:bg-slate-700/30', textColor: 'text-slate-700 dark:text-slate-400', borderColor: 'border-slate-200 dark:border-slate-600' },
  ];


  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListChecks className="h-8 w-8" />
          <h1 className="text-3xl font-bold tracking-tight" suppressHydrationWarning>Şarjör Envanteri</h1>
        </div>
        <Link href="/inventory/magazines/new"> 
          <Button> 
            <PlusCircle className="mr-2 h-4 w-4" /> <span suppressHydrationWarning>Şarjör Ekle</span>
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
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle suppressHydrationWarning>Tüm Şarjörler</CardTitle>
          <CardDescription suppressHydrationWarning>Envanterdeki tüm şarjörleri yönetin ve takip edin.</CardDescription>
        </CardHeader>
        <CardContent>
          <MagazinesTableClient magazines={magazines} depots={depots} /> {/* Pass depots prop */}
        </CardContent>
      </Card>
    </div>
  );
}
