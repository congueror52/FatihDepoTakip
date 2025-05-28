
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Truck } from "lucide-react";
import Link from "next/link";
import { getShipments, getDepots, getShipmentTypeDefinitions } from "@/lib/actions/inventory.actions";
import { ShipmentsTableClient } from "./_components/shipments-table-client";

export default async function ShipmentsPage() {
  const shipments = await getShipments();
  const depots = await getDepots(); 
  const shipmentTypeDefs = await getShipmentTypeDefinitions();


  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="h-8 w-8" />
          <h1 className="text-3xl font-bold tracking-tight" suppressHydrationWarning>Malzeme Kaydı Takibi</h1>
        </div>
        <Link href="/shipments/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> <span suppressHydrationWarning>Yeni Malzeme Kaydı Ekle</span>
          </Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle suppressHydrationWarning>Tüm Malzeme Kayıtları</CardTitle>
          <CardDescription suppressHydrationWarning>Gelen, giden ve depolar arası transfer malzeme kayıtlarını yönetin.</CardDescription>
        </CardHeader>
        <CardContent>
          {shipments && depots && shipmentTypeDefs ? (
            <ShipmentsTableClient shipments={shipments} depots={depots} shipmentTypeDefs={shipmentTypeDefs} />
          ) : (
            <p className="text-muted-foreground" suppressHydrationWarning>Malzeme kayıtları yükleniyor veya bulunamadı.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
