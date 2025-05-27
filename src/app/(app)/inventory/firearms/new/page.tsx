import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FirearmForm } from "../_components/firearm-form";
import { Target } from "lucide-react";

export default function NewFirearmPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Target className="h-8 w-8" />
        <h1 className="text-3xl font-bold tracking-tight">Add New Firearm</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Firearm Details</CardTitle>
          <CardDescription>Enter the information for the new firearm.</CardDescription>
        </CardHeader>
        <CardContent>
          <FirearmForm />
        </CardContent>
      </Card>
    </div>
  );
}
