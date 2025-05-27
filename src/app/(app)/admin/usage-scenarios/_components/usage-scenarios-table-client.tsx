
'use client';

import type { UsageScenario } from "@/types/inventory";
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
import { Edit, Trash2 } from "lucide-react";
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
import { deleteUsageScenarioAction } from "@/lib/actions/inventory.actions";

interface UsageScenariosTableClientProps {
  scenarios: UsageScenario[];
}

export function UsageScenariosTableClient({ scenarios: initialScenarios }: UsageScenariosTableClientProps) {
  const [scenarios, setScenarios] = useState<UsageScenario[]>(initialScenarios);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!selectedScenarioId) return;
    try {
      await deleteUsageScenarioAction(selectedScenarioId);
      setScenarios(scenarios.filter(s => s.id !== selectedScenarioId));
      toast({ variant: "success", title: "Başarılı", description: "Kullanım senaryosu başarıyla silindi." });
    } catch (error) {
      toast({ variant: "destructive", title: "Hata", description: "Kullanım senaryosu silinemedi." });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedScenarioId(null);
    }
  };

  const openDeleteDialog = (id: string) => {
    setSelectedScenarioId(id);
    setIsDeleteDialogOpen(true);
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead><span suppressHydrationWarning>Senaryo Adı</span></TableHead>
            <TableHead><span suppressHydrationWarning>Tanımlı Kalibreler ve Kişi Başı Sarfiyatları</span></TableHead>
            <TableHead><span suppressHydrationWarning>Son Güncelleme</span></TableHead>
            <TableHead className="text-right"><span suppressHydrationWarning>Eylemler</span></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {scenarios.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center" suppressHydrationWarning>Kullanım senaryosu bulunamadı.</TableCell>
            </TableRow>
          ) : (
            scenarios.map((scenario) => (
              <TableRow key={scenario.id}>
                <TableCell className="font-medium">{scenario.name}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {scenario.consumptionRatesPerCaliber.length > 0 ? (
                      scenario.consumptionRatesPerCaliber.map(rate => (
                        <Badge key={rate.caliber} variant="secondary" className="text-xs">
                          {rate.caliber}: {rate.roundsPerPerson} <span suppressHydrationWarning>adet/kişi</span>
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground" suppressHydrationWarning>Sarfiyat oranı tanımlanmamış</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>{new Date(scenario.lastUpdated).toLocaleDateString('tr-TR')}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/usage-scenarios/${scenario.id}/edit`} className="flex items-center">
                      <Edit className="mr-2 h-3 w-3" /> <span suppressHydrationWarning>Düzenle</span>
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openDeleteDialog(scenario.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/50 hover:border-destructive">
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
              <span suppressHydrationWarning>Bu işlem geri alınamaz. Bu, kullanım senaryosunu kalıcı olarak silecektir.</span>
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
