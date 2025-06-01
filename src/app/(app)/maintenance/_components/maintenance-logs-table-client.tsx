
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
import { Eye, Trash2 } from "lucide-react"; // Added Trash2
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react"; // Added useEffect for client-side state
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { deleteMaintenanceLogAction } from "@/lib/actions/inventory.actions"; // New action
import type { InventoryItemType } from "@/types/inventory";


interface MaintenanceLogsTableClientProps {
  logs: EnrichedMaintenanceLog[];
}

const itemTypeTranslations: Record<EnrichedMaintenanceLog['parentItemType'], string> = {
    firearm: "Silah",
    magazine: "Şarjör",
    other: "Diğer Malzeme",
};

export function MaintenanceLogsTableClient({ logs: initialLogs }: MaintenanceLogsTableClientProps) {
  const [logs, setLogs] = useState<EnrichedMaintenanceLog[]>(initialLogs);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedLogForDeletion, setSelectedLogForDeletion] = useState<{ parentItemId: string; parentItemType: InventoryItemType; logId: string } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setLogs(initialLogs);
  }, [initialLogs]);


  const getStatusColor = (status: string, itemType: EnrichedMaintenanceLog['parentItemType']) => {
    if (itemType === 'firearm' || itemType === 'magazine' || itemType === 'other') { 
        switch (status) {
            case 'Depoda': return 'bg-green-500 hover:bg-green-600';
            case 'Kullanımda': return 'bg-blue-500 hover:bg-blue-600'; 
            case 'Poligonda': return 'bg-purple-500 hover:bg-purple-600';
            case 'Destekte': return 'bg-yellow-500 hover:bg-yellow-600 text-black';
            case 'Bakımda': return 'bg-yellow-500 hover:bg-yellow-600 text-black';
            case 'Arızalı': return 'bg-red-500 hover:bg-red-600';
            case 'Depoda Arızalı': return 'bg-red-500 hover:bg-red-600';
            case 'Rapor Bekliyor': return 'bg-sky-500 hover:bg-sky-600'; 
            case 'Hizmet Dışı': return 'bg-gray-500 hover:bg-gray-600';
            default: return 'bg-gray-400 hover:bg-gray-500';
        }
    }
    return 'bg-gray-400 hover:bg-gray-500';
  };

  const getItemDetailPath = (itemType: InventoryItemType, itemId: string) => {
    switch (itemType) {
      case 'firearm': return `/inventory/firearms/${itemId}`;
      case 'magazine': return `/inventory/magazines`; // No individual detail page, go to list
      case 'other': return `/inventory/other-materials/${itemId}`;
      default: return '/maintenance'; // Fallback
    }
  };

  const handleDelete = async () => {
    if (!selectedLogForDeletion) return;
    try {
      await deleteMaintenanceLogAction(
        selectedLogForDeletion.parentItemId,
        selectedLogForDeletion.parentItemType,
        selectedLogForDeletion.logId
      );
      setLogs(logs.filter(log => log.id !== selectedLogForDeletion.logId));
      toast({ variant: "success", title: "Başarılı", description: "Bakım kaydı başarıyla silindi." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Hata", description: error.message || "Bakım kaydı silinemedi." });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedLogForDeletion(null);
    }
  };

  const openDeleteDialog = (parentItemId: string, parentItemType: InventoryItemType, logId: string) => {
    setSelectedLogForDeletion({ parentItemId, parentItemType, logId });
    setIsDeleteDialogOpen(true);
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
            <TableHead className="text-right"><span suppressHydrationWarning>Eylemler</span></TableHead>
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
                <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={getItemDetailPath(log.parentItemType, log.parentItemId)} className="flex items-center">
                            <Eye className="mr-2 h-3 w-3" /> <span suppressHydrationWarning>Öğe Detayı</span>
                        </Link>
                    </Button>
                     <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => openDeleteDialog(log.parentItemId, log.parentItemType, log.id)} 
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/50 hover:border-destructive"
                      >
                        <Trash2 className="mr-2 h-3 w-3" /> <span suppressHydrationWarning>Sil</span>
                    </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
       <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle><span suppressHydrationWarning>Emin misiniz?</span></AlertDialogTitle>
            <AlertDialogDescription>
              <span suppressHydrationWarning>Bu işlem geri alınamaz. Bu, seçili bakım kaydını kalıcı olarak silecektir. Bu işlem ana öğenin durumunu otomatik olarak değiştirmez.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel><span suppressHydrationWarning>İptal</span></AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} variant="destructive">
              <span suppressHydrationWarning>Sil</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

