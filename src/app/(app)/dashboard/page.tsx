
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Boxes, DollarSign, Users, ShieldAlert, BarChart3, Activity, Target, ListChecks, BellRing } from 'lucide-react'; // Added BellRing
import Image from 'next/image';
import Link from 'next/link';
import { getFirearms, getMagazines, getAmmunition, getTriggeredAlerts } from '@/lib/actions/inventory.actions'; // Changed to getTriggeredAlerts
import type { AlertDefinition } from '@/types/inventory'; 
import { Badge } from '@/components/ui/badge'; 


export default async function DashboardPage() {
  const firearms = await getFirearms();
  const magazines = await getMagazines();
  const ammunition = await getAmmunition();
  const triggeredAlerts = await getTriggeredAlerts(); // Fetch triggered alerts

  const latestAlerts = triggeredAlerts.slice(0, 5); // Show latest 5 triggered alerts


  const summaryData = {
    totalFirearms: firearms.length,
    totalMagazines: magazines.length,
    totalAmmunitionRounds: ammunition.reduce((sum, ammo) => sum + ammo.quantity, 0),
    recentActivity: [
      { id: 1, description: "5.56mm mühimmat sevkiyatı alındı", time: "2 saat önce" },
      { id: 2, description: "SN:XG5523 seri numaralı silah bakım için bildirildi", time: "5 saat önce" },
      { id: 3, description: "9mm HP fişekler için düşük stok uyarısı", time: "1 gün önce" },
    ]
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
              {triggeredAlerts.length === 0 ? "aktif uyarı bulunmuyor" : (triggeredAlerts.length === 1 ? "aktif uyarı" : "aktif uyarılar")}
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
              {summaryData.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 pt-1">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                      <Activity className="h-4 w-4 text-secondary-foreground" />
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium" suppressHydrationWarning>{activity.description}</p>
                    <p className="text-xs text-muted-foreground" suppressHydrationWarning>{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {latestAlerts.length > 0 && (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BellRing className="h-5 w-5 text-destructive" />
                    <span suppressHydrationWarning>Son Uyarılar</span>
                </CardTitle>
                <CardDescription suppressHydrationWarning>Sistemdeki en son {latestAlerts.length} önemli uyarı.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {latestAlerts.map(alert => (
                    <div key={alert.id} className="flex items-start justify-between p-3 border rounded-md shadow-sm">
                        <div>
                            <p className="font-medium text-sm" suppressHydrationWarning>{alert.name}</p>
                             {/* In a real triggered alert system, this message would be pre-rendered from template */}
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
       {(latestAlerts.length === 0 && triggeredAlerts.length > 0) && ( // Case where there are alerts, but less than 5 (or 0 for "Son Uyarılar")
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
                        <span suppressHydrationWarning>Tüm Uyarıları Gör</span>
                    </Link>
                </CardContent>
            </Card>
        )}
    </div>
  );
}

