
'use client';

import type { FirearmDefinition } from "@/types/inventory";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Download } from "lucide-react";
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
import { deleteFirearmDefinitionAction, exportFirearmDefinitionsToCsvAction } from "@/lib/actions/inventory.actions";

interface FirearmDefinitionsTableClientProps {
  definitions: FirearmDefinition[];
  onRefresh: () => Promise<void>;
}

export function FirearmDefinitionsTableClient({ definitions: initialDefinitions, onRefresh }: FirearmDefinitionsTableClientProps) {
  const [definitions, setDefinitions] = useState<FirearmDefinition[]>(initialDefinitions);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDefinitionId, setSelectedDefinitionId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setDefinitions(initialDefinitions);
  }, [initialDefinitions]);

  const handleDelete = async () => {
    if (!selectedDefinitionId) return;
    try {
      await deleteFirearmDefinitionAction(selectedDefinitionId);
      await onRefresh();
      toast({ variant: "success", title: "Başarılı", description: "Silah tanımı başarıyla silindi." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Hata", description: error.message || "Silah tanımı silinemedi. Bu tanımı kullanan envanter öğeleri olabilir." });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedDefinitionId(null);
    }
  };

  const openDeleteDialog = (id: string) => {
    setSelectedDefinitionId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleExportToCsv = async () => {
    try {
      const csvString = await exportFirearmDefinitionsToCsvAction();
      if (!csvString) {
        toast({ variant: "default", title: "Bilgi", description: "Dışa aktarılacak silah tanımı bulunmamaktadır." });
        return;
      }
      
      const BOM = "\uFEFF"; // UTF-8 Byte Order Mark for Excel
      // Prepend BOM, then sep=; for Excel compatibility
      const blob = new Blob([BOM + "sep=;\n" + csvString], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      
      if (link.download !== undefined) { 
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "silah_tanimlari.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url); // Clean up
      } else {
        // Fallback for older browsers 
        window.open('data:text/csv;charset=utf-8,' + BOM + "sep=;\n" + encodeURIComponent(csvString));
      }
      toast({ variant: "success", title: "Başarılı", description: "Silah tanımları CSV olarak dışa aktarıldı." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Hata", description: error.message || "CSV dışa aktarılırken bir hata oluştu." });
    }
  };

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={handleExportToCsv} variant="outline">
          <Download className="mr-2 h-4 w-4" /> <span suppressHydrationWarning>CSV'ye Aktar</span>
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead><span suppressHydrationWarning>Tanım Adı</span></TableHead>
            <TableHead><span suppressHydrationWarning>Model</span></TableHead>
            <TableHead><span suppressHydrationWarning>Kalibre</span></TableHead>
            <TableHead><span suppressHydrationWarning>Üretici</span></TableHead>
            <TableHead><span suppressHydrationWarning>Son Güncelleme</span></TableHead>
            <TableHead className="text-right"><span suppressHydrationWarning>Eylemler</span></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {definitions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center" suppressHydrationWarning>Silah tanımı bulunamadı.</TableCell>
            </TableRow>
          ) : (
            definitions.map((definition) => (
              <TableRow key={definition.id}>
                <TableCell className="font-medium">{definition.name}</TableCell>
                <TableCell>{definition.model}</TableCell>
                <TableCell>{definition.caliber}</TableCell>
                <TableCell>{definition.manufacturer || '-'}</TableCell>
                <TableCell>{new Date(definition.lastUpdated).toLocaleDateString('tr-TR')}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/firearms-definitions/${definition.id}/edit`} className="flex items-center">
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
              <span suppressHydrationWarning>Bu işlem geri alınamaz. Bu, silah tanımını kalıcı olarak silecektir. Bu tanımı kullanan mevcut silahlar etkilenebilir.</span>
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

