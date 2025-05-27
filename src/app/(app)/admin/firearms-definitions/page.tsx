
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Settings2 } from "lucide-react";
import Link from "next/link";
import { getFirearmDefinitions } from "@/lib/actions/inventory.actions";
import { FirearmDefinitionsTableClient } from "./_components/firearm-definitions-table-client";

export default async function FirearmDefinitionsPage() {
  const definitions = await getFirearmDefinitions();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings2 className="h-8 w-8" />
          <h1 className="text-3xl font-bold tracking-tight" suppressHydrationWarning>Silah Tanımları Yönetimi</h1>
        </div>
        <Link href="/admin/firearms-definitions/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> <span suppressHydrationWarning>Yeni Silah Tanımı Ekle</span>
          </Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle suppressHydrationWarning>Tüm Silah Tanımları</CardTitle>
          <CardDescription suppressHydrationWarning>Sistemde kullanılacak ateşli silah türlerini yönetin.</CardDescription>
        </CardHeader>
        <CardContent>
          <FirearmDefinitionsTableClient definitions={definitions} />
        </CardContent>
      </Card>
    </div>
  );
}
