
'use server';
/**
 * @fileOverview An AI agent for suggesting ammunition stock balancing between depots.
 *
 * - getStockBalancingRecommendations - A function that handles the stock balancing analysis.
 * - StockBalancingInput - The input type for the getStockBalancingRecommendations function.
 * - StockBalancingOutput - The return type for the getStockBalancingRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DepotStockSchema = z.object({
  depotId: z.string(),
  depotName: z.string(),
  ammunition: z.array(z.object({ caliber: z.string(), quantity: z.number() })),
});

const DepotUsageSchema = z.object({
  depotId: z.string(),
  depotName: z.string(),
  ammunitionUsage: z.array(z.object({ caliber: z.string(), totalUsed: z.number() })),
});

export const StockBalancingInputSchema = z.object({
  depotAStock: DepotStockSchema.describe("Ammunition stock for Depot A (Kadro Atışı)"),
  depotBStock: DepotStockSchema.describe("Ammunition stock for Depot B (ACM)"),
  depotAHistoricalUsage: DepotUsageSchema.describe("Aggregated historical usage for Depot A over the analysis period"),
  depotBHistoricalUsage: DepotUsageSchema.describe("Aggregated historical usage for Depot B over the analysis period"),
  analysisPeriodDays: z.number().describe("Number of past days of usage data considered for the historical usage figures (e.g., 30)."),
});
export type StockBalancingInput = z.infer<typeof StockBalancingInputSchema>;

const TransferRecommendationSchema = z.object({
  fromDepotId: z.string(),
  fromDepotName: z.string(),
  toDepotId: z.string(),
  toDepotName: z.string(),
  caliber: z.string(),
  quantityToTransfer: z.number(),
  reason: z.string(),
});

export const StockBalancingOutputSchema = z.object({
  recommendations: z.array(TransferRecommendationSchema).describe("List of transfer recommendations."),
  summary: z.string().describe("Overall summary of the stock situation and balancing needs. Include a general assessment of stock levels for each depot."),
  notes: z.array(z.string()).optional().describe("Any additional notes or warnings, e.g., if overall stock for a caliber is critically low across all depots."),
});
export type StockBalancingOutput = z.infer<typeof StockBalancingOutputSchema>;

export async function getStockBalancingRecommendations(input: StockBalancingInput): Promise<StockBalancingOutput> {
  return stockBalancingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'stockBalancingPrompt',
  input: {schema: StockBalancingInputSchema},
  output: {schema: StockBalancingOutputSchema},
  prompt: `You are an expert military logistics AI for Ammunition Tracking (AmmoTrack). Your task is to analyze ammunition stock levels and historical usage between two depots: Depot A ({{depotAStock.depotName}}) and Depot B ({{depotBStock.depotName}}) and provide clear, actionable transfer recommendations.

Analysis Period: Last {{analysisPeriodDays}} days.

Current Stock for Depot A ({{depotAStock.depotName}}):
{{#each depotAStock.ammunition}}
- {{caliber}}: {{quantity}} rounds
{{/each}}
{{^if depotAStock.ammunition}}
- No ammunition stock data provided for Depot A.
{{/if}}

Historical Usage for Depot A ({{depotAStock.depotName}}) over {{analysisPeriodDays}} days:
{{#each depotAHistoricalUsage.ammunitionUsage}}
- {{caliber}}: {{totalUsed}} rounds
{{/each}}
{{^if depotAHistoricalUsage.ammunitionUsage}}
- No historical usage data provided for Depot A.
{{/if}}

Current Stock for Depot B ({{depotBStock.depotName}}):
{{#each depotBStock.ammunition}}
- {{caliber}}: {{quantity}} rounds
{{/each}}
{{^if depotBStock.ammunition}}
- No ammunition stock data provided for Depot B.
{{/if}}

Historical Usage for Depot B ({{depotBStock.depotName}}) over {{analysisPeriodDays}} days:
{{#each depotBHistoricalUsage.ammunitionUsage}}
- {{caliber}}: {{totalUsed}} rounds
{{/each}}
{{^if depotBHistoricalUsage.ammunitionUsage}}
- No historical usage data provided for Depot B.
{{/if}}

Based on this data:
1.  Identify any imbalances. For each caliber, compare the stock levels in each depot against their recent consumption patterns.
2.  Prioritize ensuring each depot has sufficient stock for its operational needs based on usage, while avoiding excessive overstocking in one depot if the other is low.
3.  For each caliber that needs rebalancing, recommend a specific quantity to transfer from the depot with a relative surplus to the depot with a relative deficit.
4.  Provide a clear reason for each transfer recommendation (e.g., "Depot B 9mm usage is high, stock is low; Depot A has surplus.").
5.  If a caliber is low in *both* depots relative to usage, note this in the 'notes' section.
6.  Provide an overall 'summary' assessing the general stock health of both depots and the necessity of the recommended transfers.
7.  Output should be in the specified JSON format. If no transfers are recommended, the 'recommendations' array should be empty.
`,
});

const stockBalancingFlow = ai.defineFlow(
  {
    name: 'stockBalancingFlow',
    inputSchema: StockBalancingInputSchema,
    outputSchema: StockBalancingOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
        throw new Error("AI did not return an output for stock balancing.");
    }
    // Ensure depot names are included in recommendations if not directly in schema
    // (Though the schema now includes them)
    // const recommendationsWithNames = output.recommendations.map(rec => ({
    //   ...rec,
    //   fromDepotName: input.depotAStock.depotId === rec.fromDepotId ? input.depotAStock.depotName : input.depotBStock.depotName,
    //   toDepotName: input.depotAStock.depotId === rec.toDepotId ? input.depotAStock.depotName : input.depotBStock.depotName,
    // }));
    return output; // { ...output, recommendations: recommendationsWithNames };
  }
);
