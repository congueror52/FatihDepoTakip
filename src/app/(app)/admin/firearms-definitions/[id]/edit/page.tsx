
import { getFirearmDefinitionById } from "@/lib/actions/inventory.actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FirearmDefinitionForm } from "../../_components/firearm-definition-form";
import { Settings2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditFirearmDefinitionPage({ params }: { params: { id: string } }) {
  const definition = await getFirearmDefinitionById(params.id);

  if (!definition) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/admin/firearms-definitions" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        <span suppressHydrationWarning>Silah Tanımları Listesine Geri Dön</span>
      </Link>
      <div className="flex items-center gap-2 mb-6">
        <Settings2 className="h-8 w-8" />
        <h1 className="text-3xl font-bold tracking-tight" suppressHydrationWarning>Silah Tanımını Düzenle</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle suppressHydrationWarning>Silah Tanımı Detaylarını Güncelle</CardTitle>
          <CardDescription><span suppressHydrationWarning>Silah tanımı için bilgileri değiştirin: {definition.name} ({definition.model}).</span></CardDescription>
        </CardHeader>
        <CardContent>
          <FirearmDefinitionForm definition={definition} />
        </CardContent>
      </Card>
    </div>
  );
}
