import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Boxes, DollarSign, Users, ShieldAlert, BarChart3, Activity } from 'lucide-react';
import Image from 'next/image';
// import { AmmoUsageChart } from '@/components/dashboard/AmmoUsageChart'; // Placeholder, implement later
// import { StockLevels } from '@/components/dashboard/StockLevels'; // Placeholder, implement later
// import { AlertsSummary } from '@/components/dashboard/AlertsSummary'; // Placeholder, implement later

export default async function DashboardPage() {
  // In a real app, fetch data here
  const summaryData = {
    totalFirearms: 125,
    totalMagazines: 580,
    totalAmmunitionRounds: 150000,
    activeAlerts: 3,
    recentActivity: [
      { id: 1, description: "Shipment of 5.56mm ammo received", time: "2 hours ago" },
      { id: 2, description: "Firearm SN:XG5523 reported for maintenance", time: "5 hours ago" },
      { id: 3, description: "Low stock alert for 9mm HP rounds", time: "1 day ago" },
    ]
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Firearms</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData.totalFirearms}</div>
            <p className="text-xs text-muted-foreground">+2 since last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Magazines</CardTitle>
            <Boxes className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData.totalMagazines}</div>
            <p className="text-xs text-muted-foreground">+15 since last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ammunition Rounds</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData.totalAmmunitionRounds.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+5,000 since last shipment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <ShieldAlert className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{summaryData.activeAlerts}</div>
            <p className="text-xs text-muted-foreground">View details in Alerts page</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" /> Ammunition Usage Overview</CardTitle>
            <CardDescription>Monthly ammunition consumption trends.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            {/* <AmmoUsageChart /> */}
            <div className="h-[300px] flex items-center justify-center bg-muted/50 rounded-md">
              <Image src="https://placehold.co/600x300.png?text=Ammo+Usage+Chart" alt="Ammo Usage Chart Placeholder" width={600} height={300} data-ai-hint="chart graph" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Placeholder for Ammunition Usage Chart.</p>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle  className="flex items-center gap-2"><Activity className="h-5 w-5" />Recent Activity</CardTitle>
            <CardDescription>Latest updates and system events.</CardDescription>
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
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder for StockLevels and AlertsSummary components */}
      {/* <StockLevels /> */}
      {/* <AlertsSummary /> */}
    </div>
  );
}
