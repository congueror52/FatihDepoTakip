
'use client';

import type { Magazine, Depot } from "@/types/inventory"; // Added Depot
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
import { deleteMagazineAction } from "@/lib/actions/inventory.actions";
// import { DEPOT_LOCATIONS } from "@/types/inventory"; // Removed

interface MagazinesTableClientProps {
  magazines: Magazine[];
  depots: Depot[]; // Added depots prop
}

export function MagazinesTableClient({ magazines: initialMagazines, depots }: MagazinesTableClientProps) { // Added depots to props
  const [magazines, setMagazines] = useState<Magazine[]>(initialMagazines);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMagazineId, setSelectedMagazineId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!selectedMagazineId) return;
    try {
      await deleteMagazineAction(selectedMagazineId);
      setMagazines(magazines.filter(m => m.id !== selectedMagazineId));
      toast({ variant: "success", title: "Başarılı", description: "Şarjör başarıyla silindi." });
    } catch (error: any) { // Explicitly type error as any
      toast({ variant: "destructive", title: "Hata", description: (error as Error).message || "Şarjör silinemedi." });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedMagazineId(null);
    }
  };

  const openDeleteDialog = (id: string) => {
    setSelectedMagazineId(id);
    setIsDeleteDialogOpen(true);
  };
  
  const getStatusColor = (status: Magazine['status']) => {
    switch (status) {
      case 'Hizmette': return 'bg-green-500 hover:bg-green-600';
      case 'Bakımda': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'Arızalı': return 'bg-red-500 hover:bg-red-600';
      case 'Kayıp': return 'bg-purple-500 hover:bg-purple-600';
      case 'Hizmet Dışı': return 'bg-gray-500 hover:bg-gray-600';
      default: return 'bg-primary';
    }
  };
  
  const getDepotName = (depotId: string) => {
    const depot = depots.find(d => d.id === depotId); // Use passed depots prop
    return depot ? depot.name : depotId;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead><span suppressHydrationWarning>Ad/Tanım</span></TableHead>
            <TableHead><span suppressHydrationWarning>Seri No</span></TableHead>
            <TableHead><span suppressHydrationWarning>Kalibre</span></TableHead>
            <TableHead><span suppressHydrationWarning>Kapasite</span></TableHead>
            <TableHead><span suppressHydrationWarning>Depo</span></TableHead>
            <TableHead><span suppressHydrationWarning>Durum</span></TableHead>
            <TableHead className="text-right"><span suppressHydrationWarning>Eylemler</span></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {magazines.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center" suppressHydrationWarning>Şarjör bulunamadı.</TableCell>
            </TableRow>
          ) : (
            magazines.map((magazine) => (
              <TableRow key={magazine.id}>
                <TableCell className="font-medium">{magazine.name}</TableCell>
                <TableCell>{magazine.serialNumber || '-'}</TableCell>
                <TableCell>{magazine.caliber}</TableCell>
                <TableCell>{magazine.capacity}</TableCell>
                <TableCell>{getDepotName(magazine.depotId)}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={`${getStatusColor(magazine.status)} text-primary-foreground`}>
                    {magazine.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/inventory/magazines/${magazine.id}/edit`} className="flex items-center">
                       <Edit className="mr-2 h-3 w-3" /> <span suppressHydrationWarning>Düzenle</span>
                     </Link>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openDeleteDialog(magazine.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/50 hover:border-destructive">
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
              <span suppressHydrationWarning>Bu işlem geri alınamaz. Bu, şarjörü kalıcı olarak silecektir.</span>
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
