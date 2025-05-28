
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShipmentTypeDefinitionForm } from "../_components/shipment-type-definition-form";
import { ListOrdered, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewShipmentTypeDefinitionPage() {
  return (
    <div className="max-w-2xl mx-auto">
       <Link href="/admin/shipment-types" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        <span suppressHydrationWarning>Malzeme Kayıt Türleri Listesine Geri Dön</span>
      </Link>
      <div className="flex items-center gap-2 mb-6">
        <ListOrdered className="h-8 w-8" />
        <h1 className="text-3xl font-bold tracking-tight" suppressHydrationWarning>Yeni Malzeme Kayıt Türü Ekle</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle suppressHydrationWarning>Kayıt Türü Detayları</CardTitle>
          <CardDescription suppressHydrationWarning>Yeni bir malzeme kayıt türü için bilgileri girin.</CardDescription>
        </CardHeader>
        <CardContent>
          <ShipmentTypeDefinitionForm />
        </CardContent>
      </Card>
    </div>
  );
}
