
'use client';

import type { Depot } from "@/types/inventory";
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
import { useState } from "react";
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
import { deleteDepotAction } from "@/lib/actions/inventory.actions";

interface DepotsTableClientProps {
  depots: Depot[];
}

export function DepotsTableClient({ depots: initialDepots }: DepotsTableClientProps) {
  const [depots, setDepots] = useState<Depot[]>(initialDepots);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDepotId, setSelectedDepotId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!selectedDepotId) return;
    try {
      await deleteDepotAction(selectedDepotId);
      setDepots(depots.filter(d => d.id !== selectedDepotId));
      toast({ variant: "success", title: "Başarılı", description: "Depo başarıyla silindi." });
    } catch (error) {
      toast({ variant: "destructive", title: "Hata", description: "Depo silinemedi. Bu depoyu kullanan envanter öğeleri olabilir." });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedDepotId(null);
    }
  };

  const openDeleteDialog = (id: string) => {
    setSelectedDepotId(id);
    setIsDeleteDialogOpen(true);
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead><span suppressHydrationWarning>Depo ID</span></TableHead>
            <TableHead><span suppressHydrationWarning>Depo Adı</span></TableHead>
            <TableHead><span suppressHydrationWarning>Adres</span></TableHead>
            <TableHead><span suppressHydrationWarning>İlgili Kişi</span></TableHead>
            <TableHead><span suppressHydrationWarning>Son Güncelleme</span></TableHead>
            <TableHead className="text-right"><span suppressHydrationWarning>Eylemler</span></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {depots.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center" suppressHydrationWarning>Depo tanımı bulunamadı.</TableCell>
            </TableRow>
          ) : (
            depots.map((depot) => (
              <TableRow key={depot.id}>
                <TableCell className="font-medium">{depot.id}</TableCell>
                <TableCell>{depot.name}</TableCell>
                <TableCell className="max-w-xs truncate">{depot.address || '-'}</TableCell>
                <TableCell>{depot.contactPerson || '-'}</TableCell>
                <TableCell>{new Date(depot.lastUpdated).toLocaleDateString('tr-TR')}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/depots/${depot.id}/edit`} className="flex items-center">
                      <Edit className="mr-2 h-3 w-3" /> <span suppressHydrationWarning>Düzenle</span>
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openDeleteDialog(depot.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/50 hover:border-destructive">
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
              <span suppressHydrationWarning>Bu işlem geri alınamaz. Bu, depo tanımını kalıcı olarak silecektir. Bu depoyu kullanan mevcut envanter öğeleri etkilenebilir.</span>
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
    </>
  );
}
