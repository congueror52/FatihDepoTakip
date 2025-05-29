
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Box, Warehouse, List } from "lucide-react"; // Replaced BarChartHorizontalBig with Warehouse and List
import Link from "next/link";
import { AmmunitionTableClient } from "./_components/ammunition-table-client"; 
import { getAmmunition, getDepots } from "@/lib/actions/inventory.actions"; 
import type { Ammunition, Depot } from "@/types/inventory"; 

interface DepotAmmunitionSummary {
  depotId: string;
  depotName: string;
  calibers: Array<{
    caliber: string;
    quantity: number;
  }>;
}

export default async function AmmunitionPage() {
  const ammunitionList = await getAmmunition(); 
  const depots = await getDepots(); 

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
        .sort((a, b) => a.caliber.localeCompare(b.caliber)), // Sort calibers alphabetically
    };
  }).filter(summary => summary.calibers.length > 0); // Only include depots that have ammunition


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
