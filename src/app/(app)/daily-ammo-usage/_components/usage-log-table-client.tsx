
'use client';

import type { AmmunitionDailyUsageLog, UsageScenario } from "@/types/inventory";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
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
import { deleteAmmunitionDailyUsageLogAction } from "@/lib/actions/inventory.actions";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface AmmunitionDailyUsageTableClientProps {
  logs: AmmunitionDailyUsageLog[];
  usageScenarios: UsageScenario[]; // For displaying scenario name if needed (optional)
}

export function AmmunitionDailyUsageTableClient({ logs: initialLogs, usageScenarios }: AmmunitionDailyUsageTableClientProps) {
  const [logs, setLogs] = useState<AmmunitionDailyUsageLog[]>(initialLogs);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setLogs(initialLogs);
  }, [initialLogs]);

  const getScenarioName = (scenarioId?: string) => {
    if (!scenarioId) return "-";
    const scenario = usageScenarios.find(s => s.id === scenarioId);
    return scenario ? scenario.name : "Bilinmeyen Senaryo";
  }

  const handleDelete = async () => {
    if (!selectedLogId) return;
    try {
      await deleteAmmunitionDailyUsageLogAction(selectedLogId);
      setLogs(logs.filter(log => log.id !== selectedLogId));
      toast({ variant: "success", title: "Başarılı", description: "Kullanım kaydı başarıyla silindi." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Hata", description: error.message || "Kullanım kaydı silinemedi." });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedLogId(null);
    }
  };

  const openDeleteDialog = (id: string) => {
    setSelectedLogId(id);
    setIsDeleteDialogOpen(true);
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"><span suppressHydrationWarning>Sıra</span></TableHead>
            <TableHead><span suppressHydrationWarning>Tarih</span></TableHead>
            <TableHead><span suppressHydrationWarning>Kişi Sayısı</span></TableHead>
            <TableHead><span suppressHydrationWarning>Senaryo</span></TableHead>
            <TableHead><span suppressHydrationWarning>9x19mm</span></TableHead>
            <TableHead><span suppressHydrationWarning>5.56x45mm</span></TableHead>
            <TableHead><span suppressHydrationWarning>7.62x39mm</span></TableHead>
            <TableHead><span suppressHydrationWarning>7.62x51mm</span></TableHead>
            <TableHead><span suppressHydrationWarning>Notlar</span></TableHead>
            <TableHead className="text-right"><span suppressHydrationWarning>Eylemler</span></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center" suppressHydrationWarning>Günlük fişek kullanım kaydı bulunamadı.</TableCell>
            </TableRow>
          ) : (
            logs.map((log, index) => (
              <TableRow key={log.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{format(new Date(log.date), "PPP", { locale: tr })}</TableCell>
                <TableCell>{log.personnelCount}</TableCell>
                <TableCell>{getScenarioName(log.usageScenarioId)}</TableCell>
                <TableCell>{log.used_9x19mm > 0 ? log.used_9x19mm : '-'}</TableCell>
                <TableCell>{log.used_5_56x45mm > 0 ? log.used_5_56x45mm : '-'}</TableCell>
                <TableCell>{log.used_7_62x39mm > 0 ? log.used_7_62x39mm : '-'}</TableCell>
                <TableCell>{log.used_7_62x51mm > 0 ? log.used_7_62x51mm : '-'}</TableCell>
                <TableCell className="max-w-[200px] truncate">{log.notes || '-'}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/daily-ammo-usage/${log.id}/edit`} className="flex items-center">
                      <Edit className="mr-2 h-3 w-3" /> <span suppressHydrationWarning>Düzenle</span>
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openDeleteDialog(log.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/50 hover:border-destructive">
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
              <span suppressHydrationWarning>Bu işlem geri alınamaz. Bu, kullanım kaydını kalıcı olarak silecektir.</span>
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
