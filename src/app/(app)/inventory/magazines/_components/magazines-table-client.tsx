
'use client';

import type { Magazine } from "@/types/inventory";
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
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
import { DEPOT_LOCATIONS } from "@/types/inventory";

interface MagazinesTableClientProps {
  magazines: Magazine[];
}

export function MagazinesTableClient({ magazines: initialMagazines }: MagazinesTableClientProps) {
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
    } catch (error) {
      toast({ variant: "destructive", title: "Hata", description: "Şarjör silinemedi." });
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
    const depot = DEPOT_LOCATIONS.find(d => d.id === depotId);
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
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only" suppressHydrationWarning>Menüyü aç</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel><span suppressHydrationWarning>Eylemler</span></DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href={`/inventory/magazines/${magazine.id}/edit`} className="flex items-center">
                           <Edit className="mr-2 h-4 w-4" /> <span suppressHydrationWarning>Düzenle</span>
                         </Link>
                      </DropdownMenuItem>
                       {/* Detail page link can be added here if a detail page is created */}
                      {/* <DropdownMenuItem asChild>
                        <Link href={`/inventory/magazines/${magazine.id}`} className="flex items-center">
                          <Eye className="mr-2 h-4 w-4" /> <span suppressHydrationWarning>Detayları Görüntüle</span>
                        </Link>
                      </DropdownMenuItem> */}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => openDeleteDialog(magazine.id)} className="text-destructive flex items-center">
                        <Trash2 className="mr-2 h-4 w-4" /> <span suppressHydrationWarning>Sil</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
