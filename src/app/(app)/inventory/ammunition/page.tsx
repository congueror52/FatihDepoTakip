import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Box } from "lucide-react";
import Link from "next/link";
// import { AmmunitionTableClient } from "./_components/ammunition-table-client";
// import { getAmmunition } from "@/lib/actions/inventory.actions";

export default async function AmmunitionPage() {
  // const ammunition = await getAmmunition(); // Uygulandığında yorum satırını kaldırın

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Box className="h-8 w-8" />
          <h1 className="text-3xl font-bold tracking-tight" suppressHydrationWarning>Mühimmat Envanteri</h1>
        </div>
         {/* <Link href="/inventory/ammunition/new"> */}
          <Button disabled> {/* Yeni sayfa hazır olduğunda etkinleştirin */}
            <PlusCircle className="mr-2 h-4 w-4" /> <span suppressHydrationWarning>Mühimmat Ekle</span>
          </Button>
        {/* </Link> */}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle suppressHydrationWarning>Tüm Mühimmat</CardTitle>
          <CardDescription suppressHydrationWarning>Tüm mühimmat türlerini ve miktarlarını yönetin ve takip edin.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* <AmmunitionTableClient ammunition={ammunition} /> */}
          <p className="text-muted-foreground" suppressHydrationWarning>Mühimmat tablosu ve kullanım kaydı burada görüntülenecektir. Özellik yapım aşamasında.</p>
        </CardContent>
      </Card>
    </div>
  );
}
