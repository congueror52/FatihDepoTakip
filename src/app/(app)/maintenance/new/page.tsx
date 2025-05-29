
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MaintenanceLogForm } from "../_components/maintenance-log-form";
import { Wrench, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getFirearms, getMagazines, getFirearmDefinitions } from "@/lib/actions/inventory.actions";

export default async function NewMaintenanceLogPage() {
  const firearms = await getFirearms();
  const magazines = await getMagazines();
  const firearmDefinitions = await getFirearmDefinitions();

  return (
    <div className="max-w-2xl mx-auto">
       <Link href="/maintenance" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        <span suppressHydrationWarning>Bakım Merkezi'ne Geri Dön</span>
      </Link>
      <div className="flex items-center gap-2 mb-6">
        <Wrench className="h-8 w-8" />
        <h1 className="text-3xl font-bold tracking-tight" suppressHydrationWarning>Yeni Bakım Kaydı Ekle</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle suppressHydrationWarning>Bakım Detayları</CardTitle>
          <CardDescription suppressHydrationWarning>Bir envanter öğesi için yeni bakım kaydı bilgilerini girin.</CardDescription>
        </CardHeader>
        <CardContent>
          <MaintenanceLogForm firearms={firearms} magazines={magazines} firearmDefinitions={firearmDefinitions} />
        </CardContent>
      </Card>
    </div>
  );
}
