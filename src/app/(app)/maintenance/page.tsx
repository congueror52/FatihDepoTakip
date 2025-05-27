import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Wrench } from "lucide-react";
import Link from "next/link";

export default async function MaintenancePage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wrench className="h-8 w-8" />
          <h1 className="text-3xl font-bold tracking-tight">Maintenance Hub</h1>
        </div>
        {/* <Link href="/maintenance/new-log"> */}
          <Button disabled>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Maintenance Log
          </Button>
        {/* </Link> */}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Overview</CardTitle>
          <CardDescription>Track items under maintenance and their history.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Maintenance logs and status updates will be managed here. Feature under construction.</p>
          <p className="mt-2 text-sm text-muted-foreground">Individual item maintenance history is available on item detail pages.</p>
        </CardContent>
      </Card>
    </div>
  );
}
