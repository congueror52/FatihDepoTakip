
'use client';

import type { AuditLogEntry } from "@/types/audit";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface AuditLogsTableClientProps {
  logs: AuditLogEntry[];
}

const entityTypeTranslations: Record<AuditLogEntry['entityType'], string> = {
    FirearmDefinition: "Silah Tanımı",
    Firearm: "Silah",
    Magazine: "Şarjör",
    Ammunition: "Mühimmat",
    Depot: "Depo",
    UsageScenario: "Kullanım Senaryosu",
    DailyAmmunitionUsage: "Günlük Fişek Kullanımı",
    Shipment: "Malzeme Kaydı",
    ShipmentTypeDefinition: "Malzeme Kayıt Türü",
    MaintenanceLog: "Bakım Kaydı",
    AmmunitionUsage: "Mühimmat Kullanımı", 
    AlertDefinition: "Uyarı Tanımı",
};

const actionTypeTranslations: Record<AuditLogEntry['actionType'], string> = {
    CREATE: "Oluşturma",
    UPDATE: "Güncelleme",
    DELETE: "Silme",
    LOG_USAGE: "Kullanım Kaydı",
    LOG_MAINTENANCE: "Bakım Kaydı",
};

const statusTranslations: Record<"SUCCESS" | "FAILURE", string> = {
  SUCCESS: "BAŞARILI",
  FAILURE: "BAŞARISIZ",
};

const FormattedTimestamp = ({ timestamp }: { timestamp: string }) => {
  const [formattedDate, setFormattedDate] = useState(timestamp); // Initial render with ISO string

  useEffect(() => {
    // Format the date on the client side after hydration
    setFormattedDate(format(new Date(timestamp), "PPP HH:mm:ss", { locale: tr }));
  }, [timestamp]);

  return <>{formattedDate}</>;
};


export function AuditLogsTableClient({ logs: initialLogs }: AuditLogsTableClientProps) {
  const [logs, setLogs] = useState<AuditLogEntry[]>(initialLogs);

  useEffect(() => {
    setLogs(initialLogs);
  }, [initialLogs]);

  const formatDetails = (details: any) => {
    if (!details) return '-';
    if (typeof details === 'string') return details.substring(0, 100) + (details.length > 100 ? '...' : '');
    // Attempt to get a name or id like property for a summary
    const name = details.name || details.id || details.serialNumber;
    if (name) return String(name).substring(0, 50) + (String(name).length > 50 ? '...' : '');
    return JSON.stringify(details).substring(0, 100) + (JSON.stringify(details).length > 100 ? '...' : '');
  };
  
  const getStatusBadgeVariant = (status: "SUCCESS" | "FAILURE") => {
    return status === "SUCCESS" ? "default" : "destructive";
  };

  const getStatusBadgeClasses = (status: "SUCCESS" | "FAILURE") => {
    return status === "SUCCESS" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600";
  };

  const exportToCsv = () => {
    const headers = [
      "Zaman Damgası", 
      "Aktör ID", 
      "Aktör Adı", 
      "Eylem Türü", 
      "Varlık Türü", 
      "Varlık ID", 
      "Durum", 
      "Detaylar", 
      "Hata Mesajı"
    ];
    
    const rows = logs.map(log => [
      format(new Date(log.timestamp), "yyyy-MM-dd HH:mm:ss", { locale: tr }), // For CSV, consistent formatting is fine
      log.actor.id,
      log.actor.name,
      actionTypeTranslations[log.actionType] || log.actionType,
      entityTypeTranslations[log.entityType] || log.entityType,
      log.entityId || '-',
      statusTranslations[log.status] || log.status, // Use Turkish translation for CSV as well
      log.details ? JSON.stringify(log.details) : '-', // Full details for CSV
      log.errorMessage || '-'
    ]);

    // Construct the CSV data string
    const csvData = [
      headers.join(";"), 
      ...rows.map(row => 
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(";") 
      )
    ].join("\n");

    // Prepend "sep=;" for Excel to correctly interpret semicolons as separators
    const csvPayload = "sep=;\n" + csvData;

    const dataUri = "data:text/csv;charset=utf-8," + encodeURIComponent(csvPayload);

    const link = document.createElement("a");
    link.setAttribute("href", dataUri);
    link.setAttribute("download", "denetim_kayitlari.csv");
    document.body.appendChild(link); 
    link.click();
    document.body.removeChild(link);
  };


  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={exportToCsv}>
          <Download className="mr-2 h-4 w-4" /> <span suppressHydrationWarning>Excel'e Aktar (CSV)</span>
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead><span suppressHydrationWarning>Zaman Damgası</span></TableHead>
            <TableHead><span suppressHydrationWarning>Aktör</span></TableHead>
            <TableHead><span suppressHydrationWarning>Eylem</span></TableHead>
            <TableHead><span suppressHydrationWarning>Varlık Türü</span></TableHead>
            <TableHead><span suppressHydrationWarning>Varlık ID</span></TableHead>
            <TableHead><span suppressHydrationWarning>Durum</span></TableHead>
            <TableHead><span suppressHydrationWarning>Detaylar (Özet)</span></TableHead>
            <TableHead><span suppressHydrationWarning>Hata</span></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center" suppressHydrationWarning>Denetim kaydı bulunamadı.</TableCell>
            </TableRow>
          ) : (
            logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell><FormattedTimestamp timestamp={log.timestamp} /></TableCell>
                <TableCell>{log.actor.name} ({log.actor.id})</TableCell>
                <TableCell>{actionTypeTranslations[log.actionType] || log.actionType}</TableCell>
                <TableCell>{entityTypeTranslations[log.entityType] || log.entityType}</TableCell>
                <TableCell className="truncate max-w-[100px]">{log.entityId || '-'}</TableCell>
                <TableCell>
                  <Badge className={getStatusBadgeClasses(log.status)}>{statusTranslations[log.status] || log.status}</Badge>
                </TableCell>
                <TableCell className="max-w-xs truncate" title={log.details ? JSON.stringify(log.details) : ''}>
                    {formatDetails(log.details)}
                </TableCell>
                 <TableCell className="max-w-xs truncate text-destructive" title={log.errorMessage}>
                    {log.errorMessage || '-'}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </>
  );
}
