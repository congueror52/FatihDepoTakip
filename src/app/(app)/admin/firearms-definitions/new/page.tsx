
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FirearmDefinitionForm } from "../_components/firearm-definition-form";
import { Settings2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewFirearmDefinitionPage() {
  return (
    <div className="max-w-2xl mx-auto">
       <Link href="/admin/firearms-definitions" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        <span suppressHydrationWarning>Silah Tanımları Listesine Geri Dön</span>
      </Link>
      <div className="flex items-center gap-2 mb-6">
        <Settings2 className="h-8 w-8" />
        <h1 className="text-3xl font-bold tracking-tight" suppressHydrationWarning>Yeni Silah Tanımı Ekle</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle suppressHydrationWarning>Silah Tanımı Detayları</CardTitle>
          <CardDescription suppressHydrationWarning>Yeni bir silah türü için bilgileri girin.</CardDescription>
        </CardHeader>
        <CardContent>
          <FirearmDefinitionForm />
        </CardContent>
      </Card>
    </div>
  );
}
