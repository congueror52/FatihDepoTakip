import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Wrench } from "lucide-react";
import Link from "next/link";

export default async function MaintenancePage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wrench className="h-8 w-8" />
          <h1 className="text-3xl font-bold tracking-tight" suppressHydrationWarning>Bakım Merkezi</h1>
        </div>
        {/* <Link href="/maintenance/new-log"> */}
          <Button disabled>
            <PlusCircle className="mr-2 h-4 w-4" /> <span suppressHydrationWarning>Bakım Kaydı Ekle</span>
          </Button>
        {/* </Link> */}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle suppressHydrationWarning>Bakım Özeti</CardTitle>
          <CardDescription suppressHydrationWarning>Bakımdaki öğeleri ve geçmişlerini takip edin.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground" suppressHydrationWarning>Bakım kayıtları ve durum güncellemeleri burada yönetilecektir. Özellik yapım aşamasında.</p>
          <p className="mt-2 text-sm text-muted-foreground" suppressHydrationWarning>Bireysel öğe bakım geçmişi, öğe detay sayfalarında mevcuttur.</p>
        </CardContent>
      </Card>
    </div>
  );
}
