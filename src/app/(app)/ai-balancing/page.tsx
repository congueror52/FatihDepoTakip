import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit } from "lucide-react";
import { AiBalancingForm } from "./_components/ai-balancing-form";
import { getCurrentDepotInventoriesForAI, getHistoricalUsageForAI } from "@/lib/actions/inventory.actions";

export default async function AiBalancingPage() {
  const { depotA, depotB } = await getCurrentDepotInventoriesForAI();
  const historicalUsage = await getHistoricalUsageForAI();

  // For upcoming requirements, we'll use a placeholder or a simple form input in the client component
  // as this data might be dynamic or manually entered by the user for a specific scenario.

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <BrainCircuit className="h-8 w-8" />
        <h1 className="text-3xl font-bold tracking-tight">AI Stock Balancing</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Rebalancing Suggestions</CardTitle>
          <CardDescription>
            Utilize AI to get optimal stock distribution recommendations between Depot Alpha and Depot Bravo. 
            Provide current inventory snapshots, historical usage, and any upcoming requirements.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AiBalancingForm 
            initialDepotAInventory={depotA}
            initialDepotBInventory={depotB}
            initialHistoricalUsage={historicalUsage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
