
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Package, Warehouse, ShieldX, Wrench, AlertTriangle, Info, Loader2 } from "lucide-react"; // Removed ClipboardEdit
import Link from "next/link";
import { OtherMaterialsTableClient } from "./_components/other-materials-table-client";
import { getOtherMaterials, getDepots } from "@/lib/actions/inventory.actions";
import type { OtherMaterial, Depot, OtherMaterialStatus } from "@/types/inventory";
import { useEffect, useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { otherMaterialStatuses } from "./_components/other-material-form-schema";

interface CategorySummary {
  categoryName: string;
  totalCount: number;
  statusCounts: Partial<Record<OtherMaterialStatus, number>>;
}

export default function OtherMaterialsPage() {
  const [materials, setMaterials] = useState<OtherMaterial[]>([]);
  const [depots, setDepots] = useState<Depot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [materialsData, depotsData] = await Promise.all([
          getOtherMaterials(),
          getDepots()
        ]);
        setMaterials(materialsData);
        setDepots(depotsData);
      } catch (error) {
        console.error("Diğer malzemeler verileri yüklenirken hata:", error);
        toast({ variant: "destructive", title: "Hata", description: "Diğer malzemeler verileri yüklenirken bir sorun oluştu." });
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [toast]);

  const statusCounts = useMemo(() => {
    return materials.reduce((acc, material) => {
      acc[material.status] = (acc[material.status] || 0) + material.quantity;
      return acc;
    }, {} as Record<OtherMaterialStatus, number>);
  }, [materials]);

  const summaryCards: { title: string; count: number; icon: React.ElementType; statusKey: OtherMaterialStatus, bgColor?: string, textColor?: string, borderColor?: string }[] = [
    { title: "Depodaki Malzemeler", count: statusCounts['Depoda'] || 0, icon: Warehouse, statusKey: 'Depoda', bgColor: 'bg-green-50 dark:bg-green-900/30', textColor: 'text-green-700 dark:text-green-400', borderColor: 'border-green-200 dark:border-green-700' },
    { title: "Kullanımdaki Malzemeler", count: statusCounts['Kullanımda'] || 0, icon: Package, statusKey: 'Kullanımda', bgColor: 'bg-blue-50 dark:bg-blue-900/30', textColor: 'text-blue-700 dark:text-blue-400', borderColor: 'border-blue-200 dark:border-blue-700' },
    { title: "Arızalı Malzemeler", count: statusCounts['Arızalı'] || 0, icon: ShieldX, statusKey: 'Arızalı', bgColor: 'bg-red-50 dark:bg-red-900/30', textColor: 'text-red-700 dark:text-red-400', borderColor: 'border-red-200 dark:border-red-700' },
    { title: "Bakımdaki Malzemeler", count: statusCounts['Bakımda'] || 0, icon: Wrench, statusKey: 'Bakımda', bgColor: 'bg-yellow-50 dark:bg-yellow-900/30', textColor: 'text-yellow-700 dark:text-yellow-400', borderColor: 'border-yellow-200 dark:border-yellow-700' },
    { title: "Hizmet Dışı Malzemeler", count: statusCounts['Hizmet Dışı'] || 0, icon: AlertTriangle, statusKey: 'Hizmet Dışı', bgColor: 'bg-gray-50 dark:bg-gray-900/30', textColor: 'text-gray-700 dark:text-gray-400', borderColor: 'border-gray-200 dark:border-gray-700' },
  ];

  const summaryByCategory = useMemo(() => {
    const categories: Record<string, { totalCount: number; statusCounts: Partial<Record<OtherMaterialStatus, number>> }> = {};
    materials.forEach(material => {
      const categoryKey = material.category || "Kategorisiz";
      if (!categories[categoryKey]) {
        categories[categoryKey] = { totalCount: 0, statusCounts: {} };
      }
      categories[categoryKey].totalCount += material.quantity;
      categories[categoryKey].statusCounts[material.status] = (categories[categoryKey].statusCounts[material.status] || 0) + material.quantity;
    });

    return Object.entries(categories).map(([categoryName, data]) => ({
      categoryName,
      ...data,
    })).sort((a, b) => a.categoryName.localeCompare(b.categoryName));
  }, [materials]);


  if (isLoading) {
    return (
        <div className="flex flex-col gap-6 items-center justify-center h-full">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground" suppressHydrationWarning>Diğer malzeme verileri yükleniyor...</p>
        </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-8 w-8" />
          <h1 className="text-3xl font-bold tracking-tight" suppressHydrationWarning>Diğer Malzemeler Envanteri</h1>
        </div>
        <Link href="/inventory/other-materials/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> <span suppressHydrationWarning>Yeni Malzeme Ekle</span>
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

      {summaryByCategory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Info className="h-6 w-6 text-sky-600 dark:text-sky-400" />
                <span suppressHydrationWarning>Kategoriye Göre Detaylı Malzeme Durumu</span>
            </CardTitle>
            <CardDescription suppressHydrationWarning>Her bir malzeme kategorisindeki toplam malzeme sayısı ve durumları.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {summaryByCategory.map(summary => (
              <Card key={summary.categoryName} className="shadow-md bg-sky-50 dark:bg-sky-900/40 border-sky-200 dark:border-sky-700/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-sky-800 dark:text-sky-300" suppressHydrationWarning>{summary.categoryName}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm text-sky-700 dark:text-sky-300">
                  <p><strong><span suppressHydrationWarning>Toplam Miktar:</span></strong> {summary.totalCount}</p>
                  {otherMaterialStatuses.map(status => {
                    const count = summary.statusCounts[status];
                    if (count && count > 0) {
                      return <p key={status}><span suppressHydrationWarning>{status}:</span> {count}</p>;
                    }
                    return null;
                  })}
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle suppressHydrationWarning>Tüm Diğer Malzemeler</CardTitle>
          <CardDescription suppressHydrationWarning>Envanterdeki diğer malzemeleri (koruyucu ekipman, eğitim malzemeleri vb.) yönetin ve takip edin.</CardDescription>
        </CardHeader>
        <CardContent>
          <OtherMaterialsTableClient materials={materials} depots={depots} />
        </CardContent>
      </Card>
    </div>
  );
}

