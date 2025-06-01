
'use client'; // Make this a client component for state and filtering

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, BellRing, Filter } from "lucide-react";
import { getTriggeredAlerts } from "@/lib/actions/inventory.actions";
import type { AlertDefinition, ActiveAlert, TriggeredAlertContext, AlertSeverity, AlertEntityType } from "@/types/inventory";
import { ALERT_SEVERITIES, ALERT_ENTITY_TYPES } from "@/types/inventory";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useState, useEffect, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function AlertsPage() {
  const [allTriggeredAlerts, setAllTriggeredAlerts] = useState<ActiveAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | 'all'>('all');
  const [entityTypeFilter, setEntityTypeFilter] = useState<AlertEntityType | 'all'>('all');

  useEffect(() => {
    async function fetchAlerts() {
      setIsLoading(true);
      try {
        const alerts = await getTriggeredAlerts();
        setAllTriggeredAlerts(alerts);
      } catch (error) {
        console.error("Uyarılar getirilirken hata oluştu:", error);
        // You could add a toast notification here for the user
      } finally {
        setIsLoading(false);
      }
    }
    fetchAlerts();
  }, []);

  const filteredAlerts = useMemo(() => {
    return allTriggeredAlerts.filter(alert => {
      const severityMatch = severityFilter === 'all' || alert.definition.severity === severityFilter;
      const entityTypeMatch = entityTypeFilter === 'all' || alert.definition.entityType === entityTypeFilter;
      return severityMatch && entityTypeMatch;
    });
  }, [allTriggeredAlerts, severityFilter, entityTypeFilter]);

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
        message = message.replace(/{status}/g, String(context.currentValue ?? 'N/A'));
    } else {
        message = message.replace(/{status}/g, String(context.status ?? 'N/A'));
    }

    message = message.replace(/{caliber}/g, String(context.caliber ?? 'N/A'));
    message = message.replace(/{serialNumber}/g, String(context.serialNumber ?? 'N/A'));
    return message;
  };


  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-8 w-8 text-destructive" />
          <h1 className="text-3xl font-bold tracking-tight" suppressHydrationWarning>Sistem Uyarıları</h1>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle suppressHydrationWarning>Aktif Sistem Uyarıları ({isLoading ? 'Yükleniyor...' : filteredAlerts.length})</CardTitle>
          <CardDescription suppressHydrationWarning>
            Aşağıda, sistem tarafından tetiklenmiş ve dikkat edilmesi gereken aktif uyarılar listelenmektedir. Filtreleri kullanarak sonuçları daraltabilirsiniz.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 border rounded-md bg-muted/50">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-md font-semibold" suppressHydrationWarning>Filtreler</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full sm:w-auto">
                <Select value={severityFilter} onValueChange={(value) => setSeverityFilter(value as AlertSeverity | 'all')}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Ciddiyete Göre Filtrele" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all"><span suppressHydrationWarning>Tüm Ciddiyetler</span></SelectItem>
                    {ALERT_SEVERITIES.map(sev => (
                      <SelectItem key={sev} value={sev}><span suppressHydrationWarning>{sev}</span></SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={entityTypeFilter} onValueChange={(value) => setEntityTypeFilter(value as AlertEntityType | 'all')}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Varlık Türüne Göre Filtrele" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all"><span suppressHydrationWarning>Tüm Varlık Türleri</span></SelectItem>
                    {ALERT_ENTITY_TYPES.map(et => (
                      <SelectItem key={et.value} value={et.value}><span suppressHydrationWarning>{et.label}</span></SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
               <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setSeverityFilter('all');
                    setEntityTypeFilter('all');
                  }}
                  disabled={severityFilter === 'all' && entityTypeFilter === 'all'}
                  className="w-full sm:w-auto"
                >
                <span suppressHydrationWarning>Filtreleri Temizle</span>
              </Button>
            </div>
          </div>

          {isLoading ? (
            <p className="text-muted-foreground text-center py-8" suppressHydrationWarning>Uyarılar yükleniyor...</p>
          ) : filteredAlerts.length === 0 ? (
            <p className="text-muted-foreground text-center py-8" suppressHydrationWarning>
              {allTriggeredAlerts.length > 0 ? 'Seçili filtrelere uygun aktif uyarı bulunmamaktadır.' : 'Şu anda aktif bir uyarı bulunmamaktadır.'}
            </p>
          ) : (
            <div className="space-y-4">
              {filteredAlerts.map(activeAlert => (
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
