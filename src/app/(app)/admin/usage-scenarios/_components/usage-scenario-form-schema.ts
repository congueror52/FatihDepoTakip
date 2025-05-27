
import { z } from "zod";
import { SUPPORTED_CALIBERS_FOR_CONSUMPTION } from "@/types/inventory";

export const usageScenarioFormSchema = z.object({
  name: z.string().min(2, { message: "Senaryo adı en az 2 karakter olmalıdır." }).max(100),
  description: z.string().max(500).optional(),
  preselectedCalibers: z.array(z.enum(SUPPORTED_CALIBERS_FOR_CONSUMPTION))
    .min(1, { message: "En az bir kalibre seçilmelidir." })
    .default([]),
});

export type UsageScenarioFormValues = z.infer<typeof usageScenarioFormSchema>;
