
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Wrench, History } from "lucide-react";
import Link from "next/link";
import { getAllMaintenanceLogs } from "@/lib/actions/inventory.actions";
import { MaintenanceLogsTableClient } from "./_components/maintenance-logs-table-client";

export default async function MaintenancePage() {
  const allMaintenanceLogs = await getAllMaintenanceLogs();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wrench className="h-8 w-8" />
          <h1 className="text-3xl font-bold tracking-tight" suppressHydrationWarning>Bakım Merkezi</h1>
        </div>
        <Link href="/maintenance/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> <span suppressHydrationWarning>Bakım Kaydı Ekle</span>
          </Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" /> 
            <span suppressHydrationWarning>Tüm Bakım Faaliyetleri</span>
          </CardTitle>
          <CardDescription suppressHydrationWarning>
            Sistemdeki tüm envanter öğeleri için kaydedilmiş bakım geçmişini görüntüleyin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {allMaintenanceLogs.length > 0 ? (
            <MaintenanceLogsTableClient logs={allMaintenanceLogs} />
          ) : (
            <div className="mt-4 p-4 border border-dashed rounded-md text-center text-muted-foreground">
              <Wrench className="mx-auto h-12 w-12 mb-2" />
              <p suppressHydrationWarning>Henüz herhangi bir bakım kaydı bulunmamaktadır.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

