'use server';

/**
 * @fileOverview An AI agent that suggests optimal rebalancing of ammunition and equipment between two depots.
 *
 * - suggestRebalancing - A function that suggests the optimal rebalancing strategy.
 * - SuggestRebalancingInput - The input type for the suggestRebalancing function.
 * - SuggestRebalancingOutput - The return type for the suggestRebalancing function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRebalancingInputSchema = z.object({
  depotAInventory: z.string().describe('The current inventory of depot A, in JSON format.'),
  depotBInventory: z.string().describe('The current inventory of depot B, in JSON format.'),
  historicalUsageData: z.string().describe('Historical usage data for both depots, in JSON format.'),
  upcomingRequirements: z.string().describe('Anticipated future needs for both depots, in JSON format.'),
});
export type SuggestRebalancingInput = z.infer<typeof SuggestRebalancingInputSchema>;

const SuggestRebalancingOutputSchema = z.object({
  rebalancingSuggestion: z.string().describe('A JSON object containing rebalancing suggestions for ammunition and equipment between the two depots.'),
  reasoning: z.string().describe('Explanation of the rebalancing suggestions, including factors considered and rationale behind the recommendations.'),
});
export type SuggestRebalancingOutput = z.infer<typeof SuggestRebalancingOutputSchema>;

export async function suggestRebalancing(input: SuggestRebalancingInput): Promise<SuggestRebalancingOutput> {
  return suggestRebalancingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRebalancingPrompt',
  input: {schema: SuggestRebalancingInputSchema},
  output: {schema: SuggestRebalancingOutputSchema},
  prompt: `You are an expert logistics analyst specializing in optimizing resource allocation between two depots.

You will analyze the current inventory, historical usage data, and upcoming requirements to suggest an optimal rebalancing strategy for ammunition and equipment.

Provide clear and actionable recommendations, along with a detailed explanation of your reasoning.

Consider factors such as usage patterns, upcoming events, and potential risks when formulating your suggestions.

Inventory of Depot A: {{{depotAInventory}}}
Inventory of Depot B: {{{depotBInventory}}}
Historical Usage Data: {{{historicalUsageData}}}
Upcoming Requirements: {{{upcomingRequirements}}}`,
});

const suggestRebalancingFlow = ai.defineFlow(
  {
    name: 'suggestRebalancingFlow',
    inputSchema: SuggestRebalancingInputSchema,
    outputSchema: SuggestRebalancingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
