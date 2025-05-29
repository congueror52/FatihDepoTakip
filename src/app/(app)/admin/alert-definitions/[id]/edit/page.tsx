
import { getAlertDefinitionById } from "@/lib/actions/inventory.actions"; // Corrected action name
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDefinitionForm } from "../../_components/alert-definition-form";
import { BellCog, ArrowLeft } from "lucide-react"; // Changed icon
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditAlertDefinitionPage({ params }: { params: { id: string } }) {
  const definition = await getAlertDefinitionById(params.id); // Corrected action name

  if (!definition) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/admin/alert-definitions" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        <span suppressHydrationWarning>Uyarı Tanımları Listesine Geri Dön</span>
      </Link>
      <div className="flex items-center gap-2 mb-6">
        <BellCog className="h-8 w-8" /> {/* Changed icon */}
        <h1 className="text-3xl font-bold tracking-tight" suppressHydrationWarning>Uyarı Tanımını Düzenle</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle suppressHydrationWarning>Tanım Detaylarını Güncelle</CardTitle>
          <CardDescription><span suppressHydrationWarning>Uyarı tanımı için bilgileri değiştirin: {definition.name}.</span></CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDefinitionForm definition={definition} />
        </CardContent>
      </Card>
    </div>
  );
}

    