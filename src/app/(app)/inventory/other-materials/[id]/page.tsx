
import { getOtherMaterialById, getDepots } from "@/lib/actions/inventory.actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Edit, Wrench, History, StickyNote, Package as PackageIcon } from "lucide-react";
import type { Depot } from "@/types/inventory";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export default async function OtherMaterialDetailPage({ params }: { params: { id: string } }) {
  const material = await getOtherMaterialById(params.id);
  const depots = await getDepots();

  if (!material) {
    notFound();
  }

  const getStatusColor = (status: typeof material.status) => {
    switch (status) {
      case 'Depoda': return 'bg-green-500 hover:bg-green-600';
      case 'Kullanımda': return 'bg-blue-500 hover:bg-blue-600';
      case 'Arızalı': return 'bg-red-500 hover:bg-red-600';
      case 'Bakımda': return 'bg-yellow-500 hover:bg-yellow-600 text-black';
      case 'Hizmet Dışı': return 'bg-gray-500 hover:bg-gray-600';
      default: return 'bg-primary';
    }
  };

  const depot = depots.find(d => d.id === material.depotId);

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/inventory/other-materials" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        <span suppressHydrationWarning>Diğer Malzemeler Listesine Geri Dön</span>
      </Link>

      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
                <PackageIcon className="h-7 w-7" /> {material.name}
            </CardTitle>
            <CardDescription>{material.category || 'Kategorisiz'}</CardDescription>
          </div>
          <Link href={`/inventory/other-materials/${material.id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" /> <span suppressHydrationWarning>Düzenle</span>
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="font-semibold mb-1"><span suppressHydrationWarning>Durum:</span></h3>
            <Badge variant="secondary" className={`${getStatusColor(material.status)} text-primary-foreground text-base px-3 py-1`}>
              {material.status}
            </Badge>
          </div>
          <div>
            <h3 className="font-semibold mb-1"><span suppressHydrationWarning>Depo:</span></h3>
            <p>{depot?.name || material.depotId || 'Bilinmeyen Depo'}</p>
          </div>
          {material.manufacturer && (
            <div>
              <h3 className="font-semibold mb-1"><span suppressHydrationWarning>Üretici:</span></h3>
              <p>{material.manufacturer}</p>
            </div>
          )}
          {material.purchaseDate && (
            <div>
              <h3 className="font-semibold mb-1"><span suppressHydrationWarning>Satın Alma Tarihi:</span></h3>
              <p>{format(new Date(material.purchaseDate), "PPP", { locale: tr })}</p>
            </div>
          )}
           <div>
            <h3 className="font-semibold mb-1"><span suppressHydrationWarning>Miktar:</span></h3>
            <p>{material.quantity}</p>
          </div>
           <div>
            <h3 className="font-semibold mb-1"><span suppressHydrationWarning>Son Güncelleme:</span></h3>
            <p>{new Date(material.lastUpdated).toLocaleString('tr-TR')}</p>
          </div>
        </CardContent>
      </Card>

      {material.notes && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><StickyNote className="h-5 w-5" /> <span suppressHydrationWarning>Notlar</span></CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{material.notes}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><History className="h-5 w-5" /> <span suppressHydrationWarning>Bakım Geçmişi</span></CardTitle>
          <CardDescription suppressHydrationWarning>Bu malzeme için tüm bakım faaliyetlerinin kaydı.</CardDescription>
        </CardHeader>
        <CardContent>
          {material.maintenanceHistory && material.maintenanceHistory.length > 0 ? (
            <ul className="space-y-4">
              {material.maintenanceHistory.map(log => (
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
          <Link href={`/maintenance/new?itemType=other&itemId=${material.id}`}>
            <Button variant="outline" className="mt-4">
                <Wrench className="mr-2 h-4 w-4" /> <span suppressHydrationWarning>Bakım Kaydı Ekle</span>
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
