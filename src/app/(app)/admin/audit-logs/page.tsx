
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { getAuditLogs } from "@/lib/actions/inventory.actions";
import { AuditLogsTableClient } from "./_components/audit-logs-table-client";

export default async function AuditLogsPage() {
  const logs = await getAuditLogs();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-8 w-8" />
          <h1 className="text-3xl font-bold tracking-tight" suppressHydrationWarning>Denetim Kayıtları</h1>
        </div>
        {/* Export button is now in the client component */}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle suppressHydrationWarning>Tüm Denetim Kayıtları</CardTitle>
          <CardDescription suppressHydrationWarning>Sistemde gerçekleştirilen tüm önemli işlemleri ve değişiklikleri takip edin.</CardDescription>
        </CardHeader>
        <CardContent>
          <AuditLogsTableClient logs={logs} />
        </CardContent>
      </Card>
    </div>
  );
}
