
import { getFirearmById, getFirearmDefinitions, getDepots } from "@/lib/actions/inventory.actions"; // Added getDepots
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FirearmForm } from "../../_components/firearm-form";
import { Target, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditFirearmPage({ params }: { params: { id: string } }) {
  const firearm = await getFirearmById(params.id);
  const firearmDefinitions = await getFirearmDefinitions(); 
  const depots = await getDepots(); // Fetch depots

  if (!firearm) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link href={`/inventory/firearms/${params.id}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        <span suppressHydrationWarning>Silah Detaylarına Geri Dön</span>
      </Link>
      <div className="flex items-center gap-2 mb-6">
        <Target className="h-8 w-8" />
        <h1 className="text-3xl font-bold tracking-tight" suppressHydrationWarning>Silahı Düzenle</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle suppressHydrationWarning>Silah Detaylarını Güncelle</CardTitle>
          <CardDescription><span suppressHydrationWarning>Silah için bilgileri değiştirin: {firearm.serialNumber}.</span></CardDescription>
        </CardHeader>
        <CardContent>
          <FirearmForm firearm={firearm} firearmDefinitions={firearmDefinitions} depots={depots} /> {/* Pass depots to the form */}
        </CardContent>
      </Card>
    </div>
  );
}
