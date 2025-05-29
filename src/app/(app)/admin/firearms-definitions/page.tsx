
'use client'; 

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Settings2, Upload } from "lucide-react"; 
import Link from "next/link";
import { getFirearmDefinitions, importFirearmDefinitionsFromCsvAction } from "@/lib/actions/inventory.actions";
import { FirearmDefinitionsTableClient } from "./_components/firearm-definitions-table-client";
import type { FirearmDefinition } from "@/types/inventory";
import { useEffect, useState, useRef } from "react"; 
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input"; 

export default function FirearmDefinitionsPage() {
  const [definitions, setDefinitions] = useState<FirearmDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const csvString = e.target?.result as string;
      if (!csvString) {
        toast({ variant: "destructive", title: "Hata", description: "Dosya okunamadı." });
        return;
      }
      try {
        setIsLoading(true);
        const result = await importFirearmDefinitionsFromCsvAction(csvString);
        toast({
          variant: "success",
          title: "İçe Aktarma Tamamlandı",
          description: `${result.successCount} tanım başarıyla işlendi. ${result.errorCount} tanımda hata oluştu. Hatalar için konsolu kontrol edin.`,
        });
        if (result.errors && result.errors.length > 0) {
          console.error("CSV İçe Aktarma Hataları:", result.errors);
        }
        await fetchDefinitions(); 
      } catch (error: any) {
        toast({ variant: "destructive", title: "İçe Aktarma Hatası", description: error.message || "CSV içe aktarılırken bir hata oluştu." });
      } finally {
        setIsLoading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = ""; 
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings2 className="h-8 w-8" />
          <h1 className="text-3xl font-bold tracking-tight" suppressHydrationWarning>Silah Tanımları Yönetimi</h1>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
            id="csvUploadFirearmDef" 
          />
          <Button onClick={() => fileInputRef.current?.click()} variant="outline" disabled={isLoading}>
            <Upload className="mr-2 h-4 w-4" /> <span suppressHydrationWarning>CSV'den Yükle</span>
          </Button>
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
          <CardDescription suppressHydrationWarning>Sistemde kullanılacak silah türlerini yönetin. CSV ile toplu yükleme ve dışa aktarma yapabilirsiniz.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && <p className="text-center py-4" suppressHydrationWarning>Yükleniyor...</p>}
          {!isLoading && <FirearmDefinitionsTableClient definitions={definitions} onRefresh={fetchDefinitions} />}
        </CardContent>
      </Card>
    </div>
  );
}
