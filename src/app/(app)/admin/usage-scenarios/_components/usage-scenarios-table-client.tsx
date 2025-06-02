
'use client';

import type { UsageScenario } from "@/types/inventory";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, ListTree, Box as BoxIcon } from "lucide-react";
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
import { deleteUsageScenarioAction } from "@/lib/actions/inventory.actions";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface UsageScenariosTableClientProps {
  scenarios: UsageScenario[];
}

export function UsageScenariosTableClient({ scenarios: initialScenarios }: UsageScenariosTableClientProps) {
  const [scenarios, setScenarios] = useState<UsageScenario[]>(initialScenarios);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setScenarios(initialScenarios);
  }, [initialScenarios]);

  const handleDelete = async () => {
    if (!selectedScenarioId) return;
    try {
      await deleteUsageScenarioAction(selectedScenarioId);
      setScenarios(scenarios.filter(s => s.id !== selectedScenarioId));
      toast({ variant: "success", title: "Başarılı", description: "Kullanım senaryosu başarıyla silindi." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Hata", description: error.message || "Kullanım senaryosu silinemedi." });
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
      {scenarios.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 p-8 border border-dashed rounded-lg text-center">
          <ListTree className="h-16 w-16 text-muted-foreground" />
          <h3 className="text-xl font-semibold text-muted-foreground" suppressHydrationWarning>Kullanım Senaryosu Bulunamadı</h3>
          <p className="text-sm text-muted-foreground" suppressHydrationWarning>Henüz tanımlanmış bir kullanım senaryosu yok. Yeni bir tane ekleyerek başlayın.</p>
          <Link href="/admin/usage-scenarios/new">
            <Button><span suppressHydrationWarning>Yeni Senaryo Ekle</span></Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {scenarios.map((scenario) => (
            <Card key={scenario.id} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                    <CardTitle className="text-xl font-semibold flex items-center gap-2">
                        <ListTree className="h-5 w-5 text-primary" /> 
                        <span suppressHydrationWarning>{scenario.name}</span>
                    </CardTitle>
                </div>
                {scenario.description && (
                  <CardDescription className="text-xs pt-1" suppressHydrationWarning>{scenario.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-3 flex-grow">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider"><span suppressHydrationWarning>Kalibre Bazlı Sarfiyatlar</span></h4>
                {scenario.consumptionRatesPerCaliber.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {scenario.consumptionRatesPerCaliber.map(rate => (
                      <Badge
                        key={rate.caliber}
                        variant="secondary"
                        className="flex items-center gap-1.5 py-1 px-2.5"
                      >
                        <BoxIcon className="h-3.5 w-3.5" />
                        <span suppressHydrationWarning>{rate.caliber}: {rate.roundsPerPerson} adet/kişi</span>
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic" suppressHydrationWarning>Bu senaryo için sarfiyat oranı tanımlanmamış.</p>
                )}
              </CardContent>
              <CardFooter className="flex justify-between items-center border-t pt-4 mt-auto">
                <p className="text-xs text-muted-foreground" suppressHydrationWarning>
                  Son Güncelleme: {format(new Date(scenario.lastUpdated), "PP", { locale: tr })}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild className="h-8">
                    <Link href={`/admin/usage-scenarios/${scenario.id}/edit`} className="flex items-center">
                      <Edit className="mr-1.5 h-3.5 w-3.5" /> <span suppressHydrationWarning>Düzenle</span>
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openDeleteDialog(scenario.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/50 hover:border-destructive h-8">
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" /> <span suppressHydrationWarning>Sil</span>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
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
