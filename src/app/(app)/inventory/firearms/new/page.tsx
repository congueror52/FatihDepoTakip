import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FirearmForm } from "../_components/firearm-form";
import { Target } from "lucide-react";

export default function NewFirearmPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Target className="h-8 w-8" />
        <h1 className="text-3xl font-bold tracking-tight" suppressHydrationWarning>Yeni Ateşli Silah Ekle</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle suppressHydrationWarning>Ateşli Silah Detayları</CardTitle>
          <CardDescription suppressHydrationWarning>Yeni ateşli silah için bilgileri girin.</CardDescription>
        </CardHeader>
        <CardContent>
          <FirearmForm />
        </CardContent>
      </Card>
    </div>
  );
}
