
'use client';

import type { AlertDefinition, Depot } from "@/types/inventory";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Edit, Trash2, Warehouse, Globe } from "lucide-react";
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
import { deleteAlertDefinitionAction } from "@/lib/actions/inventory.actions";

interface AlertDefinitionsTableClientProps {
  definitions: AlertDefinition[];
  depots: Depot[]; // To resolve depot names
}

export function AlertDefinitionsTableClient({ definitions: initialDefinitions, depots }: AlertDefinitionsTableClientProps) {
  const [definitions, setDefinitions] = useState<AlertDefinition[]>(initialDefinitions);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDefinitionId, setSelectedDefinitionId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setDefinitions(initialDefinitions);
  }, [initialDefinitions]);

  const handleDelete = async () => {
    if (!selectedDefinitionId) return;
    try {
      await deleteAlertDefinitionAction(selectedDefinitionId);
      setDefinitions(definitions.filter(d => d.id !== selectedDefinitionId));
      toast({ variant: "success", title: "Başarılı", description: "Uyarı tanımı başarıyla silindi." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Hata", description: error.message || "Uyarı tanımı silinemedi." });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedDefinitionId(null);
    }
  };

  const openDeleteDialog = (id: string) => {
    setSelectedDefinitionId(id);
    setIsDeleteDialogOpen(true);
  };
  
  const getSeverityBadgeClasses = (severity: AlertDefinition['severity']) => {
    switch (severity) {
      case 'Yüksek': return 'bg-red-500 hover:bg-red-600';
      case 'Orta': return 'bg-yellow-500 hover:bg-yellow-600 text-black';
      case 'Düşük': return 'bg-blue-500 hover:bg-blue-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getDepotName = (depotId?: string) => {
    if (!depotId) return <span className="flex items-center gap-1 text-muted-foreground text-xs"><Globe className="h-3 w-3" /> <span suppressHydrationWarning>Tüm Depolar</span></span>;
    const depot = depots.find(d => d.id === depotId);
    return depot ? <span className="flex items-center gap-1"><Warehouse className="h-3 w-3 text-muted-foreground" /> {depot.name}</span> : depotId;
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead><span suppressHydrationWarning>Uyarı Adı</span></TableHead>
            <TableHead><span suppressHydrationWarning>Varlık Türü</span></TableHead>
            <TableHead><span suppressHydrationWarning>Koşul</span></TableHead>
            <TableHead><span suppressHydrationWarning>Depo</span></TableHead>
            <TableHead><span suppressHydrationWarning>Ciddiyet</span></TableHead>
            <TableHead className="text-center"><span suppressHydrationWarning>Aktif mi?</span></TableHead>
            <TableHead><span suppressHydrationWarning>Son Güncelleme</span></TableHead>
            <TableHead className="text-right"><span suppressHydrationWarning>Eylemler</span></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {definitions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center" suppressHydrationWarning>Uyarı tanımı bulunamadı.</TableCell>
            </TableRow>
          ) : (
            definitions.map((definition) => (
              <TableRow key={definition.id}>
                <TableCell className="font-medium">{definition.name}</TableCell>
                <TableCell>{definition.entityType}</TableCell>
                <TableCell>{definition.conditionType}</TableCell>
                <TableCell>{getDepotName(definition.depotId)}</TableCell>
                <TableCell>
                  <Badge className={getSeverityBadgeClasses(definition.severity)}>{definition.severity}</Badge>
                </TableCell>
                <TableCell className="text-center">
                  {definition.isActive ? <CheckCircle className="h-5 w-5 text-green-500 mx-auto" /> : <XCircle className="h-5 w-5 text-red-500 mx-auto" />}
                </TableCell>
                <TableCell>{new Date(definition.lastUpdated).toLocaleDateString('tr-TR')}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/alert-definitions/${definition.id}/edit`} className="flex items-center">
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
              <span suppressHydrationWarning>Bu işlem geri alınamaz. Bu, uyarı tanımını kalıcı olarak silecektir.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel><span suppressHydrationWarning>İptal</span></AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} variant="destructive">
              <span suppressHydrationWarning>Sil</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
