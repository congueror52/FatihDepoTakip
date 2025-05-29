
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, BellRing } from "lucide-react";
import { getAlertDefinitions } from "@/lib/actions/inventory.actions";
import type { AlertDefinition } from "@/types/inventory";
import { Badge } from "@/components/ui/badge";

// Helper function to simulate active alerts based on definitions (for prototype)
// This should ideally come from a dedicated active alerts data source in a real system.
const getSimulatedActiveAlerts = (definitions: AlertDefinition[]): AlertDefinition[] => {
  return definitions.filter(def => def.isActive).map(def => ({
    ...def,
    // Simulate message and date for display
    // message: def.messageTemplate
    //   .replace('{itemName}', def.name)
    //   .replace('{depotName}', 'N/A')
    //   .replace('{currentValue}', 'N/A')
    //   .replace('{threshold}', String(def.thresholdValue || 'N/A'))
    //   .replace('{status}', String(def.statusFilter || 'N/A'))
    //   .replace('{caliber}', String(def.caliberFilter || 'N/A'))
    //   .replace('{serialNumber}', 'N/A'),
    // date: new Date().toISOString() // Simulate a date
  })).sort((a,b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
};


export default async function AlertsPage() {
  const alertDefinitions = await getAlertDefinitions();
  const activeAlerts = getSimulatedActiveAlerts(alertDefinitions);

  const getSeverityColor = (severity: string) => {
    if (severity === 'Yüksek') return 'border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-700';
    if (severity === 'Orta') return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-700';
    return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700'; // Düşük
  };
  
  const getSeverityTextColor = (severity: string) => {
    if (severity === 'Yüksek') return 'text-red-700 dark:text-red-400';
    if (severity === 'Orta') return 'text-yellow-700 dark:text-yellow-400';
    return 'text-blue-700 dark:text-blue-400'; // Düşük
  };
  
  const getSeverityBadgeClasses = (severity: AlertDefinition['severity']) => {
    switch (severity) {
      case 'Yüksek': return 'bg-red-500 hover:bg-red-600';
      case 'Orta': return 'bg-yellow-500 hover:bg-yellow-600 text-black';
      case 'Düşük': return 'bg-blue-500 hover:bg-blue-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };


  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <ShieldAlert className="h-8 w-8 text-destructive" />
        <h1 className="text-3xl font-bold tracking-tight" suppressHydrationWarning>Sistem Uyarıları</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle suppressHydrationWarning>Tanımlı ve Aktif Uyarı Kuralları</CardTitle>
          <CardDescription suppressHydrationWarning>
            Aşağıda sistemde tanımlanmış ve aktif olan uyarı kuralları listelenmektedir. 
            Bu kurallar, belirli koşullar oluştuğunda (örn. düşük stok, hatalı durum) otomatik uyarılar üretir.
            Gerçek zamanlı tetiklenen uyarılar için ayrı bir bildirim sistemi entegre edilebilir.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeAlerts.length === 0 ? (
            <p className="text-muted-foreground text-center py-8" suppressHydrationWarning>Aktif uyarı kuralı bulunmamaktadır veya tanımlı kurallar henüz bir uyarıyı tetiklememiştir.</p>
          ) : (
            <div className="space-y-4">
              {activeAlerts.map(alert => (
                <Card key={alert.id} className={`${getSeverityColor(alert.severity)}`}>
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className={`text-lg ${getSeverityTextColor(alert.severity)} flex items-center gap-2`}>
                      <BellRing className="h-5 w-5"/>
                      <span suppressHydrationWarning>{alert.name}</span>
                    </CardTitle>
                    <Badge className={getSeverityBadgeClasses(alert.severity)}>{alert.severity}</Badge>
                  </CardHeader>
                  <CardContent>
                    <p className={`${getSeverityTextColor(alert.severity)} mb-1`} suppressHydrationWarning>{alert.description || "Bu uyarı için ek açıklama yok."}</p>
                    <p className="text-xs text-muted-foreground" suppressHydrationWarning>
                        Koşul: {alert.conditionType} | Varlık: {alert.entityType}
                        {alert.caliberFilter && ` | Kalibre: ${alert.caliberFilter}`}
                        {alert.thresholdValue !== undefined && ` | Eşik: ${alert.thresholdValue}`}
                        {alert.statusFilter && ` | Durum: ${alert.statusFilter}`}
                    </p>
                     <p className={`text-xs mt-1 ${getSeverityTextColor(alert.severity)} opacity-75`} suppressHydrationWarning>
                      Kural Son Güncelleme: {new Date(alert.lastUpdated).toLocaleString('tr-TR')}
                    </p>
                    <p className="text-sm mt-2 p-2 bg-background/50 rounded-md border border-dashed" suppressHydrationWarning>
                      <span className="font-semibold">Mesaj Şablonu:</span> {alert.messageTemplate}
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
