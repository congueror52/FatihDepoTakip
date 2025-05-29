
// 'use client'; // Removed this line

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, ListChecks, CheckCircle, XCircle, Wrench, AlertTriangle, ServerCrash, Info } from "lucide-react"; 
import Link from "next/link";
import { MagazinesTableClient } from "./_components/magazines-table-client"; 
import { getMagazines, getDepots, getFirearmDefinitions } from "@/lib/actions/inventory.actions"; 
import type { MagazineStatus, FirearmDefinition, Magazine, Depot } from "@/types/inventory"; 
import { magazineStatuses } from "./_components/magazine-form-schema";
// useEffect, useState, and useToast are no longer needed here if it's a Server Component
// import { useEffect, useState } from "react";
// import { useToast } from "@/hooks/use-toast";

export const dynamic = 'force-dynamic'; // Ensures the page is re-rendered dynamically

export default async function MagazinesPage() {
  let magazines: Magazine[] = [];
  let depots: Depot[] = [];
  let firearmDefinitions: FirearmDefinition[] = [];
  let errorLoadingData = false;

  try {
    magazines = await getMagazines(); 
    depots = await getDepots(); 
    firearmDefinitions = await getFirearmDefinitions();
  } catch (error) {
    console.error("Şarjör envanteri verileri yüklenirken hata:", error);
    errorLoadingData = true;
  }


  const statusCounts = magazines.reduce((acc, magazine) => {
    acc[magazine.status] = (acc[magazine.status] || 0) + 1;
    return acc;
  }, {} as Record<MagazineStatus, number>);

  const summaryCards: { title: string; count: number; icon: React.ElementType; statusKey: MagazineStatus, bgColor?: string, textColor?: string, borderColor?: string }[] = [
    { title: "Hizmetteki Şarjörler", count: statusCounts['Hizmette'] || 0, icon: CheckCircle, statusKey: 'Hizmette', bgColor: 'bg-green-50 dark:bg-green-900/30', textColor: 'text-green-700 dark:text-green-400', borderColor: 'border-green-200 dark:border-green-700' },
    { title: "Arızalı Şarjörler", count: statusCounts['Arızalı'] || 0, icon: XCircle, statusKey: 'Arızalı', bgColor: 'bg-red-50 dark:bg-red-900/30', textColor: 'text-red-700 dark:text-red-400', borderColor: 'border-red-200 dark:border-red-700' },
    { title: "Bakımdaki Şarjörler", count: statusCounts['Bakımda'] || 0, icon: Wrench, statusKey: 'Bakımda', bgColor: 'bg-yellow-50 dark:bg-yellow-900/30', textColor: 'text-yellow-700 dark:text-yellow-400', borderColor: 'border-yellow-200 dark:border-yellow-700' },
    { title: "Kayıp Şarjörler", count: statusCounts['Kayıp'] || 0, icon: AlertTriangle, statusKey: 'Kayıp', bgColor: 'bg-purple-50 dark:bg-purple-900/30', textColor: 'text-purple-700 dark:text-purple-400', borderColor: 'border-purple-200 dark:border-purple-700' },
    { title: "Hizmet Dışı Şarjörler", count: statusCounts['Hizmet Dışı'] || 0, icon: ServerCrash, statusKey: 'Hizmet Dışı', bgColor: 'bg-slate-50 dark:bg-slate-700/30', textColor: 'text-slate-700 dark:text-slate-400', borderColor: 'border-slate-200 dark:border-slate-600' },
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


  if (errorLoadingData) {
    return (
      <div className="flex flex-col gap-6 items-center justify-center h-full">
        <XCircle className="h-12 w-12 text-destructive" />
        <h1 className="text-2xl font-semibold" suppressHydrationWarning>Veri Yüklenemedi</h1>
        <p className="text-muted-foreground" suppressHydrationWarning>Şarjör envanteri verileri yüklenirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.</p>
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
              <div className={`text-2xl font-bold ${card.textColor}`}>{card.count}</div>
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
          <MagazinesTableClient magazines={magazines} depots={depots} /> {/* Pass depots prop */}
        </CardContent>
      </Card>
    </div>
  );
}
