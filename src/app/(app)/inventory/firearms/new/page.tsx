
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FirearmForm } from "../_components/firearm-form";
import { Target } from "lucide-react";
import { getFirearmDefinitions, getDepots } from "@/lib/actions/inventory.actions"; // Added getDepots

export default async function NewFirearmPage() {
  const firearmDefinitions = await getFirearmDefinitions();
  const depots = await getDepots(); // Fetch depots

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Target className="h-8 w-8" />
        <h1 className="text-3xl font-bold tracking-tight" suppressHydrationWarning>Yeni Silah Ekle</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle suppressHydrationWarning>Silah Detayları</CardTitle>
          <CardDescription suppressHydrationWarning>Yeni silah için bir tür seçin ve bilgileri girin.</CardDescription>
        </CardHeader>
        <CardContent>
          <FirearmForm firearmDefinitions={firearmDefinitions} depots={depots} /> {/* Pass depots to the form */}
        </CardContent>
      </Card>
    </div>
  );
}
