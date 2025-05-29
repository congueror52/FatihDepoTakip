
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, BellDot } from "lucide-react"; 
import Link from "next/link";
import { getAlertDefinitions } from "@/lib/actions/inventory.actions"; 
import { AlertDefinitionsTableClient } from "./_components/alert-definitions-table-client";

export default async function AlertDefinitionsPage() {
  const definitions = await getAlertDefinitions(); 

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BellDot className="h-8 w-8" /> 
          <h1 className="text-3xl font-bold tracking-tight" suppressHydrationWarning>Uyarı Tanımları Yönetimi</h1>
        </div>
        <Link href="/admin/alert-definitions/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> <span suppressHydrationWarning>Yeni Uyarı Tanımı Ekle</span>
          </Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle suppressHydrationWarning>Tanımlı Uyarı Kuralları</CardTitle>
          <CardDescription suppressHydrationWarning>Sistemde otomatik uyarılar oluşturmak için kuralları yönetin.</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDefinitionsTableClient definitions={definitions} />
        </CardContent>
      </Card>
    </div>
  );
}

    
