import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Truck } from "lucide-react";
import Link from "next/link";

export default async function ShipmentsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="h-8 w-8" />
          <h1 className="text-3xl font-bold tracking-tight">Shipment Tracking</h1>
        </div>
        {/* <Link href="/shipments/new"> */}
          <Button disabled>
            <PlusCircle className="mr-2 h-4 w-4" /> Log New Shipment
          </Button>
        {/* </Link> */}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Shipment History</CardTitle>
          <CardDescription>View incoming and outgoing shipments.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Shipment logging and history table will be displayed here. Feature under construction.</p>
        </CardContent>
      </Card>
    </div>
  );
}
