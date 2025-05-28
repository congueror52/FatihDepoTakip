
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Wrench, History } from "lucide-react";
import Link from "next/link";

export default async function MaintenancePage() {
  // TODO: Fetch and display a summary of items currently in maintenance or recently maintained.
  // For now, this page will primarily link to adding new maintenance logs.

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wrench className="h-8 w-8" />
          <h1 className="text-3xl font-bold tracking-tight" suppressHydrationWarning>Bakım Merkezi</h1>
        </div>
        <Link href="/maintenance/new-log">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> <span suppressHydrationWarning>Bakım Kaydı Ekle</span>
          </Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" /> 
            <span suppressHydrationWarning>Bakım Faaliyetleri</span>
          </CardTitle>
          <CardDescription suppressHydrationWarning>
            Buradan yeni bakım kayıtları ekleyebilir ve envanter öğelerinin bakım geçmişlerini ilgili öğe detay sayfalarından takip edebilirsiniz.
            Yakın zamanda bakıma alınan veya bakımı tamamlanan öğelerin bir özeti ileride burada gösterilecektir.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground" suppressHydrationWarning>
            Öğe bazlı bakım geçmişleri, ilgili envanter (Silah, Şarjör) detay sayfalarında listelenmektedir.
          </p>
          {/* Placeholder for future summary table or list */}
          <div className="mt-4 p-4 border border-dashed rounded-md text-center text-muted-foreground">
            <Wrench className="mx-auto h-12 w-12 mb-2" />
            <p suppressHydrationWarning>Yakında: Bakımdaki ve son işlem gören öğelerin özeti.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
