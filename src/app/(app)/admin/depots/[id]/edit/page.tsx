
import { getDepotById } from "@/lib/actions/inventory.actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DepotForm } from "../../_components/depot-form";
import { Warehouse, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditDepotPage({ params }: { params: { id: string } }) {
  const depot = await getDepotById(params.id);

  if (!depot) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/admin/depots" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        <span suppressHydrationWarning>Depo Tanımları Listesine Geri Dön</span>
      </Link>
      <div className="flex items-center gap-2 mb-6">
        <Warehouse className="h-8 w-8" />
        <h1 className="text-3xl font-bold tracking-tight" suppressHydrationWarning>Depo Tanımını Düzenle</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle suppressHydrationWarning>Depo Detaylarını Güncelle</CardTitle>
          <CardDescription><span suppressHydrationWarning>Depo tanımı için bilgileri değiştirin: {depot.name} (ID: {depot.id}).</span></CardDescription>
        </CardHeader>
        <CardContent>
          <DepotForm depot={depot} />
        </CardContent>
      </Card>
    </div>
  );
}
