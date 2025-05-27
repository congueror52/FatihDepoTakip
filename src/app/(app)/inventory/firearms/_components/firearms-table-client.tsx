
'use client';

import type { Firearm } from "@/types/inventory";
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
import { deleteFirearmAction } from "@/lib/actions/inventory.actions";
import { DEPOT_LOCATIONS } from "@/types/inventory";

interface FirearmsTableClientProps {
  firearms: Firearm[];
}

export function FirearmsTableClient({ firearms: initialFirearms }: FirearmsTableClientProps) {
  const [firearms, setFirearms] = useState<Firearm[]>(initialFirearms);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedFirearmId, setSelectedFirearmId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!selectedFirearmId) return;
    try {
      await deleteFirearmAction(selectedFirearmId);
      setFirearms(firearms.filter(f => f.id !== selectedFirearmId));
      toast({ variant: "success", title: "Başarılı", description: "Ateşli silah başarıyla silindi." });
    } catch (error) {
      toast({ variant: "destructive", title: "Hata", description: "Ateşli silah silinemedi." });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedFirearmId(null);
    }
  };

  const openDeleteDialog = (id: string) => {
    setSelectedFirearmId(id);
    setIsDeleteDialogOpen(true);
  };
  
  const getStatusColor = (status: Firearm['status']) => {
    switch (status) {
      case 'Hizmette': return 'bg-green-500 hover:bg-green-600';
      case 'Bakımda': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'Arızalı': return 'bg-red-500 hover:bg-red-600';
      case 'Onarım Bekliyor': return 'bg-orange-500 hover:bg-orange-600';
      case 'Onarıldı': return 'bg-blue-500 hover:bg-blue-600';
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
            <TableHead><span suppressHydrationWarning>Seri Numarası</span></TableHead>
            <TableHead><span suppressHydrationWarning>Model</span></TableHead>
            <TableHead><span suppressHydrationWarning>Kalibre</span></TableHead>
            <TableHead><span suppressHydrationWarning>Depo</span></TableHead>
            <TableHead><span suppressHydrationWarning>Durum</span></TableHead>
            <TableHead><span suppressHydrationWarning>Son Güncelleme</span></TableHead>
            <TableHead className="text-right"><span suppressHydrationWarning>Eylemler</span></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {firearms.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center" suppressHydrationWarning>Ateşli silah bulunamadı.</TableCell>
            </TableRow>
          ) : (
            firearms.map((firearm) => (
              <TableRow key={firearm.id}>
                <TableCell className="font-medium">{firearm.serialNumber}</TableCell>
                <TableCell>{firearm.model}</TableCell>
                <TableCell>{firearm.caliber}</TableCell>
                <TableCell>{getDepotName(firearm.depotId)}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={`${getStatusColor(firearm.status)} text-primary-foreground`}>
                    {firearm.status}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(firearm.lastUpdated).toLocaleDateString('tr-TR')}</TableCell>
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
                        <Link href={`/inventory/firearms/${firearm.id}`} className="flex items-center">
                          <Eye className="mr-2 h-4 w-4" /> <span suppressHydrationWarning>Detayları Görüntüle</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                         <Link href={`/inventory/firearms/${firearm.id}/edit`} className="flex items-center">
                           <Edit className="mr-2 h-4 w-4" /> <span suppressHydrationWarning>Düzenle</span>
                         </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => openDeleteDialog(firearm.id)} className="text-destructive flex items-center">
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
              <span suppressHydrationWarning>Bu işlem geri alınamaz. Bu, ateşli silahı ve ilgili tüm verileri kalıcı olarak silecektir.</span>
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
