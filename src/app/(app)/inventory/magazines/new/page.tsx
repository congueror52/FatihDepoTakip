
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MagazineForm } from "../_components/magazine-form";
import { ListChecks, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewMagazinePage() {
  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/inventory/magazines" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        <span suppressHydrationWarning>Şarjör Listesine Geri Dön</span>
      </Link>
      <div className="flex items-center gap-2 mb-6">
        <ListChecks className="h-8 w-8" />
        <h1 className="text-3xl font-bold tracking-tight" suppressHydrationWarning>Yeni Şarjör Ekle</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle suppressHydrationWarning>Şarjör Detayları</CardTitle>
          <CardDescription suppressHydrationWarning>Yeni şarjör için bilgileri girin.</CardDescription>
        </CardHeader>
        <CardContent>
          <MagazineForm />
        </CardContent>
      </Card>
    </div>
  );
}
