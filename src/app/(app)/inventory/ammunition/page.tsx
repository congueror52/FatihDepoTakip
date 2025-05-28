
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Box, BarChartHorizontalBig } from "lucide-react"; // Added BarChartHorizontalBig
import Link from "next/link";
import { AmmunitionTableClient } from "./_components/ammunition-table-client"; 
import { getAmmunition, getDepots } from "@/lib/actions/inventory.actions"; 
import type { Ammunition } from "@/types/inventory"; // Added Ammunition type for grouping

export default async function AmmunitionPage() {
  const ammunitionList = await getAmmunition(); 
  const depots = await getDepots(); 

  const ammunitionByCaliber = ammunitionList.reduce((acc, ammo) => {
    if (!acc[ammo.caliber]) {
      acc[ammo.caliber] = 0;
    }
    acc[ammo.caliber] += ammo.quantity;
    return acc;
  }, {} as Record<string, number>);

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

      {Object.keys(ammunitionByCaliber).length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-6">
          {Object.entries(ammunitionByCaliber).map(([caliber, quantity]) => (
            <Card key={caliber} className="shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium" suppressHydrationWarning>{caliber}</CardTitle>
                <BarChartHorizontalBig className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{quantity.toLocaleString()} <span className="text-xs text-muted-foreground" suppressHydrationWarning>adet</span></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle suppressHydrationWarning>Tüm Mühimmat</CardTitle>
          <CardDescription suppressHydrationWarning>Tüm mühimmat türlerini ve miktarlarını yönetin ve takip edin.</CardDescription>
        </CardHeader>
        <CardContent>
          <AmmunitionTableClient ammunition={ammunitionList} depots={depots} />
        </CardContent>
      </Card>
    </div>
  );
}
