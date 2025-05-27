
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Calculator } from "lucide-react";
import Link from "next/link";
import { getAmmunitionStandardConsumptionRates } from "@/lib/actions/inventory.actions";
import { ConsumptionRatesTableClient } from "./_components/consumption-rate-table-client";

export default async function ConsumptionRatesPage() {
  const rates = await getAmmunitionStandardConsumptionRates();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calculator className="h-8 w-8" />
          <h1 className="text-3xl font-bold tracking-tight" suppressHydrationWarning>Fişek Sarfiyat Oranları Yönetimi</h1>
        </div>
        <Link href="/admin/consumption-rates/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> <span suppressHydrationWarning>Yeni Sarfiyat Oranı Ekle</span>
          </Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle suppressHydrationWarning>Tanımlı Fişek Sarfiyat Oranları</CardTitle>
          <CardDescription suppressHydrationWarning>Günlük fişek kullanım formunda otomatik hesaplama için kullanılacak kişi başı standart sarfiyat miktarlarını yönetin.</CardDescription>
        </CardHeader>
        <CardContent>
          <ConsumptionRatesTableClient rates={rates} />
        </CardContent>
      </Card>
    </div>
  );
}
