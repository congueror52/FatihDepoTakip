
'use client';

import type { OtherMaterial, Depot } from "@/types/inventory";
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
import { Edit, Trash2, Eye } from "lucide-react";
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
import { deleteOtherMaterialAction } from "@/lib/actions/inventory.actions";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface OtherMaterialsTableClientProps {
  materials: OtherMaterial[];
  depots: Depot[];
}

const FormattedTimestamp = ({ timestamp }: { timestamp: string }) => {
  const [formattedDate, setFormattedDate] = useState(timestamp);

  useEffect(() => {
    try {
      setFormattedDate(format(new Date(timestamp), "P", { locale: tr }));
    } catch (e) {
      console.warn("Invalid date for formatting:", timestamp);
      setFormattedDate(timestamp); // Fallback to original if formatting fails
    }
  }, [timestamp]);

  return <>{formattedDate}</>;
};

export function OtherMaterialsTableClient({ materials: initialMaterials, depots }: OtherMaterialsTableClientProps) {
  const [materials, setMaterials] = useState<OtherMaterial[]>(initialMaterials);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setMaterials(initialMaterials);
  }, [initialMaterials]);

  const handleDelete = async () => {
    if (!selectedMaterialId) return;
    try {
      await deleteOtherMaterialAction(selectedMaterialId);
      setMaterials(materials.filter(m => m.id !== selectedMaterialId));
      toast({ variant: "success", title: "Başarılı", description: "Malzeme başarıyla silindi." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Hata", description: error.message || "Malzeme silinemedi." });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedMaterialId(null);
    }
  };

  const openDeleteDialog = (id: string) => {
    setSelectedMaterialId(id);
    setIsDeleteDialogOpen(true);
  };

  const getStatusColor = (status: OtherMaterial['status']) => {
    switch (status) {
      case 'Depoda': return 'bg-green-500 hover:bg-green-600';
      case 'Kullanımda': return 'bg-blue-500 hover:bg-blue-600';
      case 'Arızalı': return 'bg-red-500 hover:bg-red-600';
      case 'Bakımda': return 'bg-yellow-500 hover:bg-yellow-600 text-black';
      case 'Hizmet Dışı': return 'bg-gray-500 hover:bg-gray-600';
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
            <TableHead><span suppressHydrationWarning>Kategori</span></TableHead>
            <TableHead><span suppressHydrationWarning>Miktar</span></TableHead>
            <TableHead><span suppressHydrationWarning>Depo</span></TableHead>
            <TableHead><span suppressHydrationWarning>Durum</span></TableHead>
            <TableHead><span suppressHydrationWarning>Son Güncelleme</span></TableHead>
            <TableHead className="text-right"><span suppressHydrationWarning>Eylemler</span></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {materials.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center" suppressHydrationWarning>Diğer malzeme bulunamadı.</TableCell>
            </TableRow>
          ) : (
            materials.map((material) => (
              <TableRow key={material.id}>
                <TableCell className="font-medium">{material.name}</TableCell>
                <TableCell>{material.category || '-'}</TableCell>
                <TableCell>{material.quantity}</TableCell>
                <TableCell>{getDepotName(material.depotId)}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={`${getStatusColor(material.status)} text-primary-foreground`}>
                    {material.status}
                  </Badge>
                </TableCell>
                <TableCell><FormattedTimestamp timestamp={material.lastUpdated} /></TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/inventory/other-materials/${material.id}`} className="flex items-center">
                      <Eye className="mr-2 h-3 w-3" /> <span suppressHydrationWarning>Detay</span>
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/inventory/other-materials/${material.id}/edit`} className="flex items-center">
                       <Edit className="mr-2 h-3 w-3" /> <span suppressHydrationWarning>Düzenle</span>
                     </Link>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openDeleteDialog(material.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/50 hover:border-destructive">
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
              <span suppressHydrationWarning>Bu işlem geri alınamaz. Bu, malzemeyi kalıcı olarak silecektir.</span>
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
