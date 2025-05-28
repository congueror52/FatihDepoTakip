
import { getFirearmById } from "@/lib/actions/inventory.actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Edit, Wrench, History, StickyNote } from "lucide-react";
import { DEPOT_LOCATIONS } from "@/types/inventory";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export default async function FirearmDetailPage({ params }: { params: { id: string } }) {
  const firearm = await getFirearmById(params.id);

  if (!firearm) {
    notFound();
  }
  
  const getStatusColor = (status: typeof firearm.status) => {
    switch (status) {
      case 'Hizmette': return 'bg-green-500 hover:bg-green-600';
      case 'Bakımda': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'Arızalı': return 'bg-red-500 hover:bg-red-600';
      case 'Onarım Bekliyor': return 'bg-orange-500 hover:bg-orange-600';
      case 'Onarıldı': return 'bg-blue-500 hover:bg-blue-600';
      case 'Hizmet Dışı': return 'bg-gray-500 hover:bg-gray-600';
      default: return 'bg-primary';
    }
  };

  const depot = DEPOT_LOCATIONS.find(d => d.id === firearm.depotId);

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/inventory/firearms" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        <span suppressHydrationWarning>Silah Listesine Geri Dön</span>
      </Link>

      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">{firearm.name} - {firearm.serialNumber}</CardTitle>
            <CardDescription>{firearm.model} ({firearm.caliber})</CardDescription>
          </div>
          <Link href={`/inventory/firearms/${firearm.id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" /> <span suppressHydrationWarning>Düzenle</span>
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="font-semibold mb-1"><span suppressHydrationWarning>Durum:</span></h3>
            <Badge variant="secondary" className={`${getStatusColor(firearm.status)} text-primary-foreground text-base px-3 py-1`}>
              {firearm.status}
            </Badge>
          </div>
          <div>
            <h3 className="font-semibold mb-1"><span suppressHydrationWarning>Depo:</span></h3>
            <p>{depot?.name || 'Bilinmeyen Depo'}</p>
          </div>
          {firearm.manufacturer && (
            <div>
              <h3 className="font-semibold mb-1"><span suppressHydrationWarning>Üretici:</span></h3>
              <p>{firearm.manufacturer}</p>
            </div>
          )}
          {firearm.purchaseDate && (
            <div>
              <h3 className="font-semibold mb-1"><span suppressHydrationWarning>Satın Alma Tarihi:</span></h3>
              <p>{format(new Date(firearm.purchaseDate), "PPP", { locale: tr })}</p>
            </div>
          )}
           <div>
            <h3 className="font-semibold mb-1"><span suppressHydrationWarning>Son Güncelleme:</span></h3>
            <p>{new Date(firearm.lastUpdated).toLocaleString('tr-TR')}</p>
          </div>
        </CardContent>
      </Card>

      {firearm.notes && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><StickyNote className="h-5 w-5" /> <span suppressHydrationWarning>Notlar</span></CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{firearm.notes}</p>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><History className="h-5 w-5" /> <span suppressHydrationWarning>Bakım Geçmişi</span></CardTitle>
          <CardDescription suppressHydrationWarning>Bu silah için tüm bakım faaliyetlerinin kaydı.</CardDescription>
        </CardHeader>
        <CardContent>
          {firearm.maintenanceHistory && firearm.maintenanceHistory.length > 0 ? (
            <ul className="space-y-4">
              {firearm.maintenanceHistory.map(log => (
                <li key={log.id} className="p-4 border rounded-md">
                  <p className="font-semibold"><span suppressHydrationWarning>Tarih:</span> {format(new Date(log.date), "PPP", { locale: tr })}</p>
                  <p><span suppressHydrationWarning>Durum Değişikliği:</span> {log.statusChangeFrom} <ArrowLeft className="inline h-3 w-3"/> {log.statusChangeTo}</p>
                  <p><span suppressHydrationWarning>Açıklama:</span> {log.description}</p>
                  {log.technician && <p><span suppressHydrationWarning>Teknisyen:</span> {log.technician}</p>}
                </li>
              ))}
            </ul>
          ) : (
            <p suppressHydrationWarning>Bakım geçmişi kaydedilmemiş.</p>
          )}
          <Button variant="outline" className="mt-4" disabled>
             <Wrench className="mr-2 h-4 w-4" /> <span suppressHydrationWarning>Bakım Kaydı Ekle</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
