
'use client';

import type { Magazine, Depot } from "@/types/inventory"; 
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
import { deleteMagazineAction } from "@/lib/actions/inventory.actions";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface MagazinesTableClientProps {
  magazines: Magazine[];
  depots: Depot[];
}

const FormattedTimestamp = ({ timestamp }: { timestamp: string }) => {
  const [formattedDate, setFormattedDate] = useState(timestamp); 

  useEffect(() => {
    try {
      setFormattedDate(format(new Date(timestamp), "P", { locale: tr })); 
    } catch (e) {
      console.warn("Invalid date for formatting:", timestamp);
      setFormattedDate(timestamp);
    }
  }, [timestamp]);

  return <>{formattedDate}</>;
};


export function MagazinesTableClient({ magazines: initialMagazines, depots }: MagazinesTableClientProps) {
  const [magazines, setMagazines] = useState<Magazine[]>(initialMagazines);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMagazineId, setSelectedMagazineId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setMagazines(initialMagazines);
  }, [initialMagazines]);

  const handleDelete = async () => {
    if (!selectedMagazineId) return;
    try {
      await deleteMagazineAction(selectedMagazineId);
      setMagazines(magazines.filter(m => m.id !== selectedMagazineId));
      toast({ variant: "success", title: "Başarılı", description: "Şarjör başarıyla silindi." });
    } catch (error: any) {
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
      case 'Depoda': return 'bg-green-500 hover:bg-green-600'; // Green
      case 'Poligonda': return 'bg-purple-500 hover:bg-purple-600'; // Purple
      case 'Depoda Arızalı': return 'bg-red-500 hover:bg-red-600'; // Red
      case 'Destekte': return 'bg-yellow-500 hover:bg-yellow-600'; // Yellow
      case 'Rapor Bekliyor': return 'bg-blue-500 hover:bg-blue-600'; // Blue
      default: return 'bg-gray-500 hover:bg-gray-600'; // Default/fallback
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
            <TableHead><span suppressHydrationWarning>Seri No</span></TableHead>
            <TableHead><span suppressHydrationWarning>Kalibre</span></TableHead>
            <TableHead><span suppressHydrationWarning>Kapasite</span></TableHead>
            <TableHead><span suppressHydrationWarning>Depo</span></TableHead>
            <TableHead><span suppressHydrationWarning>Durum</span></TableHead>
            <TableHead><span suppressHydrationWarning>Son Güncelleme</span></TableHead>
            <TableHead className="text-right"><span suppressHydrationWarning>Eylemler</span></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {magazines.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center" suppressHydrationWarning>Şarjör bulunamadı.</TableCell>
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
                <TableCell><FormattedTimestamp timestamp={magazine.lastUpdated} /></TableCell>
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
