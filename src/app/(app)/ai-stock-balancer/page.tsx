
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Brain, Loader2, AlertTriangle, ArrowRightLeft, Info } from 'lucide-react';
import { getAmmunition, getDepots, getAmmunitionDailyUsageLogs } from '@/lib/actions/inventory.actions';
import { getStockBalancingRecommendations, type StockBalancingInput, type StockBalancingOutput } from '@/ai/flows/stock-balancing-flow';
import type { Ammunition, Depot, AmmunitionDailyUsageLog, SupportedCaliber } from '@/types/inventory';
import { Separator } from '@/components/ui/separator';

const ANALYSIS_PERIOD_DAYS = 30; // Default period to analyze usage

export default function AiStockBalancerPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<StockBalancingOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [depotA, setDepotA] = useState<Depot | null>(null);
  const [depotB, setDepotB] = useState<Depot | null>(null);

  useEffect(() => {
    async function fetchDepotInfo() {
        const allDepots = await getDepots();
        const dA = allDepots.find(d => d.id === 'depotA'); // Kadro Atışı
        const dB = allDepots.find(d => d.id === 'depotB'); // ACM
        if (dA) setDepotA(dA);
        if (dB) setDepotB(dB);
    }
    fetchDepotInfo();
  }, []);


  const handleAnalyzeStock = async () => {
    setIsLoading(true);
    setError(null);
    setRecommendations(null);

    try {
      const allAmmunition = await getAmmunition();
      const allDepots = await getDepots(); // Re-fetch or use state if already fetched
      const dailyUsageLogs = await getAmmunitionDailyUsageLogs();

      const depotAData = allDepots.find(d => d.id === 'depotA');
      const depotBData = allDepots.find(d => d.id === 'depotB');

      if (!depotAData || !depotBData) {
        throw new Error("Depot A (Kadro Atışı) or Depot B (ACM) definitions not found.");
      }

      const createDepotStockView = (depotId: string, depotName: string) => {
        const stock = allAmmunition
          .filter(a => a.depotId === depotId)
          .map(a => ({ caliber: a.caliber, quantity: a.quantity }));
        return { depotId, depotName, ammunition: stock };
      };

      const aggregateUsage = (depotId: string, depotName: string) => {
        const relevantLogs = dailyUsageLogs.filter(log => {
            const logDate = new Date(log.date);
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - ANALYSIS_PERIOD_DAYS);
            return logDate >= cutoffDate; // Only consider logs within the analysis period
        });

        const usageByCaliber: Record<string, number> = {};
        relevantLogs.forEach(log => {
            // Assuming usage logs are for a specific depot, or need filtering if they are global
            // For now, let's assume logs don't have depotId and apply usage to specific depots based on context
            // This needs refinement if dailyUsageLogs don't inherently map to specific depots per caliber
            // For this example, let's assume we can't directly link daily usage to Depot A or B without more context in the logs
            // So, we will simulate a scenario where usage applies to the target depot.
            // This part needs more robust logic based on how dailyUsageLogs are structured.
            // For now, let's aggregate ALL usage and let the AI discern if possible, or we need to update how usage is logged.
            // For a more realistic scenario, dailyUsageLogs should have a depotId.
            // Let's assume for now `dailyUsageLogs` are global and we distribute them for the AI prompt
            // based on which depot we are analyzing. This is a simplification.

            // Simplified: if daily usage logs don't specify depot, this aggregation won't be depot-specific.
            // The prompt will need to handle this ambiguity or the data model for daily usage needs depotId.
            // For now, let's provide total usage and let the AI make sense of it with current stock.
            // This section needs real-world data structure considerations.
            // A BETTER APPROACH: If AmmunitionDailyUsageLog has depotId:
            if (log.depotId === depotId) { // Hypothetical: if daily logs had depotId
                 (Object.keys(log) as Array<keyof AmmunitionDailyUsageLog>).forEach(key => {
                    if (key.startsWith('used_')) {
                        const caliber = key.replace('used_', '').replace(/_/g, '.'); // e.g. used_9x19mm -> 9x19mm
                        if (SUPPORTED_CALIBERS.includes(caliber as SupportedCaliber)) {
                             usageByCaliber[caliber] = (usageByCaliber[caliber] || 0) + (log[key] as number);
                        }
                    }
                });
            }
        });
         // If no specific depot logs, use all logs for both - this is a placeholder for better logic
        if (Object.keys(usageByCaliber).length === 0) {
             dailyUsageLogs.forEach(log => {
                (Object.keys(log) as Array<keyof AmmunitionDailyUsageLog>).forEach(key => {
                    if (key.startsWith('used_')) {
                        const caliber = key.replace('used_', '').replace(/_/g, '.');
                         if (SUPPORTED_CALIBERS.includes(caliber as SupportedCaliber)) {
                            usageByCaliber[caliber] = (usageByCaliber[caliber] || 0) + (log[key] as number);
                        }
                    }
                });
            });
        }


        return {
            depotId,
            depotName,
            ammunitionUsage: Object.entries(usageByCaliber).map(([caliber, totalUsed]) => ({ caliber, totalUsed })),
        };
      };
      
      const inputForAI: StockBalancingInput = {
        depotAStock: createDepotStockView('depotA', depotAData.name),
        depotBStock: createDepotStockView('depotB', depotBData.name),
        // For historical usage, if logs are not depot-specific, we pass general usage or make assumptions.
        // This is a key area for data model refinement. For now, passing aggregated general usage.
        depotAHistoricalUsage: aggregateUsage('depotA', depotAData.name), // Placeholder logic
        depotBHistoricalUsage: aggregateUsage('depotB', depotBData.name), // Placeholder logic
        analysisPeriodDays: ANALYSIS_PERIOD_DAYS,
      };

      const result = await getStockBalancingRecommendations(inputForAI);
      setRecommendations(result);
    } catch (e: any) {
      console.error("Stock balancing analysis error:", e);
      setError(e.message || "Stok dengeleme önerileri alınırken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight" suppressHydrationWarning>AI Destekli Stok Dengeleme</h1>
        </div>
        <Button onClick={handleAnalyzeStock} disabled={isLoading || !depotA || !depotB}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <ArrowRightLeft className="mr-2 h-4 w-4" />
          )}
          <span suppressHydrationWarning>{isLoading ? "Analiz Ediliyor..." : "Stokları Analiz Et ve Öner"}</span>
        </Button>
      </div>
      
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Bilgilendirme</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground" suppressHydrationWarning>
            Bu araç, {depotA?.name ? `Depo A (${depotA.name})` : 'Depo A'} ile {depotB?.name ? `Depo B (${depotB.name})` : 'Depo B'} arasındaki mühimmat stoklarını, mevcut miktarlarını ve son <strong>{ANALYSIS_PERIOD_DAYS} günlük</strong> kullanım verilerini analiz ederek olası transfer ihtiyaçları için öneriler sunar.
            Öneriler, mühimmatın daha verimli kullanılmasına ve olası eksikliklerin önlenmesine yardımcı olmayı amaçlar.
            <br/>
            <strong className="text-foreground">Not:</strong> Sunulan öneriler tavsiye niteliğindedir ve nihai karar operasyonel gerekliliklere göre verilmelidir. Günlük kullanım verilerinde depo ayrımı yoksa, analiz genel kullanıma göre yapılır.
          </p>
        </CardContent>
      </Card>


      {error && (
        <Card className="border-destructive bg-destructive/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive"><AlertTriangle className="h-5 w-5" /> Hata</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {recommendations && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl" suppressHydrationWarning>Genel Değerlendirme ve Özet</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground" suppressHydrationWarning>{recommendations.summary}</p>
            </CardContent>
          </Card>

          {recommendations.recommendations && recommendations.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl" suppressHydrationWarning>Transfer Önerileri ({recommendations.recommendations.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recommendations.recommendations.map((rec, index) => (
                  <Card key={index} className="shadow-md">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg text-primary flex items-center gap-2">
                        <ArrowRightLeft className="h-5 w-5"/>
                        {rec.caliber} Transferi
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1">
                      <p><strong suppressHydrationWarning>Miktar:</strong> {rec.quantityToTransfer.toLocaleString()} adet</p>
                      <p><strong suppressHydrationWarning>Nereden:</strong> Depo {rec.fromDepotId.toUpperCase()} ({rec.fromDepotName})</p>
                      <p><strong suppressHydrationWarning>Nereye:</strong> Depo {rec.toDepotId.toUpperCase()} ({rec.toDepotName})</p>
                      <p><strong suppressHydrationWarning>Gerekçe:</strong> {rec.reason}</p>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          )}
           {recommendations.recommendations && recommendations.recommendations.length === 0 && (
             <Card>
                <CardHeader>
                    <CardTitle className="text-xl" suppressHydrationWarning>Transfer Önerisi Bulunmamaktadır</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground" suppressHydrationWarning>Mevcut stok ve kullanım verilerine göre depolar arası mühimmat transferi için acil bir öneri bulunmamaktadır.</p>
                </CardContent>
             </Card>
           )}

          {recommendations.notes && recommendations.notes.length > 0 && (
            <Card className="border-amber-500 bg-amber-50 dark:bg-amber-900/20">
              <CardHeader>
                <CardTitle className="text-xl text-amber-700 dark:text-amber-400 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" /> Ek Notlar ve Uyarılar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-1 text-amber-600 dark:text-amber-300">
                  {recommendations.notes.map((note, index) => (
                    <li key={index}>{note}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
