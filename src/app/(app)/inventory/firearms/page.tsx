
'use client'; 

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PlusCircle, Target, ShieldX, Warehouse, MapPin, FileText, PackageCheck, ClipboardEdit, Info, Download } from "lucide-react"; 
import Link from "next/link";
import { getFirearms, getFirearmDefinitions, getDepots } from "@/lib/actions/inventory.actions"; 
import { FirearmsTableClient } from "./_components/firearms-table-client";
import type { FirearmStatus, Firearm, Depot, FirearmDefinition } from "@/types/inventory";
import { firearmStatuses } from "./_components/firearm-form-schema"; 
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function FirearmsPage() {
  const [firearms, setFirearms] = useState<Firearm[]>([]);
  const [firearmDefinitions, setFirearmDefinitions] = useState<FirearmDefinition[]>([]);
  const [depots, setDepots] = useState<Depot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [firearmsData, definitionsData, depotsData] = await Promise.all([
        getFirearms(),
        getFirearmDefinitions(),
        getDepots()
      ]);
      setFirearms(firearmsData);
      setFirearmDefinitions(definitionsData);
      setDepots(depotsData);
    } catch (error) {
      console.error("Veri yüklenirken hata:", error);
      toast({ variant: "destructive", title: "Hata", description: "Silah envanteri verileri yüklenirken bir sorun oluştu." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const statusCounts = firearms.reduce((acc, firearm) => {
    acc[firearm.status] = (acc[firearm.status] || 0) + 1;
    return acc;
  }, {} as Record<FirearmStatus, number>);

  const summaryCards: { title: string; count: number; icon: React.ElementType; statusKey: FirearmStatus, bgColor?: string, textColor?: string, borderColor?: string }[] = [
    { title: "Depodaki Silahlar", count: statusCounts['Depoda'] || 0, icon: Warehouse, statusKey: 'Depoda', bgColor: 'bg-green-50 dark:bg-green-900/30', textColor: 'text-green-700 dark:text-green-400', borderColor: 'border-green-200 dark:border-green-700' },
    { title: "Depoda Arızalı Silahlar", count: statusCounts['Depoda Arızalı'] || 0, icon: ShieldX, statusKey: 'Depoda Arızalı', bgColor: 'bg-red-50 dark:bg-red-900/30', textColor: 'text-red-700 dark:text-red-400', borderColor: 'border-red-200 dark:border-red-700' },
    { title: "Desteğe Teslim Edilenler", count: statusCounts['Destekte'] || 0, icon: PackageCheck, statusKey: 'Destekte', bgColor: 'bg-yellow-50 dark:bg-yellow-900/30', textColor: 'text-yellow-700 dark:text-yellow-400', borderColor: 'border-yellow-200 dark:border-yellow-700' },
    { title: "Poligondaki Silahlar", count: statusCounts['Poligonda'] || 0, icon: MapPin, statusKey: 'Poligonda', bgColor: 'bg-orange-50 dark:bg-orange-900/30', textColor: 'text-orange-700 dark:text-orange-400', borderColor: 'border-orange-200 dark:border-orange-700' },
    { title: "Rapor Yazılacaklar", count: statusCounts['Rapor Bekliyor'] || 0, icon: ClipboardEdit, statusKey: 'Rapor Bekliyor', bgColor: 'bg-slate-50 dark:bg-slate-700/30', textColor: 'text-slate-700 dark:text-slate-400', borderColor: 'border-slate-200 dark:border-slate-600' },
  ];

  const summaryByDefinition = firearmDefinitions.map(definition => {
    const instances = firearms.filter(f => f.definitionId === definition.id);
    const totalCount = instances.length;
    const statusCounts: Partial<Record<FirearmStatus, number>> = {};
    
    for (const status of firearmStatuses) { 
      const count = instances.filter(f => f.status === status).length;
      if (count > 0) {
        statusCounts[status] = count;
      }
    }
    return {
      definition,
      totalCount,
      statusCounts,
    };
  }).filter(summary => summary.totalCount > 0); 

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-8 w-8" />
          <h1 className="text-3xl font-bold tracking-tight" suppressHydrationWarning>Silah Envanteri</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/inventory/firearms/new">
            <Button disabled={isLoading}>
              <PlusCircle className="mr-2 h-4 w-4" /> <span suppressHydrationWarning>Silah Ekle</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mb-6">
        {summaryCards.map((card) => (
          <Card key={card.statusKey} className={`${card.bgColor} ${card.borderColor}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={`text-sm font-medium ${card.textColor}`} suppressHydrationWarning>{card.title}</CardTitle>
              <card.icon className={`h-5 w-5 ${card.textColor} opacity-80`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${card.textColor}`}>{card.count}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {summaryByDefinition.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Info className="h-6 w-6 text-blue-600" />
                <span suppressHydrationWarning>Silah Türüne Göre Detaylı Durum</span>
            </CardTitle>
            <CardDescription suppressHydrationWarning>Envanterdeki her bir silah türünün mevcut durum özeti.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {summaryByDefinition.map(summary => (
              <Card key={summary.definition.id} className="shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg" suppressHydrationWarning>{summary.definition.name} ({summary.definition.model})</CardTitle>
                  <CardDescription suppressHydrationWarning>Kalibre: {summary.definition.caliber}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <p><strong><span suppressHydrationWarning>Toplam:</span></strong> {summary.totalCount}</p>
                  {Object.entries(summary.statusCounts).map(([status, count]) => (
                    <p key={status}><span suppressHydrationWarning>{status}:</span> {count}</p>
                  ))}
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}
      
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="all-firearms" className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <AccordionTrigger className="p-6 text-left hover:no-underline">
            <div className="flex flex-1 flex-col items-start">
              <CardTitle suppressHydrationWarning>Tüm Silahlar</CardTitle>
              <CardDescription suppressHydrationWarning>
                Envanterdeki tüm silahları yönetin ve takip edin. (Göstermek için tıklayın)
              </CardDescription>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="p-6 pt-0">
              {isLoading ? (
                <p className="text-center py-4" suppressHydrationWarning>Silahlar yükleniyor...</p>
              ) : (
                <FirearmsTableClient firearms={firearms} depots={depots} onRefresh={fetchData} />
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
