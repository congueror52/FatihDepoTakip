
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShipmentForm } from "../_components/shipment-form";
import { Truck, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getDepots, getShipmentTypeDefinitions } from "@/lib/actions/inventory.actions";

export default async function NewShipmentPage() {
  const depots = await getDepots();
  const shipmentTypeDefs = await getShipmentTypeDefinitions();
  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/shipments" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        <span suppressHydrationWarning>Malzeme Kayıt Listesine Geri Dön</span>
      </Link>
      <div className="flex items-center gap-2 mb-6">
        <Truck className="h-8 w-8" />
        <h1 className="text-3xl font-bold tracking-tight" suppressHydrationWarning>Yeni Malzeme Kaydı Ekle</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle suppressHydrationWarning>Malzeme Kaydı Detayları</CardTitle>
          <CardDescription suppressHydrationWarning>Yeni bir malzeme kaydı için bilgileri girin.</CardDescription>
        </CardHeader>
        <CardContent>
          <ShipmentForm depots={depots} shipmentTypeDefs={shipmentTypeDefs} />
        </CardContent>
      </Card>
    </div>
  );
}
