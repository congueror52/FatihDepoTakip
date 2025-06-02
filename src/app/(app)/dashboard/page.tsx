
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Users, ShieldAlert, BarChart3, Activity, Target, ListChecks, BellRing, ListTree, LineChart as LineChartIcon, Box as BoxIcon, Package as PackageIcon, Calculator, AlertTriangle } from 'lucide-react';
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
  getAmmunitionStandardConsumptionRates // New import
} from '@/lib/actions/inventory.actions';
import type { AlertDefinition, SupportedCaliber, AmmunitionStandardConsumptionRate } from '@/types/inventory'; // Added AmmunitionStandardConsumptionRate
import { SUPPORTED_CALIBERS } from '@/types/inventory';
import { Badge } from '@/components/ui/badge';
import type { AuditLogEntry } from '@/types/audit';
import { AmmunitionUsageSummaryChart } from './_components/ammunition-usage-summary-chart';
import { MonthlyScenarioUsageChart } from './_components/monthly-scenario-usage-chart';


export default async function DashboardPage() {
  const firearms = await getFirearms();
  const magazines = await getMagazines();
  const ammunitionStock = await getAmmunition();
  const otherMaterialsStock = await getOtherMaterials();
  const triggeredAlerts = await getTriggeredAlerts();
  const recentAuditLogs = await getRecentAuditLogs(5);
  const dailyUsageLogs = await getAmmunitionDailyUsageLogs();
  const monthlyScenarioUsageData = await getMonthlyScenarioUsageForChart();
  const standardConsumptionRates = await getAmmunitionStandardConsumptionRates(); // Fetch new rates

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
    AmmunitionStandardConsumptionRate: "Fişek Sarfiyat Standardı",
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
      
      <Card className="bg-sky-50 dark:bg-sky-900/30 border-sky-200 dark:border-sky-700/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sky-800 dark:text-sky-300">
            <Calculator className="h-6 w-6" />
            <span suppressHydrationWarning>Mühimmat Yeterlilik Tahmini</span>
          </CardTitle>
          <CardDescription className="text-sky-700 dark:text-sky-400" suppressHydrationWarning>
            Her bir kalibre için mevcut stok ve tanımlanmış standart kişi başı sarfiyat oranlarına göre tahmini yeterlilik.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SUPPORTED_CALIBERS.map(caliber => {
            const stock = stockByCaliber[caliber] || 0;
            const rateEntry = standardConsumptionRates.find(r => r.caliber === caliber);
            const roundsPerPerson = rateEntry ? rateEntry.roundsPerPerson : 0;
            const engagementsRemaining = roundsPerPerson > 0 ? Math.floor(stock / roundsPerPerson) : Infinity;

            return (
              <Card key={caliber} className="bg-background/70 dark:bg-background/50">
                <CardHeader className="pb-2 pt-3">
                  <CardTitle className="text-md font-semibold text-foreground">{caliber}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground" suppressHydrationWarning>Mevcut Stok:</span>
                    <span className="font-medium">{stock.toLocaleString()} <span className="text-xs text-muted-foreground">adet</span></span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground" suppressHydrationWarning>Kişi Başı Sarfiyat:</span>
                    <span className="font-medium">{roundsPerPerson.toLocaleString()} <span className="text-xs text-muted-foreground">adet</span></span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-dashed mt-1">
                    <span className="text-muted-foreground font-medium" suppressHydrationWarning>Tahmini Kişi Sayısı:</span>
                    <span className={`font-bold ${engagementsRemaining === Infinity || engagementsRemaining === 0 ? 'text-orange-500' : 'text-green-600 dark:text-green-400'}`}>
                      {engagementsRemaining === Infinity ? (roundsPerPerson === 0 ? 'Tanımsız' : 'Sınırsız') : engagementsRemaining.toLocaleString()}
                    </span>
                  </div>
                   {engagementsRemaining === Infinity && roundsPerPerson === 0 && (
                        <p className="text-xs text-orange-500" suppressHydrationWarning>Bu kalibre için kişi başı sarfiyat 0 olarak ayarlanmış.</p>
                    )}
                </CardContent>
              </Card>
            );
          })}
           <div className="sm:col-span-2 lg:col-span-4 mt-2">
                <Link href="/admin/ammo-consumption-rates">
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                        <Calculator className="mr-2 h-4 w-4"/> <span suppressHydrationWarning>Standart Sarfiyat Oranlarını Düzenle</span>
                    </Button>
                </Link>
            </div>
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
