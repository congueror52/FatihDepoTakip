import { getFirearmById } from "@/lib/actions/inventory.actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FirearmForm } from "../../_components/firearm-form";
import { Target, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditFirearmPage({ params }: { params: { id: string } }) {
  const firearm = await getFirearmById(params.id);

  if (!firearm) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link href={`/inventory/firearms/${params.id}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Firearm Details
      </Link>
      <div className="flex items-center gap-2 mb-6">
        <Target className="h-8 w-8" />
        <h1 className="text-3xl font-bold tracking-tight">Edit Firearm</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Update Firearm Details</CardTitle>
          <CardDescription>Modify the information for firearm: {firearm.serialNumber}.</CardDescription>
        </CardHeader>
        <CardContent>
          <FirearmForm firearm={firearm} />
        </CardContent>
      </Card>
    </div>
  );
}
