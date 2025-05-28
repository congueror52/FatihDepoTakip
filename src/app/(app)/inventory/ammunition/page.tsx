
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Box } from "lucide-react";
import Link from "next/link";
import { AmmunitionTableClient } from "./_components/ammunition-table-client"; 
import { getAmmunition, getDepots } from "@/lib/actions/inventory.actions"; // Import getDepots

export default async function AmmunitionPage() {
  const ammunition = await getAmmunition(); 
  const depots = await getDepots(); // Fetch depots

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
          <CardTitle suppressHydrationWarning>Tüm Mühimmat</CardTitle>
          <CardDescription suppressHydrationWarning>Tüm mühimmat türlerini ve miktarlarını yönetin ve takip edin.</CardDescription>
        </CardHeader>
        <CardContent>
          <AmmunitionTableClient ammunition={ammunition} depots={depots} /> {/* Pass depots to the table */}
        </CardContent>
      </Card>
    </div>
  );
}
