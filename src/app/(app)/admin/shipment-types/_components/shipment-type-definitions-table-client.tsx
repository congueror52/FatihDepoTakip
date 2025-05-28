
'use client';

import type { ShipmentTypeDefinition } from "@/types/inventory";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Edit, Trash2 } from "lucide-react";
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
import { deleteShipmentTypeDefinitionAction } from "@/lib/actions/inventory.actions";

interface ShipmentTypeDefinitionsTableClientProps {
  definitions: ShipmentTypeDefinition[];
}

export function ShipmentTypeDefinitionsTableClient({ definitions: initialDefinitions }: ShipmentTypeDefinitionsTableClientProps) {
  const [definitions, setDefinitions] = useState<ShipmentTypeDefinition[]>(initialDefinitions);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDefinitionId, setSelectedDefinitionId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!selectedDefinitionId) return;
    try {
      await deleteShipmentTypeDefinitionAction(selectedDefinitionId);
      setDefinitions(definitions.filter(d => d.id !== selectedDefinitionId));
      toast({ variant: "success", title: "Başarılı", description: "Malzeme kayıt türü başarıyla silindi." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Hata", description: error.message || "Malzeme kayıt türü silinemedi. Bu türü kullanan kayıtlar olabilir." });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedDefinitionId(null);
    }
  };

  const openDeleteDialog = (id: string) => {
    setSelectedDefinitionId(id);
    setIsDeleteDialogOpen(true);
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead><span suppressHydrationWarning>Tür Adı</span></TableHead>
            <TableHead><span suppressHydrationWarning>Açıklama</span></TableHead>
            <TableHead className="text-center"><span suppressHydrationWarning>Kaynak Depo Gerekli</span></TableHead>
            <TableHead className="text-center"><span suppressHydrationWarning>Hedef Depo Gerekli</span></TableHead>
            <TableHead><span suppressHydrationWarning>Son Güncelleme</span></TableHead>
            <TableHead className="text-right"><span suppressHydrationWarning>Eylemler</span></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {definitions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center" suppressHydrationWarning>Malzeme kayıt türü bulunamadı.</TableCell>
            </TableRow>
          ) : (
            definitions.map((definition) => (
              <TableRow key={definition.id}>
                <TableCell className="font-medium">{definition.name}</TableCell>
                <TableCell className="max-w-xs truncate">{definition.description || '-'}</TableCell>
                <TableCell className="text-center">
                  {definition.requiresSourceDepot ? <CheckCircle className="h-5 w-5 text-green-500 mx-auto" /> : <XCircle className="h-5 w-5 text-red-500 mx-auto" />}
                </TableCell>
                <TableCell className="text-center">
                  {definition.requiresDestinationDepot ? <CheckCircle className="h-5 w-5 text-green-500 mx-auto" /> : <XCircle className="h-5 w-5 text-red-500 mx-auto" />}
                </TableCell>
                <TableCell>{new Date(definition.lastUpdated).toLocaleDateString('tr-TR')}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/shipment-types/${definition.id}/edit`} className="flex items-center">
                      <Edit className="mr-2 h-3 w-3" /> <span suppressHydrationWarning>Düzenle</span>
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openDeleteDialog(definition.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/50 hover:border-destructive">
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
              <span suppressHydrationWarning>Bu işlem geri alınamaz. Bu, malzeme kayıt türünü kalıcı olarak silecektir. Bu türü kullanan mevcut malzeme kayıtları etkilenebilir.</span>
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
