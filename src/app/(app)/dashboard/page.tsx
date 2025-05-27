import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Boxes, DollarSign, Users, ShieldAlert, BarChart3, Activity } from 'lucide-react';
import Image from 'next/image';
// import { AmmoUsageChart } from '@/components/dashboard/AmmoUsageChart'; // Placeholder, implement later
// import { StockLevels } from '@/components/dashboard/StockLevels'; // Placeholder, implement later
// import { AlertsSummary } from '@/components/dashboard/AlertsSummary'; // Placeholder, implement later

export default async function DashboardPage() {
  // Gerçek bir uygulamada veriler burada çekilir
  const summaryData = {
    totalFirearms: 125,
    totalMagazines: 580,
    totalAmmunitionRounds: 150000,
    activeAlerts: 3,
    recentActivity: [
      { id: 1, description: "5.56mm mühimmat sevkiyatı alındı", time: "2 saat önce" },
      { id: 2, description: "SN:XG5523 seri numaralı ateşli silah bakım için bildirildi", time: "5 saat önce" },
      { id: 3, description: "9mm HP fişekler için düşük stok uyarısı", time: "1 gün önce" },
    ]
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight" suppressHydrationWarning>Gösterge Paneli</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" suppressHydrationWarning>Toplam Ateşli Silah</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData.totalFirearms}</div>
            <p className="text-xs text-muted-foreground" suppressHydrationWarning>geçen aydan beri +2</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" suppressHydrationWarning>Toplam Şarjör</CardTitle>
            <Boxes className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData.totalMagazines}</div>
            <p className="text-xs text-muted-foreground" suppressHydrationWarning>geçen aydan beri +15</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" suppressHydrationWarning>Mühimmat Adedi</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData.totalAmmunitionRounds.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground" suppressHydrationWarning>son sevkiyattan beri +5,000</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" suppressHydrationWarning>Aktif Uyarılar</CardTitle>
            <ShieldAlert className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{summaryData.activeAlerts}</div>
            <p className="text-xs text-muted-foreground" suppressHydrationWarning>Detayları Uyarılar sayfasında görüntüleyin</p>
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
