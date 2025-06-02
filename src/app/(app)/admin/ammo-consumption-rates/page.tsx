
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConsumptionRatesForm } from "./_components/consumption-rates-form";
import { Calculator, Settings } from "lucide-react";
import { getAmmunitionStandardConsumptionRates } from "@/lib/actions/inventory.actions";
import type { AmmunitionStandardConsumptionRate } from "@/types/inventory";
import { SUPPORTED_CALIBERS } from "@/types/inventory";

export default async function AmmoConsumptionRatesPage() {
  const existingRates = await getAmmunitionStandardConsumptionRates();

  // Ensure all supported calibers have an entry, default to 0 if not present
  const initialRatesWithDefaults: AmmunitionStandardConsumptionRate[] = SUPPORTED_CALIBERS.map(caliber => {
    const foundRate = existingRates.find(r => r.caliber === caliber);
    return foundRate || { caliber, roundsPerPerson: 0 };
  });


  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="h-6 w-6 text-muted-foreground" />
        <span className="text-sm text-muted-foreground" suppressHydrationWarning>Yönetim Paneli</span>
        <span className="text-sm text-muted-foreground">/</span>
        <Calculator className="h-6 w-6" />
        <h1 className="text-2xl font-semibold tracking-tight" suppressHydrationWarning>Fişek Sarfiyat Standartları</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle suppressHydrationWarning>Standart Kişi Başı Fişek Sarfiyat Oranları</CardTitle>
          <CardDescription suppressHydrationWarning>
            Her bir kalibre için, bir personelin standart bir angajman veya eğitimde ortalama ne kadar fişek tüketeceğini tanımlayın.
            Bu oranlar, dashboard'daki mühimmat yeterlilik tahminleri için kullanılacaktır.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ConsumptionRatesForm initialRates={initialRatesWithDefaults} />
        </CardContent>
      </Card>
    </div>
  );
}
