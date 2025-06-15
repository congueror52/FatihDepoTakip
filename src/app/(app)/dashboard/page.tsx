
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Briefcase, Users, ShieldAlert, BarChart3, Activity, Target, ListChecks, BellRing, ListTree, LineChart as LineChartIcon, Box as BoxIcon, Package as PackageIcon, Info, AlertTriangle, Layers, UsersRound, ThermometerSnowflake, HelpCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import {
  getFirearms,
  getMagazines,
  getAmmunition,
  getOtherMaterials,
  getTriggeredAlerts,
  getRecentAuditLogs,
  getAmmunitionDailyUsageLogs,
  getMonthlyScenarioUsageForChart,
  getUsageScenarios
} from '@/lib/actions/inventory.actions';
import type { AlertDefinition, SupportedCaliber, UsageScenario, Ammunition, Magazine, Firearm, OtherMaterial } from '@/types/inventory';
import { SUPPORTED_CALIBERS } from '@/types/inventory';
import { Badge } from '@/components/ui/badge';
import type { AuditLogEntry } from '@/types/audit';
import { AmmunitionUsageSummaryChart } from './_components/ammunition-usage-summary-chart';
import { MonthlyScenarioUsageChart } from './_components/monthly-scenario-usage-chart';

// Helper structure for dashboard display
interface CaliberSufficiencyInfo {
  caliber: SupportedCaliber;
  currentStock: number;
  roundsPerPerson: number;
  engagementsSupported: number | 'N/A' | 'Sınırsız';
}
interface ScenarioDetailedSufficiencyInfo {
  scenarioId: string;
  scenarioName: string;
  scenarioDescription?: string;
  calibers: CaliberSufficiencyInfo[];
}


