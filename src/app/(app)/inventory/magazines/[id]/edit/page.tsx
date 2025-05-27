
import { getMagazineById } from "@/lib/actions/inventory.actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MagazineForm } from "../../_components/magazine-form";
import { ListChecks, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditMagazinePage({ params }: { params: { id: string } }) {
  const magazine = await getMagazineById(params.id);

  if (!magazine) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/inventory/magazines" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        <span suppressHydrationWarning>Şarjör Listesine Geri Dön</span>
      </Link>
      <div className="flex items-center gap-2 mb-6">
        <ListChecks className="h-8 w-8" />
        <h1 className="text-3xl font-bold tracking-tight" suppressHydrationWarning>Şarjörü Düzenle</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle suppressHydrationWarning>Şarjör Detaylarını Güncelle</CardTitle>
          <CardDescription><span suppressHydrationWarning>Şarjör için bilgileri değiştirin: {magazine.name}.</span></CardDescription>
        </CardHeader>
        <CardContent>
          <MagazineForm magazine={magazine} />
        </CardContent>
      </Card>
    </div>
  );
}
