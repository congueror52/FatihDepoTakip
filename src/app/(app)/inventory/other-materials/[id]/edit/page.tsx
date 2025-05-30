
import { getOtherMaterialById, getDepots } from "@/lib/actions/inventory.actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OtherMaterialForm } from "../../_components/other-material-form";
import { Package, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditOtherMaterialPage({ params }: { params: { id: string } }) {
  const material = await getOtherMaterialById(params.id);
  const depots = await getDepots();

  if (!material) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link href={`/inventory/other-materials/${material.id}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        <span suppressHydrationWarning>Malzeme Detaylarına Geri Dön</span>
      </Link>
      <div className="flex items-center gap-2 mb-6">
        <Package className="h-8 w-8" />
        <h1 className="text-3xl font-bold tracking-tight" suppressHydrationWarning>Diğer Malzemeyi Düzenle</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle suppressHydrationWarning>Malzeme Detaylarını Güncelle</CardTitle>
          <CardDescription><span suppressHydrationWarning>Malzeme için bilgileri değiştirin: {material.name}.</span></CardDescription>
        </CardHeader>
        <CardContent>
          <OtherMaterialForm material={material} depots={depots} />
        </CardContent>
      </Card>
    </div>
  );
}
