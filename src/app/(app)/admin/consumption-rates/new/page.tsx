
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AmmunitionStandardConsumptionRateForm } from "../_components/consumption-rate-form";
import { Calculator, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewConsumptionRatePage() {
  return (
    <div className="max-w-2xl mx-auto">
       <Link href="/admin/consumption-rates" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        <span suppressHydrationWarning>Fişek Sarfiyat Oranları Listesine Geri Dön</span>
      </Link>
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="h-8 w-8" />
        <h1 className="text-3xl font-bold tracking-tight" suppressHydrationWarning>Yeni Fişek Sarfiyat Oranı Ekle</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle suppressHydrationWarning>Sarfiyat Oranı Detayları</CardTitle>
          <CardDescription suppressHydrationWarning>Belirli bir fişek kalibresi için kişi başı standart sarfiyat miktarını girin.</CardDescription>
        </CardHeader>
        <CardContent>
          <AmmunitionStandardConsumptionRateForm />
        </CardContent>
      </Card>
    </div>
  );
}
