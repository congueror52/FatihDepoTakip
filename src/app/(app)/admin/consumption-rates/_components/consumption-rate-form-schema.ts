
import { z } from "zod";
import { SUPPORTED_CALIBERS_FOR_CONSUMPTION } from "@/types/inventory";

export const ammunitionStandardConsumptionRateFormSchema = z.object({
  caliber: z.enum(SUPPORTED_CALIBERS_FOR_CONSUMPTION, {
    errorMap: () => ({ message: "Lütfen geçerli bir kalibre seçin." }),
  }),
  roundsPerPerson: z.coerce.number().int().min(0, { message: "Kişi başı miktar 0 veya daha büyük olmalıdır." }),
});

export type AmmunitionStandardConsumptionRateFormValues = z.infer<typeof ammunitionStandardConsumptionRateFormSchema>;
