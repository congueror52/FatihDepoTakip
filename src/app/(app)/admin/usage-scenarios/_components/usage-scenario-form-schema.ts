
import { z } from "zod";
import { SUPPORTED_CALIBERS } from "@/types/inventory";

export const scenarioCaliberConsumptionSchema = z.object({
  caliber: z.enum(SUPPORTED_CALIBERS, {
    errorMap: () => ({ message: "Lütfen geçerli bir kalibre seçin." }),
  }),
  roundsPerPerson: z.coerce
    .number()
    .int()
    .min(0, { message: "Kişi başı miktar 0 veya daha büyük olmalıdır." }),
});

export const usageScenarioFormSchema = z.object({
  name: z.string().min(2, { message: "Senaryo adı en az 2 karakter olmalıdır." }).max(100),
  description: z.string().max(500).optional(),
  consumptionRatesPerCaliber: z.array(scenarioCaliberConsumptionSchema)
    .min(1, { message: "En az bir kalibre için sarfiyat oranı tanımlanmalıdır." })
    .default([]),
});

export type UsageScenarioFormValues = z.infer<typeof usageScenarioFormSchema>;
export type ScenarioCaliberConsumptionFormValues = z.infer<typeof scenarioCaliberConsumptionSchema>;
