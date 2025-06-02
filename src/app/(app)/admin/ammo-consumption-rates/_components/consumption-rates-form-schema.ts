
import { z } from "zod";
import { SUPPORTED_CALIBERS } from "@/types/inventory";

export const standardConsumptionRateSchema = z.object({
  caliber: z.enum(SUPPORTED_CALIBERS),
  roundsPerPerson: z.coerce
    .number({ invalid_type_error: "Lütfen geçerli bir sayı girin." })
    .int({ message: "Miktar tam sayı olmalıdır." })
    .min(0, { message: "Kişi başı miktar 0 veya daha büyük olmalıdır." }),
});

export const consumptionRatesFormSchema = z.object({
  rates: z.array(standardConsumptionRateSchema),
});

export type ConsumptionRatesFormValues = z.infer<typeof consumptionRatesFormSchema>;
export type StandardConsumptionRateFormValues = z.infer<typeof standardConsumptionRateSchema>;
