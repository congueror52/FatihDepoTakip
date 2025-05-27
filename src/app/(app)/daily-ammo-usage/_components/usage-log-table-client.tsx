
'use client';

import type { AmmunitionDailyUsageLog } from "@/types/inventory";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// import { Button } from "@/components/ui/button";
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
// import { MoreHorizontal, Trash2, Pencil } from "lucide-react"; // Pencil for Edit
import { useState } from "react";
// import { useToast } from "@/hooks/use-toast";
// import { deleteAmmunitionDailyUsageLogAction } from "@/lib/actions/inventory.actions"; // Implement if needed
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface AmmunitionDailyUsageTableClientProps {
  logs: AmmunitionDailyUsageLog[];
}

export function AmmunitionDailyUsageTableClient({ logs: initialLogs }: AmmunitionDailyUsageTableClientProps) {
  const [logs, setLogs] = useState<AmmunitionDailyUsageLog[]>(initialLogs);
  // const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  // const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  // const { toast } = useToast();

  // const handleDelete = async () => {
  //   if (!selectedLogId) return;
  //   try {
  //     await deleteAmmunitionDailyUsageLogAction(selectedLogId); // Implement this action
  //     setLogs(logs.filter(log => log.id !== selectedLogId));
  //     toast({ title: "Başarılı", description: "Kullanım kaydı başarıyla silindi." });
  //   } catch (error) {
  //     toast({ variant: "destructive", title: "Hata", description: "Kullanım kaydı silinemedi." });
  //   } finally {
  //     setIsDeleteDialogOpen(false);
  //     setSelectedLogId(null);
  //   }
  // };

  // const openDeleteDialog = (id: string) => {
  //   setSelectedLogId(id);
  //   setIsDeleteDialogOpen(true);
  // };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"><span suppressHydrationWarning>Sıra</span></TableHead>
            <TableHead><span suppressHydrationWarning>Tarih</span></TableHead>
            <TableHead><span suppressHydrationWarning>Kişi Sayısı</span></TableHead>
            <TableHead><span suppressHydrationWarning>9x19mm</span></TableHead>
            <TableHead><span suppressHydrationWarning>5.56x45mm</span></TableHead>
            <TableHead><span suppressHydrationWarning>7.62x39mm</span></TableHead>
            <TableHead><span suppressHydrationWarning>7.62x51mm</span></TableHead>
            <TableHead><span suppressHydrationWarning>Notlar</span></TableHead>
            {/* <TableHead className="text-right"><span suppressHydrationWarning>Eylemler</span></TableHead> */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center" suppressHydrationWarning>Günlük fişek kullanım kaydı bulunamadı.</TableCell>
            </TableRow>
          ) : (
            logs.map((log, index) => (
              <TableRow key={log.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{format(new Date(log.date), "PPP", { locale: tr })}</TableCell>
                <TableCell>{log.personnelCount}</TableCell>
                <TableCell>{log.used_9x19mm > 0 ? log.used_9x19mm : '-'}</TableCell>
                <TableCell>{log.used_5_56x45mm > 0 ? log.used_5_56x45mm : '-'}</TableCell>
                <TableCell>{log.used_7_62x39mm > 0 ? log.used_7_62x39mm : '-'}</TableCell>
                <TableCell>{log.used_7_62x51mm > 0 ? log.used_7_62x51mm : '-'}</TableCell>
                <TableCell className="max-w-[200px] truncate">{log.notes || '-'}</TableCell>
                {/* <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only" suppressHydrationWarning>Menüyü aç</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel><span suppressHydrationWarning>Eylemler</span></DropdownMenuLabel>
                      <DropdownMenuItem disabled className="flex items-center"> <Pencil className="mr-2 h-4 w-4" /> <span suppressHydrationWarning>Düzenle (Yakında)</span></DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openDeleteDialog(log.id)} className="text-destructive flex items-center" disabled> <Trash2 className="mr-2 h-4 w-4" /> <span suppressHydrationWarning>Sil (Yakında)</span></DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell> */}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {/* AlertDialog for delete confirmation - Implement when delete action is ready
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
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              <span suppressHydrationWarning>Sil</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      */}
    </>
  );
}
