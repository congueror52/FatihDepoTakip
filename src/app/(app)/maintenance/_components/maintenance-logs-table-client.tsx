
'use client';

import type { EnrichedMaintenanceLog } from "@/lib/actions/inventory.actions"; // Updated import
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MaintenanceLogsTableClientProps {
  logs: EnrichedMaintenanceLog[];
}

const itemTypeTranslations: Record<EnrichedMaintenanceLog['parentItemType'], string> = {
    firearm: "Silah",
    magazine: "Şarjör",
    other: "Diğer Malzeme",
};

export function MaintenanceLogsTableClient({ logs }: MaintenanceLogsTableClientProps) {

  const getStatusColor = (status: string, itemType: EnrichedMaintenanceLog['parentItemType']) => {
    if (itemType === 'firearm' || itemType === 'magazine' || itemType === 'other') { // Added 'other'
        switch (status) {
            case 'Depoda': return 'bg-green-500 hover:bg-green-600';
            case 'Kullanımda': return 'bg-blue-500 hover:bg-blue-600'; // Specific to OtherMaterial
            case 'Poligonda': return 'bg-purple-500 hover:bg-purple-600';
            case 'Destekte': return 'bg-yellow-500 hover:bg-yellow-600 text-black';
            case 'Bakımda': return 'bg-yellow-500 hover:bg-yellow-600 text-black';
            case 'Arızalı': return 'bg-red-500 hover:bg-red-600';
            case 'Depoda Arızalı': return 'bg-red-500 hover:bg-red-600';
            case 'Rapor Bekliyor': return 'bg-sky-500 hover:bg-sky-600'; // Sky blue for report pending
            case 'Hizmet Dışı': return 'bg-gray-500 hover:bg-gray-600';
            default: return 'bg-gray-400 hover:bg-gray-500';
        }
    }
    return 'bg-gray-400 hover:bg-gray-500';
  };


  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead><span suppressHydrationWarning>Tarih</span></TableHead>
            <TableHead><span suppressHydrationWarning>Öğe Türü</span></TableHead>
            <TableHead><span suppressHydrationWarning>Öğe Tanımlayıcı</span></TableHead>
            <TableHead><span suppressHydrationWarning>Açıklama</span></TableHead>
            <TableHead><span suppressHydrationWarning>Önceki Durum</span></TableHead>
            <TableHead><span suppressHydrationWarning>Yeni Durum</span></TableHead>
            <TableHead><span suppressHydrationWarning>Teknisyen</span></TableHead>
            <TableHead className="text-right"><span suppressHydrationWarning>Öğeyi Gör</span></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center" suppressHydrationWarning>Bakım kaydı bulunamadı.</TableCell>
            </TableRow>
          ) : (
            logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{format(new Date(log.date), "PPP", { locale: tr })}</TableCell>
                <TableCell>{itemTypeTranslations[log.parentItemType]}</TableCell>
                <TableCell className="font-medium">{log.parentItemIdentifier}</TableCell>
                <TableCell className="max-w-xs truncate" title={log.description}>{log.description}</TableCell>
                <TableCell>
                    <Badge variant="outline" className={`${getStatusColor(log.statusChangeFrom, log.parentItemType)} text-white dark:text-black`}>
                        {log.statusChangeFrom}
                    </Badge>
                </TableCell>
                <TableCell>
                    <Badge className={`${getStatusColor(log.statusChangeTo, log.parentItemType)} text-white dark:text-black`}>
                        {log.statusChangeTo}
                    </Badge>
                </TableCell>
                <TableCell>{log.technician || '-'}</TableCell>
                <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/inventory/${log.parentItemType === 'other' ? 'other-materials' : log.parentItemType + 's'}/${log.parentItemId}`} className="flex items-center">
                            <Eye className="mr-2 h-3 w-3" /> <span suppressHydrationWarning>Detay</span>
                        </Link>
                    </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </>
  );
}
