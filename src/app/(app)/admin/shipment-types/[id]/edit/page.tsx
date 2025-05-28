
import { getShipmentTypeDefinitionById } from "@/lib/actions/inventory.actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShipmentTypeDefinitionForm } from "../../_components/shipment-type-definition-form";
import { ListOrdered, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditShipmentTypeDefinitionPage({ params }: { params: { id: string } }) {
  const definition = await getShipmentTypeDefinitionById(params.id);

  if (!definition) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/admin/shipment-types" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        <span suppressHydrationWarning>Malzeme Kayıt Türleri Listesine Geri Dön</span>
      </Link>
      <div className="flex items-center gap-2 mb-6">
        <ListOrdered className="h-8 w-8" />
        <h1 className="text-3xl font-bold tracking-tight" suppressHydrationWarning>Malzeme Kayıt Türünü Düzenle</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle suppressHydrationWarning>Kayıt Türü Detaylarını Güncelle</CardTitle>
          <CardDescription><span suppressHydrationWarning>Malzeme kayıt türü için bilgileri değiştirin: {definition.name}.</span></CardDescription>
        </CardHeader>
        <CardContent>
          <ShipmentTypeDefinitionForm definition={definition} />
        </CardContent>
      </Card>
    </div>
  );
}
