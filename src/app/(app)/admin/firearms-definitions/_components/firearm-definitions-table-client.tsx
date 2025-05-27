
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
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
import { deleteFirearmDefinitionAction } from "@/lib/actions/inventory.actions";

interface FirearmDefinitionsTableClientProps {
  definitions: FirearmDefinition[];
}

export function FirearmDefinitionsTableClient({ definitions: initialDefinitions }: FirearmDefinitionsTableClientProps) {
  const [definitions, setDefinitions] = useState<FirearmDefinition[]>(initialDefinitions);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDefinitionId, setSelectedDefinitionId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!selectedDefinitionId) return;
    try {
      await deleteFirearmDefinitionAction(selectedDefinitionId);
      setDefinitions(definitions.filter(d => d.id !== selectedDefinitionId));
      toast({ variant: "success", title: "Başarılı", description: "Silah tanımı başarıyla silindi." });
    } catch (error) {
      toast({ variant: "destructive", title: "Hata", description: "Silah tanımı silinemedi. Bu tanımı kullanan envanter öğeleri olabilir." });
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
                         <Link href={`/admin/firearms-definitions/${definition.id}/edit`} className="flex items-center">
                           <Edit className="mr-2 h-4 w-4" /> <span suppressHydrationWarning>Düzenle</span>
                         </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => openDeleteDialog(definition.id)} className="text-destructive flex items-center">
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
