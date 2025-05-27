import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, ListChecks } from "lucide-react";
import Link from "next/link";
// import { MagazinesTableClient } from "./_components/magazines-table-client";
// import { getMagazines } from "@/lib/actions/inventory.actions";

export default async function MagazinesPage() {
  // const magazines = await getMagazines(); // Uncomment when implemented

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListChecks className="h-8 w-8" />
          <h1 className="text-3xl font-bold tracking-tight">Magazines Inventory</h1>
        </div>
        {/* <Link href="/inventory/magazines/new"> */}
          <Button disabled> {/* Enable when new page is ready */}
            <PlusCircle className="mr-2 h-4 w-4" /> Add Magazine
          </Button>
        {/* </Link> */}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Magazines</CardTitle>
          <CardDescription>Manage and track all magazines in the inventory.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* <MagazinesTableClient magazines={magazines} /> */}
          <p className="text-muted-foreground">Magazine table will be displayed here. Feature under construction.</p>
        </CardContent>
      </Card>
    </div>
  );
}
