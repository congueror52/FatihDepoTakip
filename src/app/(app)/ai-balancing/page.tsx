import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit } from "lucide-react";
import { AiBalancingForm } from "./_components/ai-balancing-form";
import { getCurrentDepotInventoriesForAI, getHistoricalUsageForAI } from "@/lib/actions/inventory.actions";

export default async function AiBalancingPage() {
  const { depotA, depotB } = await getCurrentDepotInventoriesForAI();
  const historicalUsage = await getHistoricalUsageForAI();

  // Yaklaşan gereksinimler için, istemci bileşeninde bir yer tutucu veya basit bir form girişi kullanacağız
  // çünkü bu veriler dinamik olabilir veya kullanıcı tarafından belirli bir senaryo için manuel olarak girilebilir.

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <BrainCircuit className="h-8 w-8" />
        <h1 className="text-3xl font-bold tracking-tight" suppressHydrationWarning>Yapay Zeka Stok Dengeleme</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle suppressHydrationWarning>Yeniden Dengeleme Önerileri</CardTitle>
          <CardDescription suppressHydrationWarning>
            Depo Alfa ve Depo Bravo arasında en uygun stok dağıtım önerilerini almak için yapay zekayı kullanın.
            Mevcut envanter anlık görüntülerini, geçmiş kullanımı ve yaklaşan gereksinimleri sağlayın.
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
