import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, BellRing } from "lucide-react";

export default async function AlertsPage() {
  // Mock alerts data
  const alerts = [
    { id: '1', severity: 'High', message: 'Low stock: 9mm FMJ ammunition (Depot A - 500 rounds remaining)', date: new Date().toISOString() },
    { id: '2', severity: 'Medium', message: 'Firearm SN:XG5523 overdue for scheduled maintenance', date: new Date(Date.now() - 86400000 * 2).toISOString() },
    { id: '3', severity: 'Low', message: 'Magazine M007 (Depot B) reported minor damage', date: new Date(Date.now() - 86400000 * 3).toISOString() },
  ];

  const getSeverityColor = (severity: string) => {
    if (severity === 'High') return 'border-red-500 bg-red-50';
    if (severity === 'Medium') return 'border-yellow-500 bg-yellow-50';
    return 'border-blue-500 bg-blue-50';
  };
  
  const getSeverityTextColor = (severity: string) => {
    if (severity === 'High') return 'text-red-700';
    if (severity === 'Medium') return 'text-yellow-700';
    return 'text-blue-700';
  };


  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <ShieldAlert className="h-8 w-8 text-destructive" />
        <h1 className="text-3xl font-bold tracking-tight">System Alerts</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Active Alerts</CardTitle>
          <CardDescription>Review important notifications regarding inventory levels and item statuses.</CardDescription>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <p className="text-muted-foreground">No active alerts. System is nominal.</p>
          ) : (
            <div className="space-y-4">
              {alerts.map(alert => (
                <Card key={alert.id} className={`${getSeverityColor(alert.severity)}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className={`text-lg ${getSeverityTextColor(alert.severity)} flex items-center gap-2`}>
                      <BellRing className="h-5 w-5"/>
                      {alert.severity} Priority Alert
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className={`${getSeverityTextColor(alert.severity)}`}>{alert.message}</p>
                    <p className={`text-xs mt-1 ${getSeverityTextColor(alert.severity)} opacity-75`}>
                      Logged: {new Date(alert.date).toLocaleString()}
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
