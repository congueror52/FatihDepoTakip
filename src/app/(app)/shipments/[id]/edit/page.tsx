
import { getShipmentById, getDepots, getShipmentTypeDefinitions } from "@/lib/actions/inventory.actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShipmentForm } from "../../_components/shipment-form";
import { Truck, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditShipmentPage({ params }: { params: { id: string } }) {
  const shipment = await getShipmentById(params.id);
  const depots = await getDepots();
  const shipmentTypeDefs = await getShipmentTypeDefinitions();

  if (!shipment) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/shipments" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        <span suppressHydrationWarning>Malzeme Kayıt Listesine Geri Dön</span>
      </Link>
      <div className="flex items-center gap-2 mb-6">
        <Truck className="h-8 w-8" />
        <h1 className="text-3xl font-bold tracking-tight" suppressHydrationWarning>Malzeme Kaydını Düzenle</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle suppressHydrationWarning>Malzeme Kaydı Detaylarını Güncelle</CardTitle>
          <CardDescription><span suppressHydrationWarning>Malzeme kaydı için bilgileri değiştirin (ID: {shipment.id.substring(0,8)}...).</span></CardDescription>
        </CardHeader>
        <CardContent>
          <ShipmentForm shipment={shipment} depots={depots} shipmentTypeDefs={shipmentTypeDefs} />
        </CardContent>
      </Card>
    </div>
  );
}
