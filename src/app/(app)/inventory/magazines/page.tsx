
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, ListChecks } from "lucide-react";
import Link from "next/link";
import { MagazinesTableClient } from "./_components/magazines-table-client"; // Updated
import { getMagazines } from "@/lib/actions/inventory.actions"; // Updated

export default async function MagazinesPage() {
  const magazines = await getMagazines(); 

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
      
      <Card>
        <CardHeader>
          <CardTitle suppressHydrationWarning>Tüm Şarjörler</CardTitle>
          <CardDescription suppressHydrationWarning>Envanterdeki tüm şarjörleri yönetin ve takip edin.</CardDescription>
        </CardHeader>
        <CardContent>
          <MagazinesTableClient magazines={magazines} /> 
        </CardContent>
      </Card>
    </div>
  );
}

