// This feature (Global Ammunition Consumption Rates) has been removed.
// Consumption rates are now managed per Usage Scenario.
// This file is being replaced with an empty shell to prevent build errors.

import { z } from "zod";

export const consumptionRatesFormSchema = z.object({}); // Empty schema
export type ConsumptionRatesFormValues = z.infer<typeof consumptionRatesFormSchema>;
