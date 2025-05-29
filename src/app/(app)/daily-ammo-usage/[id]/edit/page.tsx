
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AmmunitionDailyUsageForm } from "../../_components/usage-log-form";
import { ClipboardList, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getUsageScenarios, getAmmunitionDailyUsageLogById } from "@/lib/actions/inventory.actions";
import { notFound } from "next/navigation";

interface EditAmmunitionDailyUsagePageProps {
  params: { id: string };
}

export default async function EditAmmunitionDailyUsagePage({ params }: EditAmmunitionDailyUsagePageProps) {
  const { id } = params;
  const usageScenarios = await getUsageScenarios();
  const logToEdit = await getAmmunitionDailyUsageLogById(id);

  if (!logToEdit) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto">
       <Link href="/daily-ammo-usage" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        <span suppressHydrationWarning>Günlük Kullanım Listesine Geri Dön</span>
      </Link>
      <div className="flex items-center gap-2 mb-6">
        <ClipboardList className="h-8 w-8" />
        <h1 className="text-3xl font-bold tracking-tight" suppressHydrationWarning>Günlük Fişek Kullanım Kaydını Düzenle</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle suppressHydrationWarning>Kullanım Detaylarını Güncelle</CardTitle>
          <CardDescription suppressHydrationWarning>
            {new Date(logToEdit.date).toLocaleDateString('tr-TR')} tarihli günlük fişek kullanım bilgilerini düzenleyin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AmmunitionDailyUsageForm usageScenarios={usageScenarios} logToEdit={logToEdit} />
        </CardContent>
      </Card>
    </div>
  );
}
