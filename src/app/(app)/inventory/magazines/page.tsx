
'use client'; // This page uses client-side state and effects

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, ListChecks, Warehouse, ShieldX, PackageCheck, MapPin, ClipboardEdit, Info, Loader2 } from "lucide-react"; 
import Link from "next/link";
import { MagazinesTableClient } from "./_components/magazines-table-client"; 
import { getMagazines, getDepots, getFirearmDefinitions } from "@/lib/actions/inventory.actions"; 
import type { MagazineStatus, FirearmDefinition, Magazine, Depot } from "@/types/inventory"; 
import { magazineStatuses } from "./_components/magazine-form-schema";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

export const dynamic = 'force-dynamic'; 

export default function MagazinesPage() {
  const [magazines, setMagazines] = useState<Magazine[]>([]);
  const [depots, setDepots] = useState<Depot[]>([]);
  const [firearmDefinitions, setFirearmDefinitions] = useState<FirearmDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [magazinesData, depotsData, definitionsData] = await Promise.all([
          getMagazines(),
          getDepots(),
          getFirearmDefinitions()
        ]);
        setMagazines(magazinesData);
        setDepots(depotsData);
        setFirearmDefinitions(definitionsData);
      } catch (error) {
        console.error("Şarjör envanteri verileri yüklenirken hata:", error);
        toast({ variant: "destructive", title: "Hata", description: "Şarjör envanteri verileri yüklenirken bir sorun oluştu." });
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [toast]);


  const statusCounts = magazines.reduce((acc, magazine) => {
    acc[magazine.status] = (acc[magazine.status] || 0) + 1;
    return acc;
  }, {} as Record<MagazineStatus, number>);

  const summaryCards: { title: string; count: number; icon: React.ElementType; statusKey: MagazineStatus, bgColor?: string, textColor?: string, borderColor?: string }[] = [
    { title: "Depodaki Şarjörler", count: statusCounts['Depoda'] || 0, icon: Warehouse, statusKey: 'Depoda', bgColor: 'bg-green-50 dark:bg-green-900/30', textColor: 'text-green-700 dark:text-green-400', borderColor: 'border-green-200 dark:border-green-700' },
    { title: "Depoda Arızalı Şarjörler", count: statusCounts['Depoda Arızalı'] || 0, icon: ShieldX, statusKey: 'Depoda Arızalı', bgColor: 'bg-red-50 dark:bg-red-900/30', textColor: 'text-red-700 dark:text-red-400', borderColor: 'border-red-200 dark:border-red-700' },
    { title: "Desteğe Teslim Edilenler", count: statusCounts['Destekte'] || 0, icon: PackageCheck, statusKey: 'Destekte', bgColor: 'bg-yellow-50 dark:bg-yellow-900/30', textColor: 'text-yellow-700 dark:text-yellow-400', borderColor: 'border-yellow-200 dark:border-yellow-700' },
    { title: "Poligondaki Şarjörler", count: statusCounts['Poligonda'] || 0, icon: MapPin, statusKey: 'Poligonda', bgColor: 'bg-purple-50 dark:bg-purple-900/30', textColor: 'text-purple-700 dark:text-purple-400', borderColor: 'border-purple-200 dark:border-purple-700' },
    { title: "Rapor Yazılacaklar", count: statusCounts['Rapor Bekliyor'] || 0, icon: ClipboardEdit, statusKey: 'Rapor Bekliyor', bgColor: 'bg-blue-50 dark:bg-blue-900/30', textColor: 'text-blue-700 dark:text-blue-400', borderColor: 'border-blue-200 dark:border-blue-700' },
  ];

  const summaryByFirearmDefinition = firearmDefinitions.map(definition => {
    const compatibleMagazines = magazines.filter(
      (mag) => mag.compatibleFirearmDefinitionId === definition.id
    );
    const totalCount = compatibleMagazines.length;
    const statusCounts: Partial<Record<MagazineStatus, number>> = {};

    if (totalCount > 0) {
      for (const status of magazineStatuses) {
        const count = compatibleMagazines.filter(mag => mag.status === status).length;
        if (count > 0) {
          statusCounts[status] = count;
        }
      }
    }
    return {
      definition,
      totalCount,
      statusCounts,
    };
  }).filter(summary => summary.totalCount > 0);


  if (isLoading) {
    return (
        <div className="flex flex-col gap-6 items-center justify-center h-full">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground" suppressHydrationWarning>Şarjör verileri yükleniyor...</p>
        </div>
    );
  }


  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListChecks className="h-8 w-8" />
          <h1 className="text-3xl font-bold tracking-tight" suppressHydrationWarning>Şarjör Envanteri</h1>
        </div>
        <Link href="/inventory/magazines/new"> 
          <Button> 
            <PlusCircle className="mr-2 h-4 w-4" /> <span suppressHydrationWarning>Şarjör Ekle</span>
          </Button>
        </Link> 
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mb-6">
        {summaryCards.map((card) => (
          <Card key={card.statusKey} className={`${card.bgColor} ${card.borderColor}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={`text-sm font-medium ${card.textColor}`} suppressHydrationWarning>{card.title}</CardTitle>
              <card.icon className={`h-5 w-5 ${card.textColor} opacity-80`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${card.textColor} text-center`}>{card.count}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {summaryByFirearmDefinition.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Info className="h-6 w-6 text-blue-600" />
                <span suppressHydrationWarning>Silah Türüne Göre Uyumlu Şarjör Durumu</span>
            </CardTitle>
            <CardDescription suppressHydrationWarning>Her bir silah türü ile uyumlu şarjörlerin mevcut durum özeti.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {summaryByFirearmDefinition.map(summary => (
              <Card key={summary.definition.id} className="shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg" suppressHydrationWarning>{summary.definition.name} ({summary.definition.model}) Uyumlu Şarjörler</CardTitle>
                  <CardDescription suppressHydrationWarning>Kalibre: {summary.definition.caliber}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <p><strong><span suppressHydrationWarning>Toplam Uyumlu Şarjör:</span></strong> {summary.totalCount}</p>
                  {Object.entries(summary.statusCounts).map(([status, count]) => (
                    <p key={status}><span suppressHydrationWarning>{status as string}:</span> {count}</p>
                  ))}
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle suppressHydrationWarning>Tüm Şarjörler</CardTitle>
          <CardDescription suppressHydrationWarning>Envanterdeki tüm şarjörleri yönetin ve takip edin.</CardDescription>
        </CardHeader>
        <CardContent>
          <MagazinesTableClient magazines={magazines} depots={depots} />
        </CardContent>
      </Card>
    </div>
  );
}
