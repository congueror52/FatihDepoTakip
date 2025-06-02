
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Briefcase, Users, ShieldAlert, BarChart3, Activity, Target, ListChecks, BellRing, ListTree, LineChart as LineChartIcon, Box as BoxIcon, Package as PackageIcon, Info, AlertTriangle, Layers, UsersRound, ThermometerSnowflake, HelpCircle, AlertCircle, CheckCircle } from 'lucide-react';
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
interface ScenarioSufficiencyInfo {
  scenarioId: string;
  scenarioName: string;
  scenarioDescription?: string;
  maxEngagements: number | 'N/A' | 'Sınırsız';
  requiredCalibers: Array<{
    caliber: SupportedCaliber;
    currentStock: number;
    roundsPerPerson: number;
    isLimiting: boolean;
  }>;
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
    AmmunitionUsage: "Mühimmat Kullanımı",
    AlertDefinition: "Uyarı Tanımı",
  };

  const formatLogEntryDescription = (log: AuditLogEntry): string => {
    const translatedEntityType = entityTypeTranslations[log.entityType] || log.entityType;
    
    let identifier = log.details?.name || log.entityId || log.details?.id || '';
    if (typeof identifier === 'string' && identifier.length > 20) {
      identifier = `${identifier.substring(0, 17)}...`;
    }
    const identifierText = identifier ? `"${identifier}"` : '';

    switch (log.actionType) {
      case 'CREATE':
        return `${translatedEntityType} ${identifierText} oluşturuldu.`.trim();
      case 'UPDATE':
        if ((log.entityType === 'Firearm' || log.entityType === 'Magazine' || log.entityType === 'OtherMaterial') && log.details?.maintenanceLogAdded && log.details?.status) {
             return `${translatedEntityType} ${identifierText} için bakım yapıldı, yeni durum: ${log.details.status}.`.trim();
        }
        return `${translatedEntityType} ${identifierText} güncellendi.`.trim();
      case 'DELETE':
        return `${translatedEntityType} ${identifierText} silindi.`.trim();
      case 'LOG_USAGE':
        const usageIdentifier = log.details?.ammunitionId || identifierText || 'Mühimmat';
        return `Mühimmat kullanımı kaydedildi: ${usageIdentifier}`.trim();
      case 'LOG_MAINTENANCE':
         return `${translatedEntityType} ${identifierText} oluşturuldu.`.trim();
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

  const scenarioSufficiencyData: ScenarioSufficiencyInfo[] = usageScenarios.map(scenario => {
    let minEngagementsForScenario: number | 'N/A' | 'Sınırsız' = Infinity;
    let hasActiveConsumption = false;
    
    const requiredCalibersDetailsIntermediate = scenario.consumptionRatesPerCaliber.map(rate => {
      const currentStockForCaliber = stockByCaliber[rate.caliber] || 0;
      let engagementsThisCaliberSupports: number | 'Sınırsız' = 'Sınırsız';

      if (rate.roundsPerPerson > 0) {
        hasActiveConsumption = true;
        engagementsThisCaliberSupports = Math.floor(currentStockForCaliber / rate.roundsPerPerson);
        
        if (minEngagementsForScenario === Infinity || (typeof minEngagementsForScenario === 'number' && engagementsThisCaliberSupports < minEngagementsForScenario)) {
          minEngagementsForScenario = engagementsThisCaliberSupports;
        } else if (minEngagementsForScenario === 'Sınırsız' && typeof engagementsThisCaliberSupports === 'number') {
            minEngagementsForScenario = engagementsThisCaliberSupports;
        }
      }
      return {
        caliber: rate.caliber,
        currentStock: currentStockForCaliber,
        roundsPerPerson: rate.roundsPerPerson,
        engagementsThisCaliberSupports
      };
    });

    if (!hasActiveConsumption) {
      minEngagementsForScenario = 'Sınırsız';
    } else if (minEngagementsForScenario === Infinity) {
      minEngagementsForScenario = 'Sınırsız';
    }
    
    const finalRequiredCalibers = requiredCalibersDetailsIntermediate.map(rc => ({
      ...rc,
      isLimiting: hasActiveConsumption &&
                  typeof minEngagementsForScenario === 'number' &&
                  rc.roundsPerPerson > 0 &&
                  typeof rc.engagementsThisCaliberSupports === 'number' &&
                  rc.engagementsThisCaliberSupports === minEngagementsForScenario
    }));


    return {
      scenarioId: scenario.id,
      scenarioName: scenario.name,
      scenarioDescription: scenario.description,
      maxEngagements: minEngagementsForScenario,
      requiredCalibers: finalRequiredCalibers,
    };
  }).sort((a,b) => a.scenarioName.localeCompare(b.scenarioName));


  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight" suppressHydrationWarning>ÖZET BİLGİLER</h1>

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
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            <span suppressHydrationWarning>Mühimmat Yeterlilik (Senaryo Bazlı)</span>
          </CardTitle>
          <CardDescription suppressHydrationWarning>
            Her bir kullanım senaryosu için mevcut mühimmat stoğu ile tahmini kaç kişilik angajmana yeteceğini gösterir.
            Detaylı sarfiyat oranları için <Link href="/admin/usage-scenarios" className="text-primary hover:underline">Kullanım Senaryoları</Link> sayfasını ziyaret edin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {usageScenarios.length === 0 ? (
             <p className="text-muted-foreground text-center py-4" suppressHydrationWarning>Henüz tanımlanmış kullanım senaryosu bulunmamaktadır. Lütfen <Link href="/admin/usage-scenarios" className="text-primary hover:underline">Kullanım Senaryoları</Link> sayfasından senaryo ekleyin.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {scenarioSufficiencyData.map(scenarioInfo => (
                <Card key={scenarioInfo.scenarioId} className="flex flex-col border shadow-lg hover:shadow-xl transition-shadow duration-200">
                  <CardHeader className="pb-2 bg-muted/30 dark:bg-muted/20">
                    <CardTitle className="text-base font-semibold" suppressHydrationWarning>{scenarioInfo.scenarioName}</CardTitle>
                    {scenarioInfo.scenarioDescription && <CardDescription className="text-xs leading-tight" suppressHydrationWarning>{scenarioInfo.scenarioDescription.substring(0,70)}{scenarioInfo.scenarioDescription.length > 70 ? '...' : ''}</CardDescription>}
                  </CardHeader>
                  <CardContent className="flex-grow space-y-3 pt-4">
                    <div className="flex items-center justify-between p-3 bg-primary/10 dark:bg-primary/20 rounded-md text-primary-foreground">
                        <div className="flex items-center gap-2 text-sm">
                            <UsersRound className="h-5 w-5 text-primary dark:text-primary-foreground/80"/>
                            <span className="font-medium text-primary dark:text-primary-foreground/90" suppressHydrationWarning>Kapasite:</span>
                        </div>
                        <span className="text-lg font-bold text-primary dark:text-primary-foreground" suppressHydrationWarning>
                            {scenarioInfo.maxEngagements === 'Sınırsız' ? <ThermometerSnowflake className="inline h-5 w-5" title="Sınırsız (Sarfiyat Tanımlanmamış/Sıfır)" /> :
                             scenarioInfo.maxEngagements === 'N/A' ? <HelpCircle className="inline h-5 w-5" title="Hesaplanamadı" /> :
                             `${scenarioInfo.maxEngagements.toLocaleString()} Kişi`}
                        </span>
                    </div>
                    <div>
                        <h4 className="text-xs font-medium mb-1 text-muted-foreground" suppressHydrationWarning>Gerekli Kalibreler ve Stok Durumu:</h4>
                        {scenarioInfo.requiredCalibers.length === 0 || scenarioInfo.requiredCalibers.every(rc => rc.roundsPerPerson === 0) ? (
                            <p className="text-xs text-muted-foreground italic" suppressHydrationWarning>Bu senaryo için aktif fişek sarfiyatı tanımlanmamış.</p>
                        ) : (
                            <ul className="space-y-1 text-xs">
                            {scenarioInfo.requiredCalibers.filter(rc => rc.roundsPerPerson > 0).map(rc => (
                                <li key={rc.caliber} className={`flex justify-between items-center p-1.5 rounded-sm ${rc.isLimiting && typeof scenarioInfo.maxEngagements === 'number' ? 'bg-destructive/10 dark:bg-destructive/20' : 'bg-muted/30 dark:bg-muted/15'}`}>
                                <span className="flex items-center gap-1">
                                    {rc.isLimiting && typeof scenarioInfo.maxEngagements === 'number' && <AlertCircle className="h-3.5 w-3.5 text-destructive flex-shrink-0" />}
                                    <span className={`${rc.isLimiting && typeof scenarioInfo.maxEngagements === 'number' ? 'font-semibold text-destructive dark:text-red-400' : 'text-foreground/80'}`} suppressHydrationWarning>{rc.caliber}:</span>
                                </span>
                                <span className="text-foreground/90" suppressHydrationWarning>
                                    {rc.currentStock.toLocaleString()} / {rc.roundsPerPerson} (Kişi Başı)
                                </span>
                                </li>
                            ))}
                            </ul>
                        )}
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
                        <div key={alert.uniqueId} className="flex items-start justify-between p-3 border rounded-md shadow-sm">
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
    </div>
  );
}
        

    