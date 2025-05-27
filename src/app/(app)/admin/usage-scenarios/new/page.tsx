
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UsageScenarioForm } from "../_components/usage-scenario-form";
import { FileCheck2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewUsageScenarioPage() {
  return (
    <div className="max-w-2xl mx-auto">
       <Link href="/admin/usage-scenarios" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        <span suppressHydrationWarning>Kullanım Senaryoları Listesine Geri Dön</span>
      </Link>
      <div className="flex items-center gap-2 mb-6">
        <FileCheck2 className="h-8 w-8" />
        <h1 className="text-3xl font-bold tracking-tight" suppressHydrationWarning>Yeni Kullanım Senaryosu Ekle</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle suppressHydrationWarning>Senaryo Detayları</CardTitle>
          <CardDescription suppressHydrationWarning>Yeni bir kullanım senaryosu için bilgileri ve varsayılan olarak seçilecek fişek kalibrelerini girin.</CardDescription>
        </CardHeader>
        <CardContent>
          <UsageScenarioForm />
        </CardContent>
      </Card>
    </div>
  );
}
