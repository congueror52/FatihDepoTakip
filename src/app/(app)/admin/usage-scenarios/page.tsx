
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, FileCheck2 } from "lucide-react";
import Link from "next/link";
import { getUsageScenarios } from "@/lib/actions/inventory.actions";
import { UsageScenariosTableClient } from "./_components/usage-scenarios-table-client";

export default async function UsageScenariosPage() {
  const scenarios = await getUsageScenarios();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileCheck2 className="h-8 w-8" />
          <h1 className="text-3xl font-bold tracking-tight" suppressHydrationWarning>Kullanım Senaryoları Yönetimi</h1>
        </div>
        <Link href="/admin/usage-scenarios/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> <span suppressHydrationWarning>Yeni Senaryo Ekle</span>
          </Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle suppressHydrationWarning>Tanımlı Kullanım Senaryoları</CardTitle>
          <CardDescription suppressHydrationWarning>Günlük fişek kullanım formunda otomatik kalibre seçimi için kullanılacak senaryoları yönetin.</CardDescription>
        </CardHeader>
        <CardContent>
          <UsageScenariosTableClient scenarios={scenarios} />
        </CardContent>
      </Card>
    </div>
  );
}
