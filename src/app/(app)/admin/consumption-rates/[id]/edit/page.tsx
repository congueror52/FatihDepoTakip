
import { getAmmunitionStandardConsumptionRateById } from "@/lib/actions/inventory.actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AmmunitionStandardConsumptionRateForm } from "../../_components/consumption-rate-form";
import { Calculator, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditConsumptionRatePage({ params }: { params: { id: string } }) {
  const rate = await getAmmunitionStandardConsumptionRateById(params.id);

  if (!rate) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/admin/consumption-rates" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        <span suppressHydrationWarning>Fişek Sarfiyat Oranları Listesine Geri Dön</span>
      </Link>
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="h-8 w-8" />
        <h1 className="text-3xl font-bold tracking-tight" suppressHydrationWarning>Fişek Sarfiyat Oranını Düzenle</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle suppressHydrationWarning>Sarfiyat Oranı Detaylarını Güncelle</CardTitle>
          <CardDescription><span suppressHydrationWarning>Fişek sarfiyat oranını değiştirin: {rate.caliber}.</span></CardDescription>
        </CardHeader>
        <CardContent>
          <AmmunitionStandardConsumptionRateForm rate={rate} />
        </CardContent>
      </Card>
    </div>
  );
}
