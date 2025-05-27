import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Target } from "lucide-react";
import Link from "next/link";
import { getFirearms } from "@/lib/actions/inventory.actions";
import { FirearmsTableClient } from "./_components/firearms-table-client";

export default async function FirearmsPage() {
  const firearms = await getFirearms();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-8 w-8" />
          <h1 className="text-3xl font-bold tracking-tight" suppressHydrationWarning>Ateşli Silah Envanteri</h1>
        </div>
        <Link href="/inventory/firearms/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> <span suppressHydrationWarning>Ateşli Silah Ekle</span>
          </Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle suppressHydrationWarning>Tüm Ateşli Silahlar</CardTitle>
          <CardDescription suppressHydrationWarning>Envanterdeki tüm ateşli silahları yönetin ve takip edin.</CardDescription>
        </CardHeader>
        <CardContent>
          <FirearmsTableClient firearms={firearms} />
        </CardContent>
      </Card>
    </div>
  );
}
