
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Boxes, DollarSign, Users, ShieldAlert, BarChart3, Activity, BellRing, ArrowRight, Target, ListChecks } from 'lucide-react'; // Added ListChecks
import Image from 'next/image';
import Link from 'next/link';
import { getFirearms, getMagazines, getAmmunition } from '@/lib/actions/inventory.actions'; // Added getMagazines

// import { AmmoUsageChart } from '@/components/dashboard/AmmoUsageChart'; // Placeholder, implement later
// import { StockLevels } from '@/components/dashboard/StockLevels'; // Placeholder, implement later
// import { AlertsSummary } from '@/components/dashboard/AlertsSummary'; // Placeholder, implement later

export default async function DashboardPage() {
  // Gerçek bir uygulamada veriler burada çekilir
  const firearms = await getFirearms();
  const magazines = await getMagazines(); // Fetch magazines
  const ammunition = await getAmmunition();

  const summaryData = {
    totalFirearms: firearms.length,
    totalMagazines: magazines.length, // Use fetched magazine count
    totalAmmunitionRounds: ammunition.reduce((sum, ammo) => sum + ammo.quantity, 0),
    recentActivity: [
      { id: 1, description: "5.56mm mühimmat sevkiyatı alındı", time: "2 saat önce" },
      { id: 2, description: "SN:XG5523 seri numaralı silah bakım için bildirildi", time: "5 saat önce" },
      { id: 3, description: "9mm HP fişekler için düşük stok uyarısı", time: "1 gün önce" },
    ]
  };

  // Örnek uyarı verileri (alerts sayfasındakiyle tutarlı)
  const allAlerts = [
    { id: '1', severity: 'Yüksek', message: 'Düşük stok: 9mm FMJ mühimmat (Depo A - 500 adet kaldı)', date: new Date(Date.now() - 86400000 * 0.2).toISOString() },
    { id: '2', severity: 'Orta', message: 'SN:XG5523 seri nolu silahın planlı bakımı gecikti', date: new Date(Date.now() - 86400000 * 2).toISOString() },
    { id: '4', severity: 'Yüksek', message: 'Depo B sıcaklık sensörü arızalı.', date: new Date(Date.now() - 86400000 * 0.5).toISOString() },
    { id: '3', severity: 'Düşük', message: 'Şarjör M007 (Depo B) için küçük hasar bildirildi', date: new Date(Date.now() - 86400000 * 3).toISOString() },
    { id: '5', severity: 'Orta', message: 'Depo A nem seviyesi kritik eşiğin üzerinde.', date: new Date(Date.now() - 86400000 * 1).toISOString() },
  ];

  const severityOrder: { [key: string]: number } = { 'Yüksek': 1, 'Orta': 2, 'Düşük': 3 };
  
  const sortedAlerts = [...allAlerts]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) 
    .sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]); 

  const top3Alerts = sortedAlerts.slice(0, 3);

  const getSeverityTextColor = (severity: string) => {
    if (severity === 'Yüksek') return 'text-red-700 dark:text-red-400';
    if (severity === 'Orta') return 'text-yellow-700 dark:text-yellow-400';
    return 'text-blue-700 dark:text-blue-400'; 
  };


  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight" suppressHydrationWarning>Gösterge Paneli</h1>
      
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
            {/* <p className="text-xs text-muted-foreground" suppressHydrationWarning>geçen aydan beri +2</p> */}
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
            {/* <p className="text-xs text-muted-foreground" suppressHydrationWarning>geçen aydan beri +15</p> */}
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
            {/* <p className="text-xs text-muted-foreground" suppressHydrationWarning>son sevkiyattan beri +5,000</p> */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Link href="/alerts" className="hover:underline">
              <CardTitle className="text-sm font-medium">
                <span suppressHydrationWarning>Aktif Uyarılar</span>
              </CardTitle>
            </Link>
            <ShieldAlert className={`h-4 w-4 ${allAlerts.length > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent className="pt-1">
            {sortedAlerts.length > 0 && (
              <div className="space-y-3">
                {top3Alerts.map(alert => (
                  <div key={alert.id} className="flex items-start gap-2">
                    <BellRing className={`h-4 w-4 mt-0.5 shrink-0 ${getSeverityTextColor(alert.severity)}`} />
                    <div>
                      <p className={`text-xs font-medium leading-tight ${getSeverityTextColor(alert.severity)}`} suppressHydrationWarning>
                        {alert.message}
                      </p>
                      <p className={`text-[0.7rem] text-muted-foreground opacity-80`} suppressHydrationWarning>
                        {new Date(alert.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: 'numeric', minute: 'numeric' })}
                      </p>
                    </div>
                  </div>
                ))}
                 <Link href="/alerts" className="text-xs text-primary hover:underline font-medium flex items-center gap-1 pt-1">
                  {allAlerts.length > 3 ? (
                    <span suppressHydrationWarning>Tüm {allAlerts.length} uyarıyı gör</span>
                  ) : (
                    <span suppressHydrationWarning>Uyarıları Yönet</span>
                  )}
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            )}
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
            {/* <AmmoUsageChart /> */}
            <div className="h-[300px] flex items-center justify-center bg-muted/50 rounded-md">
              <Image src="https://placehold.co/600x300.png?text=Mühimmat+Kullanım+Grafiği" alt="Mühimmat Kullanım Grafiği Yer Tutucusu" width={600} height={300} data-ai-hint="grafik çizelge" />
            </div>
            <p className="text-xs text-muted-foreground mt-2" suppressHydrationWarning>Mühimmat Kullanım Grafiği için yer tutucu.</p>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle  className="flex items-center gap-2"><Activity className="h-5 w-5" /><span suppressHydrationWarning>Son Aktiviteler</span></CardTitle>
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

      {/* StockLevels ve AlertsSummary bileşenleri için yer tutucu */}
      {/* <StockLevels /> */}
      {/* <AlertsSummary /> */}
    </div>
  );
}
