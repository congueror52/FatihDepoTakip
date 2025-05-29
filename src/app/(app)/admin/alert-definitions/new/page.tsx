
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDefinitionForm } from "../_components/alert-definition-form";
import { BellDot, ArrowLeft } from "lucide-react"; 
import Link from "next/link";
import { getDepots } from "@/lib/actions/inventory.actions"; // Import getDepots

export default async function NewAlertDefinitionPage() {
  const depots = await getDepots(); // Fetch depots
  return (
    <div className="max-w-2xl mx-auto">
       <Link href="/admin/alert-definitions" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        <span suppressHydrationWarning>Uyarı Tanımları Listesine Geri Dön</span>
      </Link>
      <div className="flex items-center gap-2 mb-6">
        <BellDot className="h-8 w-8" /> 
        <h1 className="text-3xl font-bold tracking-tight" suppressHydrationWarning>Yeni Uyarı Tanımı Ekle</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle suppressHydrationWarning>Uyarı Tanımı Detayları</CardTitle>
          <CardDescription suppressHydrationWarning>Yeni bir uyarı kuralı için bilgileri girin.</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDefinitionForm depots={depots} /> {/* Pass depots to the form */}
        </CardContent>
      </Card>
    </div>
  );
}
