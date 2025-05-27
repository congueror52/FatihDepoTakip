import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Box } from "lucide-react";
import Link from "next/link";
// import { AmmunitionTableClient } from "./_components/ammunition-table-client";
// import { getAmmunition } from "@/lib/actions/inventory.actions";

export default async function AmmunitionPage() {
  // const ammunition = await getAmmunition(); // Uncomment when implemented

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Box className="h-8 w-8" />
          <h1 className="text-3xl font-bold tracking-tight">Ammunition Inventory</h1>
        </div>
         {/* <Link href="/inventory/ammunition/new"> */}
          <Button disabled> {/* Enable when new page is ready */}
            <PlusCircle className="mr-2 h-4 w-4" /> Add Ammunition
          </Button>
        {/* </Link> */}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Ammunition</CardTitle>
          <CardDescription>Manage and track all ammunition types and quantities.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* <AmmunitionTableClient ammunition={ammunition} /> */}
          <p className="text-muted-foreground">Ammunition table and usage logging will be displayed here. Feature under construction.</p>
        </CardContent>
      </Card>
    </div>
  );
}
