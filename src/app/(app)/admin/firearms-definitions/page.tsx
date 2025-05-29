
'use client'; 

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Settings2, Download } from "lucide-react"; 
import Link from "next/link";
import { getFirearmDefinitions, exportFirearmDefinitionsToCsvAction } from "@/lib/actions/inventory.actions";
import { FirearmDefinitionsTableClient } from "./_components/firearm-definitions-table-client";
import type { FirearmDefinition } from "@/types/inventory";
import { useEffect, useState, useRef } from "react"; 
import { useToast } from "@/hooks/use-toast";
// Input kaldırıldı

export default function FirearmDefinitionsPage() {
  const [definitions, setDefinitions] = useState<FirearmDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  // fileInputRef kaldırıldı

  const fetchDefinitions = async () => {
    setIsLoading(true);
    try {
      const defs = await getFirearmDefinitions();
      setDefinitions(defs);
    } catch (error) {
      console.error("Silah tanımları yüklenirken hata:", error);
      toast({ variant: "destructive", title: "Hata", description: "Silah tanımları yüklenirken bir sorun oluştu." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDefinitions();
  }, []);

  // handleFileChange fonksiyonu kaldırıldı

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings2 className="h-8 w-8" />
          <h1 className="text-3xl font-bold tracking-tight" suppressHydrationWarning>Silah Tanımları Yönetimi</h1>
        </div>
        <div className="flex items-center gap-2">
          {/* CSV Yükleme Input ve Butonu kaldırıldı */}
          <Link href="/admin/firearms-definitions/new">
            <Button disabled={isLoading}>
              <PlusCircle className="mr-2 h-4 w-4" /> <span suppressHydrationWarning>Yeni Silah Tanımı Ekle</span>
            </Button>
          </Link>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle suppressHydrationWarning>Tüm Silah Tanımları</CardTitle>
          <CardDescription suppressHydrationWarning>Sistemde kullanılacak silah türlerini yönetin. CSV ile dışa aktarma yapabilirsiniz.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && <p className="text-center py-4" suppressHydrationWarning>Yükleniyor...</p>}
          {!isLoading && <FirearmDefinitionsTableClient definitions={definitions} onRefresh={fetchDefinitions} />}
        </CardContent>
      </Card>
    </div>
  );
}
