
'use client';

import type { Ammunition, Depot } from "@/types/inventory"; // Added Depot
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
import { Edit, Trash2 } from "lucide-react"; // Removed MoreHorizontal, DropdownMenu components
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
import { deleteAmmunitionAction } from "@/lib/actions/inventory.actions";

interface AmmunitionTableClientProps {
  ammunition: Ammunition[];
  depots: Depot[]; 
}

export function AmmunitionTableClient({ ammunition: initialAmmunition, depots }: AmmunitionTableClientProps) { 
  const [ammunitionList, setAmmunitionList] = useState<Ammunition[]>(initialAmmunition);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAmmunitionId, setSelectedAmmunitionId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!selectedAmmunitionId) return;
    try {
      await deleteAmmunitionAction(selectedAmmunitionId);
      setAmmunitionList(ammunitionList.filter(a => a.id !== selectedAmmunitionId));
      toast({ variant: "success", title: "Başarılı", description: "Mühimmat başarıyla silindi." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Hata", description: error.message || "Mühimmat silinemedi." });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedAmmunitionId(null);
    }
  };

  const openDeleteDialog = (id: string) => {
    setSelectedAmmunitionId(id);
    setIsDeleteDialogOpen(true);
  };
  
  const getStatusColor = (status: Ammunition['status']) => {
    switch (status) {
      case 'Mevcut': return 'bg-green-500 hover:bg-green-600';
      case 'Düşük Stok': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'Kritik Stok': return 'bg-orange-500 hover:bg-orange-600';
      case 'Tükenmek Üzere': return 'bg-red-500 hover:bg-red-600';
      default: return 'bg-primary';
    }
  };
  
  const getDepotName = (depotId: string) => {
    const depot = depots.find(d => d.id === depotId); 
    return depot ? depot.name : depotId;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead><span suppressHydrationWarning>Ad/Tanım</span></TableHead>
            <TableHead><span suppressHydrationWarning>Kalibre</span></TableHead>
            <TableHead><span suppressHydrationWarning>Miktar</span></TableHead>
            <TableHead><span suppressHydrationWarning>Depo</span></TableHead>
            <TableHead><span suppressHydrationWarning>Durum</span></TableHead>
            <TableHead><span suppressHydrationWarning>Lot No</span></TableHead>
            <TableHead className="text-right"><span suppressHydrationWarning>Eylemler</span></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ammunitionList.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center" suppressHydrationWarning>Mühimmat bulunamadı.</TableCell>
            </TableRow>
          ) : (
            ammunitionList.map((ammo) => (
              <TableRow key={ammo.id}>
                <TableCell className="font-medium">{ammo.name}</TableCell>
                <TableCell>{ammo.caliber}</TableCell>
                <TableCell>{ammo.quantity.toLocaleString()}</TableCell>
                <TableCell>{getDepotName(ammo.depotId)}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={`${getStatusColor(ammo.status)} text-primary-foreground`}>
                    {ammo.status}
                  </Badge>
                </TableCell>
                <TableCell>{ammo.lotNumber || '-'}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/inventory/ammunition/${ammo.id}/edit`} className="flex items-center">
                      <Edit className="mr-2 h-3 w-3" /> <span suppressHydrationWarning>Düzenle</span>
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openDeleteDialog(ammo.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/50 hover:border-destructive">
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
              <span suppressHydrationWarning>Bu işlem geri alınamaz. Bu, mühimmatı kalıcı olarak silecektir.</span>
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
