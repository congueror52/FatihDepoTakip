
'use client';

import type { Shipment, Depot, ShipmentTypeDefinition } from "@/types/inventory";
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
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
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
import { deleteShipmentAction } from "@/lib/actions/inventory.actions";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface ShipmentsTableClientProps {
  shipments: Shipment[];
  depots: Depot[];
  shipmentTypeDefs: ShipmentTypeDefinition[];
}

export function ShipmentsTableClient({ shipments: initialShipments, depots, shipmentTypeDefs }: ShipmentsTableClientProps) {
  const [shipments, setShipments] = useState<Shipment[]>(initialShipments);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedShipmentId, setSelectedShipmentId] = useState<string | null>(null);
  const { toast } = useToast();

  const getDepotName = (depotId?: string) => {
    if (!depotId) return '-';
    const depot = depots.find(d => d.id === depotId);
    return depot ? depot.name : depotId;
  };

  const getShipmentTypeName = (typeId: string) => {
    const typeDef = shipmentTypeDefs.find(t => t.id === typeId);
    return typeDef ? typeDef.name : "Bilinmeyen Tür";
  }

  const handleDelete = async () => {
    if (!selectedShipmentId) return;
    try {
      await deleteShipmentAction(selectedShipmentId);
      setShipments(shipments.filter(s => s.id !== selectedShipmentId));
      toast({ variant: "success", title: "Başarılı", description: "Malzeme kaydı başarıyla silindi." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Hata", description: error.message || "Malzeme kaydı silinemedi." });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedShipmentId(null);
    }
  };

  const openDeleteDialog = (id: string) => {
    setSelectedShipmentId(id);
    setIsDeleteDialogOpen(true);
  };
  
  const getTypeColor = (typeName: string) => {
    // Color logic can be expanded if ShipmentTypeDefinition gets a color property
    if (typeName.includes("Gelen") || typeName.includes("Devreden")) return 'bg-green-500 hover:bg-green-600';
    if (typeName.includes("Giden")) return 'bg-red-500 hover:bg-red-600';
    if (typeName.includes("Transfer")) return 'bg-blue-500 hover:bg-blue-600';
    return 'bg-primary';
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead><span suppressHydrationWarning>Kayıt ID</span></TableHead>
            <TableHead><span suppressHydrationWarning>Tarih</span></TableHead>
            <TableHead><span suppressHydrationWarning>Tür</span></TableHead>
            <TableHead><span suppressHydrationWarning>Kaynak Depo</span></TableHead>
            <TableHead><span suppressHydrationWarning>Hedef Depo</span></TableHead>
            <TableHead><span suppressHydrationWarning>Öğe Sayısı</span></TableHead>
            <TableHead><span suppressHydrationWarning>Notlar</span></TableHead>
            <TableHead className="text-right"><span suppressHydrationWarning>Eylemler</span></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shipments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center" suppressHydrationWarning>Malzeme kaydı bulunamadı.</TableCell>
            </TableRow>
          ) : (
            shipments.map((shipment) => {
              const shipmentTypeName = getShipmentTypeName(shipment.typeId);
              return (
                <TableRow key={shipment.id}>
                  <TableCell className="font-medium">{shipment.id.substring(0,8)}...</TableCell>
                  <TableCell>{format(new Date(shipment.date), "PPP", { locale: tr })}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`${getTypeColor(shipmentTypeName)} text-primary-foreground`}>
                      {shipmentTypeName}
                    </Badge>
                  </TableCell>
                  <TableCell>{getDepotName(shipment.sourceDepotId)}</TableCell>
                  <TableCell>{getDepotName(shipment.destinationDepotId)}</TableCell>
                  <TableCell>{shipment.items.length}</TableCell>
                  <TableCell className="max-w-xs truncate">{shipment.notes || '-'}</TableCell>
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
                          <Link href={`/shipments/${shipment.id}/edit`} className="flex items-center">
                             <Edit className="mr-2 h-4 w-4" /> <span suppressHydrationWarning>Düzenle</span>
                           </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => openDeleteDialog(shipment.id)} className="text-destructive flex items-center">
                          <Trash2 className="mr-2 h-4 w-4" /> <span suppressHydrationWarning>Sil</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle><span suppressHydrationWarning>Emin misiniz?</span></AlertDialogTitle>
            <AlertDialogDescription>
              <span suppressHydrationWarning>Bu işlem geri alınamaz. Bu, malzeme kaydını kalıcı olarak silecektir.</span>
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
