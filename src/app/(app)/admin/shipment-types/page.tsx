
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, ListOrdered } from "lucide-react";
import Link from "next/link";
import { getShipmentTypeDefinitions } from "@/lib/actions/inventory.actions";
import { ShipmentTypeDefinitionsTableClient } from "./_components/shipment-type-definitions-table-client";

export default async function ShipmentTypeDefinitionsPage() {
  const definitions = await getShipmentTypeDefinitions();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListOrdered className="h-8 w-8" />
          <h1 className="text-3xl font-bold tracking-tight" suppressHydrationWarning>Malzeme Kayıt Türleri Yönetimi</h1>
        </div>
        <Link href="/admin/shipment-types/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> <span suppressHydrationWarning>Yeni Kayıt Türü Ekle</span>
          </Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle suppressHydrationWarning>Tanımlı Malzeme Kayıt Türleri</CardTitle>
          <CardDescription suppressHydrationWarning>Sistemde kullanılacak malzeme kayıt türlerini (Gelen, Giden, Transfer vb.) yönetin.</CardDescription>
        </CardHeader>
        <CardContent>
          <ShipmentTypeDefinitionsTableClient definitions={definitions} />
        </CardContent>
      </Card>
    </div>
  );
}
