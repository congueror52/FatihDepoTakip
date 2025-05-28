
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Warehouse } from "lucide-react";
import Link from "next/link";
import { getDepots } from "@/lib/actions/inventory.actions";
import { DepotsTableClient } from "./_components/depots-table-client";

export default async function DepotsPage() {
  const depots = await getDepots();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Warehouse className="h-8 w-8" />
          <h1 className="text-3xl font-bold tracking-tight" suppressHydrationWarning>Depo Tanımları Yönetimi</h1>
        </div>
        <Link href="/admin/depots/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> <span suppressHydrationWarning>Yeni Depo Tanımı Ekle</span>
          </Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle suppressHydrationWarning>Tüm Depo Tanımları</CardTitle>
          <CardDescription suppressHydrationWarning>Sistemdeki depo konumlarını ve detaylarını yönetin.</CardDescription>
        </CardHeader>
        <CardContent>
          <DepotsTableClient depots={depots} />
        </CardContent>
      </Card>
    </div>
  );
}
