
'use client';

import type { AmmunitionStandardConsumptionRate } from "@/types/inventory";
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
import { deleteAmmunitionStandardConsumptionRateAction } from "@/lib/actions/inventory.actions";

interface ConsumptionRatesTableClientProps {
  rates: AmmunitionStandardConsumptionRate[];
}

export function ConsumptionRatesTableClient({ rates: initialRates }: ConsumptionRatesTableClientProps) {
  const [rates, setRates] = useState<AmmunitionStandardConsumptionRate[]>(initialRates);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRateId, setSelectedRateId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!selectedRateId) return;
    try {
      await deleteAmmunitionStandardConsumptionRateAction(selectedRateId);
      setRates(rates.filter(r => r.id !== selectedRateId));
      toast({ title: "Başarılı", description: "Fişek sarfiyat oranı başarıyla silindi." });
    } catch (error) {
      toast({ variant: "destructive", title: "Hata", description: "Fişek sarfiyat oranı silinemedi." });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedRateId(null);
    }
  };

  const openDeleteDialog = (id: string) => {
    setSelectedRateId(id);
    setIsDeleteDialogOpen(true);
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead><span suppressHydrationWarning>Kalibre</span></TableHead>
            <TableHead><span suppressHydrationWarning>Kişi Başı Fişek Adedi</span></TableHead>
            <TableHead><span suppressHydrationWarning>Son Güncelleme</span></TableHead>
            <TableHead className="text-right"><span suppressHydrationWarning>Eylemler</span></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rates.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center" suppressHydrationWarning>Fişek sarfiyat oranı bulunamadı.</TableCell>
            </TableRow>
          ) : (
            rates.map((rate) => (
              <TableRow key={rate.id}>
                <TableCell className="font-medium">{rate.caliber}</TableCell>
                <TableCell>{rate.roundsPerPerson}</TableCell>
                <TableCell>{new Date(rate.lastUpdated).toLocaleDateString('tr-TR')}</TableCell>
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
                         <Link href={`/admin/consumption-rates/${rate.id}/edit`} className="flex items-center">
                           <Edit className="mr-2 h-4 w-4" /> <span suppressHydrationWarning>Düzenle</span>
                         </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => openDeleteDialog(rate.id)} className="text-destructive flex items-center">
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
              <span suppressHydrationWarning>Bu işlem geri alınamaz. Bu, fişek sarfiyat oranını kalıcı olarak silecektir.</span>
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
