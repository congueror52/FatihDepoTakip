
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, BellRing } from "lucide-react";
import { getTriggeredAlerts } from "@/lib/actions/inventory.actions"; // Changed to getTriggeredAlerts
import type { AlertDefinition } from "@/types/inventory";
import { Badge } from "@/components/ui/badge";

export default async function AlertsPage() {
  // Fetch actual triggered alerts (currently placeholder, will return empty)
  const triggeredAlerts = await getTriggeredAlerts(); 

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
          <CardTitle suppressHydrationWarning>Aktif Sistem Uyarıları</CardTitle>
          <CardDescription suppressHydrationWarning>
            Aşağıda, sistem tarafından tetiklenmiş ve dikkat edilmesi gereken aktif uyarılar listelenmektedir.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {triggeredAlerts.length === 0 ? (
            <p className="text-muted-foreground text-center py-8" suppressHydrationWarning>Şu anda aktif bir uyarı bulunmamaktadır.</p>
          ) : (
            <div className="space-y-4">
              {triggeredAlerts.map(alert => (
                <Card key={alert.id} className={`${getSeverityColor(alert.severity)}`}>
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className={`text-lg ${getSeverityTextColor(alert.severity)} flex items-center gap-2`}>
                      <BellRing className="h-5 w-5"/>
                      <span suppressHydrationWarning>{alert.name}</span>
                    </CardTitle>
                    <Badge className={getSeverityBadgeClasses(alert.severity)}>{alert.severity}</Badge>
                  </CardHeader>
                  <CardContent>
                    {/* In a real triggered alert system, this message would be pre-rendered */}
                    <p className={`${getSeverityTextColor(alert.severity)} mb-1`} suppressHydrationWarning>
                       {alert.messageTemplate
                        .replace('{itemName}', alert.name) // Basic replacement
                        .replace('{depotName}', 'N/A') // Placeholder - would come from actual data
                        .replace('{currentValue}', String(alert.thresholdValue || 'N/A')) // Placeholder
                        .replace('{threshold}', String(alert.thresholdValue || 'N/A'))
                        .replace('{status}', String(alert.statusFilter || 'N/A'))
                        .replace('{caliber}', String(alert.caliberFilter || 'N/A'))
                        .replace('{serialNumber}', 'N/A')}
                    </p>
                    <p className="text-xs text-muted-foreground" suppressHydrationWarning>
                        Koşul: {alert.conditionType} | Varlık: {alert.entityType}
                        {alert.caliberFilter && ` | Kalibre: ${alert.caliberFilter}`}
                        {alert.thresholdValue !== undefined && ` | Eşik: ${alert.thresholdValue}`}
                        {alert.statusFilter && ` | Durum: ${alert.statusFilter}`}
                    </p>
                     <p className={`text-xs mt-1 ${getSeverityTextColor(alert.severity)} opacity-75`} suppressHydrationWarning>
                      Uyarı Tarihi: {new Date(alert.lastUpdated).toLocaleString('tr-TR')} {/* This would be trigger date */}
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

