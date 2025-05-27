import { getFirearmById } from "@/lib/actions/inventory.actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Edit, Wrench, History, StickyNote } from "lucide-react";
import { DEPOT_LOCATIONS } from "@/types/inventory";
import { notFound } from "next/navigation";

export default async function FirearmDetailPage({ params }: { params: { id: string } }) {
  const firearm = await getFirearmById(params.id);

  if (!firearm) {
    notFound();
  }
  
  const getStatusColor = (status: typeof firearm.status) => {
    switch (status) {
      case 'In Service': return 'bg-green-500 hover:bg-green-600';
      case 'Under Maintenance': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'Defective': return 'bg-red-500 hover:bg-red-600';
      case 'Awaiting Repair': return 'bg-orange-500 hover:bg-orange-600';
      case 'Repaired': return 'bg-blue-500 hover:bg-blue-600';
      case 'Out of Service': return 'bg-gray-500 hover:bg-gray-600';
      default: return 'bg-primary';
    }
  };

  const depot = DEPOT_LOCATIONS.find(d => d.id === firearm.depotId);

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/inventory/firearms" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Firearms List
      </Link>

      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">{firearm.name} - {firearm.serialNumber}</CardTitle>
            <CardDescription>{firearm.model} ({firearm.caliber})</CardDescription>
          </div>
          <Link href={`/inventory/firearms/${firearm.id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" /> Edit
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="font-semibold mb-1">Status:</h3>
            <Badge variant="secondary" className={`${getStatusColor(firearm.status)} text-primary-foreground text-base px-3 py-1`}>
              {firearm.status}
            </Badge>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Depot:</h3>
            <p>{depot?.name || 'Unknown Depot'}</p>
          </div>
          {firearm.manufacturer && (
            <div>
              <h3 className="font-semibold mb-1">Manufacturer:</h3>
              <p>{firearm.manufacturer}</p>
            </div>
          )}
          {firearm.purchaseDate && (
            <div>
              <h3 className="font-semibold mb-1">Purchase Date:</h3>
              <p>{new Date(firearm.purchaseDate).toLocaleDateString()}</p>
            </div>
          )}
           <div>
            <h3 className="font-semibold mb-1">Last Updated:</h3>
            <p>{new Date(firearm.lastUpdated).toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>

      {firearm.notes && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><StickyNote className="h-5 w-5" /> Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{firearm.notes}</p>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><History className="h-5 w-5" /> Maintenance History</CardTitle>
          <CardDescription>Log of all maintenance activities for this firearm.</CardDescription>
        </CardHeader>
        <CardContent>
          {firearm.maintenanceHistory && firearm.maintenanceHistory.length > 0 ? (
            <ul className="space-y-4">
              {firearm.maintenanceHistory.map(log => (
                <li key={log.id} className="p-4 border rounded-md">
                  <p className="font-semibold">Date: {new Date(log.date).toLocaleDateString()}</p>
                  <p>Status Change: {log.statusChangeFrom} <ArrowLeft className="inline h-3 w-3"/> {log.statusChangeTo}</p>
                  <p>Description: {log.description}</p>
                  {log.technician && <p>Technician: {log.technician}</p>}
                </li>
              ))}
            </ul>
          ) : (
            <p>No maintenance history recorded.</p>
          )}
          <Button variant="outline" className="mt-4">
             <Wrench className="mr-2 h-4 w-4" /> Add Maintenance Log
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