export default async function DashboardPage() {
  const firearms = await getFirearms();
  const magazines = await getMagazines();
  const ammunitionStock = await getAmmunition();
  const otherMaterialsStock = await getOtherMaterials();
  const triggeredAlerts = await getTriggeredAlerts();
  const recentAuditLogs = await getRecentAuditLogs(5);
  const dailyUsageLogs = await getAmmunitionDailyUsageLogs();
  const monthlyScenarioUsageData = await getMonthlyScenarioUsageForChart();
  const usageScenarios = await getUsageScenarios();

  const getSeverityBadgeClasses = (severity: AlertDefinition['severity']) => {
    switch (severity) {
      case 'Yüksek': return 'bg-red-500 hover:bg-red-600';
      case 'Orta': return 'bg-yellow-500 hover:bg-yellow-600 text-black';
      case 'Düşük': return 'bg-blue-500 hover:bg-blue-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getSeverityCardClasses = (severity: AlertDefinition['severity']) => {
    switch (severity) {
      case 'Yüksek': return 'border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-700/80';
      case 'Orta': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-700/80';
      case 'Düşük': return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700/80';
      default: return 'border-gray-300 bg-gray-50 dark:bg-gray-700/20 dark:border-gray-600/80';
    }
  };

  const entityTypeTranslations: Record<AuditLogEntry['entityType'], string> = {
    FirearmDefinition: "Silah Tanımı",
    Firearm: "Silah",
    Magazine: "Şarjör",
    Ammunition: "Mühimmat",
    OtherMaterial: "Diğer Malzeme",
    Depot: "Depo",
    UsageScenario: "Kullanım Senaryosu",
    DailyAmmunitionUsage: "Günlük Fişek Kullanımı",
    Shipment: "Malzeme Kaydı",
    ShipmentTypeDefinition: "Malzeme Kayıt Türü",
    MaintenanceLog: "Bakım Kaydı",
    AlertDefinition: "Uyarı Tanımı",
  };

  const formatLogEntryDescription = (log: AuditLogEntry): string => {
    const translatedEntityType = entityTypeTranslations[log.entityType] || log.entityType;
    
    let objectIdentifier = "";
    // Prioritize parentItemIdentifier for MaintenanceLog CREATE actions
    if (log.entityType === "MaintenanceLog" && log.actionType === "CREATE" && log.details?.parentItemIdentifier) {
      objectIdentifier = log.details.parentItemIdentifier;
    } else if (log.entityType === "MaintenanceLog" && log.actionType === "LOG_MAINTENANCE" && log.details?.parentItemIdentifier) { // For failed maintenance log attempts
      objectIdentifier = log.details.parentItemIdentifier;
    } else if (log.details?.name) { // General name from details
      objectIdentifier = log.details.name;
    } else if (log.entityId) { // Entity ID from the log itself
      objectIdentifier = log.entityId;
    } else if (log.details?.id) { // ID from details (e.g., for created items where entityId might be the new ID)
      objectIdentifier = log.details.id;
    }
  
    // Shorten if it's a long ID-like string, but not if it's a descriptive parentItemIdentifier
    if (objectIdentifier.length > 20 && 
        (objectIdentifier.includes('-') || /^[0-9a-fA-F]+$/.test(objectIdentifier)) &&
        !(log.details?.parentItemIdentifier && objectIdentifier === log.details.parentItemIdentifier) ) {
        objectIdentifier = `${objectIdentifier.substring(0, 8)}...`;
    }
    const identifierText = objectIdentifier ? `"${objectIdentifier}"` : (log.entityType ? `bir ${translatedEntityType.toLowerCase()}` : 'bir öğe');
  
    switch (log.actionType) {
      case 'CREATE':
        if (log.entityType === "MaintenanceLog") {
          return `${identifierText} için ${translatedEntityType.toLowerCase()} oluşturuldu.`;
        }
        return `${translatedEntityType} ${identifierText} oluşturuldu.`.trim();
      case 'UPDATE':
        if ((log.entityType === 'Firearm' || log.entityType === 'Magazine' || log.entityType === 'OtherMaterial') && log.details?.maintenanceLogAdded && log.details?.status) {
             return `${identifierText} için bakım yapıldı, yeni durum: ${log.details.status}.`.trim();
        }
        return `${translatedEntityType} ${identifierText} güncellendi.`.trim();
      case 'DELETE':
        return `${translatedEntityType} ${identifierText} silindi.`.trim();
      case 'LOG_MAINTENANCE': // This is the failure case in addMaintenanceLogToItemAction
          return `${identifierText} için ${translatedEntityType.toLowerCase()} oluşturma/güncelleme başarısız.`;
      default:
        return `${log.actionType} işlemi ${translatedEntityType} ${identifierText} üzerinde yapıldı.`.trim();
    }
  };

  const usageByCaliber = dailyUsageLogs.reduce((acc, log) => {
    acc['9x19mm'] = (acc['9x19mm'] || 0) + log.used_9x19mm;
    acc['5.56x45mm'] = (acc['5.56x45mm'] || 0) + log.used_5_56x45mm;
    acc['7.62x39mm'] = (acc['7.62x39mm'] || 0) + log.used_7_62x39mm;
    acc['7.62x51mm'] = (acc['7.62x51mm'] || 0) + log.used_7_62x51mm;
    return acc;
  }, {} as Record<SupportedCaliber, number>);

  const stockByCaliber = ammunitionStock.reduce((acc, ammo) => {
    acc[ammo.caliber] = (acc[ammo.caliber] || 0) + ammo.quantity;
    return acc;
  }, {} as Record<SupportedCaliber, number>);

  const ammunitionUsageChartData = SUPPORTED_CALIBERS.map(caliber => ({
    name: caliber,
    'Kullanılan': usageByCaliber[caliber] || 0,
    'Mevcut Stok': stockByCaliber[caliber] || 0,
  }));

  const scenarioDetailedSufficiencyData: ScenarioDetailedSufficiencyInfo[] = usageScenarios.map(scenario => {
    const caliberDetails: CaliberSufficiencyInfo[] = scenario.consumptionRatesPerCaliber
      .filter(rate => rate.roundsPerPerson > 0) // Sadece sarfiyatı olanları dikkate al
      .map(rate => {
        const currentStockForCaliber = stockByCaliber[rate.caliber] || 0;
        let engagements: number | 'Sınırsız' | 'N/A' = 'N/A';

        if (rate.roundsPerPerson > 0) {
          engagements = Math.floor(currentStockForCaliber / rate.roundsPerPerson);
        } else {
          engagements = 'Sınırsız'; 
        }

        return {
          caliber: rate.caliber,
          currentStock: currentStockForCaliber,
          roundsPerPerson: rate.roundsPerPerson,
          engagementsSupported: engagements,
        };
      });
  
    return {
      scenarioId: scenario.id,
      scenarioName: scenario.name,
      scenarioDescription: scenario.description,
      calibers: caliberDetails.sort((a,b) => a.caliber.localeCompare(b.caliber)),
    };
  }).sort((a,b) => a.scenarioName.localeCompare(b.scenarioName));


  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight" suppressHydrationWarning>ÖZET BİLGİLER</h1>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            <span suppressHydrationWarning>Mühimmat Yeterlilik (Senaryo Bazlı)</span>
          </CardTitle>
          <CardDescription suppressHydrationWarning>
            Her bir kullanım senaryosu için, o senaryoda tanımlı her bir kalibrenin mevcut mühimmat stoğu ile tahmini kaç kişilik angajmana yeteceğini gösterir.
            Sarfiyat oranlarını <Link href="/admin/usage-scenarios" className="text-primary hover:underline">Kullanım Senaryoları</Link> sayfasından yönetebilirsiniz.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {usageScenarios.length === 0 ? (
             <p className="text-muted-foreground text-center py-4" suppressHydrationWarning>Henüz tanımlanmış kullanım senaryosu bulunmamaktadır. Lütfen <Link href="/admin/usage-scenarios" className="text-primary hover:underline">Kullanım Senaryoları</Link> sayfasından senaryo ekleyin.</p>
          ) : (
            scenarioDetailedSufficiencyData.map(scenarioInfo => (
              <div key={scenarioInfo.scenarioId} className="space-y-4 p-4 border rounded-lg shadow">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-semibold text-primary" suppressHydrationWarning>{scenarioInfo.scenarioName}</h3>
                        {scenarioInfo.scenarioDescription && <p className="text-xs text-muted-foreground" suppressHydrationWarning>{scenarioInfo.scenarioDescription}</p>}
                    </div>
                </div>

                {scenarioInfo.calibers.length === 0 ? (
                     <p className="text-sm text-muted-foreground italic py-2" suppressHydrationWarning>Bu senaryo için aktif (sıfırdan büyük) fişek sarfiyatı tanımlanmamış.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {scenarioInfo.calibers.map(caliberInfo => (
                        <Card key={caliberInfo.caliber} className="flex flex-col">
                          <CardHeader className="pb-2 pt-3 bg-muted/20 dark:bg-muted/10">
                              <CardTitle className="text-sm font-medium flex items-center gap-1.5">
                                  <BoxIcon className="h-4 w-4 text-muted-foreground" />
                                  <span suppressHydrationWarning>{caliberInfo.caliber}</span>
                              </CardTitle>
                          </CardHeader>
                          <CardContent className="flex-grow space-y-1.5 text-xs pt-3">
                              <div className="flex justify-between">
                                  <span className="text-muted-foreground" suppressHydrationWarning>Mevcut Stok:</span>
                                  <span className="font-semibold" suppressHydrationWarning>{caliberInfo.currentStock.toLocaleString()} adet</span>
                              </div>
                              <div className="flex justify-between">
                                  <span className="text-muted-foreground" suppressHydrationWarning>Kişi Başı Sarfiyat:</span>
                                  <span className="font-semibold" suppressHydrationWarning>{caliberInfo.roundsPerPerson} adet</span>
                              </div>
                              <div className="flex justify-between items-center pt-1 mt-1 border-t">
                                  <span className="text-muted-foreground flex items-center gap-1"><UsersRound className="h-3.5 w-3.5"/> <span suppressHydrationWarning>Tahmini Kapasite:</span></span>
                                  <span className="text-lg font-bold text-destructive">
                                  {caliberInfo.engagementsSupported === 'Sınırsız' ? <ThermometerSnowflake className="inline h-5 w-5" title="Sınırsız (Sarfiyat Tanımlanmamış/Sıfır)" /> :
                                   caliberInfo.engagementsSupported === 'N/A' ? <HelpCircle className="inline h-5 w-5" title="Hesaplanamadı (Sarfiyat 0)" /> :
                                   <span suppressHydrationWarning>{`${(caliberInfo.engagementsSupported as number).toLocaleString()} Kişi`}</span>}
                                  </span>
                              </div>
                          </CardContent>
                           <CardFooter className="pt-3 mt-auto border-t">
                             <Button variant="ghost" size="sm" className="w-full text-primary hover:bg-primary/5 h-8" asChild>
                                 <Link href={`/admin/usage-scenarios/${scenarioInfo.scenarioId}/edit`}>
                                    <span suppressHydrationWarning>Senaryoyu Yapılandır</span>
                                 </Link>
                             </Button>
                           </CardFooter>
                        </Card>
                    ))}
                    </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>


      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" /> <span suppressHydrationWarning>Mühimmat Kullanım ve Stok Özeti (Kalibre Bazlı)</span></CardTitle>
            <CardDescription suppressHydrationWarning>Kaydedilen günlük kullanımlara göre kalibre bazlı toplam tüketim ve mevcut stok.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <AmmunitionUsageSummaryChart data={ammunitionUsageChartData} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /><span suppressHydrationWarning>Son Aktiviteler</span></CardTitle>
            <CardDescription suppressHydrationWarning>En son güncellemeler ve sistem olayları.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
              {recentAuditLogs.length > 0 ? (
                recentAuditLogs.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 pt-1">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                        <Activity className="h-4 w-4 text-secondary-foreground" />
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium" suppressHydrationWarning>{formatLogEntryDescription(activity)}</p>
                      <p className="text-xs text-muted-foreground" suppressHydrationWarning>{new Date(activity.timestamp).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground" suppressHydrationWarning>Son aktivite bulunmamaktadır.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BellRing className="h-5 w-5 text-muted-foreground" />
                    <span suppressHydrationWarning>Son Uyarılar</span>
                </CardTitle>
                 <CardDescription suppressHydrationWarning>Sistemdeki en son {Math.min(triggeredAlerts.length, 5)} önemli uyarı.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {triggeredAlerts.length === 0 ? (
                    <p className="text-muted-foreground"><span suppressHydrationWarning>Dikkate değer son uyarı bulunmamaktadır.</span></p>
                ) : (
                    triggeredAlerts.slice(0, 5).map(alert => (
                        <div key={alert.uniqueId} className={`flex items-start justify-between p-3 border rounded-md shadow-sm ${getSeverityCardClasses(alert.definition.severity)}`}>
                            <div>
                                <p className="font-medium text-sm" suppressHydrationWarning>{alert.definition.name}</p>
                                <p className="text-xs text-muted-foreground" suppressHydrationWarning>
                                    {alert.definition.messageTemplate.substring(0, 100) + '...'} - <span suppressHydrationWarning>Tanım Güncelleme: {new Date(alert.definition.lastUpdated).toLocaleDateString('tr-TR')}</span>
                                </p>
                            </div>
                            <Badge className={getSeverityBadgeClasses(alert.definition.severity)}>{alert.definition.severity}</Badge>
                        </div>
                    ))
                )}
                 <Link href="/alerts" className="text-sm text-primary hover:underline float-right mt-2">
                    <span suppressHydrationWarning>Tüm Uyarıları Gör</span>
                </Link>
            </CardContent>
        </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
         <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><LineChartIcon className="h-5 w-5" /> <span suppressHydrationWarning>Aylık Senaryo Bazlı Mühimmat Kullanımı</span></CardTitle>
            <CardDescription suppressHydrationWarning>Seçilen senaryolara göre aylık toplam mühimmat tüketim trendleri.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <MonthlyScenarioUsageChart data={monthlyScenarioUsageData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
        

    




