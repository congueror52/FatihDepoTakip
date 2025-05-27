
import { getAmmunitionById } from "@/lib/actions/inventory.actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AmmunitionForm } from "../../_components/ammunition-form";
import { Box, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditAmmunitionPage({ params }: { params: { id: string } }) {
  const ammunition = await getAmmunitionById(params.id);

  if (!ammunition) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/inventory/ammunition" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        <span suppressHydrationWarning>Mühimmat Listesine Geri Dön</span>
      </Link>
      <div className="flex items-center gap-2 mb-6">
        <Box className="h-8 w-8" />
        <h1 className="text-3xl font-bold tracking-tight" suppressHydrationWarning>Mühimmatı Düzenle</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle suppressHydrationWarning>Mühimmat Detaylarını Güncelle</CardTitle>
          <CardDescription><span suppressHydrationWarning>Mühimmat için bilgileri değiştirin: {ammunition.name}.</span></CardDescription>
        </CardHeader>
        <CardContent>
          <AmmunitionForm ammunition={ammunition} />
        </CardContent>
      </Card>
    </div>
  );
}
