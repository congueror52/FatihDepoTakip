
import { getFirearmById, getFirearmDefinitions } from "@/lib/actions/inventory.actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FirearmForm } from "../../_components/firearm-form";
import { Target, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditFirearmPage({ params }: { params: { id: string } }) {
  const firearm = await getFirearmById(params.id);
  const firearmDefinitions = await getFirearmDefinitions(); // Needed for the form

  if (!firearm) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link href={`/inventory/firearms/${params.id}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        <span suppressHydrationWarning>Ateşli Silah Detaylarına Geri Dön</span>
      </Link>
      <div className="flex items-center gap-2 mb-6">
        <Target className="h-8 w-8" />
        <h1 className="text-3xl font-bold tracking-tight" suppressHydrationWarning>Ateşli Silahı Düzenle</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle suppressHydrationWarning>Ateşli Silah Detaylarını Güncelle</CardTitle>
          <CardDescription><span suppressHydrationWarning>Ateşli silah için bilgileri değiştirin: {firearm.serialNumber}.</span></CardDescription>
        </CardHeader>
        <CardContent>
          <FirearmForm firearm={firearm} firearmDefinitions={firearmDefinitions} />
        </CardContent>
      </Card>
    </div>
  );
}
