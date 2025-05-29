
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Boxes, DollarSign, Users, ShieldAlert, BarChart3, Activity, Target, ListChecks, BellRing } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { getFirearms, getMagazines, getAmmunition, getTriggeredAlerts, getRecentAuditLogs } from '@/lib/actions/inventory.actions';
import type { AlertDefinition } from '@/types/inventory'; 
import { Badge } from '@/components/ui/badge'; 
import type { AuditLogEntry } from '@/types/audit';


export default async function DashboardPage() {
  const firearms = await getFirearms();
  const magazines = await getMagazines();
  const ammunition = await getAmmunition();
  const triggeredAlerts = await getTriggeredAlerts(); 
  const recentAuditLogs = await getRecentAuditLogs(5);

  // For "Diğer Malzemeler" (Other Items) - Placeholder count for now
  const totalOtherItems = 0; 


  const summaryData = {
    totalFirearms: firearms.length,
    totalMagazines: magazines.length,
    totalAmmunitionRounds: ammunition.reduce((sum, ammo) => sum + ammo.quantity, 0),
  };
  
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
    Depot: "Depo",
    UsageScenario: "Kullanım Senaryosu",
    DailyAmmunitionUsage: "Günlük Fişek Kullanımı",
    Shipment: "Malzeme Kaydı",
    ShipmentTypeDefinition: "Malzeme Kayıt Türü",
    MaintenanceLog: "Bakım Kaydı",
    AmmunitionUsage: "Mühimmat Kullanımı", // This might be deprecated
    AlertDefinition: "Uyarı Tanımı",
  };

  const formatLogEntryDescription = (log: AuditLogEntry): string => {
    const translatedEntityType = entityTypeTranslations[log.entityType] || log.entityType;
    
    let identifier = log.details?.name || log.entityId || log.details?.id;

    if (typeof identifier === 'string' && identifier.length > 20) {
      identifier = `${identifier.substring(0, 17)}...`;
    } else if (!identifier) {
      identifier = ''; 
    }

    const identifierText = identifier ? `"${identifier}"` : '';

    switch (log.actionType) {
      case 'CREATE':
        return `${translatedEntityType} ${identifierText} oluşturuldu.`;
      case 'UPDATE':
        if ((log.entityType === 'Firearm' || log.entityType === 'Magazine') && log.details?.maintenanceLogAdded && log.details?.status) {
             return `${translatedEntityType} ${identifierText} için bakım yapıldı, yeni durum: ${log.details.status}.`;
        }
        return `${translatedEntityType} ${identifierText} güncellendi.`;
      case 'DELETE':
        return `${translatedEntityType} ${identifierText} silindi.`;
      case 'LOG_USAGE': 
        return `Mühimmat kullanımı kaydedildi: ${log.details?.ammunitionId || identifierText}`;
      case 'LOG_MAINTENANCE': 
         // This case is for the 'MaintenanceLog' entity type being created.
         // The actual item being maintained is logged via an 'UPDATE' to 'Firearm' or 'Magazine'.
         // So, a log for a 'MaintenanceLog' entity means "A maintenance log entry was created".
         return `${translatedEntityType} ${identifierText} oluşturuldu.`;
      default:
        return `${log.actionType} işlemi ${translatedEntityType} ${identifierText} üzerinde yapıldı.`;
    }
  };


  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight" suppressHydrationWarning>ÖZET BİLGİLER</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Link href="/inventory/firearms" className="hover:underline">
              <CardTitle className="text-sm font-medium" suppressHydrationWarning>Toplam Silah</CardTitle>
            </Link>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData.totalFirearms}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Link href="/inventory/magazines" className="hover:underline">
              <CardTitle className="text-sm font-medium" suppressHydrationWarning>Toplam Şarjör</CardTitle>
            </Link>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData.totalMagazines}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Link href="/inventory/ammunition" className="hover:underline">
              <CardTitle className="text-sm font-medium" suppressHydrationWarning>Mühimmat Adedi</CardTitle>
            </Link>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-box h-4 w-4 text-muted-foreground"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" x2="12" y1="22" y2="12"/></svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData.totalAmmunitionRounds.toLocaleString()}</div>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" suppressHydrationWarning>Toplam Diğer Malzemeler</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOtherItems}</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Link href="/alerts" className="hover:underline">
              <CardTitle className="text-sm font-medium">
                <span suppressHydrationWarning>Aktif Uyarılar</span>
              </CardTitle>
            </Link>
            <ShieldAlert className={`h-4 w-4 ${triggeredAlerts.length > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{triggeredAlerts.length}</div>
            <p className="text-xs text-muted-foreground" suppressHydrationWarning>
              {triggeredAlerts.length === 0 ? "aktif uyarı bulunmuyor" : (triggeredAlerts.length === 1 ? "aktif uyarı" : `${triggeredAlerts.length} aktif uyarılar`)}
            </p>
          </CardContent>
        </Card>
      </div>


      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" /> <span suppressHydrationWarning>Mühimmat Kullanım Özeti</span></CardTitle>
            <CardDescription suppressHydrationWarning>Aylık mühimmat tüketim eğilimleri.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] flex items-center justify-center bg-muted/50 rounded-md">
              <Image src="https://placehold.co/600x300.png?text=Mühimmat+Kullanım+Grafiği" alt="Mühimmat Kullanım Grafiği Yer Tutucusu" width={600} height={300} data-ai-hint="grafik çizelge" />
            </div>
            <p className="text-xs text-muted-foreground mt-2" suppressHydrationWarning>Mühimmat Kullanım Grafiği için yer tutucu.</p>
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
      
      {triggeredAlerts.length > 0 && (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BellRing className="h-5 w-5 text-destructive" />
                    <span suppressHydrationWarning>Son Uyarılar</span>
                </CardTitle>
                <CardDescription suppressHydrationWarning>Sistemdeki en son {Math.min(triggeredAlerts.length, 5)} önemli uyarı.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {triggeredAlerts.slice(0, 5).map(alert => ( // Tetiklenmiş uyarıları gösterir
                    <div key={alert.id} className="flex items-start justify-between p-3 border rounded-md shadow-sm">
                        <div>
                            <p className="font-medium text-sm" suppressHydrationWarning>{alert.name}</p>
                            <p className="text-xs text-muted-foreground" suppressHydrationWarning>
                                {alert.messageTemplate.substring(0, 100) + '...'} - <span suppressHydrationWarning>Tetiklenme: {new Date(alert.lastUpdated).toLocaleDateString('tr-TR')}</span>
                            </p>
                        </div>
                        <Badge className={getSeverityBadgeClasses(alert.severity)}>{alert.severity}</Badge>
                    </div>
                ))}
                 <Link href="/alerts" className="text-sm text-primary hover:underline float-right mt-2">
                    <span suppressHydrationWarning>Tüm Uyarıları Gör</span>
                </Link>
            </CardContent>
        </Card>
      )}
       {(triggeredAlerts.length === 0) && ( 
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BellRing className="h-5 w-5 text-muted-foreground" />
                        <span suppressHydrationWarning>Son Uyarılar</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground"><span suppressHydrationWarning>Dikkate değer son uyarı bulunmamaktadır.</span></p>
                     <Link href="/alerts" className="text-sm text-primary hover:underline float-right mt-2">
                        <span suppressHydrationWarning>Tanımlı Uyarılara Git</span>
                    </Link>
                </CardContent>
            </Card>
        )}
    </div>
  );
}
