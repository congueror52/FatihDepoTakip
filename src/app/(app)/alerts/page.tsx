
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, BellRing } from "lucide-react";
import { getTriggeredAlerts } from "@/lib/actions/inventory.actions";
import type { AlertDefinition, ActiveAlert, TriggeredAlertContext } from "@/types/inventory";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export default async function AlertsPage() {
  const triggeredAlerts: ActiveAlert[] = await getTriggeredAlerts(); 

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

  const formatAlertMessage = (template: string, context: TriggeredAlertContext, conditionType: AlertDefinition['conditionType']) => {
    let message = template;
    message = message.replace(/{itemName}/g, String(context.itemName ?? 'N/A'));
    message = message.replace(/{depotName}/g, String(context.itemDepotName ?? 'N/A'));
    message = message.replace(/{currentValue}/g, String(context.currentValue ?? 'N/A'));
    message = message.replace(/{threshold}/g, String(context.thresholdValue !== undefined ? context.thresholdValue : 'N/A'));
    
    if (conditionType === 'status_is') {
        message = message.replace(/{status}/g, String(context.currentValue ?? 'N/A')); // For status_is, currentValue *is* the status
    } else {
        // For low_stock or other types, {status} placeholder might not be directly applicable from context.currentValue.
        // If context had a specific 'statusOfAggregatedStock' or similar, it could be used here.
        // For now, if {status} is used in a non-status_is alert, it might not provide the intended info.
        // We'll leave it to be replaced by 'N/A' if context.status isn't explicitly set for these cases,
        // or rely on template crafter not to use {status} inappropriately for low_stock.
        // Fallback to N/A if context.status is not present, which it won't be for low_stock.
        message = message.replace(/{status}/g, String(context.status ?? 'N/A'));
    }

    message = message.replace(/{caliber}/g, String(context.caliber ?? 'N/A'));
    message = message.replace(/{serialNumber}/g, String(context.serialNumber ?? 'N/A'));
    return message;
  };


  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <ShieldAlert className="h-8 w-8 text-destructive" />
        <h1 className="text-3xl font-bold tracking-tight" suppressHydrationWarning>Sistem Uyarıları</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle suppressHydrationWarning>Aktif Sistem Uyarıları ({triggeredAlerts.length})</CardTitle>
          <CardDescription suppressHydrationWarning>
            Aşağıda, sistem tarafından tetiklenmiş ve dikkat edilmesi gereken aktif uyarılar listelenmektedir.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {triggeredAlerts.length === 0 ? (
            <p className="text-muted-foreground text-center py-8" suppressHydrationWarning>Şu anda aktif bir uyarı bulunmamaktadır.</p>
          ) : (
            <div className="space-y-4">
              {triggeredAlerts.map(activeAlert => (
                <Card key={activeAlert.uniqueId} className={`${getSeverityColor(activeAlert.definition.severity)}`}>
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className={`text-lg ${getSeverityTextColor(activeAlert.definition.severity)} flex items-center gap-2`}>
                      <BellRing className="h-5 w-5"/>
                      <span suppressHydrationWarning>{activeAlert.definition.name}</span>
                    </CardTitle>
                    <Badge className={getSeverityBadgeClasses(activeAlert.definition.severity)}>{activeAlert.definition.severity}</Badge>
                  </CardHeader>
                  <CardContent>
                    <p className={`${getSeverityTextColor(activeAlert.definition.severity)} mb-1`} suppressHydrationWarning>
                       {formatAlertMessage(activeAlert.definition.messageTemplate, activeAlert.context, activeAlert.definition.conditionType)}
                    </p>
                    <p className="text-xs text-muted-foreground" suppressHydrationWarning>
                        Koşul: {activeAlert.definition.conditionType} | Varlık: {activeAlert.definition.entityType}
                        {activeAlert.context.caliber && ` | Kalibre: ${activeAlert.context.caliber}`}
                        {activeAlert.context.thresholdValue !== undefined && ` | Eşik: ${activeAlert.context.thresholdValue}`}
                        {activeAlert.definition.statusFilter && ` | Hedef Durum: ${activeAlert.definition.statusFilter}`}
                        {activeAlert.context.itemDepotName && activeAlert.context.itemDepotName !== 'Tüm Depolar' && ` | Depo: ${activeAlert.context.itemDepotName}`}
                    </p>
                     <p className={`text-xs mt-1 ${getSeverityTextColor(activeAlert.definition.severity)} opacity-75`} suppressHydrationWarning>
                      Uyarı Zamanı: {format(new Date(activeAlert.triggeredAt), "PPP HH:mm:ss", { locale: tr })}
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
