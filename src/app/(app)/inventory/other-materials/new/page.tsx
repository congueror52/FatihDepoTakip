
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OtherMaterialForm } from "../_components/other-material-form";
import { Package, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getDepots } from "@/lib/actions/inventory.actions";

export default async function NewOtherMaterialPage() {
  const depots = await getDepots();

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/inventory/other-materials" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        <span suppressHydrationWarning>Diğer Malzemeler Listesine Geri Dön</span>
      </Link>
      <div className="flex items-center gap-2 mb-6">
        <Package className="h-8 w-8" />
        <h1 className="text-3xl font-bold tracking-tight" suppressHydrationWarning>Yeni Diğer Malzeme Ekle</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle suppressHydrationWarning>Malzeme Detayları</CardTitle>
          <CardDescription suppressHydrationWarning>Yeni diğer malzeme için bilgileri girin.</CardDescription>
        </CardHeader>
        <CardContent>
          <OtherMaterialForm depots={depots} />
        </CardContent>
      </Card>
    </div>
  );
}
