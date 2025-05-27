import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, BellRing } from "lucide-react";

export default async function AlertsPage() {
  // Örnek uyarı verileri
  const alerts = [
    { id: '1', severity: 'Yüksek', message: 'Düşük stok: 9mm FMJ mühimmat (Depo A - 500 adet kaldı)', date: new Date().toISOString() },
    { id: '2', severity: 'Orta', message: 'SN:XG5523 seri nolu ateşli silahın planlı bakımı gecikti', date: new Date(Date.now() - 86400000 * 2).toISOString() },
    { id: '3', severity: 'Düşük', message: 'Şarjör M007 (Depo B) için küçük hasar bildirildi', date: new Date(Date.now() - 86400000 * 3).toISOString() },
  ];

  const getSeverityColor = (severity: string) => {
    if (severity === 'Yüksek') return 'border-red-500 bg-red-50';
    if (severity === 'Orta') return 'border-yellow-500 bg-yellow-50';
    return 'border-blue-500 bg-blue-50'; // Düşük
  };
  
  const getSeverityTextColor = (severity: string) => {
    if (severity === 'Yüksek') return 'text-red-700';
    if (severity === 'Orta') return 'text-yellow-700';
    return 'text-blue-700'; // Düşük
  };


  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <ShieldAlert className="h-8 w-8 text-destructive" />
        <h1 className="text-3xl font-bold tracking-tight" suppressHydrationWarning>Sistem Uyarıları</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle suppressHydrationWarning>Aktif Uyarılar</CardTitle>
          <CardDescription suppressHydrationWarning>Envanter seviyeleri ve öğe durumları hakkındaki önemli bildirimleri inceleyin.</CardDescription>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <p className="text-muted-foreground" suppressHydrationWarning>Aktif uyarı yok. Sistem nominal.</p>
          ) : (
            <div className="space-y-4">
              {alerts.map(alert => (
                <Card key={alert.id} className={`${getSeverityColor(alert.severity)}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className={`text-lg ${getSeverityTextColor(alert.severity)} flex items-center gap-2`}>
                      <BellRing className="h-5 w-5"/>
                      <span suppressHydrationWarning>{alert.severity} Öncelikli Uyarı</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className={`${getSeverityTextColor(alert.severity)}`} suppressHydrationWarning>{alert.message}</p>
                    <p className={`text-xs mt-1 ${getSeverityTextColor(alert.severity)} opacity-75`} suppressHydrationWarning>
                      Kaydedildi: {new Date(alert.date).toLocaleString('tr-TR')}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
